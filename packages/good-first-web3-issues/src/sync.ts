import { graphqlFetchAll } from '@mktcode/graphql-fetch-all';
import { graphql } from '@octokit/graphql';
import { whitelistCycle } from './whitelist';
import { ORG_REPOS_QUERY, REPO_ISSUES_QUERY, USER_REPOS_QUERY } from './queries';
import { Organization, Repository } from './types';
import { db } from './db';

const client = graphql.defaults({
  headers: {
    Authorization: `bearer ${process.env.PAT}`,
  },
})

export async function sync() {
  const { value: login } = whitelistCycle.next();
  console.log(`Syncing ${login}...`)

  let orgOrUser;

  try {
    const orgResponse = await graphqlFetchAll<{ organization: Organization }>(client, ORG_REPOS_QUERY, { login, first: 100 }, ['organization', 'repositories']);
    orgOrUser = orgResponse.organization;
  } catch {
    try {
      const userResponse = await graphqlFetchAll<{ user: Organization }>(client, USER_REPOS_QUERY, { login, first: 100 }, ['user', 'repositories']);
      orgOrUser = userResponse.user;
    } catch (e) {
      console.log(e);
    }
  }

  if (!orgOrUser) {
    db.hDel('orgs', login)
    console.log(`Removed ${login}!`);
    return;
  }

  for (const repo of orgOrUser.repositories.nodes) {
    try {
      const issuesResponse = await graphqlFetchAll<{ repository: Repository }>(client, REPO_ISSUES_QUERY, { owner: orgOrUser.login, name: repo.name, first: 100 }, ['repository', 'issues']);
      orgOrUser.repositories.nodes = orgOrUser.repositories.nodes.map((r) => r.name === repo.name ? issuesResponse.repository : r);
    } catch (e) {
      console.log(e);
    }
  }

  orgOrUser.repositories.nodes = orgOrUser.repositories.nodes.filter((repo) => repo.issues.nodes.length > 0);

  if (orgOrUser.repositories.nodes.length === 0) {
    db.hDel('orgs', login)
    console.log(`Removed ${login}!`);
    return;
  }

  await db.hSet('orgs', login, JSON.stringify(orgOrUser));

  console.log(`Synced ${login}!`);
}