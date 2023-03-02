export type RepositoryScan = {
  createdAt: string;
  stargazerCount: number;
}

export function evaluateRepositoryScan(repositoryScan: RepositoryScan) {
  return {
    mostActiveContributor: null,
    contributors: [],
  };
}