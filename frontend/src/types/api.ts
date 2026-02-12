import { User, Problem, Submission, Playlist, ProblemSolved, ProblemInPlaylist } from './models';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  requiresOTP?: boolean;
  email?: string;
  expiresAt?: string;
  remainingAttempts?: number;
  error?: string;
}

export interface OTPResponse {
  success: boolean;
  email: string;
  expiresAt: string;
  remainingAttempts: number;
  error?: string;
}

export interface ProblemsResponse {
  data: Problem[];
}

export interface ProblemResponse {
  data: Problem;
}

export interface SubmissionsResponse {
  data: Submission[];
}

export interface SubmissionResponse {
  data: Submission;
}

export interface PlaylistsResponse {
  data: Playlist[];
}

export interface PlaylistResponse {
  data: Playlist;
}

export interface SolvedProblemsResponse {
  data: ProblemSolved[];
}

export interface ExecuteCodeRequest {
  code: string;
  language: string;
  problemId: string;
  testCases?: Array<{ input: string; output: string }>;
}

export interface ExecuteCodeResponse {
  success: boolean;
  results?: TestCaseResult[];
  error?: string;
}

export interface TestCaseResult {
  testCase: number;
  passed: boolean;
  stdout: string | null;
  expected: string;
  stderr: string | null;
  compileOutput: string | null;
  status: string;
  memory: string | null;
  time: string | null;
}

export interface LeaderboardEntry {
  userId: string;
  user?: User;
  userName?: string;
  userEmail?: string;
  userImage?: string | null;
  problemsSolved:
    | number
    | {
        EASY: number;
        MEDIUM: number;
        HARD: number;
      };
  totalProblemsSolved?: number;
  easyCount?: number;
  mediumCount?: number;
  hardCount?: number;
  score?: number;
  totalScore?: number;
  problemsSolvedByDifficulty?: {
    EASY: number;
    MEDIUM: number;
    HARD: number;
  };
  rank?: number;
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
}

export interface UserStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissions: number;
  recentSubmissions: Submission[];
  solvedProblems: ProblemSolved[];
  streak?: number;
}

export interface PlaylistWithProblems extends Playlist {
  problems: ProblemInPlaylist[];
}
