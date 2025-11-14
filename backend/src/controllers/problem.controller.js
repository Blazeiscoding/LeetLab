import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/rapidapi.lib.js";

export const createProblem = async (req, res) => {
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

  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "You are not allowed to create a problem" });
  }

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
      const tokens = submissionResults.map((res) => res.token);
      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Reference solution for ${language} failed on test case ${
              i + 1
            }`,
          });
        }
      }
    }

    const newProblem = await db.problem.create({
      data: {
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
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      message: "Problem created successfully",
      data: newProblem,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error While Creating Problem" });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await db.problem.findMany();

    if (!problems) {
      return res.status(404).json({ error: "No problems found" });
    }

    res.status(200).json({
      data: problems,
      success: true,
      message: "Problems fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error While Fetching Problems" });
  }
};

export const getProblemById = async (req, res) => {
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
    console.log(error);
    return res
      .status(500)
      .json({ error: "Error While Fetching Problem by Id" });
  }
};

export const updateProblem = async (req, res) => {
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
        examples,
        constraints,
        testCases,
        codeSnippet,
        hints,
        editorial,
        referenceSolution,
      },
    });

    res.status(200).json({
      data: problem,
      success: true,
      message: "Problem updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error While Updating Problem" });
  }
};

export const deleteProblem = async (req, res) => {
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
    console.log(error);
    return res.status(500).json({ error: "Error While Deleting Problem" });
  }
};

export const getAllSolvedProblemsByUser = async (req, res) => {
  try {
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
    console.log(error);
    return res.status(500).json({ error: "Error While Fetching Problems" });
  }
};
