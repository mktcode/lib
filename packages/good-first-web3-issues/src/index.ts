import express from 'express';
import { createClient } from 'redis';
import { graphql } from "@octokit/graphql";
import { graphqlFetchAll } from '@mktcodelib/graphql-fetch-all';
import { whitelistCycle } from './whitelist';
import { ORG_REPOS_QUERY, REPO_ISSUES_QUERY, USER_REPOS_QUERY } from './queries';
import { Organization, Repository } from './types';

type Options = {
  githubToken: string;
  port?: number;
  redisConfig?: Record<string, any>;
  syncInterval?: number;
  debug?: boolean;
}

export class GoodFirstWeb3Issues {
  private port: number;
  private syncInterval: number;
  private debug: boolean;

  private db: ReturnType<typeof createClient>;
  private server: ReturnType<typeof express>;
  private github: ReturnType<typeof graphql.defaults>;

  constructor({
    githubToken,
    port = 3000,
    redisConfig = {},
    syncInterval = 1e3 * 60 * 5,
    debug = false,
  }: Options) {
    this.port = port;
    this.syncInterval = syncInterval;
    this.debug = debug;

    this.db = createClient(redisConfig);
    this.db.on('error', (err: any) => console.log('Redis Client Error', err));


    this.server = express();
    this.server.get('/', async (_req, res) => {
      const cached = await this.db.hGetAll('orgs');
    
      if (cached) {
        Object.keys(cached).forEach((key) => {
          cached[key] = JSON.parse(cached[key]!);
        });
      }
    
      res.send(cached || {});
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

  async sync() {
    const { value: login } = whitelistCycle.next();
    this.log(`Syncing ${login}...`)
  
    let orgOrUser;
  
    try {
      const orgResponse = await graphqlFetchAll<{ organization: Organization }>(
        this.github,
        ORG_REPOS_QUERY,
        { login, first: 100 },
      );
      orgOrUser = orgResponse.organization;
    } catch {
      try {
        const userResponse = await graphqlFetchAll<{ user: Organization }>(
          this.github,
          USER_REPOS_QUERY,
          { login, first: 100 },
        );
        orgOrUser = userResponse.user;
      } catch (e) {
        this.log(e);
      }
    }
  
    if (!orgOrUser) {
      this.db.hDel('orgs', login)
      this.log(`Removed ${login}!`);
      return;
    }
  
    for (const repo of orgOrUser.repositories.nodes) {
      try {
        const issuesResponse = await graphqlFetchAll<{ repository: Repository }>(
          this.github,
          REPO_ISSUES_QUERY,
          { owner: orgOrUser.login, name: repo.name, first: 100 },
        );
        repo.issues.nodes = issuesResponse.repository.issues.nodes;
      } catch (e) {
        this.log(e);
      }
    }
  
    orgOrUser.repositories.nodes = orgOrUser.repositories.nodes.filter((repo) => repo.issues.nodes.length > 0);
  
    if (orgOrUser.repositories.nodes.length === 0) {
      this.db.hDel('orgs', login)
      this.log(`Removed ${login}!`);
      return;
    }
  
    await this.db.hSet('orgs', login, JSON.stringify(orgOrUser));
  
    this.log(`Synced ${login}!`);
  }

  run() {
    this.db.connect();
    this.server.listen(this.port, () => console.log(`Listening on http://localhost:${this.port}`));
    this.sync();
    setInterval(() => this.sync(), this.syncInterval);
  }
}