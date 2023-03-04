export type Label = {
  id: string;
  name: string;
  color: string;
}

export type Assignee = {
  id: string;
  login: string;
  avatarUrl: string;
}

export type Issue = {
  id: string;
  title: string;
  url: string;
  labels: Label[]
  assignees: Assignee[]
};

export type IssueNode = Issue & {
  labels: {
    totalCount: number;
    nodes: Label[];
  }
  assignees: {
    totalCount: number;
    nodes: Assignee[];
  }
}

export type Repository = {
  id: string;
  name: string;
  description: string;
  url: string;
  stargazersCount: number;
  issues: Issue[]
};

export type RepositoryNode = Repository & {
  issues: {
    totalCount: number;
    nodes: IssueNode[];
  }
}

export type Organization = {
  id: string;
  login: string;
  name: string;
  description: string;
  url: string;
  websiteUrl: string;
  avatarUrl: string;
  repositories: Repository[];
};

export type OrganizationNode = Organization & {
  repositories: {
    totalCount: number;
    nodes: RepositoryNode[];
  }
}

export type RateLimit = {
  remaining: number;
}