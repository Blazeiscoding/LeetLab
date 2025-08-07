import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Code,
  Trophy,
  Target,
  BookOpen,
  Play,
  TrendingUp,
  Star,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { axiosInstance } from "../util/axios";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const HomePage = () => {
  const { authUser } = useAuthStore();
  const [stats, setStats] = useState({
    totalProblems: 0,
    solvedProblems: 0,
    recentSubmissions: [],
    problemsByDifficulty: { EASY: 0, MEDIUM: 0, HARD: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [topLeaderboard, setTopLeaderboard] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchTopLeaderboard();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [problemsRes, solvedRes, submissionsRes] = await Promise.all([
        axiosInstance.get("/problems/get-all-problems"),
        axiosInstance
          .get("/problems/get-solved-problems")
          .catch(() => ({ data: { data: [] } })),
        axiosInstance
          .get("/submission/get-all-submission")
          .catch(() => ({ data: { data: [] } })),
      ]);

      const allProblems = problemsRes.data.data || [];
      const solvedProblems = solvedRes.data.data || [];
      const submissions = submissionsRes.data.data || [];

      // Create a map of problem IDs to problem details
      const problemMap = allProblems.reduce((acc, problem) => {
        const problemId = problem._id || problem.id;
        acc[problemId] = {
          title: problem.title || problem.name || `Problem #${problemId}`,
          difficulty: problem.difficulty,
        };
        return acc;
      }, {});

      // Add problem names to submissions
      const submissionsWithNames = submissions.map((submission) => ({
        ...submission,
        problemTitle:
          problemMap[submission.problemId]?.title ||
          `Problem #${submission.problemId}`,
        problemDifficulty: problemMap[submission.problemId]?.difficulty,
      }));

      const problemsByDifficulty = allProblems.reduce(
        (acc, problem) => {
          acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
          return acc;
        },
        { EASY: 0, MEDIUM: 0, HARD: 0 }
      );

      setStats({
        totalProblems: allProblems.length,
        solvedProblems: solvedProblems.length,
        recentSubmissions: submissionsWithNames.slice(0, 5),
        problemsByDifficulty,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopLeaderboard = async () => {
    try {
      const res = await axiosInstance.get("/leaderboard/monthly");
      setTopLeaderboard((res.data.data.leaderboard || []).slice(0, 3));
    } catch (err) {
      setTopLeaderboard([]);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-base-200 to-base-300">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-base-content/70">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      {/* Compact Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-2xl animate-pulse delay-700"></div>
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Welcome Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                Welcome back, {authUser?.name || "Coder"}!
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              CodingShastra
            </h1>

            {/* Subheading */}
            <h2 className="text-xl md:text-2xl font-semibold mb-6 text-base-content/80">
              Master coding interviews with confidence
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg mb-8 text-base-content/70 max-w-2xl mx-auto">
              Practice algorithmic problems, track your progress, and ace your
              next technical interview.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                to="/problems"
                className="btn btn-primary btn-lg gap-2 hover:scale-105 transition-transform shadow-lg"
              >
                <Play className="w-5 h-5" />
                Start Coding
              </Link>
              <Link
                to="/playlists"
                className="btn btn-outline btn-lg gap-2 hover:scale-105 transition-transform"
              >
                <BookOpen className="w-5 h-5" />
                View Playlists
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-base-100/60 backdrop-blur-sm rounded-xl p-4 border border-base-300/50">
                <div className="text-2xl font-bold text-primary">
                  {stats.totalProblems}
                </div>
                <div className="text-xs text-base-content/70">
                  Total Problems
                </div>
              </div>
              <div className="bg-base-100/60 backdrop-blur-sm rounded-xl p-4 border border-base-300/50">
                <div className="text-2xl font-bold text-success">
                  {stats.solvedProblems}
                </div>
                <div className="text-xs text-base-content/70">Solved</div>
              </div>
              <div className="bg-base-100/60 backdrop-blur-sm rounded-xl p-4 border border-base-300/50">
                <div className="text-2xl font-bold text-info">
                  {stats.totalProblems > 0
                    ? Math.round(
                        (stats.solvedProblems / stats.totalProblems) * 100
                      )
                    : 0}
                  %
                </div>
                <div className="text-xs text-base-content/70">Progress</div>
              </div>
              <div className="bg-base-100/60 backdrop-blur-sm rounded-xl p-4 border border-base-300/50">
                <div className="text-2xl font-bold text-secondary">
                  {stats.recentSubmissions.length}
                </div>
                <div className="text-xs text-base-content/70">Recent</div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center mt-8">
            <div className="animate-bounce">
              <ChevronDown className="w-6 h-6 text-base-content/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Progress Overview */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Your Progress Overview</h2>
            <p className="text-base-content/70">Track your coding journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-200">
              <div className="card-body items-center text-center p-6">
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  {stats.totalProblems}
                </div>
                <div className="text-sm font-medium">Total Problems</div>
                <div className="text-xs text-base-content/60 mt-1">
                  Available to solve
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-200">
              <div className="card-body items-center text-center p-6">
                <div className="p-3 bg-success/10 rounded-full mb-3">
                  <Trophy className="w-6 h-6 text-success" />
                </div>
                <div className="text-2xl font-bold text-success">
                  {stats.solvedProblems}
                </div>
                <div className="text-sm font-medium">Problems Solved</div>
                <div className="text-xs text-base-content/60 mt-1">
                  Keep it up!
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-200">
              <div className="card-body items-center text-center p-6">
                <div className="p-3 bg-info/10 rounded-full mb-3">
                  <Target className="w-6 h-6 text-info" />
                </div>
                <div className="text-2xl font-bold text-info">
                  {stats.totalProblems > 0
                    ? Math.round(
                        (stats.solvedProblems / stats.totalProblems) * 100
                      )
                    : 0}
                  %
                </div>
                <div className="text-sm font-medium">Completion Rate</div>
                <div className="text-xs text-base-content/60 mt-1">
                  Overall progress
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-200">
              <div className="card-body items-center text-center p-6">
                <div className="p-3 bg-secondary/10 rounded-full mb-3">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-2xl font-bold text-secondary">
                  {stats.recentSubmissions.length}
                </div>
                <div className="text-sm font-medium">Recent Activity</div>
                <div className="text-xs text-base-content/60 mt-1">
                  This week
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          {/* Problems by Difficulty */}
          <div className="xl:col-span-2">
            <div className="card bg-base-100 shadow-lg border border-base-200">
              <div className="card-body">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Problem Distribution
                  </h3>
                  <div className="badge badge-primary badge-outline">
                    By Difficulty
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(stats.problemsByDifficulty).map(
                    ([difficulty, count]) => {
                      const percentage =
                        stats.totalProblems > 0
                          ? Math.round((count / stats.totalProblems) * 100)
                          : 0;
                      return (
                        <div key={difficulty} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  difficulty === "EASY"
                                    ? "bg-green-500"
                                    : difficulty === "MEDIUM"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span className="font-medium">{difficulty}</span>
                              <div className="badge badge-sm badge-outline">
                                {percentage}%
                              </div>
                            </div>
                            <span className="font-bold text-lg">{count}</span>
                          </div>
                          <progress
                            className={`progress w-full h-2 ${
                              difficulty === "EASY"
                                ? "progress-success"
                                : difficulty === "MEDIUM"
                                ? "progress-warning"
                                : "progress-error"
                            }`}
                            value={count}
                            max={stats.totalProblems}
                          ></progress>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="flex justify-center mt-6">
                  <Link to="/problems" className="btn btn-primary gap-2">
                    <Code className="w-4 h-4" />
                    Browse All Problems
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="xl:col-span-1">
            <div className="card bg-base-100 shadow-lg border border-base-200 h-full">
              <div className="card-body">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                    Recent Activity
                  </h3>
                  <div className="badge badge-secondary badge-outline">
                    {stats.recentSubmissions.length}
                  </div>
                </div>

                {stats.recentSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-4 bg-base-200 rounded-full w-fit mx-auto mb-4">
                      <Code className="w-8 h-8 text-base-content/40" />
                    </div>
                    <h4 className="font-semibold mb-2">No submissions yet</h4>
                    <p className="text-sm text-base-content/70 mb-4">
                      Start solving problems to see your activity here
                    </p>
                    <Link
                      to="/problems"
                      className="btn btn-primary btn-sm gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start Now
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentSubmissions.map((submission, index) => (
                      <div
                        key={index}
                        className="p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm truncate mb-1">
                              {submission.problemTitle}
                            </h5>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="badge badge-xs badge-outline">
                                {submission.language}
                              </span>
                              {submission.problemDifficulty && (
                                <span
                                  className={`badge badge-xs ${
                                    submission.problemDifficulty === "EASY"
                                      ? "badge-success"
                                      : submission.problemDifficulty ===
                                        "MEDIUM"
                                      ? "badge-warning"
                                      : "badge-error"
                                  }`}
                                >
                                  {submission.problemDifficulty}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <div
                              className={`badge badge-xs ${
                                submission.status === "Accepted"
                                  ? "badge-success"
                                  : "badge-error"
                              }`}
                            >
                              {submission.status}
                            </div>
                            <p className="text-xs text-base-content/60 mt-1">
                              {new Date(
                                submission.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-2">
                      <Link
                        to="/profile"
                        className="btn btn-outline btn-sm gap-2"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Quick Actions</h2>
          <p className="text-base-content/70">Jump into what you need most</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/problems" className="group">
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-base-200 group-hover:border-primary/30">
              <div className="card-body text-center p-6">
                <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Code className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Browse Problems</h3>
                <p className="text-base-content/70 text-sm mb-4">
                  Explore coding challenges for all skill levels
                </p>
                <div className="flex justify-center gap-2">
                  <div className="badge badge-primary badge-sm">
                    500+ Problems
                  </div>
                  <div className="badge badge-outline badge-sm">All Levels</div>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/playlists" className="group">
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-base-200 group-hover:border-secondary/30">
              <div className="card-body text-center p-6">
                <div className="p-4 bg-secondary/10 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-2">My Playlists</h3>
                <p className="text-base-content/70 text-sm mb-4">
                  Organize learning with curated collections
                </p>
                <div className="flex justify-center gap-2">
                  <div className="badge badge-secondary badge-sm">
                    Organized
                  </div>
                  <div className="badge badge-outline badge-sm">Custom</div>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/profile" className="group">
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-base-200 group-hover:border-accent/30">
              <div className="card-body text-center p-6">
                <div className="p-4 bg-accent/10 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">My Progress</h3>
                <p className="text-base-content/70 text-sm mb-4">
                  Track achievements and analyze performance
                </p>
                <div className="flex justify-center gap-2">
                  <div className="badge badge-accent badge-sm">Analytics</div>
                  <div className="badge badge-outline badge-sm">Insights</div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
