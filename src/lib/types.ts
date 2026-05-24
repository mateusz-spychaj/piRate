export interface PRScore {
  impact: number;
  aiLeverage: number;
  quality: number;
  total: number;
  pirateSummary: string;
}

export interface PRData {
  id: number;
  number: number;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  changedFiles: number;
  additions: number;
  deletions: number;
  url: string;
  diffUrl: string;
  score: PRScore;
}

export interface RepoAnalysis {
  repoUrl: string;
  repoName: string;
  totalScore: number;
  avgImpact: number;
  avgAiLeverage: number;
  avgQuality: number;
  pirateSummary: string;
  prs: PRData[];
  recommendations: string[];
  analyzedAt: string;
}

export type Language = 'pl' | 'en';

export type SortField = 'title' | 'author' | 'changedFiles' | 'impact' | 'aiLeverage' | 'quality' | 'total';
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  author: string | null;
  sortField: SortField;
  sortDirection: SortDirection;
}
