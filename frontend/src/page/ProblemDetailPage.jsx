import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { axiosInstance } from "../util/axios";
import toast from "react-hot-toast";

const ProblemDetailPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("JAVASCRIPT");
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [hints, setHints] = useState([]);
  const [loadingHints, setLoadingHints] = useState(false);

  // Cooldown states
  const [runCooldown, setRunCooldown] = useState(0);
  const [submitCooldown, setSubmitCooldown] = useState(0);

  const languageMap = {
    JAVASCRIPT: { id: 63, name: "JavaScript", extension: "js" },
    PYTHON: { id: 71, name: "Python", extension: "py" },
    JAVA: { id: 62, name: "Java", extension: "java" },
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  useEffect(() => {
    if (problem && problem.codeSnippet) {
      setCode(problem.codeSnippet[selectedLanguage] || "");
    }
  }, [selectedLanguage, problem]);

  // Cooldown timers
  useEffect(() => {
    let runTimer;
    if (runCooldown > 0) {
      runTimer = setTimeout(() => {
        setRunCooldown(runCooldown - 1);
      }, 1000);
    }
    return () => clearTimeout(runTimer);
  }, [runCooldown]);

  useEffect(() => {
    let submitTimer;
    if (submitCooldown > 0) {
      submitTimer = setTimeout(() => {
        setSubmitCooldown(submitCooldown - 1);
      }, 1000);
    }
    return () => clearTimeout(submitTimer);
  }, [submitCooldown]);

  const fetchProblem = async () => {
    try {
      const response = await axiosInstance.get(`/problems/get-problem/${id}`);
      setProblem(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch problem");
      console.error("Error fetching problem:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHints = async () => {
    if (hints.length > 0) return; // Don't fetch if already loaded

    setLoadingHints(true);
    try {
      // Note: This endpoint doesn't exist in your backend, you may need to add it
      // For now, we'll show a placeholder
      setHints([]);
    } catch (error) {
      console.error("Error fetching hints:", error);
      setHints([]);
    } finally {
      setLoadingHints(false);
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    if (runCooldown > 0) {
      toast.error(`Please wait ${runCooldown} seconds before running again`);
      return;
    }

    setIsRunning(true);
    try {
      const testCases = problem.testCases || [];
      const inputs = testCases.map((tc) => tc.input);
      const outputs = testCases.map((tc) => tc.output);

      const payload = {
        source_code: code,
        language_id: languageMap[selectedLanguage].id,
        stdin: inputs,
        expected_outputs: outputs,
        problem_id: id,
      };

      // Fixed: Use correct endpoint for running code
      const response = await axiosInstance.post("/execute-code/run", payload);

      // Fixed: Handle the correct response structure from runCode endpoint
      const responseData = response.data.results;
      const formattedResults = {
        status: responseData.status,
        testCases: responseData.testCases || [],
        error: null,
      };

      setTestResults(formattedResults);
      setActiveTab("output");

      const passedCount = formattedResults.testCases.filter(
        (tc) => tc.passed
      ).length;
      const totalCount = formattedResults.testCases.length;

      if (formattedResults.status === "Accepted") {
        toast.success(`All ${totalCount} test cases passed!`);
      } else {
        toast.error(`${passedCount}/${totalCount} test cases passed`);
      }

      // Start 15-second cooldown
      setRunCooldown(15);
    } catch (error) {
      console.error("Error running code:", error);

      // Set error results for display in output tab
      const errorResults = {
        status: "Error",
        testCases: [],
        error: {
          message:
            error.response?.data?.error ||
            error.message ||
            "Unknown error occurred",
          details: error.response?.data?.message || "Failed to execute code",
        },
      };

      setTestResults(errorResults);
      setActiveTab("output");
      toast.error("Error running code");

      // Start 15-second cooldown even on error
      setRunCooldown(15);
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    if (submitCooldown > 0) {
      toast.error(
        `Please wait ${submitCooldown} seconds before submitting again`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const testCases = problem.testCases || [];
      const inputs = testCases.map((tc) => tc.input);
      const outputs = testCases.map((tc) => tc.output);

      const payload = {
        source_code: code,
        language_id: languageMap[selectedLanguage].id,
        stdin: inputs,
        expected_outputs: outputs,
        problem_id: id,
      };

      // Fixed: Use correct endpoint for submitting code
      const response = await axiosInstance.post(
        "/execute-code/submit",
        payload
      );

      // Fixed: Handle the correct response structure from executeCode endpoint
      const submissionData = response.data.submission;
      const formattedResults = {
        status: submissionData.status,
        testCases: submissionData.testCases || [],
        error: null,
      };

      setTestResults(formattedResults);
      setActiveTab("output");

      if (formattedResults.status === "Accepted") {
        toast.success("All test cases passed! Problem solved!");
      } else {
        const passedCount = formattedResults.testCases.filter(
          (tc) => tc.passed
        ).length;
        const totalCount = formattedResults.testCases.length;
        toast.error(`${passedCount}/${totalCount} test cases passed`);
      }

      // Start 15-second cooldown
      setSubmitCooldown(15);
    } catch (error) {
      console.error("Error submitting code:", error);

      // Set error results for display in output tab
      const errorResults = {
        status: "Error",
        testCases: [],
        error: {
          message:
            error.response?.data?.error ||
            error.message ||
            "Unknown error occurred",
          details: error.response?.data?.message || "Failed to submit code",
        },
      };

      setTestResults(errorResults);
      setActiveTab("output");
      toast.error("Error submitting code");

      // Start 15-second cooldown even on error
      setSubmitCooldown(15);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCode = () => {
    if (problem && problem.codeSnippet) {
      setCode(problem.codeSnippet[selectedLanguage] || "");
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "badge-success";
      case "MEDIUM":
        return "badge-warning";
      case "HARD":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Problem not found</h2>
          <p className="text-gray-600">
            The problem you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-base-100 border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <div className={`badge ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {problem.tags?.map((tag, index) => (
              <span key={index} className="badge badge-outline badge-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r flex flex-col">
          {/* Tabs */}
          <div className="tabs tabs-bordered px-4 pt-4">
            <button
              className={`tab ${
                activeTab === "description" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`tab ${activeTab === "hints" ? "tab-active" : ""}`}
              onClick={() => {
                setActiveTab("hints");
                fetchHints();
              }}
            >
              Hints
            </button>
            <button
              className={`tab ${activeTab === "output" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("output")}
            >
              Output
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "description" ? (
              <div className="space-y-6">
                {/* Problem Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Problem Statement
                  </h3>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                    {problem.description}
                  </div>
                </div>

                {/* Examples */}
                {problem.examples && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Examples</h3>
                    {Object.entries(problem.examples).map(([lang, example]) => (
                      <div
                        key={lang}
                        className="mb-4 p-4 bg-base-200 rounded-lg"
                      >
                        <h4 className="font-medium mb-2">{lang}</h4>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <strong>Input:</strong>
                            <code className="ml-2 bg-base-300 px-2 py-1 rounded font-mono text-sm">
                              {example.input}
                            </code>
                          </div>
                          <div className="text-sm">
                            <strong>Output:</strong>
                            <code className="ml-2 bg-base-300 px-2 py-1 rounded font-mono text-sm">
                              {example.output}
                            </code>
                          </div>
                          {example.explanation && (
                            <div className="text-sm">
                              <strong>Explanation:</strong>
                              <span className="ml-2 text-gray-600">
                                {example.explanation}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Constraints</h3>
                    <div className="text-gray-700 font-mono text-sm bg-base-200 p-3 rounded leading-relaxed">
                      {problem.constraints}
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === "hints" ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Hints</h3>
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-2 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <p>No hints available for this problem</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                {testResults ? (
                  <div className="space-y-4">
                    {/* Show error if there's a general error */}
                    {testResults.error && (
                      <div className="alert alert-error">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5" />
                          <div>
                            <div className="font-medium">
                              {testResults.error.message}
                            </div>
                            <div className="text-sm opacity-75">
                              {testResults.error.details}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Overall Status - only show if we have test cases */}
                    {testResults.testCases &&
                      testResults.testCases.length > 0 && (
                        <div
                          className={`alert ${
                            testResults.status === "Accepted"
                              ? "alert-success"
                              : testResults.status === "Error"
                              ? "alert-error"
                              : "alert-warning"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {testResults.status === "Accepted" ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <XCircle className="w-5 h-5" />
                            )}
                            <span className="font-medium">
                              {testResults.status}
                            </span>
                            <span className="ml-2">
                              (
                              {
                                testResults.testCases.filter((tc) => tc.passed)
                                  .length
                              }
                              /{testResults.testCases.length} passed)
                            </span>
                          </div>
                        </div>
                      )}

                    {/* Individual Test Cases */}
                    {testResults.testCases?.map((testCase, index) => (
                      <div key={index} className="card bg-base-100 shadow">
                        <div className="card-body p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">
                              Test Case {testCase.testCase || index + 1}
                            </h4>
                            <div
                              className={`badge ${
                                testCase.passed
                                  ? "badge-success"
                                  : "badge-error"
                              }`}
                            >
                              {testCase.passed ? "PASS" : "FAIL"}
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div>
                              <strong>Status:</strong> {testCase.status}
                            </div>

                            {/* Show compilation error first if it exists */}
                            {testCase.compileOutput && (
                              <div>
                                <strong>Compilation Error:</strong>
                                <pre className="bg-red-100 text-red-800 p-2 rounded mt-1 overflow-x-auto">
                                  {testCase.compileOutput}
                                </pre>
                              </div>
                            )}

                            {/* Show runtime error if it exists */}
                            {testCase.stderr && (
                              <div>
                                <strong>Runtime Error:</strong>
                                <pre className="bg-red-100 text-red-800 p-2 rounded mt-1 overflow-x-auto">
                                  {testCase.stderr}
                                </pre>
                              </div>
                            )}

                            {/* Only show output comparison if there's no compilation error */}
                            {!testCase.compileOutput && (
                              <>
                                {testCase.stdout !== undefined && (
                                  <div>
                                    <strong>Your Output:</strong>
                                    <pre className="bg-base-200 p-2 rounded mt-1 overflow-x-auto">
                                      {testCase.stdout || "(empty)"}
                                    </pre>
                                  </div>
                                )}

                                {testCase.expected !== undefined && (
                                  <div>
                                    <strong>Expected Output:</strong>
                                    <pre className="bg-base-200 p-2 rounded mt-1 overflow-x-auto">
                                      {testCase.expected || "(empty)"}
                                    </pre>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Performance metrics */}
                            <div className="flex gap-4 pt-2">
                              {testCase.time && (
                                <div className="text-xs">
                                  <strong>Time:</strong> {testCase.time}
                                </div>
                              )}
                              {testCase.memory && (
                                <div className="text-xs">
                                  <strong>Memory:</strong> {testCase.memory}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Run or submit your code to see results</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Editor Header */}
          <div className="bg-base-100 border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select
                className="select select-bordered select-sm"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {Object.entries(languageMap).map(([key, lang]) => (
                  <option key={key} value={key}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-ghost btn-sm"
                onClick={resetCode}
                title="Reset to template"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                className="btn btn-outline btn-sm"
                onClick={runCode}
                disabled={isRunning || runCooldown > 0}
                title={
                  runCooldown > 0
                    ? `Wait ${runCooldown}s before running again`
                    : "Run code"
                }
              >
                {isRunning ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {runCooldown > 0 ? `Run (${runCooldown}s)` : "Run"}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={submitCode}
                disabled={isSubmitting || submitCooldown > 0}
                title={
                  submitCooldown > 0
                    ? `Wait ${submitCooldown}s before submitting again`
                    : "Submit code"
                }
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitCooldown > 0 ? `Submit (${submitCooldown}s)` : "Submit"}
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={
                selectedLanguage.toLowerCase() === "javascript"
                  ? "javascript"
                  : selectedLanguage.toLowerCase()
              }
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                tabSize: 2,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailPage;
