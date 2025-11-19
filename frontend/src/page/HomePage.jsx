import React, { useEffect, useState, useMemo } from "react";
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
  ArrowRight,
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

      const problemMap = allProblems.reduce((acc, problem) => {
        const problemId = problem._id || problem.id;
        acc[problemId] = {
          title: problem.title || problem.name || `Problem #${problemId}`,
          difficulty: problem.difficulty,
        };
        return acc;
      }, {});

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

  // Memoize computed stats
  const computedStats = useMemo(
    () => ({
      totalProblems: stats.totalProblems,
      solvedProblems: stats.solvedProblems,
      progressPercent:
        stats.totalProblems > 0
          ? Math.round((stats.solvedProblems / stats.totalProblems) * 100)
          : 0,
      recentCount: stats.recentSubmissions.length,
    }),
    [stats.totalProblems, stats.solvedProblems, stats.recentSubmissions.length]
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "text-success";
      case "MEDIUM":
        return "text-warning";
      case "HARD":
        return "text-error";
      default:
        return "text-base-content/60";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-base-content/70">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200/30">
      {/* Compact Hero Section */}
      <div className="relative overflow-hidden border-b border-base-content/5 bg-base-100/50 backdrop-blur-3xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Welcome Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-base-200/50 rounded-full mb-8 border border-base-content/10 backdrop-blur-md shadow-sm">
              <Star className="w-4 h-4 text-warning fill-warning/20" />
              <span className="text-sm font-semibold text-base-content/80">
                Welcome back, {authUser?.name || "Coder"}!
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-br from-base-content via-base-content/90 to-base-content/50 bg-clip-text text-transparent tracking-tight">
              Master Your <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Coding Journey
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl mb-10 text-base-content/60 max-w-2xl mx-auto leading-relaxed">
              Practice algorithmic problems, track your progress, and ace your
              next technical interview with our curated challenges.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                to="/problems"
                className="btn btn-primary btn-lg h-14 px-8 rounded-2xl gap-3 hover:scale-105 transition-transform shadow-xl shadow-primary/20"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Coding
              </Link>
              <Link
                to="/playlists"
                className="btn btn-ghost btn-lg h-14 px-8 rounded-2xl gap-3 hover:bg-base-200/50 border border-base-content/10 hover:scale-105 transition-transform"
              >
                <BookOpen className="w-5 h-5" />
                View Playlists
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                {
                  label: "Total Problems",
                  value: computedStats.totalProblems,
                  color: "text-primary",
                },
                {
                  label: "Solved",
                  value: computedStats.solvedProblems,
                  color: "text-success",
                },
                {
                  label: "Completion",
                  value: `${computedStats.progressPercent}%`,
                  color: "text-info",
                },
                {
                  label: "Recent Activity",
                  value: computedStats.recentCount,
                  color: "text-secondary",
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-base-100/80 backdrop-blur-md rounded-2xl p-4 border border-base-content/5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`text-3xl font-black ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-base-content/50 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          {/* Problems by Difficulty */}
          <div className="xl:col-span-2">
            <div className="card bg-base-100 shadow-xl border border-base-content/5 h-full">
              <div className="card-body p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                      <Target className="w-5 h-5 text-primary" />
                      Problem Distribution
                    </h3>
                    <p className="text-sm text-base-content/60">
                      Your progress across different difficulty levels
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {Object.entries(stats.problemsByDifficulty).map(
                    ([difficulty, count]) => {
                      const percentage =
                        stats.totalProblems > 0
                          ? Math.round((count / stats.totalProblems) * 100)
                          : 0;
                      return (
                        <div key={difficulty} className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  difficulty === "EASY"
                                    ? "bg-success"
                                    : difficulty === "MEDIUM"
                                    ? "bg-warning"
                                    : "bg-error"
                                }`}
                              ></span>
                              <span className="font-bold opacity-80">
                                {difficulty}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-black">{count}</span>
                              <span className="text-base-content/40">/</span>
                              <span className="text-base-content/40">
                                {stats.totalProblems}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-base-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${
                                difficulty === "EASY"
                                  ? "bg-success"
                                  : difficulty === "MEDIUM"
                                  ? "bg-warning"
                                  : "bg-error"
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-base-content/5">
                  <Link
                    to="/problems"
                    className="btn btn-outline btn-block gap-2 group"
                  >
                    Browse All Problems
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="xl:col-span-1">
            <div className="card bg-base-100 shadow-xl border border-base-content/5 h-full">
              <div className="card-body p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                      <TrendingUp className="w-5 h-5 text-secondary" />
                      Recent Activity
                    </h3>
                    <p className="text-sm text-base-content/60">
                      Your latest submissions
                    </p>
                  </div>
                </div>

                {stats.recentSubmissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
                    <div className="p-4 bg-base-200/50 rounded-full mb-4">
                      <Code className="w-8 h-8 text-base-content/30" />
                    </div>
                    <h4 className="font-bold mb-2">No activity yet</h4>
                    <p className="text-sm text-base-content/60 mb-6 max-w-[200px]">
                      Start solving problems to see your history here
                    </p>
                    <Link to="/problems" className="btn btn-primary btn-sm">
                      Start Now
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentSubmissions.map((submission, index) => (
                      <div
                        key={index}
                        className="group p-4 bg-base-200/30 rounded-xl border border-base-content/5 hover:bg-base-200/60 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm truncate mb-1 group-hover:text-primary transition-colors">
                              {submission.problemTitle}
                            </h5>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="badge badge-sm badge-ghost font-mono">
                                {submission.language}
                              </span>
                              {submission.problemDifficulty && (
                                <span
                                  className={`font-bold ${getDifficultyColor(
                                    submission.problemDifficulty
                                  )}`}
                                >
                                  {submission.problemDifficulty}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`badge badge-sm font-semibold mb-1 ${
                                submission.status === "Accepted"
                                  ? "badge-success gap-1"
                                  : "badge-error gap-1"
                              }`}
                            >
                              {submission.status === "Accepted" ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                  AC
                                </>
                              ) : (
                                "WA"
                              )}
                            </div>
                            <p className="text-[10px] text-base-content/40 font-medium">
                              {new Date(
                                submission.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Link
                      to="/profile"
                      className="btn btn-ghost btn-sm btn-block mt-2 text-base-content/60 hover:text-base-content"
                    >
                      View All Activity
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/problems" className="group">
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-base-content/5 hover:border-primary/30">
              <div className="card-body p-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                  Browse Problems
                </h3>
                <p className="text-sm text-base-content/60">
                  Explore our extensive collection of coding challenges sorted by
                  difficulty and topic.
                </p>
              </div>
            </div>
          </Link>

          <Link to="/playlists" className="group">
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-base-content/5 hover:border-secondary/30">
              <div className="card-body p-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-secondary transition-colors">
                  Curated Playlists
                </h3>
                <p className="text-sm text-base-content/60">
                  Follow structured learning paths designed to master specific
                  algorithms and data structures.
                </p>
              </div>
            </div>
          </Link>

          <Link to="/profile" className="group">
            <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-base-content/5 hover:border-accent/30">
              <div className="card-body p-6">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">
                  Track Progress
                </h3>
                <p className="text-sm text-base-content/60">
                  Analyze your performance, visualize your growth, and climb the
                  leaderboards.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
