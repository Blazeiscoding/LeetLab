export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum Status {
  Accepted = 'Accepted',
  WrongAnswer = 'WrongAnswer',
}

export type DifficultyType = keyof typeof Difficulty;
export type StatusType = keyof typeof Status;
export type UserRoleType = keyof typeof UserRole;
