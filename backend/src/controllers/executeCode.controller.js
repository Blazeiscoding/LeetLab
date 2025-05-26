import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";

import { db } from "../libs/db.js";

// New function for just running code (no submission record)
export const runCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_outputs } = req.body;

    // Validate testCases array
    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      return res.status(400).json({ error: "Invalid testCases array" });
    }

    // Prepare each test case for judge0 batch submission
    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    // Submit batch to judge0
    const submitResponse = await submitBatch(submissions);
    const tokens = submitResponse.map((res) => res.token);
    const results = await pollBatchResults(tokens);

    let allPassed = true;

    const detailedResults = results.map((result, index) => {
      const stdout = result.stdout?.trim();
      const expected_output = expected_outputs[index].trim();
      const passed = stdout === expected_output;
      if (!passed) allPassed = false;

      return {
        testCase: index + 1,
        passed,
        stdout,
        expected: expected_output || null,
        stderr: result.stderr,
        compileOutput: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} KB` : undefined,
        time: result.time ? `${result.time} s` : undefined,
      };
    });

    return res.status(200).json({
      message: "Code Executed Successfully",
      success: true,
      results: {
        status: allPassed ? "Accepted" : "Wrong Answer",
        testCases: detailedResults,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Error While Running Code" });
  }
};

// Updated function for submitting code (creates submission record)
export const executeCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_outputs, problem_id } =
      req.body;

    const userId = req.user.id;

    // Validate testCases array
    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      return res.status(400).json({ error: "Invalid testCases array" });
    }

    // Prepare each test case for judge0 batch submission
    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    // Submit batch to judge0
    const submitResponse = await submitBatch(submissions);
    const tokens = submitResponse.map((res) => res.token);
    const results = await pollBatchResults(tokens);

    let allPassed = true;

    const detailedResults = results.map((result, index) => {
      const stdout = result.stdout?.trim();
      const expected_output = expected_outputs[index].trim();
      const passed = stdout === expected_output;
      if (!passed) allPassed = false;

      return {
        testCase: index + 1,
        passed,
        stdout,
        expected: expected_output || null,
        stderr: result.stderr,
        compileOutput: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} KB` : undefined,
        time: result.time ? `${result.time} s` : undefined,
      };
    });

    // Store submission summary (only when submitting)
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

    // If all passed, mark problem as solved for the current user
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

    // Save individual test case results
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
    console.log(error);
    return res.status(500).json({ error: "Error While Executing Code" });
  }
};
