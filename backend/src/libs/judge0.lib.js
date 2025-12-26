import axios from "axios";
import { LANGUAGE_IDS, LANGUAGE_NAMES, STATUS_CODES, POLLING_CONFIG } from "../utils/constants.js";

export const getJudge0LanguageId = (language) => {
  return LANGUAGE_IDS[language.toUpperCase()];
};

export const submitBatch = async (submissions) => {
  try {
    const options = {
      method: "POST",
      url: `${process.env.JUDGE0_API_URL}/submissions/batch`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.JUDGE0_AUTH}`,
      },
      data: {
        submissions,
      },
    };

    const { data } = await axios.request(options);
    console.log("Submission Results", data);
    return data;
  } catch (error) {
    console.error(
      "Error submitting batch:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
  const maxAttempts = POLLING_CONFIG.MAX_ATTEMPTS;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const { data } = await axios.get(
        `${process.env.JUDGE0_API_URL}/submissions/batch`,
        {
          params: {
            tokens: tokens.join(","),
            base64_encoded: false,
          },
          headers: {
            Authorization: `Bearer ${process.env.JUDGE0_AUTH}`,
          },
        }
      );

      const results = data.submissions;

      // Check if all submissions are done processing
      const isAllDone = results.every(
        (result) =>
          result.status.id !== STATUS_CODES.IN_QUEUE &&
          result.status.id !== STATUS_CODES.PROCESSING
      );

      if (isAllDone) {
        return results;
      }

      await sleep(POLLING_CONFIG.INTERVAL_MS);
      attempts++;
    } catch (error) {
      console.error(
        "Error polling results:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  throw new Error("Polling timeout: Results took too long to process");
};

export function getLanguageName(languageId) {
  return LANGUAGE_NAMES[languageId];
}
