import React, { useState, useEffect } from "react";
import { User, Trophy, Code, Calendar, Target, Award } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../util/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { authUser } = useAuthStore();
  const [submissions, setSubmissions] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [submissionsRes, solvedRes] = await Promise.all([
        axiosInstance.get("/submission/get-all-submission"),
        axiosInstance.get("/problems/get-solved-problems"),
      ]);

      setSubmissions(submissionsRes.data.data || []);
      setSolvedProblems(solvedRes.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch profile data");
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
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

    return {
      totalSubmissions,
      acceptedSubmissions,
      solvedCount,
      successRate,
      difficultyBreakdown,
      languageBreakdown,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Header */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="avatar">
              <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={
                    authUser?.image ||
                    "https://avatar.iran.liara.run/public/boy"
                  }
                  alt="Profile"
                />
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold">{authUser?.name}</h1>
              <p className="text-gray-600">{authUser?.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Member since {formatDate(authUser?.createdAt || new Date())}
                </span>
              </div>
              {authUser?.role === "ADMIN" && (
                <div className="badge badge-primary mt-2">Admin</div>
              )}
            </div>

            <div className="stats stats-vertical lg:stats-horizontal shadow">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="stat-title">Solved</div>
                <div className="stat-value text-primary">
                  {stats.solvedCount}
                </div>
              </div>

              <div className="stat">
                <div className="stat-figure text-secondary">
                  <Code className="w-8 h-8" />
                </div>
                <div className="stat-title">Submissions</div>
                <div className="stat-value text-secondary">
                  {stats.totalSubmissions}
                </div>
              </div>

              <div className="stat">
                <div className="stat-figure text-accent">
                  <Target className="w-8 h-8" />
                </div>
                <div className="stat-title">Success Rate</div>
                <div className="stat-value text-accent">
                  {stats.successRate}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-bordered mb-6">
        <button
          className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === "submissions" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("submissions")}
        >
          Submissions
        </button>
        <button
          className={`tab ${activeTab === "solved" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("solved")}
        >
          Solved Problems
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Difficulty Breakdown */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <Award className="w-5 h-5" />
                Problems by Difficulty
              </h2>
              <div className="space-y-4">
                {["EASY", "MEDIUM", "HARD"].map((difficulty) => {
                  const count = stats.difficultyBreakdown[difficulty] || 0;
                  const color =
                    difficulty === "EASY"
                      ? "success"
                      : difficulty === "MEDIUM"
                      ? "warning"
                      : "error";
                  return (
                    <div
                      key={difficulty}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`badge badge-${color} badge-sm`}></div>
                        <span>{difficulty}</span>
                      </div>
                      <span className="font-bold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Language Breakdown */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <Code className="w-5 h-5" />
                Languages Used
              </h2>
              <div className="space-y-4">
                {Object.entries(stats.languageBreakdown).map(
                  ([language, count]) => (
                    <div
                      key={language}
                      className="flex items-center justify-between"
                    >
                      <span>{language}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  )
                )}
                {Object.keys(stats.languageBreakdown).length === 0 && (
                  <p className="text-gray-500 text-center">
                    No submissions yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Recent Submissions</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Code className="w-12 h-12 text-gray-400" />
                          <p className="text-gray-500">No submissions yet</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    submissions.slice(0, 10).map((submission) => (
                      <tr key={submission.id}>
                        <td>
                          <Link
                            to={`/problems/${submission.problemId}`}
                            className="link link-hover"
                          >
                            Problem #{submission.problemId}
                          </Link>
                        </td>
                        <td>{submission.language}</td>
                        <td>
                          <div
                            className={`badge ${
                              submission.status === "Accepted"
                                ? "badge-success"
                                : "badge-error"
                            }`}
                          >
                            {submission.status}
                          </div>
                        </td>
                        <td>{formatDate(submission.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "solved" && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Solved Problems</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {solvedProblems.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Trophy className="w-12 h-12 text-gray-400" />
                    <p className="text-gray-500">No problems solved yet</p>
                    <Link
                      to="/problems"
                      className="btn btn-primary btn-sm mt-2"
                    >
                      Start Solving
                    </Link>
                  </div>
                </div>
              ) : (
                solvedProblems.map((problem) => (
                  <div key={problem.id} className="card bg-base-200 shadow">
                    <div className="card-body p-4">
                      <Link
                        to={`/problems/${problem.id}`}
                        className="card-title text-sm link link-hover"
                      >
                        {problem.title}
                      </Link>
                      <div className="flex items-center justify-between mt-2">
                        <div
                          className={`badge badge-sm ${
                            problem.difficulty === "EASY"
                              ? "badge-success"
                              : problem.difficulty === "MEDIUM"
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                        >
                          {problem.difficulty}
                        </div>
                        <div className="badge badge-outline badge-sm">
                          <Trophy className="w-3 h-3 mr-1" />
                          Solved
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
