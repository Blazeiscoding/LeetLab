import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IconArrowRight, IconBolt, IconBook, IconCircleCheck, IconCode, IconRocket, IconTarget, IconTrophy } from '@tabler/icons-react';
import { useAuthStore } from "../store/useAuthStore";

// Hooks
import { useProblems } from "../hooks/useProblems";
import { useSolvedProblems } from "../hooks/useProblems";
import { useRecentSubmissions } from "../hooks/useSubmissions";
import { useTopLeaderboard } from "../hooks/useLeaderboard";

// Components
import Loader from "../components/Loader";
import { getUserAvatar } from "../utils/avatar";
import {
  TextGenerateEffect,
  FlipWords,
  GlowingBackground,
  GridBackground,
  BentoGridItem,
  Card3D,
} from "../components/ui/AceternityEffects";
import { Difficulty, Problem } from "../types";

// Difficulty utilities
import { getDifficultyColor, getDifficultyBgColor } from "../utils/difficulty";

const HomePage = () => {
  const { authUser } = useAuthStore();

  // Data fetching with React Query
  const { data: problems = [], isLoading: problemsLoading } = useProblems();
  const { data: solvedProblems = [] } = useSolvedProblems();
  const { data: submissions = [] } = useRecentSubmissions(5);
  const { data: topLeaderboard = [] } = useTopLeaderboard(3);

  // Computed stats
  const stats = useMemo(() => {
    const totalProblems = problems.length;
    // Ensure solvedProblems is an array (API might return object with difficulty keys)
    const solvedArray = Array.isArray(solvedProblems) ? solvedProblems : [];
    const solvedCount = solvedArray.length;
    const solvedSet = new Set(solvedArray.map((p) => p.id));

    const byDifficulty: Record<Difficulty, { total: number; solved: number }> = {
      EASY: { total: 0, solved: 0 },
      MEDIUM: { total: 0, solved: 0 },
      HARD: { total: 0, solved: 0 },
    };

    problems.forEach((problem) => {
      const diff = (problem.difficulty || Difficulty.MEDIUM) as Difficulty;
      if (diff in byDifficulty) {
        byDifficulty[diff].total++;
        if (solvedSet.has(problem.id)) {
          byDifficulty[diff].solved++;
        }
      }
    });

    return { totalProblems, solvedCount, byDifficulty };
  }, [problems, solvedProblems]);

  // Create a map for quick problem title lookup
  const problemMap = useMemo(() => {
    const map: Record<string, Problem> = {};
    problems.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [problems]);

  // Helper to get problem title
  const getProblemTitle = (problemId: string) => {
    const problem = problemMap[problemId];
    return problem?.title || `Problem #${problemId?.slice(0, 8) || 'Unknown'}`;
  };

  const flipWords = ["practice", "compete", "learn", "grow", "succeed"];

  if (problemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Global Background Effects - flows through entire page */}
      <div className="fixed inset-0 pointer-events-none">
        <GridBackground />
        <GlowingBackground />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center">

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <IconCode className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Welcome back, {authUser?.name?.split(" ")[0] || "Coder"}!
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight">
              <span className="block mb-2">Master coding with</span>
              <span className="text-primary">
                <FlipWords words={flipWords} duration={2500} />
              </span>
            </h1>

            {/* Subheading */}
            <TextGenerateEffect
              words="Solve algorithmic challenges, track your progress, and compete with developers worldwide."
              className="text-lg md:text-xl text-base-content/60 max-w-2xl mx-auto mb-10"
            />

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/problems"
                className="btn btn-primary btn-lg gap-2 group"
              >
                Start Practicing
                <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/leaderboard"
                className="btn btn-outline btn-lg gap-2"
              >
                <IconTrophy className="w-5 h-5" />
                View Leaderboard
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-16 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
          >
            {[
              { value: stats.totalProblems, label: "Problems" },
              { value: stats.solvedCount, label: "Solved" },
              { value: `${Math.round((stats.solvedCount / stats.totalProblems) * 100) || 0}%`, label: "Progress" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-base-content/60 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Difficulty Progress Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Progress
            </h2>
            <p className="text-base-content/60 max-w-xl mx-auto">
              Track your journey across different difficulty levels
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.entries(stats.byDifficulty) as Array<[Difficulty, { total: number; solved: number }]>).map(([level, data], i) => (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card3D>
                  <div className="bg-base-100 rounded-2xl p-6 border border-base-content/5 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-lg font-bold ${getDifficultyColor(level)}`}>
                        {level.charAt(0) + level.slice(1).toLowerCase()}
                      </span>
                      <span className="text-2xl font-black">
                        {data.solved}/{data.total}
                      </span>
                    </div>
                    <div className="w-full bg-base-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${getDifficultyBgColor(level)}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(data.solved / data.total) * 100 || 0}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      />
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-20 px-4 bg-base-200/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to excel
            </h2>
            <p className="text-base-content/60 max-w-xl mx-auto">
              Practice, compete, and track your coding journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2"
            >
              <BentoGridItem
                icon={IconCode}
                title="Curated Problem Set"
                description="Practice with carefully selected algorithmic challenges covering data structures, algorithms, and more."
                className="h-full"
              >
                <div className="mt-4 flex gap-2 flex-wrap">
                  {["Arrays", "Trees", "Graphs", "DP", "Strings"].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-base-200 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </BentoGridItem>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <BentoGridItem
                icon={IconTrophy}
                title="Monthly Leaderboard"
                description="Compete with other developers and climb the ranks."
                className="h-full"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <BentoGridItem
                icon={IconBook}
                title="Custom Playlists"
                description="Create personalized problem sets for focused practice."
                className="h-full"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <BentoGridItem
                icon={IconTarget}
                title="Progress Tracking"
                description="Monitor your improvement with detailed analytics."
                className="h-full"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <BentoGridItem
                icon={IconBolt}
                title="Real-time Feedback"
                description="Get instant feedback on your code submissions."
                className="h-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      {topLeaderboard.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Top Performers
              </h2>
              <p className="text-base-content/60">
                This month's coding champions
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topLeaderboard.slice(0, 3).map((user, index) => (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={index === 0 ? "md:-mt-4" : ""}
                >
                  <div
                    className={`relative bg-base-100 rounded-2xl p-6 border text-center ${
                      index === 0
                        ? "border-yellow-500/30 shadow-lg shadow-yellow-500/10"
                        : "border-base-content/5"
                    }`}
                  >
                    {index === 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500 rounded-full">
                        <IconTrophy className="w-4 h-4 text-yellow-900" />
                      </div>
                    )}
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden ring-4 ring-base-200">
                      <img
                        src={getUserAvatar(user.user)}
                        alt={user.user?.name || user.user?.email || "User"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{user.user?.name}</h3>
                    <p className="text-primary font-bold text-xl">
                      {user.score} pts
                    </p>
                    <p className="text-sm text-base-content/60 mt-2">
                      {typeof user.problemsSolved === 'object' 
                        ? (user.problemsSolved.EASY || 0) + (user.problemsSolved.MEDIUM || 0) + (user.problemsSolved.HARD || 0)
                        : user.problemsSolved || 0} problems solved
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <Link to="/leaderboard" className="btn btn-outline gap-2">
                View Full Leaderboard
                <IconArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {submissions.length > 0 && (
        <section className="py-20 px-4 bg-base-200/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Recent Activity
              </h2>
              <p className="text-base-content/60">
                Your latest submissions
              </p>
            </motion.div>

            <div className="space-y-3">
              {submissions.slice(0, 5).map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/problems/${submission.problemId}`}
                    className="flex items-center justify-between p-4 bg-base-100 rounded-xl border border-base-content/5 hover:border-primary/20 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          submission.status === "Accepted"
                            ? "bg-success/10 text-success"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        <IconCircleCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {getProblemTitle(submission.problemId)}
                        </p>
                        <p className="text-sm text-base-content/60">
                          {submission.language}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-medium ${
                          submission.status === "Accepted"
                            ? "text-success"
                            : "text-error"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative bg-base-100/50 backdrop-blur-sm rounded-3xl p-12 border border-base-content/5">
            <div className="relative z-10">
              <IconRocket className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to level up?
              </h2>
              <p className="text-base-content/60 mb-8 max-w-lg mx-auto">
                Start solving problems today and join thousands of developers improving their skills.
              </p>
              <Link
                to="/problems"
                className="btn btn-primary btn-lg gap-2 group"
              >
                Start Coding Now
                <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
