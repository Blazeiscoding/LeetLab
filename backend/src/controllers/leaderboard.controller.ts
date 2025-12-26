import { Request, Response } from "express";
import { db } from "../libs/db.js";
import { Difficulty } from "@prisma/client";

// Scoring weights for different difficulty levels
const DIFFICULTY_WEIGHTS: Record<Difficulty, number> = {
  EASY: 1,
  MEDIUM: 3,
  HARD: 5,
};

interface UserScore {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  totalScore: number;
  problemsSolved: {
    EASY: number;
    MEDIUM: number;
    HARD: number;
  };
  solvedProblems: Array<{
    id: string;
    title: string;
    difficulty: Difficulty;
    solvedAt: Date;
  }>;
}

interface LeaderboardQuery {
  month?: string;
  year?: string;
}

export const getMonthlyLeaderboard = async (
  req: Request<unknown, unknown, unknown, LeaderboardQuery>,
  res: Response
): Promise<Response | void> => {
  try {
    const { month, year } = req.query;

    // Get current month and year if not provided
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month, 10) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year, 10) : currentDate.getFullYear();

    // Calculate the start and end of the target month
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(
      targetYear,
      targetMonth + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Get all problems solved in the target month with their difficulty
    const solvedProblems = await db.problemSolved.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
    });

    // Calculate scores for each user
    const userScores: Record<string, UserScore> = {};

    solvedProblems.forEach((solved) => {
      const userId = solved.user.id;
      const difficulty = solved.problem.difficulty;
      const points = DIFFICULTY_WEIGHTS[difficulty] || 0;

      if (!userScores[userId]) {
        userScores[userId] = {
          user: solved.user,
          totalScore: 0,
          problemsSolved: {
            EASY: 0,
            MEDIUM: 0,
            HARD: 0,
          },
          solvedProblems: [],
        };
      }

      userScores[userId].totalScore += points;
      userScores[userId].problemsSolved[difficulty]++;
      userScores[userId].solvedProblems.push({
        id: solved.problem.id,
        title: solved.problem.title,
        difficulty: solved.problem.difficulty,
        solvedAt: solved.createdAt,
      });
    });

    // Convert to array and sort by total score (descending)
    const leaderboard = Object.values(userScores)
      .map((userData) => ({
        ...userData,
        totalProblemsSolved:
          userData.problemsSolved.EASY +
          userData.problemsSolved.MEDIUM +
          userData.problemsSolved.HARD,
      }))
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        if (b.totalProblemsSolved !== a.totalProblemsSolved) {
          return b.totalProblemsSolved - a.totalProblemsSolved;
        }
        if (b.problemsSolved.HARD !== a.problemsSolved.HARD) {
          return b.problemsSolved.HARD - a.problemsSolved.HARD;
        }
        if (b.problemsSolved.MEDIUM !== a.problemsSolved.MEDIUM) {
          return b.problemsSolved.MEDIUM - a.problemsSolved.MEDIUM;
        }
        return b.problemsSolved.EASY - a.problemsSolved.EASY;
      });

    // Add rank to each entry
    const leaderboardWithRanks = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    return res.status(200).json({
      success: true,
      message: "Monthly leaderboard retrieved successfully",
      data: {
        month: targetMonth + 1,
        year: targetYear,
        period: {
          start: startOfMonth,
          end: endOfMonth,
        },
        leaderboard: leaderboardWithRanks,
        totalParticipants: leaderboardWithRanks.length,
      },
    });
  } catch (error) {
    console.error("Error fetching monthly leaderboard:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      success: false,
      message: "Error fetching monthly leaderboard",
      error: errorMessage,
    });
  }
};

export const getUserLeaderboardStats = async (
  req: Request<unknown, unknown, unknown, LeaderboardQuery>,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const { month, year } = req.query;

    // Get current month and year if not provided
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month, 10) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year, 10) : currentDate.getFullYear();

    // Calculate the start and end of the target month
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(
      targetYear,
      targetMonth + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Get user's solved problems for the month
    const userSolvedProblems = await db.problemSolved.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
    });

    // Calculate user's stats
    let totalScore = 0;
    const problemsSolved = {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
    };

    userSolvedProblems.forEach((solved) => {
      const difficulty = solved.problem.difficulty;
      const points = DIFFICULTY_WEIGHTS[difficulty] || 0;
      totalScore += points;
      problemsSolved[difficulty]++;
    });

    const totalProblemsSolved =
      problemsSolved.EASY + problemsSolved.MEDIUM + problemsSolved.HARD;

    // Get user's rank in the leaderboard
    const allUserScores = await db.problemSolved.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
        problem: {
          select: {
            difficulty: true,
          },
        },
      },
    });

    // Calculate scores for all users
    const allScores: Record<string, number> = {};
    allUserScores.forEach((solved) => {
      const userId = solved.user.id;
      const difficulty = solved.problem.difficulty;
      const points = DIFFICULTY_WEIGHTS[difficulty] || 0;

      if (!allScores[userId]) {
        allScores[userId] = 0;
      }
      allScores[userId] += points;
    });

    // Sort users by score and find user's rank
    const sortedUsers = Object.entries(allScores)
      .sort(([, a], [, b]) => b - a)
      .map(([userId]) => userId);

    const userRank = sortedUsers.indexOf(userId) + 1;

    return res.status(200).json({
      success: true,
      message: "User leaderboard stats retrieved successfully",
      data: {
        month: targetMonth + 1,
        year: targetYear,
        userRank: userRank > 0 ? userRank : null,
        totalParticipants: sortedUsers.length,
        stats: {
          totalScore,
          totalProblemsSolved,
          problemsSolved,
          solvedProblems: userSolvedProblems.map((solved) => ({
            id: solved.problem.id,
            title: solved.problem.title,
            difficulty: solved.problem.difficulty,
            solvedAt: solved.createdAt,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user leaderboard stats:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      success: false,
      message: "Error fetching user leaderboard stats",
      error: errorMessage,
    });
  }
};

