import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { axiosInstance } from "../utils/axios";
import { IconAlertCircle, IconCircleCheck, IconDeviceFloppy, IconEdit, IconFilter, IconPlus, IconSearch, IconTrash, IconX } from '@tabler/icons-react';
import { problemSchema } from "../utils/zodSchema";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { CodeSnippets, Difficulty, Problem, TestCase } from "../types";

type Language = "JAVASCRIPT" | "PYTHON" | "JAVA";
type DifficultyFilter = "all" | "easy" | "medium" | "hard";

interface ExampleForm {
  input: string;
  output: string;
  explanation: string;
}

interface UpdateFormData {
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  constraints: string;
  hints: string;
  editorial: string;
  testCases: TestCase[];
  examples: Record<Language, ExampleForm>;
  codeSnippet: CodeSnippets;
  referenceSolution: CodeSnippets;
}

interface ApiErrorPayload {
  message?: string;
  error?: string;
}

const DEFAULT_SNIPPETS: CodeSnippets = {
  JAVASCRIPT: "",
  PYTHON: "",
  JAVA: "",
};

const DEFAULT_EXAMPLES: Record<Language, ExampleForm> = {
  JAVASCRIPT: { input: "", output: "", explanation: "" },
  PYTHON: { input: "", output: "", explanation: "" },
  JAVA: { input: "", output: "", explanation: "" },
};

const DEFAULT_FORM: UpdateFormData = {
  title: "",
  description: "",
  difficulty: Difficulty.EASY,
  tags: [],
  constraints: "",
  hints: "",
  editorial: "",
  testCases: [{ input: "", output: "" }],
  examples: DEFAULT_EXAMPLES,
  codeSnippet: DEFAULT_SNIPPETS,
  referenceSolution: DEFAULT_SNIPPETS,
};

const LANGUAGES: Language[] = ["JAVASCRIPT", "PYTHON", "JAVA"];

