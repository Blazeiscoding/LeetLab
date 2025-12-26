import { Request, Response } from "express";
import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../libs/rapidapi.lib.js";
import { db } from "../libs/db.js";
import { validateTestCases } from "../utils/validators.js";
import { errorResponse } from "../utils/errorHandler.js";
import { Prisma } from "@prisma/client";

interface RunCodeBody {
  source_code: string;
  language_id: number;
  stdin: string[];
  expected_outputs: string[];
}

interface ExecuteCodeBody extends RunCodeBody {
  problem_id: string;
}

interface TestCaseResult {
  testCase: number;
  passed: boolean;
  stdout: string;
  expected: string | null;
  stderr: string | null;
  compileOutput: string | null;
  status: string;
  memory?: string;
  time?: string;
}

interface ExecuteTestCasesResult {
  allPassed: boolean;
  detailedResults: TestCaseResult[];
}

/**
 * Executes code and returns test case results
 */
const executeTestCases = async (
  source_code: string,
  language_id: number,
  stdin: string[],
  expected_outputs: string[]
): Promise<ExecuteTestCasesResult> => {
  const submissions = stdin.map((input) => ({
    source_code,
    language_id,
    stdin: input,
  }));

  const submitResponse = await submitBatch(submissions);
  const tokens = submitResponse.submissions.map((res) => res.token);
  const results = await pollBatchResults(tokens);

  let allPassed = true;

  const detailedResults: TestCaseResult[] = results.map((result, index) => {
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

export const runCode = async (
  req: Request<unknown, unknown, RunCodeBody>,
  res: Response
): Promise<Response | void> => {
  try {
    const { source_code, language_id, stdin, expected_outputs } = req.body;

    const validation = validateTestCases(stdin, expected_outputs);
    if (!validation.isValid) {
      return errorResponse(
        res,
        400,
        validation.error || "Invalid test cases"
      );
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

export const executeCode = async (
  req: Request<unknown, unknown, ExecuteCodeBody>,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { source_code, language_id, stdin, expected_outputs, problem_id } =
      req.body;

    const userId = req.user.id;

    const validation = validateTestCases(stdin, expected_outputs);
    if (!validation.isValid) {
      return errorResponse(
        res,
        400,
        validation.error || "Invalid test cases"
      );
    }

    const { allPassed, detailedResults } = await executeTestCases(
      source_code,
      language_id,
      stdin,
      expected_outputs
    );

    const languageName = getLanguageName(language_id);
    if (!languageName) {
      return errorResponse(res, 400, "Invalid language ID");
    }

    const submission = await db.submission.create({
      data: {
        userId,
        problemId: problem_id,
        sourceCode: source_code,
        language: languageName,
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
        status: allPassed ? ("Accepted" as const) : ("WrongAnswer" as const),
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
      expected: result.expected || "",
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      status: (result.passed ? ("Accepted" as const) : ("WrongAnswer" as const)) as "Accepted" | "WrongAnswer",
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

