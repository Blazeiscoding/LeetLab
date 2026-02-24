import { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { useHotkeys } from "react-hotkeys-hook";
import { IconChevronRight, IconFileCode, IconHash, IconHome, IconLogout, IconSearch, IconTrophy, IconUser, IconX } from '@tabler/icons-react';
import { useAuthStore } from "../store/useAuthStore";
import { useProblems } from "../hooks/useProblems";

const PAGES = [
  { name: "Home", icon: IconHome, path: "/", shortcut: "G H" },
  { name: "Problems", icon: IconFileCode, path: "/problems", shortcut: "G P" },
  { name: "Leaderboard", icon: IconTrophy, path: "/leaderboard", shortcut: "G L" },
  { name: "Profile", icon: IconUser, path: "/profile", shortcut: "G U" },
] as const;

/**
 * Command palette for quick navigation and search (Cmd+K)
 */
const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const navigate = useNavigate();
  const { authUser, logout } = useAuthStore();
  const { data: problems = [] } = useProblems({ enabled: open && !!authUser });

  // Open with Cmd+K or Ctrl+K
  useHotkeys("meta+k, ctrl+k", (e: KeyboardEvent) => {
    e.preventDefault();
    setOpen(true);
  });

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset search when closed
  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  // Filter and sort problems by search
  const filteredProblems = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    if (!normalizedSearch) return problems.slice(0, 5);

    return problems
      .filter((p) =>
        p.title.toLowerCase().includes(normalizedSearch) ||
        p.tags?.some((t) => t.toLowerCase().includes(normalizedSearch))
      )
      .slice(0, 8);
  }, [deferredSearch, problems]);

  const handleSelect = useCallback((path: string) => {
    navigate(path);
    setOpen(false);
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    await logout();
    setOpen(false);
  }, [logout]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Command Dialog */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg">
        <Command className="bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 overflow-hidden">
          {/* IconSearch Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-base-content/10">
            <IconSearch className="w-5 h-5 text-base-content/40" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search problems, navigate pages..."
              className="flex-1 bg-transparent outline-none text-base placeholder:text-base-content/40"
              autoFocus
            />
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-base-200 rounded-lg transition-colors"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-base-content/50">
              No results found.
            </Command.Empty>

            {/* Pages */}
            <Command.Group heading="Pages" className="px-2 py-1 text-xs font-bold text-base-content/40 uppercase tracking-wider">
              {PAGES.map((page) => (
                <Command.Item
                  key={page.path}
                  value={page.name}
                  onSelect={() => handleSelect(page.path)}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-base-content/80 hover:bg-base-200/50 hover:text-base-content transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                >
                  <div className="flex items-center gap-3">
                    <page.icon className="w-4 h-4" />
                    <span className="font-medium">{page.name}</span>
                  </div>
                  <kbd className="hidden sm:block text-xs bg-base-200 px-2 py-0.5 rounded font-mono">
                    {page.shortcut}
                  </kbd>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Problems */}
            {filteredProblems.length > 0 && (
              <Command.Group heading="Problems" className="px-2 py-1 mt-2 text-xs font-bold text-base-content/40 uppercase tracking-wider">
                {filteredProblems.map((problem) => (
                  <Command.Item
                    key={problem.id}
                    value={`${problem.title} ${problem.tags?.join(" ")}`}
                    onSelect={() => handleSelect(`/problems/${problem.id}`)}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-base-content/80 hover:bg-base-200/50 hover:text-base-content transition-colors data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <IconHash className="w-4 h-4 shrink-0" />
                      <span className="font-medium truncate">{problem.title}</span>
                      <span
                        className={`badge badge-sm shrink-0 ${
                          problem.difficulty === "EASY"
                            ? "badge-success"
                            : problem.difficulty === "MEDIUM"
                            ? "badge-warning"
                            : "badge-error"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>
                    <IconChevronRight className="w-4 h-4 shrink-0 opacity-40" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Actions */}
            {authUser && (
              <Command.Group heading="Actions" className="px-2 py-1 mt-2 text-xs font-bold text-base-content/40 uppercase tracking-wider">
                <Command.Item
                  value="logout"
                  onSelect={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-error/70 hover:bg-error/10 hover:text-error transition-colors data-[selected=true]:bg-error/10 data-[selected=true]:text-error"
                >
                  <IconLogout className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </Command.Item>
              </Command.Group>
            )}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-base-content/10 text-xs text-base-content/40">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="kbd kbd-xs">↑</kbd>
                <kbd className="kbd kbd-xs">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="kbd kbd-xs">↵</kbd>
                select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="kbd kbd-xs">esc</kbd>
              close
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
};

export default CommandPalette;
