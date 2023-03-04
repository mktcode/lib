export type Label = {
  id: string;
  name: string;
  color: string;
}

export type Issue = {
  id: string;
  title: string;
  url: string;
  labels: Label[]
};

export type IssueNode = Issue & {
  labels: {
    totalCount: number;
    nodes: Label[];
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