const UpdateProblem = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [problemToUpdate, setProblemToUpdate] = useState<Problem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [updateForm, setUpdateForm] = useState<UpdateFormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const blurActiveElement = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<{ success: boolean; data: Problem[] }>(
        "/problems/get-all-problems"
      );

      if (response.data.success) {
        setProblems(response.data.data);
        setFilteredProblems(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
      toast.error("Failed to fetch problems. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = problems;

    if (searchTerm) {
      filtered = filtered.filter(
        (problem) =>
          problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          problem.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(
        (problem) => problem.difficulty.toLowerCase() === difficultyFilter
      );
    }

    setFilteredProblems(filtered);
  }, [searchTerm, difficultyFilter, problems]);

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleUpdateProblem = async () => {
    try {
      if (!problemToUpdate) {
        toast.error(
          "No problem selected or problem ID is missing. Please close and retry."
        );
        return;
      }

      const problemId = problemToUpdate.id || problemToUpdate._id;
      if (!problemId) {
        toast.error(
          "No problem selected or problem ID is missing. Please close and retry."
        );
        return;
      }

      setUpdating(problemId);

      const formDataForValidation = {
        ...updateForm,

        codeSnippets: updateForm.codeSnippet,
        referenceSolutions: updateForm.referenceSolution,
      };

      // Validate form data
      const result = problemSchema.safeParse(formDataForValidation);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((schemaError) => {
          // Map schema field names back to form field names
          let fieldPath = schemaError.path.join(".");
          if (fieldPath.startsWith("codeSnippets")) {
            fieldPath = fieldPath.replace("codeSnippets", "codeSnippet");
          }
          if (fieldPath.startsWith("referenceSolutions")) {
            fieldPath = fieldPath.replace(
              "referenceSolutions",
              "referenceSolution"
            );
          }
          fieldErrors[fieldPath] = schemaError.message;
        });
        setErrors(fieldErrors);
        toast.error("Please correct the errors highlighted in the form.");
        setUpdating(null);
        return;
      }

      setErrors({});

      const response = await axiosInstance.put(
        `/problems/update-problem/${problemId}`,
        updateForm
      );

      if (response.data.success) {
        toast.success("Problem updated successfully!");
        fetchProblems();
        closeUpdateModal();
      } else {
        toast.error(
          response.data.message || "Failed to update problem. Please try again."
        );
      }
    } catch (error) {
      console.error("Error updating problem:", error);
      if (isAxiosError<ApiErrorPayload>(error) && error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          "An error occurred.";
        if (status === 403) {
          toast.error("You don't have permission to update problems.");
        } else if (status === 404) {
          toast.error("Problem not found on the server.");
        } else {
          toast.error(`Server error: ${message} (Status ${status})`);
        }
      } else if (isAxiosError(error) && error.request) {
        toast.error("No response from server. Check your network connection.");
      } else {
        toast.error("Error setting up update request. Please try again.");
      }
    } finally {
      setUpdating(null);
    }
  };

  const openUpdateModal = (problem: Problem) => {
    setProblemToUpdate(problem);
    setUpdateForm({
      title: problem.title || "",
      description: problem.description || "",
      difficulty: problem.difficulty || Difficulty.EASY,
      tags: problem.tags || [],
      constraints: problem.constraints || "",
      hints: problem.hints || "",
      editorial: problem.editorial || "",
      testCases:
        problem.testCases?.length > 0
          ? problem.testCases
          : [{ input: "", output: "" }],
      examples: problem.examples
        ? {
            JAVASCRIPT: {
              input: problem.examples.JAVASCRIPT.input || "",
              output: problem.examples.JAVASCRIPT.output || "",
              explanation: problem.examples.JAVASCRIPT.explanation || "",
            },
            PYTHON: {
              input: problem.examples.PYTHON.input || "",
              output: problem.examples.PYTHON.output || "",
              explanation: problem.examples.PYTHON.explanation || "",
            },
            JAVA: {
              input: problem.examples.JAVA.input || "",
              output: problem.examples.JAVA.output || "",
              explanation: problem.examples.JAVA.explanation || "",
            },
          }
        : DEFAULT_EXAMPLES,
      codeSnippet: problem.codeSnippet || problem.codeSnippets || DEFAULT_SNIPPETS,
      referenceSolution:
        problem.referenceSolution || problem.referenceSolutions || DEFAULT_SNIPPETS,
    });
    setErrors({});
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setProblemToUpdate(null);
    setUpdateForm(DEFAULT_FORM);
    setErrors({});
  };

  const handleInputChange = <K extends keyof UpdateFormData>(
    field: K,
    value: UpdateFormData[K]
  ) => {
    setUpdateForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleNestedInputChange = (
    parent: "codeSnippet" | "referenceSolution",
    child: Language,
    value: string
  ) => {
    setUpdateForm((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value,
      },
    }));

    const errorKey = `${parent}.${child}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: undefined,
      }));
    }
  };

  const handleExampleChange = (
    language: Language,
    field: keyof ExampleForm,
    value: string
  ) => {
    setUpdateForm((prev) => ({
      ...prev,
      examples: {
        ...prev.examples,
        [language]: {
          ...prev.examples[language],
          [field]: value,
        },
      },
    }));

    const errorKey = `examples.${language}.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: undefined,
      }));
    }
  };

  const handleTestCaseChange = (
    index: number,
    field: keyof TestCase,
    value: string
  ) => {
    setUpdateForm((prev) => ({
      ...prev,
      testCases: prev.testCases.map((testCase, i) =>
        i === index ? { ...testCase, [field]: value } : testCase
      ),
    }));

    const errorKey = `testCases.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: undefined,
      }));
    }
  };

  const addTestCase = () => {
    setUpdateForm((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", output: "" }],
    }));
  };

  const removeTestCase = (index: number) => {
    if (updateForm.testCases.length > 1) {
      setUpdateForm((prev) => ({
        ...prev,
        testCases: prev.testCases.filter((_, i) => i !== index),
      }));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "hard":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200/50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Update Problems
          </h1>
          <p className="text-base-content/60 text-lg">
            Modify existing coding problems
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl border border-base-content/5 mb-8 backdrop-blur-xl overflow-visible relative z-30">
          <div className="card-body p-6 flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search problems by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="relative dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn bg-base-100 border-base-content/20 hover:border-primary text-base-content gap-2 min-w-[160px] justify-between font-medium capitalize h-[52px]"
              >
                <div className="flex items-center gap-2">
                  <IconFilter className="w-4 h-4 text-base-content/50" />
                  {difficultyFilter === "all" ? "All Difficulties" : difficultyFilter}
                </div>
                <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow-xl bg-base-100 border border-base-content/10 rounded-xl w-52 mt-2">
                {([
                  { value: "all", label: "All Difficulties", color: "text-base-content" },
                  { value: "easy", label: "Easy", color: "text-success" },
                  { value: "medium", label: "Medium", color: "text-warning" },
                  { value: "hard", label: "Hard", color: "text-error" }
                ] as { value: DifficultyFilter; label: string; color: string }[]).map((option) => (
                  <li key={option.value}>
                    <button
                      className={`flex items-center gap-2 ${difficultyFilter === option.value ? "bg-base-200 active" : ""}`}
                      onClick={() => {
                        setDifficultyFilter(option.value);
                        blurActiveElement();
                      }}
                    >
                      <span className={`w-2 h-2 rounded-full ${option.value === "all" ? "bg-gradient-to-r from-success via-warning to-error" : `bg-current ${option.color}`}`}></span>
                      <span className={option.color}>{option.label}</span>
                      {difficultyFilter === option.value && <IconCircleCheck className="w-4 h-4 ml-auto text-primary" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.map((problem) => (
            <div
              key={problem.id || problem._id}
              className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-300 border border-base-content/5 group"
            >
              <div className="card-body p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="card-title text-xl font-bold text-base-content group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {problem.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>

                <p className="text-base-content/70 text-sm mb-4 line-clamp-3">
                  {problem.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {problem.tags?.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="badge badge-ghost badge-sm"
                    >
                      {tag}
                    </span>
                  ))}
                  {problem.tags?.length > 3 && (
                    <span className="badge badge-ghost badge-sm opacity-60">
                      +{problem.tags.length - 3} more
                    </span>
                  )}
                </div>

                <button
                  onClick={() => openUpdateModal(problem)}
                  className="btn btn-primary btn-outline w-full gap-2 group-hover:scale-105"
                >
                  <IconEdit className="w-4 h-4" />
                  Update Problem
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <IconAlertCircle className="w-16 h-16 text-base-content/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-base-content/60 mb-2">
              No Problems Found
            </h3>
            <p className="text-base-content/50">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {showUpdateModal && problemToUpdate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="modal-box w-11/12 max-w-6xl bg-base-100 border border-base-content/10 max-h-[90vh] overflow-hidden flex flex-col p-0">
            <div className="flex justify-between items-center p-6 border-b border-base-content/10">
              <h2 className="text-2xl font-bold text-base-content">Update Problem</h2>
              <button
                onClick={closeUpdateModal}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow bg-base-100">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Title *</span>
                    </label>
                    <input
                      type="text"
                      value={updateForm.title || ""}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="input input-bordered w-full bg-base-200 focus:bg-base-100"
                      placeholder="Enter problem title"
                    />
                    {errors.title && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.title}</span>
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Difficulty *</span>
                    </label>
                    <div className="dropdown w-full">
                      <div
                        tabIndex={0}
                        role="button"
                        className={`btn w-full justify-between bg-base-200 border-base-content/20 hover:border-primary font-normal text-base h-[50px] ${
                          updateForm.difficulty === "EASY"
                            ? "text-success"
                            : updateForm.difficulty === "MEDIUM"
                            ? "text-warning"
                            : "text-error"
                        }`}
                      >
                        <span className="flex items-center gap-2 capitalize">
                          {updateForm.difficulty || "Select Difficulty"}
                        </span>
                        <svg
                          className="w-5 h-5 opacity-50"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow-xl bg-base-100 border border-base-content/10 rounded-xl w-full mt-1">
                        {([
                          { value: "EASY", label: "Easy", color: "text-success" },
                          { value: "MEDIUM", label: "Medium", color: "text-warning" },
                          { value: "HARD", label: "Hard", color: "text-error" }
                        ] as { value: Difficulty; label: string; color: string }[]).map((option) => (
                          <li key={option.value}>
                            <button
                              type="button"
                              className={`flex items-center gap-2 ${option.color} hover:bg-base-200`}
                              onClick={() => {
                                handleInputChange("difficulty", option.value);
                                blurActiveElement();
                              }}
                            >
                              <span className={`w-2 h-2 rounded-full bg-current`}></span>
                              {option.label}
                              {updateForm.difficulty === option.value && <IconCircleCheck className="w-4 h-4 ml-auto" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {errors.difficulty && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.difficulty}</span>
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Description *</span>
                  </label>
                  <textarea
                    value={updateForm.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="textarea textarea-bordered w-full bg-base-200 focus:bg-base-100 resize-none text-base"
                    placeholder="Enter problem description"
                  />
                  {errors.description && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.description}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Tags * (comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={updateForm.tags?.join(", ") || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "tags",
                        e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter((tag) => tag)
                      )
                    }
                    className="input input-bordered w-full bg-base-200 focus:bg-base-100"
                    placeholder="array, sorting, dynamic-programming"
                  />
                  {errors.tags && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.tags}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Constraints *</span>
                  </label>
                  <textarea
                    value={updateForm.constraints || ""}
                    onChange={(e) =>
                      handleInputChange("constraints", e.target.value)
                    }
                    rows={3}
                    className="textarea textarea-bordered w-full bg-base-200 focus:bg-base-100 resize-none"
                    placeholder="Enter problem constraints"
                  />
                  {errors.constraints && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.constraints}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Hints (Optional)</span>
                  </label>
                  <textarea
                    value={updateForm.hints || ""}
                    onChange={(e) => handleInputChange("hints", e.target.value)}
                    rows={3}
                    className="textarea textarea-bordered w-full bg-base-200 focus:bg-base-100 resize-none"
                    placeholder="Enter helpful hints for solving the problem"
                  />
                  {errors.hints && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.hints}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Editorial (Optional)</span>
                  </label>
                  <textarea
                    value={updateForm.editorial || ""}
                    onChange={(e) =>
                      handleInputChange("editorial", e.target.value)
                    }
                    rows={4}
                    className="textarea textarea-bordered w-full bg-base-200 focus:bg-base-100 resize-none"
                    placeholder="Enter detailed editorial explanation"
                  />
                  {errors.editorial && (
                    <label className="label">
                      <span className="label-text-alt text-error">{errors.editorial}</span>
                    </label>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold text-lg">Examples *</span>
                  </label>
                  {LANGUAGES.map((lang) => (
                    <div
                      key={lang}
                      className="mb-6 p-4 bg-base-200/50 rounded-xl border border-base-content/5"
                    >
                      <h4 className="text-lg font-semibold text-base-content mb-3">
                        {lang}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="label pb-0">
                            <span className="label-text-alt">Input *</span>
                          </label>
                          <textarea
                            value={updateForm.examples?.[lang]?.input || ""}
                            onChange={(e) =>
                              handleExampleChange(lang, "input", e.target.value)
                            }
                            rows={2}
                            className="textarea textarea-bordered w-full bg-base-100 text-sm resize-none font-mono"
                            placeholder="Enter example input"
                          />
                          {errors[`examples.${lang}.input`] && (
                            <span className="text-error text-xs mt-1 block">
                              {errors[`examples.${lang}.input`]}
                            </span>
                          )}
                        </div>
                        <div>
                          <label className="label pb-0">
                            <span className="label-text-alt">Output *</span>
                          </label>
                          <textarea
                            value={updateForm.examples?.[lang]?.output || ""}
                            onChange={(e) =>
                              handleExampleChange(
                                lang,
                                "output",
                                e.target.value
                              )
                            }
                            rows={2}
                            className="textarea textarea-bordered w-full bg-base-100 text-sm resize-none font-mono"
                            placeholder="Enter example output"
                          />
                          {errors[`examples.${lang}.output`] && (
                            <span className="text-error text-xs mt-1 block">
                              {errors[`examples.${lang}.output`]}
                            </span>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="label pb-0">
                            <span className="label-text-alt">Explanation (Optional)</span>
                          </label>
                          <textarea
                            value={
                              updateForm.examples?.[lang]?.explanation || ""
                            }
                            onChange={(e) =>
                              handleExampleChange(
                                lang,
                                "explanation",
                                e.target.value
                              )
                            }
                            rows={2}
                            className="textarea textarea-bordered w-full bg-base-100 text-sm resize-none"
                            placeholder="Enter explanation"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold text-lg">Code Snippets *</span>
                  </label>
                  {LANGUAGES.map((lang) => (
                    <div key={lang} className="mb-4">
                      <label className="label pb-0">
                        <span className="label-text-alt">{lang} *</span>
                      </label>
                      <textarea
                        value={updateForm.codeSnippet?.[lang] || ""}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "codeSnippet",
                            lang,
                            e.target.value
                          )
                        }
                        rows={4}
                        className="textarea textarea-bordered w-full bg-base-200 focus:bg-base-100 text-sm resize-none font-mono"
                        placeholder={`Enter ${lang} code snippet`}
                      />
                      {errors[`codeSnippet.${lang}`] && (
                        <span className="text-error text-xs mt-1 block">
                          {errors[`codeSnippet.${lang}`]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold text-lg">Reference Solutions *</span>
                  </label>
                  {LANGUAGES.map((lang) => (
                    <div key={lang} className="mb-4">
                      <label className="label pb-0">
                        <span className="label-text-alt">{lang} *</span>
                      </label>
                      <textarea
                        value={updateForm.referenceSolution?.[lang] || ""}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "referenceSolution",
                            lang,
                            e.target.value
                          )
                        }
                        rows={6}
                        className="textarea textarea-bordered w-full bg-base-200 focus:bg-base-100 text-sm resize-none font-mono"
                        placeholder={`Enter ${lang} reference solution`}
                      />
                      {errors[`referenceSolution.${lang}`] && (
                        <span className="text-error text-xs mt-1 block">
                          {errors[`referenceSolution.${lang}`]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="label">
                      <span className="label-text font-semibold text-lg">Test Cases *</span>
                    </label>
                    <button
                      onClick={addTestCase}
                      className="btn btn-sm btn-ghost text-primary"
                    >
                      <IconPlus className="w-4 h-4" />
                      Add Test Case
                    </button>
                  </div>
                  {updateForm.testCases?.map((testCase, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-base-200/50 rounded-xl relative border border-base-content/5"
                    >
                      {updateForm.testCases.length > 1 && (
                        <button
                          onClick={() => removeTestCase(index)}
                          className="absolute top-2 right-2 btn btn-ghost btn-xs text-error"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      )}
                      <div>
                        <label className="label pb-0">
                          <span className="label-text-alt">Input *</span>
                        </label>
                        <textarea
                          value={testCase.input}
                          onChange={(e) =>
                            handleTestCaseChange(index, "input", e.target.value)
                          }
                          rows={2}
                          className="textarea textarea-bordered w-full bg-base-100 text-sm resize-none font-mono"
                          placeholder="Enter test case input"
                        />
                        {errors[`testCases.${index}.input`] && (
                          <span className="text-error text-xs mt-1 block">
                            {errors[`testCases.${index}.input`]}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="label pb-0">
                          <span className="label-text-alt">Output *</span>
                        </label>
                        <textarea
                          value={testCase.output}
                          onChange={(e) =>
                            handleTestCaseChange(
                              index,
                              "output",
                              e.target.value
                            )
                          }
                          rows={2}
                          className="textarea textarea-bordered w-full bg-base-100 text-sm resize-none font-mono"
                          placeholder="Enter expected output"
                        />
                        {errors[`testCases.${index}.output`] && (
                          <span className="text-error text-xs mt-1 block">
                            {errors[`testCases.${index}.output`]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 p-6 border-t border-base-content/10 bg-base-100">
              <button
                onClick={closeUpdateModal}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProblem}
                disabled={Boolean(updating)}
                className="btn btn-primary gap-2"
              >
                {updating ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <IconDeviceFloppy className="w-4 h-4" />
                    Update Problem
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateProblem;
