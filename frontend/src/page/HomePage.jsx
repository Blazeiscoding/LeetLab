import React, { useMemo } from "react";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";
import {
  Code,
  Trophy,
  Target,
  BookOpen,
  Play,
  TrendingUp,
  Star,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

// Hooks
import { useProblems, useSolvedProblems, useProblemsByDifficulty } from "../hooks/useProblems";
import { useRecentSubmissions } from "../hooks/useSubmissions";
import { useTopLeaderboard } from "../hooks/useLeaderboard";

// Utils
import { getDifficultyColor, getDifficultyBgColor } from "../utils/difficulty";

// Components
import StatCard from "../components/ui/StatCard";
import SubmissionCard, { NoSubmissions } from "../components/ui/SubmissionCard";

const HomePage = () => {
  const { authUser } = useAuthStore();
  
  // Data fetching with React Query hooks
  const { data: problems = [], isLoading: problemsLoading } = useProblems();
  const { data: solvedProblems = [], isLoading: solvedLoading } = useSolvedProblems();
  const { data: submissions = [], isLoading: submissionsLoading } = useRecentSubmissions(5);
  const { data: topLeaderboard = [] } = useTopLeaderboard(3);
  const { data: problemsByDifficulty } = useProblemsByDifficulty();

  // Loading state
  const loading = problemsLoading || solvedLoading || submissionsLoading;

  // Create problem map for enriching submissions
  const problemMap = useMemo(() => {
    return problems.reduce((acc, problem) => {
      const problemId = problem._id || problem.id;
      acc[problemId] = {
        title: problem.title || problem.name || `Problem #${problemId}`,
        difficulty: problem.difficulty,
      };
      return acc;
    }, {});
  }, [problems]);

  // Enrich submissions with problem details
  const enrichedSubmissions = useMemo(() => {
    return submissions.map((submission) => ({
      ...submission,
      problemTitle:
        problemMap[submission.problemId]?.title ||
        `Problem #${submission.problemId}`,
      problemDifficulty: problemMap[submission.problemId]?.difficulty,
    }));
  }, [submissions, problemMap]);

  // Computed stats
  const computedStats = useMemo(
    () => ({
      totalProblems: problems.length,
      solvedProblems: solvedProblems.length,
      progressPercent:
        problems.length > 0
          ? Math.round((solvedProblems.length / problems.length) * 100)
          : 0,
      recentCount: submissions.length,
    }),
    [problems.length, solvedProblems.length, submissions.length]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="text-center">
          <Loader />
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
              <StatCard
                label="Total Problems"
                value={computedStats.totalProblems}
                color="text-primary"
              />
              <StatCard
                label="Solved"
                value={computedStats.solvedProblems}
                color="text-success"
              />
              <StatCard
                label="Completion"
                value={`${computedStats.progressPercent}%`}
                color="text-info"
              />
              <StatCard
                label="Recent Activity"
                value={computedStats.recentCount}
                color="text-secondary"
              />
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
                  {Object.entries(problemsByDifficulty || { EASY: 0, MEDIUM: 0, HARD: 0 }).map(
                    ([difficulty, count]) => {
                      const percentage =
                        problems.length > 0
                          ? Math.round((count / problems.length) * 100)
                          : 0;
                      return (
                        <div key={difficulty} className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-2 h-2 rounded-full ${getDifficultyBgColor(difficulty)}`}
                              ></span>
                              <span className="font-bold opacity-80">
                                {difficulty}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-black">{count}</span>
                              <span className="text-base-content/40">/</span>
                              <span className="text-base-content/40">
                                {problems.length}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-base-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${getDifficultyBgColor(difficulty)}`}
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

                {enrichedSubmissions.length === 0 ? (
                  <NoSubmissions onStartCoding={() => window.location.href = '/problems'} />
                ) : (
                  <div className="space-y-4">
                    {enrichedSubmissions.map((submission, index) => (
                      <SubmissionCard key={index} submission={submission} />
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
