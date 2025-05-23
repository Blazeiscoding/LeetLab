import React, { useState, useEffect } from "react";
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

  const runCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setIsRunning(true);
    try {
      const testCases = problem.testCases || [];
      const sampleTestCase = testCases[0]; // Run with first test case

      const payload = {
        source_code: code,
        language_id: languageMap[selectedLanguage].id,
        stdin: [sampleTestCase.input],
        expected_outputs: [sampleTestCase.output],
        problem_id: id,
      };

      const response = await axiosInstance.post("/execute-code", payload);
      setTestResults(response.data.submission);
      setActiveTab("output");

      if (response.data.submission.status === "Accepted") {
        toast.success("Test case passed!");
      } else {
        toast.error("Test case failed");
      }
    } catch (error) {
      toast.error("Error running code");
      console.error("Error running code:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
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

      const response = await axiosInstance.post("/execute-code", payload);
      setTestResults(response.data.submission);
      setActiveTab("output");

      if (response.data.submission.status === "Accepted") {
        toast.success("All test cases passed! Problem solved!");
      } else {
        toast.error("Some test cases failed");
      }
    } catch (error) {
      toast.error("Error submitting code");
      console.error("Error submitting code:", error);
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
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {problem.description}
                  </p>
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
                          <div>
                            <strong>Input:</strong> {example.input}
                          </div>
                          <div>
                            <strong>Output:</strong> {example.output}
                          </div>
                          {example.explanation && (
                            <div>
                              <strong>Explanation:</strong>{" "}
                              {example.explanation}
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
                    <p className="text-gray-700 font-mono text-sm bg-base-200 p-3 rounded">
                      {problem.constraints}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                {testResults ? (
                  <div className="space-y-4">
                    <div
                      className={`alert ${
                        testResults.status === "Accepted"
                          ? "alert-success"
                          : "alert-error"
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
                      </div>
                    </div>

                    {testResults.testCases?.map((testCase, index) => (
                      <div key={index} className="card bg-base-100 shadow">
                        <div className="card-body p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">
                              Test Case {testCase.testCase}
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
                            {testCase.stdout && (
                              <div>
                                <strong>Output:</strong>
                                <pre className="bg-base-200 p-2 rounded mt-1">
                                  {testCase.stdout}
                                </pre>
                              </div>
                            )}
                            {testCase.expected && (
                              <div>
                                <strong>Expected:</strong>
                                <pre className="bg-base-200 p-2 rounded mt-1">
                                  {testCase.expected}
                                </pre>
                              </div>
                            )}
                            {testCase.stderr && (
                              <div>
                                <strong>Error:</strong>
                                <pre className="bg-red-100 text-red-800 p-2 rounded mt-1">
                                  {testCase.stderr}
                                </pre>
                              </div>
                            )}
                            {testCase.time && (
                              <div>
                                <strong>Time:</strong> {testCase.time}
                              </div>
                            )}
                            {testCase.memory && (
                              <div>
                                <strong>Memory:</strong> {testCase.memory}
                              </div>
                            )}
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
                disabled={isRunning}
              >
                {isRunning ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={submitCode}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit
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
