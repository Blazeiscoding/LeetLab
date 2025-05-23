import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Trash2,
  Play,
  CheckCircle,
  Clock,
  Zap,
  Search,
  ArrowLeft,
} from "lucide-react";
import { axiosInstance } from "../util/axios";
import toast from "react-hot-toast";

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddProblemsModal, setShowAddProblemsModal] = useState(false);
  const [availableProblems, setAvailableProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchPlaylistDetails();
  }, [id]);

  const fetchPlaylistDetails = async () => {
    try {
      const response = await axiosInstance.get(`/playlist/${id}`);
      setPlaylist(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch playlist details");
      console.error("Error fetching playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProblems = async () => {
    try {
      const response = await axiosInstance.get("/problems/get-all-problems");
      const allProblems = response.data.data || [];

      // Filter out problems already in the playlist
      const playlistProblemIds =
        playlist.problems?.map((p) => p.problem.id) || [];
      const available = allProblems.filter(
        (problem) => !playlistProblemIds.includes(problem.id)
      );

      setAvailableProblems(available);
    } catch (error) {
      toast.error("Failed to fetch available problems");
    }
  };

  const openAddProblemsModal = () => {
    setShowAddProblemsModal(true);
    fetchAvailableProblems();
  };

  const addProblemsToPlaylist = async () => {
    if (selectedProblems.length === 0) {
      toast.error("Please select at least one problem");
      return;
    }

    setAdding(true);
    try {
      await axiosInstance.post(`/playlist/${id}/add-problem`, {
        problemIds: selectedProblems,
      });

      toast.success("Problems added successfully!");
      setShowAddProblemsModal(false);
      setSelectedProblems([]);
      fetchPlaylistDetails(); // Refresh playlist
    } catch (error) {
      toast.error("Failed to add problems");
    } finally {
      setAdding(false);
    }
  };

  const removeProblemFromPlaylist = async (problemId) => {
    if (
      !confirm(
        "Are you sure you want to remove this problem from the playlist?"
      )
    )
      return;

    try {
      await axiosInstance.delete(
        `/playlist/${id}/remove-problem/${problemId}`,
        {
          data: { problemIds: [problemId] },
        }
      );

      toast.success("Problem removed successfully!");
      fetchPlaylistDetails(); // Refresh playlist
    } catch (error) {
      toast.error("Failed to remove problem");
    }
  };

  const toggleProblemSelection = (problemId) => {
    setSelectedProblems((prev) =>
      prev.includes(problemId)
        ? prev.filter((id) => id !== problemId)
        : [...prev, problemId]
    );
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

  const filteredAvailableProblems = availableProblems.filter(
    (problem) =>
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (problem.tags &&
        problem.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Playlist not found</h2>
          <p className="text-gray-600">
            The playlist you're looking for doesn't exist.
          </p>
          <Link to="/playlists" className="btn btn-primary mt-4">
            Back to Playlists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/playlists" className="btn btn-ghost btn-circle">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-gray-600 mt-1">{playlist.description}</p>
          )}
        </div>
        <button
          className="btn btn-primary gap-2"
          onClick={openAddProblemsModal}
        >
          <Plus className="w-4 h-4" />
          Add Problems
        </button>
      </div>

      {/* Stats */}
      <div className="stats shadow mb-8 w-full">
        <div className="stat">
          <div className="stat-figure text-primary">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Problems</div>
          <div className="stat-value text-primary">
            {playlist.problems?.length || 0}
          </div>
        </div>

        <div className="stat">
          <div className="stat-figure text-success">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="stat-title">Completed</div>
          <div className="stat-value text-success">0</div>
          <div className="stat-desc">Coming soon</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-info">
            <Play className="w-8 h-8" />
          </div>
          <div className="stat-title">Progress</div>
          <div className="stat-value text-info">0%</div>
          <div className="stat-desc">Based on solved problems</div>
        </div>
      </div>

      {/* Problems List */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Problems in this Playlist</h2>

          {playlist.problems?.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">No problems yet</h3>
              <p className="text-gray-600 mb-6">
                Add some problems to get started with this playlist
              </p>
              <button
                className="btn btn-primary gap-2"
                onClick={openAddProblemsModal}
              >
                <Plus className="w-4 h-4" />
                Add Your First Problem
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th className="text-center">Difficulty</th>
                    <th className="text-center">Tags</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {playlist.problems.map((item) => (
                    <tr key={item.problem.id} className="hover">
                      <td>
                        <Link
                          to={`/problems/${item.problem.id}`}
                          className="link link-hover font-medium"
                        >
                          {item.problem.title}
                        </Link>
                        {item.problem.description && (
                          <p className="text-sm text-gray-500 mt-1 truncate max-w-md">
                            {item.problem.description.substring(0, 100)}...
                          </p>
                        )}
                      </td>
                      <td className="text-center">
                        <div
                          className={`flex items-center justify-center gap-2 ${getDifficultyColor(
                            item.problem.difficulty
                          )}`}
                        >
                          {getDifficultyIcon(item.problem.difficulty)}
                          <span className="font-medium">
                            {item.problem.difficulty}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {item.problem.tags?.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="badge badge-outline badge-sm"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.problem.tags?.length > 2 && (
                            <span className="badge badge-outline badge-sm">
                              +{item.problem.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="badge badge-ghost">Not Attempted</div>
                      </td>
                      <td className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Link
                            to={`/problems/${item.problem.id}`}
                            className="btn btn-primary btn-sm gap-1"
                          >
                            <Play className="w-3 h-3" />
                            Solve
                          </Link>
                          <button
                            className="btn btn-ghost btn-sm text-error"
                            onClick={() =>
                              removeProblemFromPlaylist(item.problem.id)
                            }
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Problems Modal */}
      {showAddProblemsModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Add Problems to Playlist</h3>

            {/* Search */}
            <div className="form-control mb-4">
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

            {/* Selected count */}
            {selectedProblems.length > 0 && (
              <div className="alert alert-info mb-4">
                <span>{selectedProblems.length} problem(s) selected</span>
              </div>
            )}

            {/* Problems list */}
            <div className="max-h-96 overflow-y-auto mb-4">
              {filteredAvailableProblems.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No problems found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailableProblems.map((problem) => (
                    <div
                      key={problem.id}
                      className={`card bg-base-200 shadow cursor-pointer transition-colors ${
                        selectedProblems.includes(problem.id)
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => toggleProblemSelection(problem.id)}
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-primary"
                                checked={selectedProblems.includes(problem.id)}
                                onChange={() =>
                                  toggleProblemSelection(problem.id)
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div>
                                <h4 className="font-medium">{problem.title}</h4>
                                {problem.description && (
                                  <p className="text-sm text-gray-500 truncate max-w-md">
                                    {problem.description.substring(0, 80)}...
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div
                              className={`flex items-center gap-1 ${getDifficultyColor(
                                problem.difficulty
                              )}`}
                            >
                              {getDifficultyIcon(problem.difficulty)}
                              <span className="text-sm font-medium">
                                {problem.difficulty}
                              </span>
                            </div>

                            <div className="flex gap-1">
                              {problem.tags?.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="badge badge-outline badge-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowAddProblemsModal(false);
                  setSelectedProblems([]);
                  setSearchTerm("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={addProblemsToPlaylist}
                disabled={adding || selectedProblems.length === 0}
              >
                {adding ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  `Add ${selectedProblems.length} Problem${
                    selectedProblems.length !== 1 ? "s" : ""
                  }`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetailPage;
