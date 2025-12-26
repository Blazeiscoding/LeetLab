import axios, { AxiosError } from "axios";
import {
  LANGUAGE_IDS,
  LANGUAGE_NAMES,
  STATUS_CODES,
  POLLING_CONFIG,
} from "../utils/constants.js";

interface Submission {
  source_code: string;
  language_id: number;
  stdin: string;
  expected_output?: string;
}

interface SubmissionResponse {
  token: string;
}

interface Status {
  id: number;
  description: string;
}

interface SubmissionResult {
  status: Status;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  memory: number | null;
  time: number | null;
}

interface BatchResponse {
  submissions: SubmissionResponse[];
}

interface BatchResultsResponse {
  submissions: SubmissionResult[];
}

export const getJudge0LanguageId = (language: string): number | undefined => {
  const upperLanguage = language.toUpperCase() as keyof typeof LANGUAGE_IDS;
  return LANGUAGE_IDS[upperLanguage];
};

export const submitBatch = async (
  submissions: Submission[]
): Promise<BatchResponse> => {
  try {
    const options = {
      method: "POST" as const,
      url: `${
        process.env.RAPIDAPI_BASE_URL || "https://judge0-ce.p.rapidapi.com"
      }/submissions/batch`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "",
        "X-RapidAPI-Host":
          process.env.RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com",
      },
      data: {
        submissions,
      },
    };

    const { data } = await axios.request<BatchResponse>(options);
    console.log("Submission Results", data);
    return data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      "Error submitting batch:",
      axiosError.response?.data || axiosError.message
    );
    throw error;
  }
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (
  tokens: string[]
): Promise<SubmissionResult[]> => {
  const maxAttempts = POLLING_CONFIG.MAX_ATTEMPTS;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const { data } = await axios.get<BatchResultsResponse>(
        `${
          process.env.RAPIDAPI_BASE_URL || "https://judge0-ce.p.rapidapi.com"
        }/submissions/batch`,
        {
          params: {
            tokens: tokens.join(","),
            base64_encoded: false,
          },
          headers: {
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "",
            "X-RapidAPI-Host":
              process.env.RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com",
          },
        }
      );

      const results = data.submissions;

      // Check if all submissions are done processing
      const isAllDone = results.every(
        (result: SubmissionResult) =>
          result.status.id !== STATUS_CODES.IN_QUEUE &&
          result.status.id !== STATUS_CODES.PROCESSING
      );

      if (isAllDone) {
        return results;
      }

      await sleep(POLLING_CONFIG.INTERVAL_MS);
      attempts++;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        "Error polling results:",
        axiosError.response?.data || axiosError.message
      );
      throw error;
    }
  }

  throw new Error("Polling timeout: Results took too long to process");
};

export function getLanguageName(languageId: number): string | undefined {
  return LANGUAGE_NAMES[languageId];
}
