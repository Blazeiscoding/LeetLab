import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, CheckCircle, Clock, Zap, ArrowRight } from "lucide-react";
import { axiosInstance } from "../util/axios";
import toast from "react-hot-toast";

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchProblems();
    fetchSolvedProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await axiosInstance.get("/problems/get-all-problems");
      setProblems(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch problems");
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSolvedProblems = async () => {
    try {
      const response = await axiosInstance.get("/problems/get-solved-problems");
      const solved = new Set(response.data.data.map((problem) => problem.id));
      setSolvedProblems(solved);
    } catch (error) {
      console.error("Error fetching solved problems:", error);
    }
  };

  const filteredProblems = useMemo(() => {
    let filtered = problems;

    if (searchTerm) {
      filtered = filtered.filter(
        (problem) =>
          (problem.title && problem.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (problem.tags &&
            problem.tags.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
    }

    if (difficultyFilter !== "ALL") {
      filtered = filtered.filter(
        (problem) => problem.difficulty === difficultyFilter
      );
    }

    if (statusFilter !== "ALL") {
      if (statusFilter === "SOLVED") {
        filtered = filtered.filter((problem) => solvedProblems.has(problem.id));
      } else if (statusFilter === "UNSOLVED") {
        filtered = filtered.filter(
          (problem) => !solvedProblems.has(problem.id)
        );
      }
    }

    return filtered;
  }, [problems, searchTerm, difficultyFilter, statusFilter, solvedProblems]);

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

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return <CheckCircle className="w-4 h-4" />;
      case "MEDIUM":
        return <Clock className="w-4 h-4" />;
      case "HARD":
        return <Zap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-base-200/50 pb-12">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-b from-base-100 to-base-200/50 border-b border-base-content/5 pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Problems
              </h1>
              <p className="text-base-content/70 text-lg max-w-2xl">
                Challenge yourself with our curated collection of coding problems.
                Filter by difficulty, tags, and track your progress.
              </p>
            </div>

            {/* Stats at the top right - compacted */}
            <div className="flex gap-4 bg-base-100 p-3 rounded-2xl border border-base-content/5 shadow-sm">
              <div className="text-center px-4 border-r border-base-content/10">
                <div className="text-xs font-bold uppercase tracking-wider opacity-60">
                  Total
                </div>
                <div className="font-black text-xl">{problems.length}</div>
              </div>
              <div className="text-center px-4">
                <div className="text-xs font-bold uppercase tracking-wider opacity-60">
                  Solved
                </div>
                <div className="font-black text-xl text-success">
                  {solvedProblems.size}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 max-w-7xl relative z-10">
        {/* Filters Card */}
        <div className="card bg-base-100 shadow-xl border border-base-content/5 mb-8 backdrop-blur-xl">
          <div className="card-body p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search problems by title or tag..."
                  className="input input-bordered w-full pl-12 bg-base-200/50 focus:bg-base-100 transition-all border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex w-full md:w-auto gap-3 overflow-x-auto pb-2 md:pb-0">
                <select
                  className="select select-bordered bg-base-200/50 focus:bg-base-100 border-transparent focus:border-primary"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                  <option value="ALL">Difficulty: All</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
                <select
                  className="select select-bordered bg-base-200/50 focus:bg-base-100 border-transparent focus:border-primary"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Status: All</option>
                  <option value="SOLVED">Solved</option>
                  <option value="UNSOLVED">Unsolved</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="text-center py-20 bg-base-100 rounded-3xl border border-dashed border-base-content/20">
              <div className="bg-base-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-base-content/40" />
              </div>
              <h3 className="text-2xl font-bold opacity-80 mb-2">
                No problems found
              </h3>
              <p className="text-base-content/60">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <div
                key={problem.id}
                className="group card bg-base-100 shadow-sm hover:shadow-lg transition-all duration-300 border border-base-content/5 hover:border-primary/20"
              >
                <div className="card-body p-5 sm:p-6 flex-row items-center gap-6">
                  <div
                    className={`w-1.5 self-stretch rounded-full ${
                      problem.difficulty === "EASY"
                        ? "bg-success"
                        : problem.difficulty === "MEDIUM"
                        ? "bg-warning"
                        : "bg-error"
                    }`}
                  ></div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate">
                        {problem.title}
                      </h3>
                      {solvedProblems.has(problem.id) && (
                        <div className="badge badge-success badge-sm gap-1 font-semibold">
                          <CheckCircle className="w-3 h-3" /> Solved
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
                      <div
                        className={`flex items-center gap-1.5 font-semibold ${getDifficultyColor(
                          problem.difficulty
                        )}`}
                      >
                        {getDifficultyIcon(problem.difficulty)}
                        {problem.difficulty}
                      </div>
                      <div className="hidden sm:block w-1 h-1 bg-base-content/20 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        {problem.tags?.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="badge badge-ghost badge-sm border-base-content/10 bg-base-200/50 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {problem.tags?.length > 3 && (
                          <span className="text-xs opacity-60">
                            +{problem.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <Link
                      to={`/problems/${problem.id}`}
                      className="btn btn-primary btn-sm gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 shadow-lg shadow-primary/20"
                    >
                      Solve <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                {/* Mobile Link Overlay */}
                <Link
                  to={`/problems/${problem.id}`}
                  className="absolute inset-0 sm:hidden"
                  aria-label="Solve problem"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemsPage;
