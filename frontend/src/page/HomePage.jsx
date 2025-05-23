import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Code, Trophy, Target, BookOpen, Play, TrendingUp } from "lucide-react";
import { axiosInstance } from "../util/axios";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const HomePage = () => {
  const { authUser } = useAuthStore();
  const [stats, setStats] = useState({
    totalProblems: 0,
    solvedProblems: 0,
    recentSubmissions: [],
    problemsByDifficulty: { EASY: 0, MEDIUM: 0, HARD: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [problemsRes, solvedRes, submissionsRes] = await Promise.all([
        axiosInstance.get("/problems/get-all-problems"),
        axiosInstance.get("/problems/get-solved-problems").catch(() => ({ data: { data: [] } })),
        axiosInstance.get("/submission/get-all-submission").catch(() => ({ data: { data: [] } }))
      ]);

      const allProblems = problemsRes.data.data || [];
      const solvedProblems = solvedRes.data.data || [];
      const submissions = submissionsRes.data.data || [];

      const problemsByDifficulty = allProblems.reduce((acc, problem) => {
        acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
        return acc;
      }, { EASY: 0, MEDIUM: 0, HARD: 0 });

      setStats({
        totalProblems: allProblems.length,
        solvedProblems: solvedProblems.length,
        recentSubmissions: submissions.slice(0, 5),
        problemsByDifficulty
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY": return "text-green-500";
      case "MEDIUM": return "text-yellow-500";
      case "HARD": return "text-red-500";
      default: return "text-gray-500";
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero min-h-96 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <div className="absolute top-16 left-0 w-1/3 h-1/3 bg-primary opacity-30 blur-3xl rounded-md"></div>
            <h1 className="text-5xl font-bold z-10 relative">
              Welcome to <span className="text-primary">LeetLab</span>
            </h1>
            <p className="py-6 text-lg z-10 relative">
              A Platform Inspired by LeetCode which helps you to prepare for coding
              interviews and improve your coding skills by solving coding problems
            </p>
            <div className="flex gap-4 justify-center z-10 relative">
              <Link to="/problems" className="btn btn-primary btn-lg gap-2">
                <Play className="w-5 h-5" />
                Start Coding
              </Link>
              <Link to="/playlists" className="btn btn-outline btn-lg gap-2">
                <BookOpen className="w-5 h-5" />
                My Playlists
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="stat bg-base-100 rounded-box shadow-lg">
            <div className="stat-figure text-primary">
              <Code className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Problems</div>
            <div className="stat-value text-primary">{stats.totalProblems}</div>
            <div className="stat-desc">Available to solve</div>
          </div>

          <div className="stat bg-base-100 rounded-box shadow-lg">
            <div className="stat-figure text-success">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="stat-title">Solved</div>
            <div className="stat-value text-success">{stats.solvedProblems}</div>
            <div className="stat-desc">Problems completed</div>
          </div>

          <div className="stat bg-base-100 rounded-box shadow-lg">
            <div className="stat-figure text-info">
              <Target className="w-8 h-8" />
            </div>
            <div className="stat-title">Success Rate</div>
            <div className="stat-value text-info">
              {stats.totalProblems > 0 
                ? Math.round((stats.solvedProblems / stats.totalProblems) * 100)
                : 0}%
            </div>
            <div className="stat-desc">Overall progress</div>
          </div>

          <div className="stat bg-base-100 rounded-box shadow-lg">
            <div className="stat-figure text-secondary">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="stat-title">Submissions</div>
            <div className="stat-value text-secondary">{stats.recentSubmissions.length}</div>
            <div className="stat-desc">Recent attempts</div>
          </div>
        </div>

        {/* Problems by Difficulty */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <Target className="w-5 h-5" />
                Problems by Difficulty
              </h2>
              <div className="space-y-4">
                {Object.entries(stats.problemsByDifficulty).map(([difficulty, count]) => (
                  <div key={difficulty} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        difficulty === "EASY" ? "bg-green-500" :
                        difficulty === "MEDIUM" ? "bg-yellow-500" : "bg-red-500"
                      }`}></div>
                      <span className="font-medium">{difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{count}</span>
                      <span className="text-sm text-gray-500">problems</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card-actions justify-end mt-4">
                <Link to="/problems" className="btn btn-primary btn-sm">
                  View All Problems
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <TrendingUp className="w-5 h-5" />
                Recent Submissions
              </h2>
              {stats.recentSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <Code className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No submissions yet</p>
                  <Link to="/problems" className="btn btn-primary btn-sm mt-2">
                    Start Solving
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentSubmissions.map((submission, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                      <div>
                        <p className="font-medium">Problem #{submission.problemId}</p>
                        <p className="text-sm text-gray-500">{submission.language}</p>
                      </div>
                      <div className="text-right">
                        <div className={`badge ${
                          submission.status === "Accepted" 
                            ? "badge-success" 
                            : "badge-error"
                        }`}>
                          {submission.status}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {stats.recentSubmissions.length > 0 && (
                <div className="card-actions justify-end mt-4">
                  <Link to="/profile" className="btn btn-outline btn-sm">
                    View All Submissions
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/problems" className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body text-center">
              <Code className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="card-title justify-center">Browse Problems</h2>
              <p>Explore our collection of coding challenges</p>
            </div>
          </Link>

          <Link to="/playlists" className="card bg-gradient-to-br from-secondary/10 to-secondary/5 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body text-center">
              <BookOpen className="w-12 h-12 mx-auto text-secondary mb-4" />
              <h2 className="card-title justify-center">My Playlists</h2>
              <p>Organize your practice with custom playlists</p>
            </div>
          </Link>

          <Link to="/profile" className="card bg-gradient-to-br from-accent/10 to-accent/5 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body text-center">
              <Trophy className="w-12 h-12 mx-auto text-accent mb-4" />
              <h2 className="card-title justify-center">My Progress</h2>
              <p>Track your coding journey and achievements</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;