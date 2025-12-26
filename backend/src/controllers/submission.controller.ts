import { Request, Response } from "express";
import { db } from "../libs/db.js";
import { errorResponse } from "../utils/errorHandler.js";
import {
  getPaginationParams,
  createPaginatedResponse,
} from "../utils/pagination.js";

export const getAllSubmission = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const { page, limit, skip } = getPaginationParams(req);

    const [submissions, total] = await Promise.all([
      db.submission.findMany({
        where: {
          userId: userId,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.submission.count({
        where: {
          userId: userId,
        },
      }),
    ]);

    res.status(200).json({
      ...createPaginatedResponse(submissions, total, page, limit),
      success: true,
      message: "Submission fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return errorResponse(res, 500, "Error While Fetching Submission", error);
  }
};

export const getSubmissionsForProblem = async (
  req: Request<{ problemId: string }>,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const problemId = req.params.problemId;
    const submissions = await db.submission.findMany({
      where: {
        userId: userId,
        problemId: problemId,
      },
    });

    return res.status(200).json({
      data: submissions,
      success: true,
      message: "Submission fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return errorResponse(res, 500, "Error While Fetching Submission", error);
  }
};

export const getAllTheSubmissionsForProblem = async (
  req: Request<{ problemid: string }>,
  res: Response
): Promise<Response | void> => {
  try {
    const problemId = req.params.problemid;
    const count = await db.submission.count({
      where: {
        problemId: problemId,
      },
    });

    return res.status(200).json({
      data: count,
      success: true,
      message: "Submission fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return errorResponse(res, 500, "Error While Fetching Submission", error);
  }
};

