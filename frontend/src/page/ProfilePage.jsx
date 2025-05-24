import React, { useState, useEffect } from "react";
import {
  User,
  Trophy,
  Code,
  Calendar,
  Target,
  Award,
  GitBranch,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../util/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { authUser } = useAuthStore();
  const [submissions, setSubmissions] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch data with proper error handling for each endpoint
      const promises = [];

      // Always try to fetch submissions and solved problems
      promises.push(
        axiosInstance.get("/submission/get-all-submission").catch((err) => {
          console.warn("Submissions endpoint failed:", err);
          return { data: { data: [] } };
        })
      );

      promises.push(
        axiosInstance.get("/problems/get-solved-problems").catch((err) => {
          console.warn("Solved problems endpoint failed:", err);
          return { data: { data: [] } };
        })
      );

      // Try different possible endpoints for problems
      promises.push(
        axiosInstance
          .get("/problems")
          .catch(() => axiosInstance.get("/problem"))
          .catch(() => axiosInstance.get("/api/problems"))
          .catch((err) => {
            console.warn("Problems endpoint failed:", err);
            return { data: { data: [] } };
          })
      );

      const [submissionsRes, solvedRes, problemsRes] = await Promise.all(
        promises
      );

      setSubmissions(submissionsRes.data?.data || submissionsRes.data || []);
      setSolvedProblems(solvedRes.data?.data || solvedRes.data || []);
      setProblems(problemsRes.data?.data || problemsRes.data || []);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      // Don't show error toast if we have partial data
      if (submissions.length === 0 && solvedProblems.length === 0) {
        toast.error("Some profile data couldn't be loaded");
      }
    } finally {
      setLoading(false);
    }
  };

  const getProblemTitle = (problemId) => {
    const problem = problems.find(
      (p) => p.id === problemId || p._id === problemId
    );
    return problem ? problem.title : `Problem #${problemId}`;
  };

  const getStats = () => {
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(
      (s) => s.status === "Accepted"
    ).length;
    const solvedCount = solvedProblems.length;
    const successRate =
      totalSubmissions > 0
        ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)
        : 0;

    const difficultyBreakdown = solvedProblems.reduce((acc, problem) => {
      acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
      return acc;
    }, {});

    const languageBreakdown = submissions.reduce((acc, submission) => {
      acc[submission.language] = (acc[submission.language] || 0) + 1;
      return acc;
    }, {});

    // Get recent activity (last 7 days)
    const recentSubmissions = submissions.filter((s) => {
      const submissionDate = new Date(s.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return submissionDate >= weekAgo;
    }).length;

    return {
      totalSubmissions,
      acceptedSubmissions,
      solvedCount,
      successRate,
      difficultyBreakdown,
      languageBreakdown,
      recentSubmissions,
    };
  };

  const stats = getStats();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-gray-300">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Profile Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-sm"></div>

          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center lg:items-start gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full ring-4 ring-white/30 ring-offset-4 ring-offset-transparent overflow-hidden shadow-2xl">
                    <img
                      src={
                        authUser?.image ||
                        "https://avatar.iran.liara.run/public/boy"
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    {authUser?.name}
                  </h1>
                  {authUser?.role === "ADMIN" && (
                    <div className="inline-flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm text-yellow-100 px-4 py-2 rounded-full border border-yellow-400/30">
                      <Star className="w-4 h-4" />
                      <span className="font-medium">Admin</span>
                    </div>
                  )}
                </div>

                <p className="text-blue-100 text-lg mb-4">{authUser?.email}</p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-blue-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>
                      Member since{" "}
                      {formatDate(authUser?.createdAt || new Date())}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{stats.recentSubmissions} submissions this week</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 lg:gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Trophy className="w-6 h-6 text-green-300" />
                    </div>
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        Problems Solved
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {stats.solvedCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Code className="w-6 h-6 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        Total Submissions
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {stats.totalSubmissions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Target className="w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        Success Rate
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {stats.successRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-800 rounded-2xl shadow-lg mb-8 p-2 border border-gray-700">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "submissions", label: "Submissions", icon: Code },
              { id: "solved", label: "Solved Problems", icon: Trophy },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === id
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setActiveTab(id)}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Difficulty Breakdown */}
            <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Problems by Difficulty
                </h2>
              </div>

              <div className="space-y-6">
                {[
                  {
                    key: "EASY",
                    label: "Easy",
                    color: "from-green-500 to-emerald-500",
                    bg: "bg-green-900/30",
                    border: "border-green-500/30",
                  },
                  {
                    key: "MEDIUM",
                    label: "Medium",
                    color: "from-yellow-500 to-orange-500",
                    bg: "bg-yellow-900/30",
                    border: "border-yellow-500/30",
                  },
                  {
                    key: "HARD",
                    label: "Hard",
                    color: "from-red-500 to-pink-500",
                    bg: "bg-red-900/30",
                    border: "border-red-500/30",
                  },
                ].map(({ key, label, color, bg, border }) => {
                  const count = stats.difficultyBreakdown[key] || 0;
                  const total = stats.solvedCount || 1;
                  const percentage = (count / total) * 100;

                  return (
                    <div
                      key={key}
                      className={`${bg} border ${border} rounded-xl p-4`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full bg-gradient-to-r ${color}`}
                          ></div>
                          <span className="font-semibold text-gray-200">
                            {label}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-white">
                            {count}
                          </span>
                          <p className="text-sm text-gray-400">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Language Breakdown */}
            <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Programming Languages
                </h2>
              </div>

              <div className="space-y-4">
                {Object.entries(stats.languageBreakdown).length === 0 ? (
                  <div className="text-center py-12">
                    <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No submissions yet</p>
                    <p className="text-gray-500">
                      Start coding to see your language stats!
                    </p>
                  </div>
                ) : (
                  Object.entries(stats.languageBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([language, count]) => {
                      const percentage = (count / stats.totalSubmissions) * 100;
                      return (
                        <div
                          key={language}
                          className="bg-gray-700 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-200">
                              {language}
                            </span>
                            <div className="text-right">
                              <span className="text-xl font-bold text-white">
                                {count}
                              </span>
                              <p className="text-sm text-gray-400">
                                {percentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "submissions" && (
          <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
            <div className="p-8 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-2">
                Recent Submissions
              </h2>
              <p className="text-gray-400">
                Your latest coding attempts and results
              </p>
            </div>

            <div className="overflow-x-auto">
              {submissions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Code className="w-12 h-12 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">
                    No submissions yet
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Start solving problems to see your submission history
                  </p>
                  <Link to="/problems" className="btn btn-primary">
                    Browse Problems
                  </Link>
                </div>
              ) : (
                <table className="table w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="text-left font-semibold text-gray-200 p-4">
                        Problem
                      </th>
                      <th className="text-left font-semibold text-gray-200 p-4">
                        Language
                      </th>
                      <th className="text-left font-semibold text-gray-200 p-4">
                        Status
                      </th>
                      <th className="text-left font-semibold text-gray-200 p-4">
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.slice(0, 15).map((submission) => (
                      <tr
                        key={submission.id}
                        className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="p-4">
                          <Link
                            to={`/problems/${submission.problemId}`}
                            className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
                          >
                            {getProblemTitle(submission.problemId)}
                          </Link>
                        </td>
                        <td className="p-4">
                          <span className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                            {submission.language}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {submission.status === "Accepted" ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                                  Accepted
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-red-400" />
                                <span className="bg-red-900/50 text-red-300 px-3 py-1 rounded-full text-sm font-medium border border-red-500/30">
                                  {submission.status}
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-400">
                          {formatRelativeTime(submission.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "solved" && (
          <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
            <div className="p-8 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-2">
                Solved Problems
              </h2>
              <p className="text-gray-400">
                Problems you've successfully conquered
              </p>
            </div>

            <div className="p-8">
              {solvedProblems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">
                    No problems solved yet
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Start your coding journey and earn your first victory!
                  </p>
                  <Link to="/problems" className="btn btn-primary">
                    Start Solving
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {solvedProblems.map((problem) => (
                    <div
                      key={problem.id}
                      className="group bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 border border-gray-600 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-2 rounded-lg ${
                            problem.difficulty === "EASY"
                              ? "bg-green-900/50 text-green-400 border border-green-500/30"
                              : problem.difficulty === "MEDIUM"
                              ? "bg-yellow-900/50 text-yellow-400 border border-yellow-500/30"
                              : "bg-red-900/50 text-red-400 border border-red-500/30"
                          }`}
                        >
                          <Award className="w-4 h-4" />
                        </div>
                        <div className="bg-emerald-900/50 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Solved
                        </div>
                      </div>

                      <Link
                        to={`/problems/${problem.id}`}
                        className="block group-hover:text-blue-400 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-200 mb-2 line-clamp-2">
                          {problem.title}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            problem.difficulty === "EASY"
                              ? "bg-green-900/50 text-green-300 border border-green-500/30"
                              : problem.difficulty === "MEDIUM"
                              ? "bg-yellow-900/50 text-yellow-300 border border-yellow-500/30"
                              : "bg-red-900/50 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
