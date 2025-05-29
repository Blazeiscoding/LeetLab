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
      // Ensure problemToUpdate and its _id are available
      if (!problemToUpdate || !problemToUpdate._id) {
        toast.error(
          "No problem selected or problem ID is missing. Please close and retry."
        );
        return; // Exit if crucial data is missing
      }
      setUpdating(problemToUpdate._id); // Disable button and show spinner

      // Validate form data
      const result = problemSchema.safeParse(updateForm);
      if (!result.success) {
        const fieldErrors = {};
        result.error.errors.forEach((error) => {
          // For nested errors (like in testCases), path.join('.') is good.
          // For top-level array errors, Zod might put it on the field name itself.
          fieldErrors[error.path.join(".")] = error.message;
        });
        setErrors(fieldErrors);
        toast.error("Please correct the errors highlighted in the form."); // General validation error toast
        setUpdating(null); // Re-enable button
        return;
      }

      setErrors({}); // Clear any previous errors if validation passes

      const response = await axiosInstance.put(
        `/problems/update-problem/${problemToUpdate._id}`,
        updateForm
      );

      if (response.data.success) {
        toast.success("Problem updated successfully!");
        fetchProblems(); // Refresh the list
        closeUpdateModal();
      } else {
        // Handle cases where the API request was successful (e.g., status 200)
        // but the backend indicates a business logic failure.
        toast.error(
          response.data.message || "Failed to update problem. Please try again."
        );
      }
    } catch (error) {
      console.error("Error updating problem:", error); // Log the full error for debugging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = error.response.status;
        const message = error.response.data?.message || "An error occurred.";
        if (status === 403) {
          toast.error("You don't have permission to update problems.");
        } else if (status === 404) {
          toast.error("Problem not found on the server.");
        } else {
          toast.error(`Server error: ${message} (Status ${status})`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("No response from server. Check your network connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("Error setting up update request. Please try again.");
      }
    } finally {
      setUpdating(null); // Always re-enable the button in the end
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
      codeSnippets: problem.codeSnippets || {
        JAVASCRIPT: "",
        PYTHON: "",
        JAVA: "",
      },
      referenceSolutions: problem.referenceSolutions || {
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
  };

  const handleTestCaseChange = (index, field, value) => {
    setUpdateForm((prev) => ({
      ...prev,
      testCases: prev.testCases.map((testCase, i) =>
        i === index ? { ...testCase, [field]: value } : testCase
      ),
    }));
  };

  const addTestCase = () => {
    setUpdateForm((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", output: "" }],
    }));
  };

  const removeTestCase = (index) => {
    setUpdateForm((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));
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
          <div className="loading loading-spinner loading-lg text-primary"></div>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent mb-4">
            Update Problems
          </h1>
          <p className="text-gray-400 text-lg">
            Modify existing coding problems
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-base-100/10 backdrop-blur-xl border border-gray-200/20 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search problems by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-base-200/50 border border-gray-200/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-base-200/50 border border-gray-200/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white appearance-none cursor-pointer"
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
              key={problem._id}
              className="bg-base-100/10 backdrop-blur-xl border border-gray-200/20 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300 line-clamp-2">
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
                    className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-lg border border-primary/30"
                  >
                    {tag}
                  </span>
                ))}
                {problem.tags?.length > 3 && (
                  <span className="px-2 py-1 bg-gray-400/20 text-gray-400 text-xs rounded-lg">
                    +{problem.tags.length - 3} more
                  </span>
                )}
              </div>

              <button
                onClick={() => openUpdateModal(problem)}
                className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl py-3 font-semibold transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105"
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
          <div className="bg-base-100/95 backdrop-blur-xl border border-gray-200/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {" "}
            {/* MODIFIED: Added flex flex-col */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200/20">
              <h2 className="text-2xl font-bold text-white">Update Problem</h2>
              <button
                onClick={closeUpdateModal}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              {" "}
              {/* MODIFIED: Removed max-h-[calc(90vh-120px)], added flex-grow */}
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
                      className="w-full px-4 py-3 bg-base-200/50 border border-gray-200/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
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
                      className="w-full px-4 py-3 bg-base-200/50 border border-gray-200/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
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
                    className="w-full px-4 py-3 bg-base-200/50 border border-gray-200/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white resize-none"
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
                    className="w-full px-4 py-3 bg-base-200/50 border border-gray-200/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                    placeholder="array, sorting, dynamic-programming"
                  />
                  {errors.tags && (
                    <p className="text-red-400 text-sm mt-1">{errors.tags}</p>
                  )}
                </div>

                {/* Test Cases */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Test Cases *
                  </label>
                  {updateForm.testCases?.map((testCase, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-base-200/30 rounded-xl"
                    >
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Input
                        </label>
                        <textarea
                          value={testCase.input}
                          onChange={(e) =>
                            handleTestCaseChange(index, "input", e.target.value)
                          }
                          rows={2}
                          className="w-full px-3 py-2 bg-base-200/50 border border-gray-200/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white text-sm resize-none"
                          placeholder="Enter input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Expected Output
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
                          className="w-full px-3 py-2 bg-base-200/50 border border-gray-200/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white text-sm resize-none"
                          placeholder="Enter expected output"
                        />
                      </div>
                      {updateForm.testCases.length > 1 && (
                        <button
                          onClick={() => removeTestCase(index)}
                          className="col-span-2 text-red-400 hover:text-red-300 text-sm transition-colors duration-300"
                        >
                          Remove Test Case
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addTestCase}
                    className="text-primary hover:text-primary-light text-sm transition-colors duration-300"
                  >
                    + Add Test Case
                  </button>
                  {errors["testCases"] && ( // Adjusted to handle potential Zod path for array errors
                    <p className="text-red-400 text-sm mt-1">
                      {typeof errors["testCases"] === "string"
                        ? errors["testCases"]
                        : "Error in test cases."}
                    </p>
                  )}
                  {errors["testCases.input"] && ( // Example for specific field in test cases if needed
                    <p className="text-red-400 text-sm mt-1">
                      Input in test cases cannot be empty.
                    </p>
                  )}
                  {errors["testCases.output"] && (
                    <p className="text-red-400 text-sm mt-1">
                      Output in test cases cannot be empty.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 p-6 border-t border-gray-200/20">
              <button
                onClick={closeUpdateModal}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProblem}
                disabled={!!updating} // Ensure this disables correctly
                className="px-6 py-3 bg-primary hover:bg-primary-light text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
