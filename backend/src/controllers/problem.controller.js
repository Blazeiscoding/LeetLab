import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
  // going to get all the data from request body
  const {
    title,
    description,
    difficutly,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolution,
  } = req.body;

  // going to check user role once again

  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "You are not allowed to create a problem" });
  }
  // Loop through each reference solution for different languages

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolution)) {
      const lanugageId = getJudge0LanguageId(language);
      if (!lanugageId) {
        return res
          .status(400)
          .json({ error: `Language ${language} is not supported` });
      }
      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: lanugageId,
        stdin: input,
        expected_outpust: output,
      }));
      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((res) => res.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          return res.status(400).json({ error: `Testcase ${i} failed` });
        }
      }

      const newProblem = await db.problem.create({
        data: {
          title,
          description,
          difficutly,
          tags,
          examples,
          constraints,
          testcases,
          codeSnippets,
          referenceSolution,
          userId: req.user.id,
        },
      });
      return res.status(201).json(newProblem);
    }
  } catch (error) {}
};

export const getAllProblems = async (req, res) => {};

export const getProblemById = async (req, res) => {};

export const updateProblem = async (req, res) => {};

export const deleteProblem = async (req, res) => {};

export const getAllSolvedProblemsByUser = async (req, res) => {};
