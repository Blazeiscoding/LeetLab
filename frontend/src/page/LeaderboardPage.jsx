import React from "react";
import Loader from "../components/Loader";
import {
  Trophy,
  Medal,
  TrendingUp,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Hooks
import { useLeaderboardWithRefresh } from "../hooks/useLeaderboard";

// Utils
import { formatMonthYear } from "../utils/formatters";

const LeaderboardPage = () => {
  const {
    leaderboard,
    period,
    isLoading: loading,
    refresh,
    isRefreshing: refreshing,
    error,
  } = useLeaderboardWithRefresh();

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="relative">
          <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
          <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full"></div>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="relative">
          <Trophy className="w-7 h-7 text-gray-300 drop-shadow-lg" />
          <div className="absolute inset-0 bg-gray-300/20 blur-xl rounded-full"></div>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="relative">
          <Trophy className="w-7 h-7 text-amber-700 drop-shadow-lg" />
          <div className="absolute inset-0 bg-amber-700/20 blur-xl rounded-full"></div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-base-200 border-2 border-base-content/10 font-bold text-base-content/70">
        {rank}
      </div>
    );
  };

  const getRankGradient = (rank) => {
    if (rank === 1) return "from-yellow-500/20 via-yellow-400/10 to-transparent";
    if (rank === 2) return "from-gray-400/20 via-gray-300/10 to-transparent";
    if (rank === 3) return "from-amber-600/20 via-amber-500/10 to-transparent";
    return "from-base-content/5 to-transparent";
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Leaderboard
          </h1>
        </div>

        {period?.month && period?.year && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-base-200 border border-base-content/10 mb-2"
          >
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-base-content/80">
              {formatMonthYear(period.year, period.month)}
            </span>
          </motion.div>
        )}

        <p className="text-base-content/60 text-sm md:text-base">
          Top performers of the month
        </p>

        <button
          onClick={() => refresh()}
          disabled={refreshing || loading}
          className="mt-4 btn btn-ghost btn-sm gap-2 hover:scale-105 transition-transform"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col justify-center items-center h-64"
        >
          <Loader />
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="alert alert-error shadow-lg"
        >
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Failed to load leaderboard</span>
          </div>
        </motion.div>
      ) : leaderboard.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-200 shadow-xl"
        >
          <div className="card-body items-center text-center py-16">
            <Trophy className="w-16 h-16 text-base-content/20 mb-4" />
            <h3 className="text-xl font-bold mb-2">No rankings yet</h3>
            <p className="text-base-content/60">
              Be the first to solve problems and climb the leaderboard!
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-4 border-gray-200 flex items-center justify-center shadow-lg">
                    <Medal className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                    2
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm truncate w-full">
                    {leaderboard[1]?.user?.name || leaderboard[1]?.user?.email}
                  </p>
                  <p className="text-xs text-base-content/60">
                    {leaderboard[1]?.totalScore} pts
                  </p>
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center -mt-4"
              >
                <div className="relative mb-2">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 border-4 border-yellow-300 flex items-center justify-center shadow-xl">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                    1
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-base truncate w-full">
                    {leaderboard[0]?.user?.name || leaderboard[0]?.user?.email}
                  </p>
                  <p className="text-sm text-base-content/60">
                    {leaderboard[0]?.totalScore} pts
                  </p>
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 border-4 border-amber-500 flex items-center justify-center shadow-lg">
                    <Medal className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white">
                    3
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm truncate w-full">
                    {leaderboard[2]?.user?.name || leaderboard[2]?.user?.email}
                  </p>
                  <p className="text-xs text-base-content/60">
                    {leaderboard[2]?.totalScore} pts
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="card bg-base-100 shadow-2xl border border-base-content/10 overflow-hidden">
            <div className="card-body p-0">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-base-200/50 border-b border-base-content/10">
                      <th className="text-base-content/70 font-bold">Rank</th>
                      <th className="text-base-content/70 font-bold">User</th>
                      <th className="text-base-content/70 font-bold">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Score
                        </div>
                      </th>
                      <th className="text-base-content/70 font-bold">Solved</th>
                      <th className="text-base-content/70 font-bold">Breakdown</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {leaderboard.map((entry, idx) => (
                        <motion.tr
                          key={entry.user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{
                            duration: 0.3,
                            delay: idx * 0.03,
                          }}
                          className={`group hover:bg-gradient-to-r ${getRankGradient(
                            entry.rank
                          )} transition-all duration-300 border-b border-base-content/5 ${
                            idx < 3 ? "bg-base-200/30" : ""
                          }`}
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              {getRankBadge(entry.rank)}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="avatar placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-10 h-10">
                                  <span className="text-sm font-bold">
                                    {(entry.user.name || entry.user.email)
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="font-semibold">
                                  {entry.user.name || entry.user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-primary">
                                {entry.totalScore}
                              </span>
                              <span className="text-xs text-base-content/50">
                                pts
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="badge badge-primary badge-lg font-bold">
                              {entry.totalProblemsSolved}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-success"></div>
                                <span className="text-xs font-semibold text-success">
                                  {entry.problemsSolved.EASY}
                                </span>
                              </div>
                              <span className="text-base-content/30">/</span>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-warning"></div>
                                <span className="text-xs font-semibold text-warning">
                                  {entry.problemsSolved.MEDIUM}
                                </span>
                              </div>
                              <span className="text-base-content/30">/</span>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-error"></div>
                                <span className="text-xs font-semibold text-error">
                                  {entry.problemsSolved.HARD}
                                </span>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LeaderboardPage;
