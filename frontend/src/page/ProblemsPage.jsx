import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { IconArrowRight, IconCircleCheck, IconSearch } from '@tabler/icons-react';


// Hooks
import { useProblems, useSolvedProblems } from "../hooks/useProblems";

// Utils
import { getDifficultyColor, getDifficultyIcon, getDifficultyBgColor } from "../utils/difficulty";

// Components
import DifficultyBadge from "../components/ui/DifficultyBadge";
import { SkeletonCard, SkeletonProblemList } from "../components/ui/Skeleton";

// Reusable Problem Card component
const ProblemCard = ({ problem, isSolved }) => (
  <div className="group card bg-base-100 shadow-sm hover:shadow-lg transition-all duration-300 border border-base-content/5 hover:border-primary/20 card-interactive">
    <div className="card-body p-5 sm:p-6 flex-row items-center gap-6">
      <div
        className={`w-1.5 self-stretch rounded-full ${getDifficultyBgColor(problem.difficulty)}`}
      ></div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate">
            {problem.title}
          </h3>
          {isSolved && (
            <div className="badge badge-success badge-sm gap-1 font-semibold">
              <IconCircleCheck className="w-3 h-3" /> Solved
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
          <DifficultyBadge
            difficulty={problem.difficulty}
            showIcon={true}
          />
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
          className="btn btn-primary btn-sm gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 shadow-lg shadow-primary/20 btn-haptic"
        >
          Solve <IconArrowRight className="w-4 h-4" />
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
);

const ProblemsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Data fetching with React Query hooks
  const { data: problems = [], isLoading: loading } = useProblems();
  const { data: solvedProblemsData = [] } = useSolvedProblems();

  // Convert solved problems to Set for efficient lookup
  const solvedProblems = useMemo(
    () => new Set(solvedProblemsData.map((problem) => problem.id)),
    [solvedProblemsData]
  );

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
        <div className="card bg-base-100 shadow-xl border border-base-content/5 mb-8 backdrop-blur-xl overflow-visible relative z-30">
          <div className="card-body p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <IconSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search problems by title or tag..."
                  className="input input-bordered w-full pl-12 bg-base-200/50 focus:bg-base-100 transition-all border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex w-full md:w-auto gap-3 flex-wrap justify-end">
                {/* Difficulty Filter - Custom Styled */}
                <div className="dropdown dropdown-end">
                  <label
                    tabIndex={0}
                    className="btn bg-base-200/70 hover:bg-base-200 border-0 gap-2 min-w-[140px] justify-between font-medium shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      {difficultyFilter === "ALL" ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-success via-warning to-error"></span>
                          All Levels
                        </>
                      ) : difficultyFilter === "EASY" ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-success"></span>
                          <span className="text-success">Easy</span>
                        </>
                      ) : difficultyFilter === "MEDIUM" ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-warning"></span>
                          <span className="text-warning">Medium</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-error"></span>
                          <span className="text-error">Hard</span>
                        </>
                      )}
                    </span>
                    <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[50] menu p-2 shadow-2xl bg-base-100 rounded-2xl w-52 border border-base-content/10 mt-2"
                  >
                    <li>
                      <button
                        className={`flex items-center gap-3 ${difficultyFilter === "ALL" ? "active bg-primary/10 text-primary" : ""}`}
                        onClick={() => {
                          setDifficultyFilter("ALL");
                          document.activeElement?.blur();
                        }}
                      >
                        <span className="w-3 h-3 rounded-full bg-gradient-to-r from-success via-warning to-error"></span>
                        All Levels
                        {difficultyFilter === "ALL" && <IconCircleCheck className="w-4 h-4 ml-auto" />}
                      </button>
                    </li>
                    <li>
                      <button
                        className={`flex items-center gap-3 ${difficultyFilter === "EASY" ? "active bg-success/10 text-success" : ""}`}
                        onClick={() => {
                          setDifficultyFilter("EASY");
                          document.activeElement?.blur();
                        }}
                      >
                        <span className="w-3 h-3 rounded-full bg-success"></span>
                        Easy
                        {difficultyFilter === "EASY" && <IconCircleCheck className="w-4 h-4 ml-auto text-success" />}
                      </button>
                    </li>
                    <li>
                      <button
                        className={`flex items-center gap-3 ${difficultyFilter === "MEDIUM" ? "active bg-warning/10 text-warning" : ""}`}
                        onClick={() => {
                          setDifficultyFilter("MEDIUM");
                          document.activeElement?.blur();
                        }}
                      >
                        <span className="w-3 h-3 rounded-full bg-warning"></span>
                        Medium
                        {difficultyFilter === "MEDIUM" && <IconCircleCheck className="w-4 h-4 ml-auto text-warning" />}
                      </button>
                    </li>
                    <li>
                      <button
                        className={`flex items-center gap-3 ${difficultyFilter === "HARD" ? "active bg-error/10 text-error" : ""}`}
                        onClick={() => {
                          setDifficultyFilter("HARD");
                          document.activeElement?.blur();
                        }}
                      >
                        <span className="w-3 h-3 rounded-full bg-error"></span>
                        Hard
                        {difficultyFilter === "HARD" && <IconCircleCheck className="w-4 h-4 ml-auto text-error" />}
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Status Filter - Custom Styled */}
                <div className="dropdown dropdown-end">
                  <label
                    tabIndex={0}
                    className="btn bg-base-200/70 hover:bg-base-200 border-0 gap-2 min-w-[130px] justify-between font-medium shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      {statusFilter === "ALL" ? (
                        <>
                          <IconCircleCheck className="w-4 h-4 opacity-60" />
                          All Status
                        </>
                      ) : statusFilter === "SOLVED" ? (
                        <>
                          <IconCircleCheck className="w-4 h-4 text-success" />
                          <span className="text-success">Solved</span>
                        </>
                      ) : (
                        <>
                          <IconCircleCheck className="w-4 h-4 text-info" />
                          <span className="text-info">Unsolved</span>
                        </>
                      )}
                    </span>
                    <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[50] menu p-2 shadow-2xl bg-base-100 rounded-2xl w-48 border border-base-content/10 mt-2"
                  >
                    <li>
                      <button
                        className={`flex items-center gap-3 ${statusFilter === "ALL" ? "active bg-primary/10 text-primary" : ""}`}
                        onClick={() => {
                          setStatusFilter("ALL");
                          document.activeElement?.blur();
                        }}
                      >
                        <IconCircleCheck className="w-4 h-4 opacity-60" />
                        All Status
                        {statusFilter === "ALL" && <IconCircleCheck className="w-4 h-4 ml-auto" />}
                      </button>
                    </li>
                    <li>
                      <button
                        className={`flex items-center gap-3 ${statusFilter === "SOLVED" ? "active bg-success/10 text-success" : ""}`}
                        onClick={() => {
                          setStatusFilter("SOLVED");
                          document.activeElement?.blur();
                        }}
                      >
                        <IconCircleCheck className="w-4 h-4 text-success" />
                        Solved
                        {statusFilter === "SOLVED" && <IconCircleCheck className="w-4 h-4 ml-auto text-success" />}
                      </button>
                    </li>
                    <li>
                      <button
                        className={`flex items-center gap-3 ${statusFilter === "UNSOLVED" ? "active bg-info/10 text-info" : ""}`}
                        onClick={() => {
                          setStatusFilter("UNSOLVED");
                          document.activeElement?.blur();
                        }}
                      >
                        <IconCircleCheck className="w-4 h-4 text-info" />
                        Unsolved
                        {statusFilter === "UNSOLVED" && <IconCircleCheck className="w-4 h-4 ml-auto text-info" />}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-4">
          {loading ? (
            <SkeletonProblemList count={6} />
          ) : filteredProblems.length === 0 ? (
            <div className="text-center py-20 bg-base-100 rounded-3xl border border-dashed border-base-content/20">
              <div className="bg-base-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <IconSearch className="w-10 h-10 text-base-content/40" />
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
            /* Problem list with animations */
            <div className="space-y-4 animate-fade-in">
              {filteredProblems.map((problem, index) => (
                <div 
                  key={problem.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                >
                  <ProblemCard 
                    problem={problem} 
                    isSolved={solvedProblems.has(problem.id)} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemsPage;
