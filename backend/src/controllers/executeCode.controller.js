import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../libs/rapidapi.lib.js";
import { db } from "../libs/db.js";
import { validateTestCases } from "../utils/validators.js";
import { errorResponse } from "../utils/errorHandler.js";

/**
 * Executes code and returns test case results
 */
const executeTestCases = async (source_code, language_id, stdin, expected_outputs) => {
  const submissions = stdin.map((input) => ({
    source_code,
    language_id,
    stdin: input,
  }));

  const submitResponse = await submitBatch(submissions);
  const tokens = submitResponse.map((res) => res.token);
  const results = await pollBatchResults(tokens);

  let allPassed = true;

  const detailedResults = results.map((result, index) => {
    const stdout = result.stdout?.trim() || "";
    const expected_output = (expected_outputs[index] || "").trim();
    const passed = stdout === expected_output;
    if (!passed) allPassed = false;

    return {
      testCase: index + 1,
      passed,
      stdout,
      expected: expected_output || null,
      stderr: result.stderr || null,
      compileOutput: result.compile_output || null,
      status: result.status.description,
      memory: result.memory ? `${result.memory} KB` : undefined,
      time: result.time ? `${result.time} s` : undefined,
    };
  });

  return {
    allPassed,
    detailedResults,
  };
};

export const runCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_outputs } = req.body;

    const validation = validateTestCases(stdin, expected_outputs);
    if (!validation.isValid) {
      return errorResponse(res, 400, validation.error);
    }

    const { allPassed, detailedResults } = await executeTestCases(
      source_code,
      language_id,
      stdin,
      expected_outputs
    );

    return res.status(200).json({
      message: "Code Executed Successfully",
      success: true,
      results: {
        status: allPassed ? "Accepted" : "Wrong Answer",
        testCases: detailedResults,
      },
    });
  } catch (error) {
    console.error("Error executing code:", error);
    return errorResponse(res, 500, "Error While Executing Code", error);
  }
};

export const executeCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_outputs, problem_id } =
      req.body;

    const userId = req.user.id;

    const validation = validateTestCases(stdin, expected_outputs);
    if (!validation.isValid) {
      return errorResponse(res, 400, validation.error);
    }

    const { allPassed, detailedResults } = await executeTestCases(
      source_code,
      language_id,
      stdin,
      expected_outputs
    );

    const submission = await db.submission.create({
      data: {
        userId,
        problemId: problem_id,
        sourceCode: source_code,
        language: getLanguageName(language_id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedResults.map((result) => result.stdout)),
        stderr: detailedResults.some((result) => result.stderr)
          ? JSON.stringify(detailedResults.map((result) => result.stderr))
          : null,
        compileOutput: detailedResults.some((result) => result.compileOutput)
          ? JSON.stringify(
              detailedResults.map((result) => result.compileOutput)
            )
          : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
      },
    });

    if (allPassed) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId: problem_id,
          },
        },
        update: {},
        create: {
          userId,
          problemId: problem_id,
        },
      });
    }

    const testCaseResults = detailedResults.map((result) => ({
      submissionId: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }));

    await db.testCaseResult.createMany({
      data: testCaseResults,
    });

    const submissionWithTestCase = await db.submission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testCases: true,
      },
    });

    return res.status(200).json({
      message: "Code Submitted Successfully",
      success: true,
      submission: submissionWithTestCase,
    });
  } catch (error) {
    console.error("Error executing code:", error);
    return errorResponse(res, 500, "Error While Executing Code", error);
  }
};
