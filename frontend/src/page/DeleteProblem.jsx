import  { useState, useEffect } from "react";
import { Trash2, AlertTriangle, Search, Filter, X, CheckCircle, Clock } from "lucide-react";


import { axiosInstance } from "../util/axios.js";

const DeleteProblem = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all problems
  const fetchProblems = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await axiosInstance.get("/problems/get-all-problems");

      if (response.data.success) {
        setProblems(response.data.data);
        setFilteredProblems(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
      setErrorMessage("Failed to fetch problems. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter problems based on search and difficulty
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

  // Handle delete problem
  const handleDeleteProblem = async (problemId) => {
    try {
      setDeleteLoading(problemId);
      setErrorMessage("");

      const response = await axiosInstance.delete(
        `/problems/delete-problem/${problemId}`
      );

      if (response.data.success) {
        setProblems(problems.filter((p) => p.id !== problemId));
        setSuccessMessage("Problem deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage("Failed to delete problem");
      }
    } catch (error) {
      console.error("Error deleting problem:", error);
      if (error.response?.status === 403) {
        setErrorMessage("You don't have permission to delete problems");
      } else if (error.response?.status === 404) {
        setErrorMessage("Problem not found");
      } else {
        setErrorMessage("Error deleting problem. Please try again.");
      }
    } finally {
      setDeleteLoading(null);
      setShowDeleteModal(false);
      setProblemToDelete(null);
    }
  };

  const openDeleteModal = (problem) => {
    setProblemToDelete(problem);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProblemToDelete(null);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-4">
            Delete Problems
          </h1>
          <p className="text-gray-400 text-lg">
            Manage and delete problems from the platform
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-center">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
            {errorMessage}
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:gap-4 md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search problems by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="relative dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn bg-gray-800/50 border-gray-700/50 hover:bg-gray-700 hover:border-gray-600 text-white gap-2 min-w-[160px] justify-between font-medium capitalize h-[52px]"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                {difficultyFilter === "all" ? "All Difficulties" : difficultyFilter}
              </div>
              <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow-xl bg-gray-800 border border-gray-700 rounded-xl w-52 mt-2">
              {[
                { value: "all", label: "All Difficulties", color: "text-white" },
                { value: "easy", label: "Easy", color: "text-green-400" },
                { value: "medium", label: "Medium", color: "text-yellow-400" },
                { value: "hard", label: "Hard", color: "text-red-400" }
              ].map((option) => (
                <li key={option.value}>
                  <button
                    className={`flex items-center gap-2 ${difficultyFilter === option.value ? "bg-gray-700 active" : ""}`}
                    onClick={() => {
                      setDifficultyFilter(option.value);
                      document.activeElement?.blur();
                    }}
                  >
                    <span className={`w-2 h-2 rounded-full ${option.value === "all" ? "bg-gradient-to-r from-green-400 via-yellow-400 to-red-400" : `bg-current ${option.color}`}`}></span>
                    <span className={option.color}>{option.label}</span>
                    {difficultyFilter === option.value && <CheckCircle className="w-4 h-4 ml-auto text-blue-400" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Problems Grid */}
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {problems.length === 0
                ? "No problems found"
                : "No problems match your filters"}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProblems.map((problem) => (
              <div
                key={problem.id}
                className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300 group"
              >
                {/* Problem Header */}
                <div className="flex items-start justify-between mb-4">
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

                {/* Problem Description */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {problem.description}
                </p>

                {/* Tags */}
                {problem.tags && problem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {problem.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-lg border border-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                    {problem.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-lg">
                        +{problem.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Problem ID for debugging */}
                <p className="text-xs text-gray-500 mb-4">ID: {problem.id}</p>

                {/* Delete Button */}
                <button
                  onClick={() => openDeleteModal(problem)}
                  disabled={deleteLoading === problem.id}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-105"
                >
                  {deleteLoading === problem.id ? (
                    <>
                      <div className="loading loading-spinner loading-sm"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Problem
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && problemToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Delete Problem
                </h3>
                <p className="text-gray-400">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-semibold">
                    "{problemToDelete.title}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProblem(problemToDelete.id)}
                  disabled={deleteLoading === problemToDelete.id}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading === problemToDelete.id ? (
                    <>
                      <div className="loading loading-spinner loading-sm"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteProblem;
