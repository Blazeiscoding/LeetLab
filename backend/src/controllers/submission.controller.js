import { db } from "../libs/db.js";

export const getAllSubmission = async (req, res) => {
  try {
    const userId = req.user.id;
    const submission = await db.submission.findMany({
      where: {
        userId: userId,
      },
    });

    res.status(200).json({
      data: submission,
      success: true,
      message: "Submission fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error While Fetching Submission" });
  }
};

export const getSubmissionsForProblem = async (req, res) => {
  try {
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
    console.log(error);
    return res.status(500).json({ error: "Error While Fetching Submission" });
  }
};

export const getAllTheSubmissionsForProblem = async (req, res) => {
  try {
    const problemId = req.params.problemid;
    const submissions = await db.submission.count({
      where: {
        problemId: problemId,
      },
    });

    return res.status(200).json({
      data: submissions,
      success: true,
      message: "Submission fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error While Fetching Submission" });
  }
};
