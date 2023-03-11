import express from 'express';
import cors, { CorsOptions } from 'cors';
import { createClient } from 'redis';
import { graphql } from "@octokit/graphql";
import { graphqlFetchAll } from '@mktcodelib/graphql-fetch-all';
import { whitelistCycle } from './whitelist';
import { ORG_REPOS_QUERY, REPO_ISSUES_QUERY, USER_REPOS_QUERY } from './queries';
import { Organization, OrganizationNode, RateLimit, RepositoryNode } from './types';

type Options = {
  githubToken: string;
  port?: number;
  redisConfig?: Record<string, any>;
  rateLimit?: number;
  corsOrigin?: CorsOptions['origin']
  debug?: boolean;
}

export class GoodFirstWeb3Issues {
  private port: number;
  private rateLimit: number;
  private debug: boolean;

  private db: ReturnType<typeof createClient>;
  private server: ReturnType<typeof express>;
  private github: ReturnType<typeof graphql.defaults>;

  constructor({
    githubToken,
    port = 3000,
    redisConfig = {},
    rateLimit = 5000,
    corsOrigin = /openq\.dev$/,
    debug = false,
  }: Options) {
    this.port = port;
    this.debug = debug;

    this.db = createClient(redisConfig);
    this.db.on('error', (err: any) => console.log('Redis Client Error', err));

    this.rateLimit = rateLimit;

    this.server = express();
    this.server.use(cors({ origin: corsOrigin }))
    this.server.get('/', async (_req, res) => {
      const cached = await this.db.hGetAll('orgs');
    
      if (cached) {
        Object.keys(cached).forEach((key) => {
          cached[key] = JSON.parse(cached[key]!);
        });
      }
    
      res.send(cached || {});
    });

    this.server.get('/lastSync', async (_req, res) => {
      const lastSync = await this.db.get('lastSync');
      res.send(lastSync);
    });

    this.github = graphql.defaults({
      headers: {
        Authorization: `bearer ${githubToken}`,
      },
    })
  }

  log(...args: any[]) {
    if (this.debug) {
      console.log(...args);
    }
  }

  sanitizeData(orgOrUser: OrganizationNode): Organization {
    return {
      ...orgOrUser,
      repositories: orgOrUser.repositories.nodes.map((repo) => ({
        ...repo,
        languages: repo.languages.nodes,
        issues: repo.issues.nodes.map((issue) => ({
          ...issue,
          labels: issue.labels.nodes,
          assignees: issue.assignees.nodes,
        })),
      })),
    };
  }

  async wait(rateLimit: RateLimit) {
    let waitTime = 0;

    process.stdout.write('\u001b[1A\u001b[0G');
    this.log(`\rRate limit: ${rateLimit.used}/${this.rateLimit}`)

    if (rateLimit.used >= this.rateLimit) {
      waitTime = new Date(rateLimit.resetAt).getTime() - Date.now() + 1e3 * 60;
      this.log(`Waiting ${(waitTime / 1e3 / 60).toFixed(2)} minutes until rate limit resets...\n`)
    }

    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  async sync() {
    const { value: login } = whitelistCycle.next();
    this.log(`\nSyncing ${login}...\n`);
    this.db.set('lastSync', new Date().toISOString());
  
    let orgOrUser;
  
    try {
      const orgResponse = await graphqlFetchAll<{ rateLimit: RateLimit, organization: OrganizationNode }>(
        this.github,
        ORG_REPOS_QUERY,
        { login, first: 100 },
      );
      orgOrUser = orgResponse.organization;
      await this.wait(orgResponse.rateLimit);
    } catch {
      try {
        const userResponse = await graphqlFetchAll<{ rateLimit: RateLimit, user: OrganizationNode }>(
          this.github,
          USER_REPOS_QUERY,
          { login, first: 100 },
        );
        orgOrUser = userResponse.user;
        await this.wait(userResponse.rateLimit);
      } catch (e) {
        this.log(e);
        const resetAt = new Date(Date.now() + 5 * 60 * 1e3).toISOString();
        await this.wait({ used: this.rateLimit, resetAt });
      }
    }
  
    if (!orgOrUser) {
      this.db.hDel('orgs', login)
      this.log(`Removed ${login}!`);

      this.sync();

      return;
    }
  
    for (const repo of orgOrUser.repositories.nodes) {
      try {
        const issuesResponse = await graphqlFetchAll<{ rateLimit: RateLimit, repository: RepositoryNode }>(
          this.github,
          REPO_ISSUES_QUERY,
          { owner: orgOrUser.login, name: repo.name, first: 100 },
        );
        repo.issues.nodes = issuesResponse.repository.issues.nodes;
        await this.wait(issuesResponse.rateLimit);
      } catch (e) {
        this.log(e);
        const resetAt = new Date(Date.now() + 5 * 60 * 1e3).toISOString();
        await this.wait({ used: this.rateLimit, resetAt });
      }
    }
  
    orgOrUser.repositories.nodes = orgOrUser.repositories.nodes.filter((repo) => repo.issues.nodes.length > 0);
    const issueCount = orgOrUser.repositories.nodes.reduce((acc, repo) => acc + repo.issues.nodes.length, 0);

    this.log(`Found ${orgOrUser.repositories.nodes.length} repo(s) with ${issueCount} issue(s) for ${login}.`)
  
    if (orgOrUser.repositories.nodes.length === 0) {
      this.db.hDel('orgs', login)
      this.log(`Removed ${login}!`);

      this.sync();

      return;
    }
  
    this.db.hSet('orgs', login, JSON.stringify(this.sanitizeData(orgOrUser)));
    this.log(`Synced ${login}!`);
    this.sync();
  }

  run() {
    this.db.connect();
    this.server.listen(this.port, () => {
      console.log(`Listening on http://localhost:${this.port}`)
      this.sync();
    });
  }
}