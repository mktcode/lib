import { GithubInsights } from "@mktcodelib/github-insights";

export const githubInsights = new GithubInsights({
  viewerToken: import.meta.env.VITE_GITHUB_TOKEN,
});
