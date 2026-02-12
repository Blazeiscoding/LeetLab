import { Difficulty, Status, UserRole } from './enums';

export interface User {
  id: string;
  _id?: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OTP {
  id: string;
  userId: string;
  email: string;
  otpCode: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  input: string;
  output: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodeSnippets {
  JAVASCRIPT: string;
  PYTHON: string;
  JAVA: string;
}

export interface Examples {
  JAVASCRIPT: Example;
  PYTHON: Example;
  JAVA: Example;
}

export interface Problem {
  id: string;
  _id?: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  userId: string;
  examples: Examples;
  constraints: string;
  hints?: string | null;
  editorial?: string | null;
  testCases: TestCase[];
  codeSnippet: CodeSnippets;
  codeSnippets?: CodeSnippets;
  referenceSolution: CodeSnippets;
  referenceSolutions?: CodeSnippets;
  solvedBy?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SourceCode {
  [language: string]: string;
}

export interface Submission {
  id: string;
  _id?: string;
  userId: string;
  problemId: string;
  sourceCode: SourceCode;
  language: string;
  stdin: string | null;
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  status: Status;
  memory: string | null;
  time: string | null;
  createdAt: string;
  updatedAt: string;
  testCases?: TestCaseResult[];
  problem?: Problem;
}

export interface TestCaseResult {
  id: string;
  submissionId: string;
  testCase: number;
  passed: boolean;
  stdout: string | null;
  expected: string;
  stderr: string | null;
  compileOutput: string | null;
  status: Status;
  memory: string | null;
  time: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemSolved {
  id: string;
  _id?: string;
  userId: string;
  problemId: string;
  createdAt: string;
  updatedAt: string;
  problem?: Problem;
  title?: string;
  difficulty?: Difficulty;
  tags?: string[];
}

export interface Playlist {
  id: string;
  _id?: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  problems?: ProblemInPlaylist[];
}

export interface ProblemInPlaylist {
  id: string;
  _id?: string;
  playlistId: string;
  problemId: string;
  createdAt: string;
  updatedAt: string;
  problem?: Problem;
}
