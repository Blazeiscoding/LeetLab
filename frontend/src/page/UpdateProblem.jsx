import React, { useEffect, useState } from "react";
import { axiosInstance } from "../util/axios";

const UpdateProblem = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [problemToUpdate, setProblemToUpdate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleUpdateProblem = async (problemId) => {
    try {
      setUpdating(problemId);
      const response = await axiosInstance.put(
        `/problems/update-problem/${problemId}`
      );
      if (response.data.success) {
        setSuccessMessage("Problem updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating problem:", error);
      if (error.response?.status === 403) {
        setErrorMessage("You don't have permission to update problems");
      } else if (error.response?.status === 404) {
        setErrorMessage("Problem not found");
      } else {
        setErrorMessage("Error updating problem. Please try again.");
      }
    } finally {
      setUpdating(null);
      setShowUpdateModal(false);
      setProblemToUpdate(null);
    }
  };

  const openUpdateModal = (problem) => {
    setProblemToUpdate(problem);
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setProblemToUpdate(null);
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
  return <div>UpdateProblem</div>;
};

export default UpdateProblem;
