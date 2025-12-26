import { Request, Response } from "express";
import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/rapidapi.lib.js";
import { errorResponse } from "../utils/errorHandler.js";
import { STATUS_CODES } from "../utils/constants.js";
import {
  getPaginationParams,
  createPaginatedResponse,
} from "../utils/pagination.js";
import { Difficulty, Prisma } from "@prisma/client";

interface ProblemBody {
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  examples: unknown;
  constraints: string;
  testCases: Array<{ input: string; output: string }>;
  codeSnippet: unknown;
  hints?: string;
  editorial?: string;
  referenceSolution: Record<string, string>;
}

export const createProblem = async (
  req: Request<unknown, unknown, ProblemBody>,
  res: Response
): Promise<Response | void> => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "You are not allowed to create a problem" });
  }

  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testCases,
    codeSnippet,
    hints,
    editorial,
    referenceSolution,
  } = req.body;

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolution)) {
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        return res
          .status(400)
          .json({ error: `Language ${language} is not supported` });
      }

      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);
      const tokens = submissionResults.submissions.map((res) => res.token);
      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== STATUS_CODES.ACCEPTED) {
          return errorResponse(
            res,
            400,
            `Reference solution for ${language} failed on test case ${i + 1}`
          );
        }
      }
    }

    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples: examples as Prisma.InputJsonValue,
        constraints,
        testCases: testCases as Prisma.InputJsonValue,
        codeSnippet: codeSnippet as Prisma.InputJsonValue,
        hints,
        editorial,
        referenceSolution: referenceSolution as Prisma.InputJsonValue,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      message: "Problem created successfully",
      data: newProblem,
      success: true,
    });
  } catch (error) {
    console.error("Error creating problem:", error);
    return errorResponse(res, 500, "Error While Creating Problem", error);
  }
};

export const getAllProblems = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req);

    const [problems, total] = await Promise.all([
      db.problem.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.problem.count(),
    ]);

    if (total === 0) {
      return res.status(200).json({
        ...createPaginatedResponse([], 0, page, limit),
        success: true,
        message: "No problems found",
      });
    }

    res.status(200).json({
      ...createPaginatedResponse(problems, total, page, limit),
      success: true,
      message: "Problems fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return errorResponse(res, 500, "Error While Fetching Problems", error);
  }
};

export const getProblemById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<Response | void> => {
  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.status(200).json({
      data: problem,
      success: true,
      message: "Problem fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching problem by id:", error);
    return errorResponse(res, 500, "Error While Fetching Problem by Id", error);
  }
};

export const updateProblem = async (
  req: Request<{ id: string }, unknown, ProblemBody>,
  res: Response
): Promise<Response | void> => {
  const { id } = req.params;

  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testCases,
    codeSnippet,
    hints,
    editorial,
    referenceSolution,
  } = req.body;

  try {
    const problem = await db.problem.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        difficulty,
        tags,
        examples: examples as Prisma.InputJsonValue,
        constraints,
        testCases: testCases as Prisma.InputJsonValue,
        codeSnippet: codeSnippet as Prisma.InputJsonValue,
        hints,
        editorial,
        referenceSolution: referenceSolution as Prisma.InputJsonValue,
      },
    });

    res.status(200).json({
      data: problem,
      success: true,
      message: "Problem updated successfully",
    });
  } catch (error) {
    console.error("Error updating problem:", error);
    return errorResponse(res, 500, "Error While Updating Problem", error);
  }
};

export const deleteProblem = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<Response | void> => {
  const { id } = req.params;
  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    await db.problem.delete({
      where: {
        id,
      },
    });
    res.status(200).json({
      data: problem,
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting problem:", error);
    return errorResponse(res, 500, "Error While Deleting Problem", error);
  }
};

export const getAllSolvedProblemsByUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const problems = await db.problem.findMany({
      where: {
        solvedBy: {
          some: {
            userId: req.user.id,
          },
        },
      },
      include: {
        solvedBy: {
          where: {
            userId: req.user.id,
          },
        },
      },
    });

    res.status(200).json({
      data: problems,
      success: true,
      message: "Problems fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching solved problems:", error);
    return errorResponse(res, 500, "Error While Fetching Problems", error);
  }
};

