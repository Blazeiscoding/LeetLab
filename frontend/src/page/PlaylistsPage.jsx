import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Trash2, Edit, Play, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../util/axios";
import toast from "react-hot-toast";

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await axiosInstance.get("/playlist");
      setPlaylists(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch playlists");
      console.error("Error fetching playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylist.name.trim()) {
      toast.error("Playlist name is required");
      return;
    }

    setCreating(true);
    try {
      const response = await axiosInstance.post(
        "/playlist/create-playlist",
        newPlaylist
      );
      setPlaylists([...playlists, response.data.data]);
      setNewPlaylist({ name: "", description: "" });
      setShowCreateModal(false);
      toast.success("Playlist created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;

    try {
      await axiosInstance.delete(`/playlist/${playlistId}`);
      setPlaylists(playlists.filter((p) => p.id !== playlistId));
      toast.success("Playlist deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete playlist");
    }
  };

  const getProgressPercentage = (playlist) => {
    if (!playlist.problems || playlist.problems.length === 0) return 0;
    // This would need to be calculated based on solved problems
    // For now, return a placeholder
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Playlists</h1>
          <p className="text-gray-600">
            Organize your coding practice with custom playlists
          </p>
        </div>
        <button
          className="btn btn-primary gap-2"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No playlists yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first playlist to organize your practice problems
          </p>
          <button
            className="btn btn-primary gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            Create Your First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="card-title text-lg">{playlist.name}</h2>
                  <div className="dropdown dropdown-end">
                    <label
                      tabIndex={0}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40"
                    >
                      <li>
                        <Link
                          to={`/playlists/${playlist.id}/edit`}
                          className="gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={() => deletePlaylist(playlist.id)}
                          className="gap-2 text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                {playlist.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {playlist.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <div className="stat-value text-2xl text-primary">
                    {playlist.problems?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Problems</div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{getProgressPercentage(playlist)}%</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={getProgressPercentage(playlist)}
                    max="100"
                  ></progress>
                </div>

                <div className="card-actions justify-between">
                  <Link
                    to={`/playlists/${playlist.id}`}
                    className="btn btn-outline btn-sm gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    View Details
                  </Link>
                  <Link
                    to={`/playlists/${playlist.id}/practice`}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Practice
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Playlist</h3>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Playlist Name</span>
              </label>
              <input
                type="text"
                placeholder="Enter playlist name"
                className="input input-bordered w-full"
                value={newPlaylist.name}
                onChange={(e) =>
                  setNewPlaylist({ ...newPlaylist, name: e.target.value })
                }
              />
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Description (Optional)</span>
              </label>
              <textarea
                placeholder="Enter playlist description"
                className="textarea textarea-bordered w-full"
                rows="3"
                value={newPlaylist.description}
                onChange={(e) =>
                  setNewPlaylist({
                    ...newPlaylist,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPlaylist({ name: "", description: "" });
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={createPlaylist}
                disabled={creating}
              >
                {creating ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Create Playlist"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
