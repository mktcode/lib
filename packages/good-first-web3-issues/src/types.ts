export type Label = {
  id: string;
  name: string;
  color: string;
}

export type Issue = {
  id: string;
  title: string;
  url: string;
  labels: {
    totalCount: number;
    nodes: Label[]
  };
};

export type Repository = {
  id: string;
  name: string;
  description: string;
  url: string;
  stargazersCount: number;
  issues: {
    totalCount: number;
    nodes: Issue[]
  };
};

export type Organization = {
  id: string;
  login: string;
  name: string;
  description: string;
  url: string;
  websiteUrl: string;
  avatarUrl: string;
  repositories: {
    totalCount: number;
    nodes: Repository[];
  };
};