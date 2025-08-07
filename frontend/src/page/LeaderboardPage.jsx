import React, { useEffect, useState } from "react";
import { axiosInstance } from "../util/axios";
import { Trophy, User, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState({ month: null, year: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/leaderboard/monthly");
      setLeaderboard(res.data.data.leaderboard || []);
      setPeriod({ month: res.data.data.month, year: res.data.data.year });
    } catch (err) {
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getMedal = (rank) => {
    if (rank === 1)
      return <Trophy className="text-yellow-400 w-6 h-6 animate-bounce" />;
    if (rank === 2)
      return <Trophy className="text-gray-300 w-6 h-6 animate-bounce" />;
    if (rank === 3)
      return <Trophy className="text-amber-700 w-6 h-6 animate-bounce" />;
    return <span className="font-bold text-lg">{rank}</span>;
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
          Leaderboard
        </h1>
        {period.month && period.year && (
          <p className="text-gray-400 mb-2 animate-fade-in">
            {new Date(period.year, period.month - 1).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
        <p className="text-gray-500 animate-fade-in">Top coders of the month</p>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-2xl bg-base-200/80 animate-fade-in-up">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Solved
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  E/M/H
                </th>
              </tr>
            </thead>
            <AnimatePresence>
              <tbody className="divide-y divide-gray-800">
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No data yet.
                    </td>
                  </tr>
                )}
                {leaderboard.map((entry, idx) => (
                  <motion.tr
                    key={entry.user.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className={`hover:bg-primary/10 transition-all duration-300 ${
                      idx < 3 ? "font-bold" : ""
                    }`}
                  >
                    <td className="px-4 py-3">{getMedal(entry.rank)}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      <span>{entry.user.name || entry.user.email}</span>
                    </td>
                    <td className="px-4 py-3">{entry.totalScore}</td>
                    <td className="px-4 py-3">{entry.totalProblemsSolved}</td>
                    <td className="px-4 py-3">
                      <span className="text-green-400 font-semibold">
                        {entry.problemsSolved.EASY}
                      </span>{" "}
                      /
                      <span className="text-yellow-400 font-semibold">
                        {entry.problemsSolved.MEDIUM}
                      </span>{" "}
                      /
                      <span className="text-red-400 font-semibold">
                        {entry.problemsSolved.HARD}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </AnimatePresence>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
