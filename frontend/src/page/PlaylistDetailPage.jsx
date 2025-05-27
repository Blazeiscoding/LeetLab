import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Play,
  BookOpen,
  Target,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../util/axios";
import toast from "react-hot-toast";

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddProblemModal, setShowAddProblemModal] = useState(false);
  const [availableProblems, setAvailableProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [addingProblems, setAddingProblems] = useState(false);
  const [fetchingProblems, setFetchingProblems] = useState(false);

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
      navigate("/playlists");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProblems = async () => {
    setFetchingProblems(true);
    try {
      const response = await axiosInstance.get("/problems/get-all-problems");
      const allProblems = response.data.data || [];

      const playlistProblemIds =
        playlist?.problems?.map((p) => p.problem.id) || [];
      const available = allProblems.filter(
        (problem) => !playlistProblemIds.includes(problem.id)
      );

      setAvailableProblems(available);
    } catch (error) {
      toast.error("Failed to fetch available problems");
      console.error("Error fetching problems:", error);
    } finally {
      setFetchingProblems(false);
    }
  };

  const handleAddProblemsClick = () => {
    setShowAddProblemModal(true);
    fetchAvailableProblems();
  };

  const toggleProblemSelection = (problemId) => {
    setSelectedProblems((prev) =>
      prev.includes(problemId)
        ? prev.filter((id) => id !== problemId)
        : [...prev, problemId]
    );
  };

  const addProblemsToPlaylist = async () => {
    if (selectedProblems.length === 0) {
      toast.error("Please select at least one problem");
      return;
    }

    setAddingProblems(true);
    try {
      // Fixed: Use the correct endpoint from backend routes
      await axiosInstance.post(`/playlist/${id}/add-problem`, {
        problemIds: selectedProblems,
      });

      toast.success(`Added ${selectedProblems.length} problem(s) to playlist`);
      setShowAddProblemModal(false);
      setSelectedProblems([]);
      fetchPlaylistDetails(); // Refresh playlist data
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add problems");
    } finally {
      setAddingProblems(false);
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
      // Fixed: Use the correct endpoint from backend routes
      await axiosInstance.delete(`/playlist/${id}/remove-problem`, {
        data: { problemIds: [problemId] },
      });
      toast.success("Problem removed from playlist");
      fetchPlaylistDetails(); // Refresh playlist data
    } catch (error) {
      toast.error("Failed to remove problem");
    }
  };

  const getProgressPercentage = () => {
    if (!playlist?.problems || playlist.problems.length === 0) return 0;

    // Fixed: Check solvedBy array from the nested problem structure
    const solvedCount = playlist.problems.filter(
      (problemInPlaylist) =>
        problemInPlaylist.problem?.solvedBy &&
        problemInPlaylist.problem.solvedBy.length > 0
    ).length;

    return Math.round((solvedCount / playlist.problems.length) * 100);
  };

  const filteredProblems = availableProblems.filter(
    (problem) =>
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.difficulty?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Playlist not found</h2>
          <Link to="/playlists" className="btn btn-primary">
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
          onClick={handleAddProblemsClick}
        >
          <Plus className="w-4 h-4" />
          Add Problems
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-primary">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Problems</div>
          <div className="stat-value text-primary">
            {playlist.problems?.length || 0}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-success">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="stat-title">Solved</div>
          <div className="stat-value text-success">
            {playlist.problems?.filter(
              (p) => p.problem?.solvedBy && p.problem.solvedBy.length > 0
            ).length || 0}
          </div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-info">
            <Target className="w-8 h-8" />
          </div>
          <div className="stat-title">Progress</div>
          <div className="stat-value text-info">{getProgressPercentage()}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Overall Progress</span>
          <span>{getProgressPercentage()}% Complete</span>
        </div>
        <progress
          className="progress progress-primary w-full h-3"
          value={getProgressPercentage()}
          max="100"
        />
      </div>

      {/* Problems List */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Problems</h2>
            {playlist.problems && playlist.problems.length > 0 && (
              <Link
                to={`/playlists/${playlist.id}/practice`}
                className="btn btn-primary btn-sm gap-2"
              >
                <Play className="w-4 h-4" />
                Start Practice
              </Link>
            )}
          </div>

          {!playlist.problems || playlist.problems.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">No problems yet</h3>
              <p className="text-gray-600 mb-4">
                Add some problems to start practicing
              </p>
              <button
                className="btn btn-primary gap-2"
                onClick={handleAddProblemsClick}
              >
                <Plus className="w-4 h-4" />
                Add Problems
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Difficulty</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {playlist.problems.map((problemInPlaylist) => {
                    const problem = problemInPlaylist.problem;
                    const isSolved =
                      problem?.solvedBy && problem.solvedBy.length > 0;

                    return (
                      <tr key={problemInPlaylist.id}>
                        <td>
                          <div className="font-medium">{problem.title}</div>
                          {problem.tags && (
                            <div className="flex gap-1 mt-1">
                              {problem.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="badge badge-outline badge-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              problem.difficulty === "Easy"
                                ? "badge-success"
                                : problem.difficulty === "Medium"
                                ? "badge-warning"
                                : "badge-error"
                            }`}
                          >
                            {problem.difficulty}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isSolved ? "badge-success" : "badge-ghost"
                            }`}
                          >
                            {isSolved ? "Solved" : "Not Solved"}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <Link
                              to={`/problems/${problem.id}`}
                              className="btn btn-ghost btn-xs"
                            >
                              View
                            </Link>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() =>
                                removeProblemFromPlaylist(problem.id)
                              }
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Problems Modal */}
      {showAddProblemModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Add Problems to Playlist</h3>

            {/* Search */}
            <div className="form-control mb-4">
              <div className="input-group">
                <span>
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search problems..."
                  className="input input-bordered flex-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Problems List */}
            <div className="max-h-96 overflow-y-auto mb-4">
              {fetchingProblems ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : filteredProblems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? "No problems found matching your search"
                    : "No problems available to add"}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProblems.map((problem) => (
                    <label
                      key={problem.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={selectedProblems.includes(problem.id)}
                        onChange={() => toggleProblemSelection(problem.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{problem.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`badge badge-xs ${
                              problem.difficulty === "Easy"
                                ? "badge-success"
                                : problem.difficulty === "Medium"
                                ? "badge-warning"
                                : "badge-error"
                            }`}
                          >
                            {problem.difficulty}
                          </span>
                          {problem.tags &&
                            problem.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="badge badge-outline badge-xs"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Selected count */}
            {selectedProblems.length > 0 && (
              <div className="alert alert-info mb-4">
                <span>{selectedProblems.length} problem(s) selected</span>
              </div>
            )}

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowAddProblemModal(false);
                  setSelectedProblems([]);
                  setSearchTerm("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={addProblemsToPlaylist}
                disabled={addingProblems || selectedProblems.length === 0}
              >
                {addingProblems ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  `Add ${selectedProblems.length} Problem(s)`
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
