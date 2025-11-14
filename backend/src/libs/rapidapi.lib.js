import axios from "axios";

export const getJudge0LanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  };
  return languageMap[language.toUpperCase()];
};

export const submitBatch = async (submissions) => {
  try {
    const options = {
      method: "POST",
      url: `${process.env.RAPIDAPI_BASE_URL || "https://judge0-ce.p.rapidapi.com"}/submissions/batch`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": process.env.RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com",
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
  const maxAttempts = 30; // Prevent infinite loops
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const { data } = await axios.get(
        `${process.env.RAPIDAPI_BASE_URL || "https://judge0-ce.p.rapidapi.com"}/submissions/batch`,
        {
          params: {
            tokens: tokens.join(","),
            base64_encoded: false,
          },
          headers: {
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
            "X-RapidAPI-Host": process.env.RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com",
          },
        }
      );

      const results = data.submissions;

      // Check if all submissions are done processing
      // Status IDs: 1 = In Queue, 2 = Processing
      const isAllDone = results.every(
        (result) => result.status.id !== 1 && result.status.id !== 2
      );

      if (isAllDone) {
        return results;
      }

      await sleep(1000);
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
  const LANGUAGE_NAMES = {
    71: "PYTHON",
    62: "JAVA",
    63: "JAVASCRIPT",
  };
  return LANGUAGE_NAMES[languageId];
}

