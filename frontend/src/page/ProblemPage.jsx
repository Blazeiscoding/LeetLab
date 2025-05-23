import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, CheckCircle, Clock, Zap } from "lucide-react";
import { axiosInstance } from "../util/axios";
import toast from "react-hot-toast";

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [problems, searchTerm, difficultyFilter, statusFilter]);

  const fetchProblems = async () => {
    try {
      const response = await axiosInstance.get("/problems/get-all-problems");
      setProblems(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch problems");
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProblems = () => {
    let filtered = problems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (problem) =>
          problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (problem.tags &&
            problem.tags.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
    }

    // Difficulty filter
    if (difficultyFilter !== "ALL") {
      filtered = filtered.filter(
        (problem) => problem.difficulty === difficultyFilter
      );
    }

    setFilteredProblems(filtered);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "text-green-500";
      case "MEDIUM":
        return "text-yellow-500";
      case "HARD":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return <CheckCircle className="w-4 h-4" />;
      case "MEDIUM":
        return <Clock className="w-4 h-4" />;
      case "HARD":
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Problems</h1>
        <p className="text-gray-600">
          Practice coding problems to improve your skills
        </p>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-2">
              <select
                className="select select-bordered"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="ALL">All Difficulty</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Problems Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th className="text-left">Problem</th>
                  <th className="text-center">Difficulty</th>
                  <th className="text-center">Tags</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500">No problems found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((problem) => (
                    <tr key={problem.id} className="hover">
                      <td>
                        <Link
                          to={`/problems/${problem.id}`}
                          className="link link-hover font-medium"
                        >
                          {problem.title}
                        </Link>
                        {problem.description && (
                          <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
                            {problem.description.substring(0, 100)}...
                          </p>
                        )}
                      </td>
                      <td className="text-center">
                        <div
                          className={`flex items-center justify-center gap-2 ${getDifficultyColor(
                            problem.difficulty
                          )}`}
                        >
                          {getDifficultyIcon(problem.difficulty)}
                          <span className="font-medium">
                            {problem.difficulty}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {problem.tags?.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="badge badge-outline badge-sm"
                            >
                              {tag}
                            </span>
                          ))}
                          {problem.tags?.length > 3 && (
                            <span className="badge badge-outline badge-sm">
                              +{problem.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="badge badge-ghost">Not Attempted</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Total Problems</div>
          <div className="stat-value text-primary">{problems.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Easy</div>
          <div className="stat-value text-green-500">
            {problems.filter((p) => p.difficulty === "EASY").length}
          </div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Medium</div>
          <div className="stat-value text-yellow-500">
            {problems.filter((p) => p.difficulty === "MEDIUM").length}
          </div>
        </div>
      </div>
    </div>
  );
};
