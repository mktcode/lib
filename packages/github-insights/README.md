# GitHub Insights

A collection of functions to aggregate and evaluate data from the GitHub GraphQL API.

```bash
npm i @mktcodelib/github-insights
```

## Usage

```js
const githubInsights = new GithubInsights({
  viewerToken: "<access token>",
});

// single user
const {
  forkCount,
  followersForkCount,
  stargazerCount,
  followersStargazerCount,
  followersFollowerCount,
  mergedPullRequestCount,
  mergedPullRequestCount30d,
  mergedPullRequestCount365d,
} = await githubInsights.scanUser('mktcode');

// multiple users
const usersStats = await githubInsights.scanUsers(['mktcode', 'rickkdev']);

// repo commit stats
const until = new Date();
const since = new Date();
since.setMonth(since.getMonth() - 1);

const {
  commitCount,
  linesChanged,
  commitsByDay,
  commitsByDayNormalized: {
    commitCount: commitCountNormalized,
    linesChanged: linesChangedNormalized,
  }
} = await githubInsights.scanRepoCommits('mktcode', 'lib', since, until);

console.log(linesChangedNormalized);
// [0.0036611882074566735,0.02267058898765748, ... ]
```

# Scores

*draft*

The scores are inspired by OpenQ's plans for hackathon tooling but kept as generic as possible.

## User

### Reputation

A user's reputation is based on activity over time and the number of followers and followers's followers.

## Repository

### Activity

A repository's activity is based on the number of commits, issues and pull requests (and comments) and discussions.

### Growth

Growth represents activity and popularity over time.

### Popularity

A repository's popularity is based on the number of forks, stars, and pull requests and issues from external users.

### Reputation

A repository's reputation is based on its authors' reputation.
