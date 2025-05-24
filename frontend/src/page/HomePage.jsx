import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Code, Trophy, Target, BookOpen, Play, TrendingUp, Star, Zap, Users, Award } from "lucide-react";
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

  useEffect(() => {
    fetchDashboardData();
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
      {/* Enhanced Hero Section */}
      <div className="hero min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="hero-content text-center relative z-10 max-w-6xl">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="badge badge-primary badge-lg mb-6 gap-2 animate-bounce">
              <Star className="w-4 h-4" />
              Welcome {authUser?.name || 'Coder'}!
            </div>
            
            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
              LeetLab
            </h1>
            
            {/* Subheading */}
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-base-content/90">
              Master Coding Interviews with
              <span className="text-primary"> Confidence</span>
            </h2>
            
            {/* Description */}
            <p className="text-lg md:text-xl mb-8 text-base-content/70 max-w-3xl mx-auto leading-relaxed">
              Join thousands of developers who've transformed their careers through our comprehensive 
              coding challenge platform. Practice, learn, and excel in your next technical interview.
            </p>
            
            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/problems" className="btn btn-primary btn-lg gap-3 hover:scale-105 transition-transform shadow-lg">
                <Play className="w-6 h-6" />
                Start Coding Journey
                <div className="badge badge-accent">New</div>
              </Link>
              <Link to="/playlists" className="btn btn-outline btn-lg gap-3 hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
                Explore Playlists
              </Link>
            </div>
            
            {/* Quick Stats Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="stat bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <div className="stat-value text-2xl text-primary">{stats.totalProblems}</div>
                <div className="stat-title text-xs">Problems</div>
              </div>
              <div className="stat bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <div className="stat-value text-2xl text-success">{stats.solvedProblems}</div>
                <div className="stat-title text-xs">Solved</div>
              </div>
              <div className="stat bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <div className="stat-value text-2xl text-info">
                  {stats.totalProblems > 0 ? Math.round((stats.solvedProblems / stats.totalProblems) * 100) : 0}%
                </div>
                <div className="stat-title text-xs">Progress</div>
              </div>
              <div className="stat bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <div className="stat-value text-2xl text-secondary">{stats.recentSubmissions.length}</div>
                <div className="stat-title text-xs">Recent</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-base-content/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-base-content/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Enhanced Stats Overview */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Your Coding Progress</h2>
            <p className="text-xl text-base-content/70">Track your journey to coding mastery</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="card-body items-center text-center">
                <div className="p-4 bg-primary/20 rounded-full mb-4">
                  <Code className="w-8 h-8 text-primary" />
                </div>
                <div className="stat-value text-primary text-3xl font-black">{stats.totalProblems}</div>
                <div className="stat-title font-semibold">Total Problems</div>
                <div className="stat-desc">Ready to challenge you</div>
                <div className="card-actions mt-4">
                  <div className="badge badge-primary gap-2">
                    <Zap className="w-3 h-3" />
                    Available
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-success/10 to-success/5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="card-body items-center text-center">
                <div className="p-4 bg-success/20 rounded-full mb-4">
                  <Trophy className="w-8 h-8 text-success" />
                </div>
                <div className="stat-value text-success text-3xl font-black">{stats.solvedProblems}</div>
                <div className="stat-title font-semibold">Problems Solved</div>
                <div className="stat-desc">Great job!</div>
                <div className="card-actions mt-4">
                  <div className="badge badge-success gap-2">
                    <Award className="w-3 h-3" />
                    Completed
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-info/10 to-info/5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="card-body items-center text-center">
                <div className="p-4 bg-info/20 rounded-full mb-4">
                  <Target className="w-8 h-8 text-info" />
                </div>
                <div className="stat-value text-info text-3xl font-black">
                  {stats.totalProblems > 0 ? Math.round((stats.solvedProblems / stats.totalProblems) * 100) : 0}%
                </div>
                <div className="stat-title font-semibold">Success Rate</div>
                <div className="stat-desc">Keep it up!</div>
                <div className="card-actions mt-4">
                  <div className="radial-progress text-info text-xs" style={{"--value": stats.totalProblems > 0 ? Math.round((stats.solvedProblems / stats.totalProblems) * 100) : 0, "--size": "2rem"}}>
                    {stats.totalProblems > 0 ? Math.round((stats.solvedProblems / stats.totalProblems) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="card-body items-center text-center">
                <div className="p-4 bg-secondary/20 rounded-full mb-4">
                  <TrendingUp className="w-8 h-8 text-secondary" />
                </div>
                <div className="stat-value text-secondary text-3xl font-black">{stats.recentSubmissions.length}</div>
                <div className="stat-title font-semibold">Recent Activity</div>
                <div className="stat-desc">This week</div>
                <div className="card-actions mt-4">
                  <div className="badge badge-secondary gap-2">
                    <Users className="w-3 h-3" />
                    Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16">
          {/* Problems by Difficulty - Enhanced */}
          <div className="xl:col-span-2">
            <div className="card bg-base-100 shadow-2xl border border-base-200">
              <div className="card-body">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="card-title text-2xl font-bold">
                    <Target className="w-6 h-6 text-primary" />
                    Problem Distribution
                  </h2>
                  <div className="badge badge-primary">By Difficulty</div>
                </div>
                
                <div className="space-y-6">
                  {Object.entries(stats.problemsByDifficulty).map(([difficulty, count]) => {
                    const percentage = stats.totalProblems > 0 ? Math.round((count / stats.totalProblems) * 100) : 0;
                    return (
                      <div key={difficulty} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${
                              difficulty === "EASY" ? "bg-green-500" :
                              difficulty === "MEDIUM" ? "bg-yellow-500" : "bg-red-500"
                            }`}></div>
                            <span className="font-semibold text-lg">{difficulty}</span>
                            <div className="badge badge-outline">{percentage}%</div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-2xl">{count}</span>
                            <span className="text-sm text-base-content/60 ml-1">problems</span>
                          </div>
                        </div>
                        <progress 
                          className={`progress w-full ${
                            difficulty === "EASY" ? "progress-success" :
                            difficulty === "MEDIUM" ? "progress-warning" : "progress-error"
                          }`} 
                          value={count} 
                          max={stats.totalProblems}
                        ></progress>
                      </div>
                    );
                  })}
                </div>
                
                <div className="card-actions justify-center mt-8">
                  <Link to="/problems" className="btn btn-primary btn-wide gap-2 hover:scale-105 transition-transform">
                    <Code className="w-5 h-5" />
                    Explore All Problems
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity - Enhanced */}
          <div className="xl:col-span-1">
            <div className="card bg-base-100 shadow-2xl border border-base-200 h-full">
              <div className="card-body">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="card-title text-xl font-bold">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                    Recent Activity
                  </h2>
                  <div className="badge badge-secondary">{stats.recentSubmissions.length}</div>
                </div>
                
                {stats.recentSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-6 bg-base-200 rounded-full w-fit mx-auto mb-4">
                      <Code className="w-12 h-12 text-base-content/40" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No submissions yet</h3>
                    <p className="text-base-content/70 mb-4">Start your coding journey today!</p>
                    <Link to="/problems" className="btn btn-primary btn-sm gap-2">
                      <Play className="w-4 h-4" />
                      Start Solving
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentSubmissions.map((submission, index) => (
                      <div key={index} className="card bg-base-200 hover:bg-base-300 transition-colors">
                        <div className="card-body p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate mb-2">
                                {submission.problemTitle}
                              </h4>
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="badge badge-sm badge-outline">
                                  {submission.language}
                                </div>
                                {submission.problemDifficulty && (
                                  <div className={`badge badge-sm ${
                                    submission.problemDifficulty === "EASY" ? "badge-success" :
                                    submission.problemDifficulty === "MEDIUM" ? "badge-warning" : "badge-error"
                                  }`}>
                                    {submission.problemDifficulty}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-3">
                              <div className={`badge badge-sm ${
                                submission.status === "Accepted" ? "badge-success" : "badge-error"
                              }`}>
                                {submission.status}
                              </div>
                              <p className="text-xs text-base-content/60 mt-1">
                                {new Date(submission.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {stats.recentSubmissions.length > 0 && (
                  <div className="card-actions justify-center mt-6">
                    <Link to="/profile" className="btn btn-outline btn-sm gap-2">
                      <TrendingUp className="w-4 h-4" />
                      View All Activity
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Quick Actions</h2>
          <p className="text-xl text-base-content/70">Jump right into what you need</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/problems" className="group">
            <div className="card bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:rotate-1 border border-primary/20">
              <div className="card-body text-center p-8">
                <div className="p-6 bg-primary/20 rounded-full w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Code className="w-12 h-12 text-primary" />
                </div>
                <h2 className="card-title justify-center text-2xl mb-4">Browse Problems</h2>
                <p className="text-base-content/70 mb-6">Discover coding challenges tailored to your skill level</p>
                <div className="flex justify-center gap-2">
                  <div className="badge badge-primary">500+ Problems</div>
                  <div className="badge badge-outline">All Levels</div>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/playlists" className="group">
            <div className="card bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:-rotate-1 border border-secondary/20">
              <div className="card-body text-center p-8">
                <div className="p-6 bg-secondary/20 rounded-full w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-12 h-12 text-secondary" />
                </div>
                <h2 className="card-title justify-center text-2xl mb-4">My Playlists</h2>
                <p className="text-base-content/70 mb-6">Organize your learning with curated problem collections</p>
                <div className="flex justify-center gap-2">
                  <div className="badge badge-secondary">Organized</div>
                  <div className="badge badge-outline">Custom</div>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/profile" className="group">
            <div className="card bg-gradient-to-br from-accent/10 via-accent/5 to-transparent shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:rotate-1 border border-accent/20">
              <div className="card-body text-center p-8">
                <div className="p-6 bg-accent/20 rounded-full w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-12 h-12 text-accent" />
                </div>
                <h2 className="card-title justify-center text-2xl mb-4">My Progress</h2>
                <p className="text-base-content/70 mb-6">Track achievements and monitor your coding evolution</p>
                <div className="flex justify-center gap-2">
                  <div className="badge badge-accent">Analytics</div>
                  <div className="badge badge-outline">Insights</div>
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