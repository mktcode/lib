# GitHub Insights

A collection of functions to aggregate and evaluate data from the GitHub GraphQL API.

```bash
npm i @mktcodelib/github-insights
```

```js
const githubInsights = new GithubInsights({
  viewerToken: "<access token>",
});

const {
  forkCount,
  followersForkCount,
  stargazerCount,
  followersStargazerCount,
  followersFollowerCount,
  mergedPullRequestCount,
  mergedPullRequestCount30d,
  mergedPullRequestCount365d,
} = await githubInsights.scanUser(username.value);
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
