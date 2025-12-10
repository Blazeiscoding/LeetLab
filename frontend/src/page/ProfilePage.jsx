import { useState, useEffect } from "react";
import {
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
  Layout,
  Hash,
  Terminal,
  Activity
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../util/axios";
import StreakCalendar from "../components/StreakCalendar";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { authUser } = useAuthStore();
  const [submissions, setSubmissions] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [problems, setProblems] = useState([]);
  const [problemTitles, setProblemTitles] = useState({}); // Cache for individual problem titles
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchIndividualProblemTitles = async (submissionsData) => {
    const uniqueProblemIds = [
      ...new Set(submissionsData.map((s) => s.problemId)),
    ];
    const titles = {};

    // Try different endpoints for individual problems
    const endpoints = [
      (id) => `/problems/${id}`,
      (id) => `/problem/${id}`,
      (id) => `/problems/get-problem/${id}`,
      (id) => `/get-problem/${id}`,
    ];

    for (const problemId of uniqueProblemIds) {
      for (const endpointFn of endpoints) {
        try {
          const response = await axiosInstance.get(endpointFn(problemId));
          const problemData = response.data?.data || response.data;
          if (problemData && problemData.title) {
            titles[problemId] = problemData.title;
            break; // Successfully got the title, move to next problem
          }
        } catch (error) {
          // Continue to next endpoint
          continue;
        }
      }
    }

    setProblemTitles(titles);
  };

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
          .get("/problems/get-all-problems")
          .catch(() => axiosInstance.get("/problems"))
          .catch(() => axiosInstance.get("/problem"))
          .catch(() => axiosInstance.get("/problems/all"))
          .catch(() => axiosInstance.get("/admin/problems"))
          .catch(() => axiosInstance.get("/api/problems"))
          .catch(() => axiosInstance.get("/get-problems"))
          .catch(() => axiosInstance.get("/getAllProblems"))
          .catch((err) => {
            console.warn("All problems endpoints failed:", err);
            return { data: { data: [] } };
          })
      );

      const [submissionsRes, solvedRes, problemsRes] = await Promise.all(
        promises
      );

      const submissionsData =
        submissionsRes.data?.data || submissionsRes.data || [];
      const solvedData = solvedRes.data?.data || solvedRes.data || [];
      const problemsData = problemsRes.data?.data || problemsRes.data || [];

      setSubmissions(submissionsData);
      setSolvedProblems(solvedData);
      setProblems(problemsData);

      // If problems data is empty but we have submissions, try to fetch individual problem titles
      if (problemsData.length === 0 && submissionsData.length > 0) {
        await fetchIndividualProblemTitles(submissionsData);
      }
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
    if (!problemId) {
      return "Unknown Problem";
    }

    // First, check if we have the title in our cache
    if (problemTitles[problemId]) {
      return problemTitles[problemId];
    }

    // If we don't have problems data, use fallback
    if (problems.length === 0) {
      return `Problem #${problemId}`;
    }

    // Try different matching strategies
    let problem = null;

    // Strategy 1: Direct ID match
    problem = problems.find((p) => p.id === problemId || p._id === problemId);

    // Strategy 2: String/Number conversion match
    if (!problem) {
      problem = problems.find(
        (p) =>
          String(p.id) === String(problemId) ||
          String(p._id) === String(problemId)
      );
    }

    // Strategy 3: Number conversion match
    if (!problem) {
      const numericId = parseInt(problemId);
      if (!isNaN(numericId)) {
        problem = problems.find(
          (p) => parseInt(p.id) === numericId || parseInt(p._id) === numericId
        );
      }
    }

    // Strategy 4: Check if problemId is actually the title itself
    if (!problem) {
      problem = problems.find(
        (p) =>
          p.title === problemId ||
          p.title?.toLowerCase() === String(problemId).toLowerCase()
      );
    }

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
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Profile Header */}
        <div className="relative bg-base-100/80 backdrop-blur-xl rounded-3xl shadow-xl mb-8 overflow-hidden border border-base-content/5">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
          </div>

          <div className="relative p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center lg:items-start gap-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full ring-4 ring-base-100 shadow-2xl overflow-hidden">
                    <img
                      src={
                        authUser?.image ||
                        "https://avatar.iran.liara.run/public/boy"
                      }
                      alt="Profile"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-success text-success-content p-1.5 rounded-full border-4 border-base-100 shadow-sm">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left z-10">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3 mb-3">
                  <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
                    {authUser?.name}
                  </h1>
                  {authUser?.role === "ADMIN" && (
                    <div className="badge badge-warning gap-1 font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      Admin
                    </div>
                  )}
                </div>

                <p className="text-base-content/60 text-lg mb-6 font-medium">{authUser?.email}</p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 lg:gap-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-base-200/50 rounded-full border border-base-content/5">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                      Joined {formatDate(authUser?.createdAt || new Date())}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-base-200/50 rounded-full border border-base-content/5">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium">{stats.recentSubmissions} submissions this week</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards - Hero */}
              <div className="grid grid-cols-3 gap-4 lg:min-w-[400px] w-full lg:w-auto">
                <div className="bg-base-100/50 backdrop-blur-sm rounded-2xl p-4 border border-base-content/5 text-center hover:bg-base-100 transition-colors">
                  <div className="text-success mb-2 flex justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-black text-base-content">{stats.solvedCount}</div>
                  <div className="text-xs font-bold text-base-content/50 uppercase tracking-wide">Solved</div>
                </div>

                <div className="bg-base-100/50 backdrop-blur-sm rounded-2xl p-4 border border-base-content/5 text-center hover:bg-base-100 transition-colors">
                  <div className="text-primary mb-2 flex justify-center">
                    <Code className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-black text-base-content">{stats.totalSubmissions}</div>
                  <div className="text-xs font-bold text-base-content/50 uppercase tracking-wide">Total</div>
                </div>

                <div className="bg-base-100/50 backdrop-blur-sm rounded-2xl p-4 border border-base-content/5 text-center hover:bg-base-100 transition-colors">
                  <div className="text-secondary mb-2 flex justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-black text-base-content">{stats.successRate}%</div>
                  <div className="text-xs font-bold text-base-content/50 uppercase tracking-wide">Success</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto pb-4 lg:pb-0 gap-2 mb-8 no-scrollbar">
          {[
            { id: "overview", label: "Overview", icon: Layout },
            { id: "submissions", label: "Submissions", icon: Terminal },
            { id: "solved", label: "Solved Problems", icon: Trophy },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap ${
                activeTab === id
                  ? "bg-primary text-primary-content shadow-lg shadow-primary/25"
                  : "bg-base-100 hover:bg-base-200 text-base-content/60 hover:text-base-content"
              }`}
              onClick={() => setActiveTab(id)}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Activity Streak Calendar */}
            <div className="card bg-base-100 shadow-xl border border-base-content/5">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-base-200 rounded-xl">
                    <Activity className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Activity Calendar</h2>
                    <p className="text-sm text-base-content/60">Your submission history over the past year</p>
                  </div>
                </div>
                <StreakCalendar submissions={submissions} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Difficulty Breakdown */}
            <div className="card bg-base-100 shadow-xl border border-base-content/5">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-base-200 rounded-xl">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Difficulty Breakdown</h2>
                    <p className="text-sm text-base-content/60">Problems solved by difficulty</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {[
                    {
                      key: "EASY",
                      label: "Easy",
                      color: "bg-success",
                      text: "text-success",
                    },
                    {
                      key: "MEDIUM",
                      label: "Medium",
                      color: "bg-warning",
                      text: "text-warning",
                    },
                    {
                      key: "HARD",
                      label: "Hard",
                      color: "bg-error",
                      text: "text-error",
                    },
                  ].map(({ key, label, color, text }) => {
                    const count = stats.difficultyBreakdown[key] || 0;
                    const total = stats.solvedCount || 1;
                    const percentage = (count / total) * 100;

                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${text}`}>{label}</span>
                          <div className="flex items-center gap-2">
                             <span className="font-black text-lg">{count}</span>
                             <span className="text-xs font-medium text-base-content/40">
                               ({percentage.toFixed(0)}%)
                             </span>
                          </div>
                        </div>
                        <div className="w-full bg-base-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${color} transition-all duration-1000`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Language Breakdown */}
            <div className="card bg-base-100 shadow-xl border border-base-content/5">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-base-200 rounded-xl">
                    <GitBranch className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Languages Used</h2>
                    <p className="text-sm text-base-content/60">Submissions by language</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(stats.languageBreakdown).length === 0 ? (
                    <div className="text-center py-12 bg-base-200/30 rounded-2xl border border-dashed border-base-content/10">
                      <Code className="w-12 h-12 text-base-content/20 mx-auto mb-3" />
                      <p className="text-base-content/60 font-medium">No submissions yet</p>
                      <p className="text-sm text-base-content/40">Start coding to see your stats!</p>
                    </div>
                  ) : (
                    Object.entries(stats.languageBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .map(([language, count]) => {
                        const percentage = (count / stats.totalSubmissions) * 100;
                        return (
                          <div key={language} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-bold opacity-80">{language}</span>
                                <span className="font-mono opacity-60">{count} submissions</span>
                            </div>
                             <div className="w-full bg-base-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-secondary transition-all duration-1000"
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
            </div>
          </div>
        )}

        {activeTab === "submissions" && (
          <div className="card bg-base-100 shadow-xl border border-base-content/5 overflow-hidden">
             <div className="card-body p-0">
                <div className="p-6 border-b border-base-content/5">
                    <h2 className="text-xl font-bold">Recent Submissions</h2>
                    <p className="text-sm text-base-content/60">Your latest activity history</p>
                </div>
            
                <div className="overflow-x-auto">
                    {submissions.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Terminal className="w-8 h-8 text-base-content/40" />
                            </div>
                            <h3 className="text-lg font-bold opacity-80 mb-2">No submissions found</h3>
                            <p className="text-base-content/60 mb-6">Start solving problems to populate your history</p>
                            <Link to="/problems" className="btn btn-primary btn-sm">Browse Problems</Link>
                        </div>
                    ) : (
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr className="bg-base-200/50">
                                    <th className="px-6 py-4">Problem</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Language</th>
                                    <th className="px-6 py-4 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.slice(0, 15).map((submission) => (
                                    <tr key={submission.id} className="hover">
                                        <td className="px-6 py-4">
                                            <Link 
                                                to={`/problems/${submission.problemId}`}
                                                className="font-bold hover:text-primary transition-colors"
                                            >
                                                {getProblemTitle(submission.problemId)}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`badge gap-1.5 font-bold border-0 ${
                                                submission.status === "Accepted" 
                                                    ? "bg-success/10 text-success" 
                                                    : "bg-error/10 text-error"
                                            }`}>
                                                {submission.status === "Accepted" ? (
                                                    <CheckCircle className="w-3 h-3" />
                                                ) : (
                                                    <XCircle className="w-3 h-3" />
                                                )}
                                                {submission.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs opacity-70 bg-base-300 px-2 py-1 rounded">
                                                {submission.language}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm opacity-60 font-mono">
                                            {formatRelativeTime(submission.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
             </div>
          </div>
        )}

        {activeTab === "solved" && (
            <div className="card bg-base-100 shadow-xl border border-base-content/5">
                <div className="card-body p-6">
                     <div className="mb-6">
                        <h2 className="text-xl font-bold">Solved Problems</h2>
                        <p className="text-sm text-base-content/60">Your collection of conquered challenges</p>
                    </div>

                    {solvedProblems.length === 0 ? (
                        <div className="text-center py-20 bg-base-200/30 rounded-3xl border border-dashed border-base-content/10">
                             <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-10 h-10 text-warning" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No problems solved yet</h3>
                            <p className="text-base-content/60 mb-6">Solve your first problem to earn a badge!</p>
                            <Link to="/problems" className="btn btn-primary">Start Solving</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {solvedProblems.map((problem) => (
                                <Link 
                                    key={problem.id} 
                                    to={`/problems/${problem.id}`}
                                    className="group card bg-base-200/50 hover:bg-base-200 transition-all duration-300 border border-base-content/5 hover:border-primary/20 hover:shadow-md"
                                >
                                    <div className="card-body p-5">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className={`badge badge-sm font-bold ${
                                                problem.difficulty === "EASY" ? "badge-success" :
                                                problem.difficulty === "MEDIUM" ? "badge-warning" :
                                                "badge-error"
                                            }`}>
                                                {problem.difficulty}
                                            </div>
                                            <CheckCircle className="w-4 h-4 text-success" />
                                        </div>
                                        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                            {problem.title}
                                        </h3>
                                        <div className="flex gap-2 mt-2">
                                            {problem.tags?.slice(0, 2).map((tag, i) => (
                                                <span key={i} className="text-xs bg-base-300 px-2 py-1 rounded text-base-content/60">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </Link>
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
