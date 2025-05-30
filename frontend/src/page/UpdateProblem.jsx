import React, { useEffect, useState } from "react";
import { axiosInstance } from "../util/axios";
import {
  Edit,
  Search,
  Filter,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";
import { problemSchema } from "../util/zodSchema";
import toast from "react-hot-toast";

const UpdateProblem = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [problemToUpdate, setProblemToUpdate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [updateForm, setUpdateForm] = useState({});
  const [errors, setErrors] = useState({});

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/problems/get-all-problems");

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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (problem) =>
          problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          problem.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by difficulty
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
      // Use 'id' instead of '_id' for consistency with backend
      const problemId = problemToUpdate.id || problemToUpdate._id;

      if (!problemToUpdate || !problemId) {
        toast.error(
          "No problem selected or problem ID is missing. Please close and retry."
        );
        return;
      }

      setUpdating(problemId);

      // Create properly formatted data for validation
      const formDataForValidation = {
        ...updateForm,
        // Fix field names to match schema
        codeSnippets: updateForm.codeSnippet,
        referenceSolutions: updateForm.referenceSolution,
      };

      // Validate form data
      const result = problemSchema.safeParse(formDataForValidation);
      if (!result.success) {
        const fieldErrors = {};
        result.error.errors.forEach((error) => {
          // Map schema field names back to form field names
          let fieldPath = error.path.join(".");
          if (fieldPath.startsWith("codeSnippets")) {
            fieldPath = fieldPath.replace("codeSnippets", "codeSnippet");
          }
          if (fieldPath.startsWith("referenceSolutions")) {
            fieldPath = fieldPath.replace(
              "referenceSolutions",
              "referenceSolution"
            );
          }
          fieldErrors[fieldPath] = error.message;
        });
        setErrors(fieldErrors);
        toast.error("Please correct the errors highlighted in the form.");
        setUpdating(null);
        return;
      }

      setErrors({});

      // Send data with backend expected field names
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
      if (error.response) {
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
      } else if (error.request) {
        toast.error("No response from server. Check your network connection.");
      } else {
        toast.error("Error setting up update request. Please try again.");
      }
    } finally {
      setUpdating(null);
    }
  };

  const openUpdateModal = (problem) => {
    setProblemToUpdate(problem);
    setUpdateForm({
      title: problem.title || "",
      description: problem.description || "",
      difficulty: problem.difficulty || "EASY",
      tags: problem.tags || [],
      constraints: problem.constraints || "",
      hints: problem.hints || "",
      editorial: problem.editorial || "",
      testCases:
        problem.testCases?.length > 0
          ? problem.testCases
          : [{ input: "", output: "" }],
      examples: problem.examples || {
        JAVASCRIPT: { input: "", output: "", explanation: "" },
        PYTHON: { input: "", output: "", explanation: "" },
        JAVA: { input: "", output: "", explanation: "" },
      },
      // Use backend expected field names
      codeSnippet: problem.codeSnippet || {
        JAVASCRIPT: "",
        PYTHON: "",
        JAVA: "",
      },
      referenceSolution: problem.referenceSolution || {
        JAVASCRIPT: "",
        PYTHON: "",
        JAVA: "",
      },
    });
    setErrors({});
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setProblemToUpdate(null);
    setUpdateForm({});
    setErrors({});
  };

  const handleInputChange = (field, value) => {
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

  const handleNestedInputChange = (parent, child, value) => {
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

  const handleExampleChange = (language, field, value) => {
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

  const handleTestCaseChange = (index, field, value) => {
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

  const removeTestCase = (index) => {
    if (updateForm.testCases.length > 1) {
      setUpdateForm((prev) => ({
        ...prev,
        testCases: prev.testCases.filter((_, i) => i !== index),
      }));
    }
  };

  const getDifficultyColor = (difficulty) => {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Update Problems
          </h1>
          <p className="text-gray-400 text-lg">
            Modify existing coding problems
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search problems by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white appearance-none cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.map((problem) => (
            <div
              key={problem.id || problem._id}
              className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
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

              <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                {problem.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {problem.tags?.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg border border-blue-500/30"
                  >
                    {tag}
                  </span>
                ))}
                {problem.tags?.length > 3 && (
                  <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-lg">
                    +{problem.tags.length - 3} more
                  </span>
                )}
              </div>

              <button
                onClick={() => openUpdateModal(problem)}
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-xl py-3 font-semibold transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105"
              >
                <Edit className="w-4 h-4" />
                Update Problem
              </button>
            </div>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No Problems Found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && problemToUpdate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Update Problem</h2>
              <button
                onClick={closeUpdateModal}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={updateForm.title || ""}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                      placeholder="Enter problem title"
                    />
                    {errors.title && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Difficulty *
                    </label>
                    <select
                      value={updateForm.difficulty || "EASY"}
                      onChange={(e) =>
                        handleInputChange("difficulty", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                    {errors.difficulty && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.difficulty}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={updateForm.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white resize-none"
                    placeholder="Enter problem description"
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Tags * (comma-separated)
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
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                    placeholder="array, sorting, dynamic-programming"
                  />
                  {errors.tags && (
                    <p className="text-red-400 text-sm mt-1">{errors.tags}</p>
                  )}
                </div>

                {/* Constraints */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Constraints *
                  </label>
                  <textarea
                    value={updateForm.constraints || ""}
                    onChange={(e) =>
                      handleInputChange("constraints", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white resize-none"
                    placeholder="Enter problem constraints"
                  />
                  {errors.constraints && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.constraints}
                    </p>
                  )}
                </div>

                {/* Hints */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Hints (Optional)
                  </label>
                  <textarea
                    value={updateForm.hints || ""}
                    onChange={(e) => handleInputChange("hints", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white resize-none"
                    placeholder="Enter helpful hints for solving the problem"
                  />
                  {errors.hints && (
                    <p className="text-red-400 text-sm mt-1">{errors.hints}</p>
                  )}
                </div>

                {/* Editorial */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Editorial (Optional)
                  </label>
                  <textarea
                    value={updateForm.editorial || ""}
                    onChange={(e) =>
                      handleInputChange("editorial", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white resize-none"
                    placeholder="Enter detailed editorial explanation"
                  />
                  {errors.editorial && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.editorial}
                    </p>
                  )}
                </div>

                {/* Examples */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-4">
                    Examples *
                  </label>
                  {["JAVASCRIPT", "PYTHON", "JAVA"].map((lang) => (
                    <div
                      key={lang}
                      className="mb-6 p-4 bg-gray-800/30 rounded-xl"
                    >
                      <h4 className="text-lg font-semibold text-white mb-3">
                        {lang}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Input *
                          </label>
                          <textarea
                            value={updateForm.examples?.[lang]?.input || ""}
                            onChange={(e) =>
                              handleExampleChange(lang, "input", e.target.value)
                            }
                            rows={2}
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm resize-none"
                            placeholder="Enter example input"
                          />
                          {errors[`examples.${lang}.input`] && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors[`examples.${lang}.input`]}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Output *
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
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm resize-none"
                            placeholder="Enter example output"
                          />
                          {errors[`examples.${lang}.output`] && (
                            <p className="text-red-400 text-xs mt-1">
                              {errors[`examples.${lang}.output`]}
                            </p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">
                            Explanation (Optional)
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
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm resize-none"
                            placeholder="Enter explanation"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Code Snippets */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-4">
                    Code Snippets *
                  </label>
                  {["JAVASCRIPT", "PYTHON", "JAVA"].map((lang) => (
                    <div key={lang} className="mb-4">
                      <label className="block text-xs text-gray-400 mb-1">
                        {lang} *
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
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm resize-none font-mono"
                        placeholder={`Enter ${lang} code snippet`}
                      />
                      {errors[`codeSnippet.${lang}`] && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors[`codeSnippet.${lang}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reference Solutions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-4">
                    Reference Solutions *
                  </label>
                  {["JAVASCRIPT", "PYTHON", "JAVA"].map((lang) => (
                    <div key={lang} className="mb-4">
                      <label className="block text-xs text-gray-400 mb-1">
                        {lang} *
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
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm resize-none font-mono"
                        placeholder={`Enter ${lang} reference solution`}
                      />
                      {errors[`referenceSolution.${lang}`] && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors[`referenceSolution.${lang}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Test Cases */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-semibold text-gray-300">
                      Test Cases *
                    </label>
                    <button
                      onClick={addTestCase}
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      Add Test Case
                    </button>
                  </div>
                  {updateForm.testCases?.map((testCase, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-800/30 rounded-xl relative"
                    >
                      {updateForm.testCases.length > 1 && (
                        <button
                          onClick={() => removeTestCase(index)}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-300 transition-colors duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Input *
                        </label>
                        <textarea
                          value={testCase.input}
                          onChange={(e) =>
                            handleTestCaseChange(index, "input", e.target.value)
                          }
                          rows={2}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm resize-none font-mono"
                          placeholder="Enter test case input"
                        />
                        {errors[`testCases.${index}.input`] && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors[`testCases.${index}.input`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Output *
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
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white text-sm resize-none font-mono"
                          placeholder="Enter expected output"
                        />
                        {errors[`testCases.${index}.output`] && (
                          <p className="text-red-400 text-xs mt-1">
                            {errors[`testCases.${index}.output`]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-4 p-6 border-t border-gray-700">
              <button
                onClick={closeUpdateModal}
                className="px-6 py-3 text-gray-400 hover:text-white border border-gray-600 rounded-xl transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProblem}
                disabled={updating}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-xl transition-colors duration-300 flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
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
