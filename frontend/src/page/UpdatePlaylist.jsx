import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import { IconAlertCircle, IconArrowLeft, IconBook, IconCircleCheck, IconDeviceFloppy, IconEdit } from '@tabler/icons-react';
import { Link, useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../utils/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const UpdatePlaylist = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPlaylistDetails();
  }, [id]);

  const fetchPlaylistDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/playlist/${id}`);
      const playlistData = response.data.data;
      setPlaylist(playlistData);
      setFormData({
        name: playlistData.name || "",
        description: playlistData.description || "",
      });
    } catch (error) {
      toast.error("Failed to fetch playlist details");
      console.error("Error fetching playlist:", error);
      navigate("/playlists");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Playlist name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Playlist name must be at least 3 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Playlist name must be less than 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUpdating(true);
    try {
      const response = await axiosInstance.put(`/playlist/${id}`, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      });

      if (response.data.success) {
        toast.success("Playlist updated successfully!");
        navigate(`/playlists/${id}`);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to update playlist";
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader />
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <IconAlertCircle className="w-16 h-16 mx-auto text-error mb-4" />
          <h2 className="text-2xl font-bold mb-2">Playlist not found</h2>
          <Link to="/playlists" className="btn btn-primary mt-4">
            Back to Playlists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4 mb-8"
      >
        <Link
          to={`/playlists/${id}`}
          className="btn btn-ghost btn-circle hover:scale-110 transition-transform"
        >
          <IconArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Update Playlist
          </h1>
          <p className="text-base-content/60">
            IconEdit your playlist details and information
          </p>
        </div>
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card bg-base-100 shadow-2xl border border-base-content/10"
      >
        <div className="card-body p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Playlist Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base flex items-center gap-2">
                  <IconEdit className="w-4 h-4" />
                  Playlist Name *
                </span>
                <span className="label-text-alt text-base-content/50">
                  {formData.name.length}/100
                </span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter playlist name"
                className={`input input-bordered w-full transition-all ${
                  errors.name
                    ? "input-error border-error"
                    : "focus:input-primary focus:border-primary"
                }`}
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
              />
              {errors.name && (
                <label className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <IconAlertCircle className="w-3 h-3" />
                    {errors.name}
                  </span>
                </label>
              )}
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base flex items-center gap-2">
                  <IconBook className="w-4 h-4" />
                  Description
                  <span className="text-base-content/50 font-normal text-xs">
                    (Optional)
                  </span>
                </span>
                <span className="label-text-alt text-base-content/50">
                  {formData.description.length}/500
                </span>
              </label>
              <textarea
                name="description"
                placeholder="Enter playlist description..."
                className={`textarea textarea-bordered w-full min-h-32 transition-all ${
                  errors.description
                    ? "textarea-error border-error"
                    : "focus:textarea-primary focus:border-primary"
                }`}
                value={formData.description}
                onChange={handleChange}
                maxLength={500}
                rows="5"
              />
              {errors.description && (
                <label className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <IconAlertCircle className="w-3 h-3" />
                    {errors.description}
                  </span>
                </label>
              )}
            </div>

            {/* Playlist Stats */}
            <div className="divider my-6">Playlist Information</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-figure text-primary">
                  <IconBook className="w-6 h-6" />
                </div>
                <div className="stat-title text-xs">Total Problems</div>
                <div className="stat-value text-2xl text-primary">
                  {playlist.problems?.length || 0}
                </div>
              </div>
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-figure text-success">
                  <IconCircleCheck className="w-6 h-6" />
                </div>
                <div className="stat-title text-xs">Solved</div>
                <div className="stat-value text-2xl text-success">
                  {playlist.problems?.filter(
                    (p) => p.problem?.solvedBy && p.problem.solvedBy.length > 0
                  ).length || 0}
                </div>
              </div>
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-figure text-info">
                  <IconEdit className="w-6 h-6" />
                </div>
                <div className="stat-title text-xs">Created</div>
                <div className="stat-value text-xs text-info">
                  {new Date(playlist.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Link
                to={`/playlists/${id}`}
                className="btn btn-ghost flex-1"
                disabled={updating}
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary flex-1 gap-2"
                disabled={updating}
              >
                {updating ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <IconDeviceFloppy className="w-4 h-4" />
                    IconDeviceFloppy Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default UpdatePlaylist;

