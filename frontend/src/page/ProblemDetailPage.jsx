import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Lightbulb,
  Eye,
  EyeOff,
  Code2,
  FileText,
  Terminal,
  ChevronRight,
  Maximize2,
  Minimize2,
  GripVertical,
  Keyboard,
  FlaskConical
} from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useHotkeys } from "react-hotkeys-hook";
import { axiosInstance } from "../util/axios";
import { useCodePersistence } from "../util/useCodePersistence";
import { useConfetti } from "../util/useConfetti";
import KeyboardShortcutsModal from "../components/KeyboardShortcutsModal";
import CustomTestCasePanel from "../components/CustomTestCasePanel";
import toast from "react-hot-toast";

// ✅ Lazy load Monaco Editor - Only loads when needed
const Editor = lazy(() => import("@monaco-editor/react"));

const EditorLoader = () => (
  <div className="flex items-center justify-center h-full bg-base-300/50 backdrop-blur-sm">
    <div className="text-center">
      <div className="loading loading-spinner loading-lg text-primary mb-2"></div>
      <p className="text-base-content/60 font-medium">Loading editor...</p>
    </div>
  </div>
);

const ProblemDetailPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("JAVASCRIPT");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [hints, setHints] = useState([]);
  const [revealedHints, setRevealedHints] = useState(new Set());
  const [showResetModal, setShowResetModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  
  // Cooldown states
  const [runCooldown, setRunCooldown] = useState(0);
  const [submitCooldown, setSubmitCooldown] = useState(0);

  // ✅ Memoize language configuration
  const languageMap = useMemo(() => ({
    JAVASCRIPT: { id: 63, name: "JavaScript", extension: "js" },
    PYTHON: { id: 71, name: "Python", extension: "py" },
    JAVA: { id: 62, name: "Java", extension: "java" },
  }), []);

  // Get default code snippet for current language
  const defaultCodeSnippet = useMemo(() => {
    return problem?.codeSnippet?.[selectedLanguage] || "";
  }, [problem, selectedLanguage]);

  // ✅ Use code persistence hook - auto-saves to localStorage
  const { code, setCode, resetCode: resetPersistedCode, hasPersistedCode } = useCodePersistence(
    id,
    selectedLanguage,
    defaultCodeSnippet
  );

  // ✅ Confetti for celebrations
  const { fireCanons } = useConfetti();

  // Show toast when code is restored from localStorage
  useEffect(() => {
    if (hasPersistedCode && problem) {
      toast.success("Your previous code has been restored", {
        icon: "💾",
        duration: 3000,
      });
    }
  }, [hasPersistedCode, problem, selectedLanguage]);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  // ✅ Memoize processed hints
  const processedHints = useMemo(() => {
    if (!problem?.hints) return [];
    
    try {
      if (typeof problem.hints === 'string') {
        try {
          return JSON.parse(problem.hints);
        } catch {
          return problem.hints
            .split('\n')
            .map(hint => hint.trim())
            .filter(hint => hint.length > 0);
        }
      } else if (Array.isArray(problem.hints)) {
        return problem.hints;
      }
    } catch (error) {
      console.error("Error processing hints:", error);
    }
    return [];
  }, [problem?.hints]);

  useEffect(() => {
    setHints(processedHints);
  }, [processedHints]);

  // ✅ Cooldown timer optimization - Single effect
  useEffect(() => {
    const timers = [];
    
    if (runCooldown > 0) {
      timers.push(setTimeout(() => setRunCooldown(runCooldown - 1), 1000));
    }
    
    if (submitCooldown > 0) {
      timers.push(setTimeout(() => setSubmitCooldown(submitCooldown - 1), 1000));
    }
    
    return () => timers.forEach(clearTimeout);
  }, [runCooldown, submitCooldown]);

  const fetchProblem = async () => {
    try {
      const response = await axiosInstance.get(`/problems/get-problem/${id}`);
      setProblem(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch problem");
      console.error("Error fetching problem:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ useCallback for event handlers
  const revealHint = useCallback((index) => {
    setRevealedHints(prev => new Set([...prev, index]));
  }, []);

  const hideHint = useCallback((index) => {
    setRevealedHints(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  const runCode = useCallback(async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    if (runCooldown > 0) {
      toast.error(`Please wait ${runCooldown} seconds before running again`);
      return;
    }

    setIsRunning(true);
    try {
      const testCases = problem.testCases || [];
      const inputs = testCases.map((tc) => tc.input);
      const outputs = testCases.map((tc) => tc.output);

      const payload = {
        source_code: code,
        language_id: languageMap[selectedLanguage].id,
        stdin: inputs,
        expected_outputs: outputs,
        problem_id: id,
      };

      const response = await axiosInstance.post("/execute-code/run", payload);
      const responseData = response.data.results;
      
      const formattedResults = {
        status: responseData.status,
        testCases: responseData.testCases || [],
        error: null,
      };

      setTestResults(formattedResults);
      setActiveTab("output");

      const passedCount = formattedResults.testCases.filter(tc => tc.passed).length;
      const totalCount = formattedResults.testCases.length;

      if (formattedResults.status === "Accepted") {
        toast.success(`All ${totalCount} test cases passed!`);
      } else {
        toast.error(`${passedCount}/${totalCount} test cases passed`);
      }

      setRunCooldown(15);
    } catch (error) {
      console.error("Error running code:", error);
      const errorResults = {
        status: "Error",
        testCases: [],
        error: {
          message: error.response?.data?.error || error.message || "Unknown error occurred",
          details: error.response?.data?.message || "Failed to execute code",
        },
      };
      setTestResults(errorResults);
      setActiveTab("output");
      toast.error("Error running code");
      setRunCooldown(15);
    } finally {
      setIsRunning(false);
    }
  }, [code, runCooldown, problem, languageMap, selectedLanguage, id]);

  const submitCode = useCallback(async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    if (submitCooldown > 0) {
      toast.error(`Please wait ${submitCooldown} seconds before submitting again`);
      return;
    }

    setIsSubmitting(true);
    try {
      const testCases = problem.testCases || [];
      const inputs = testCases.map((tc) => tc.input);
      const outputs = testCases.map((tc) => tc.output);

      const payload = {
        source_code: code,
        language_id: languageMap[selectedLanguage].id,
        stdin: inputs,
        expected_outputs: outputs,
        problem_id: id,
      };

      const response = await axiosInstance.post("/execute-code/submit", payload);
      const submissionData = response.data.submission;
      
      const formattedResults = {
        status: submissionData.status,
        testCases: submissionData.testCases || [],
        error: null,
      };

      setTestResults(formattedResults);
      setActiveTab("output");

      if (formattedResults.status === "Accepted") {
        toast.success("🎉 All test cases passed! Problem solved!");
        // Trigger confetti celebration!
        fireCanons();
      } else {
        const passedCount = formattedResults.testCases.filter(tc => tc.passed).length;
        const totalCount = formattedResults.testCases.length;
        toast.error(`${passedCount}/${totalCount} test cases passed`);
      }

      setSubmitCooldown(15);
    } catch (error) {
      console.error("Error submitting code:", error);
      const errorResults = {
        status: "Error",
        testCases: [],
        error: {
          message: error.response?.data?.error || error.message || "Unknown error occurred",
          details: error.response?.data?.message || "Failed to submit code",
        },
      };
      setTestResults(errorResults);
      setActiveTab("output");
      toast.error("Error submitting code");
      setSubmitCooldown(15);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, submitCooldown, problem, languageMap, selectedLanguage, id]);

  // Run custom test cases
  const runCustomTest = useCallback(async (customTests) => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setIsRunning(true);
    try {
      const inputs = customTests.map((t) => t.input);
      const outputs = customTests.map((t) => t.expectedOutput || "");

      const payload = {
        source_code: code,
        language_id: languageMap[selectedLanguage].id,
        stdin: inputs,
        expected_outputs: outputs,
        problem_id: id,
      };

      const response = await axiosInstance.post("/execute-code/run", payload);
      const responseData = response.data.results;
      
      const formattedResults = {
        status: responseData.status,
        testCases: responseData.testCases || [],
        error: null,
        isCustom: true, // Mark as custom test
      };

      setTestResults(formattedResults);
      setActiveTab("output");

      const passedCount = formattedResults.testCases.filter(tc => tc.passed).length;
      const totalCount = formattedResults.testCases.length;

      toast.success(`Custom tests complete: ${passedCount}/${totalCount} passed`, {
        icon: "🧪",
      });

    } catch (error) {
      console.error("Error running custom tests:", error);
      const errorResults = {
        status: "Error",
        testCases: [],
        error: {
          message: error.response?.data?.error || error.message || "Unknown error occurred",
          details: error.response?.data?.message || "Failed to execute code",
        },
        isCustom: true,
      };
      setTestResults(errorResults);
      setActiveTab("output");
      toast.error("Error running custom tests");
    } finally {
      setIsRunning(false);
    }
  }, [code, languageMap, selectedLanguage, id]);

  // Reset code with confirmation
  const handleResetCode = useCallback(() => {
    setShowResetModal(true);
  }, []);

  const confirmResetCode = useCallback(() => {
    resetPersistedCode();
    setShowResetModal(false);
    toast.success("Code reset to default");
  }, [resetPersistedCode]);

  // ✅ Keyboard Shortcuts
  // Run code: Ctrl/Cmd + Enter
  useHotkeys("ctrl+enter, meta+enter", (e) => {
    e.preventDefault();
    if (!isRunning && runCooldown === 0) {
      runCode();
    }
  }, { enableOnFormTags: true }, [runCode, isRunning, runCooldown]);

  // Submit code: Ctrl/Cmd + Shift + Enter
  useHotkeys("ctrl+shift+enter, meta+shift+enter", (e) => {
    e.preventDefault();
    if (!isSubmitting && submitCooldown === 0) {
      submitCode();
    }
  }, { enableOnFormTags: true }, [submitCode, isSubmitting, submitCooldown]);

  // Reset code: Ctrl/Cmd + Shift + R
  useHotkeys("ctrl+shift+r, meta+shift+r", (e) => {
    e.preventDefault();
    handleResetCode();
  }, { enableOnFormTags: true }, [handleResetCode]);

  // Show shortcuts modal: ?
  useHotkeys("shift+/", (e) => {
    e.preventDefault();
    setShowShortcutsModal(true);
  }, []);

  // Close modals: Escape
  useHotkeys("escape", () => {
    setShowResetModal(false);
    setShowShortcutsModal(false);
  }, []);

  const getDifficultyColor = useCallback((difficulty) => {
    switch (difficulty) {
      case "EASY": return "bg-success/10 text-success border-success/20";
      case "MEDIUM": return "bg-warning/10 text-warning border-warning/20";
      case "HARD": return "bg-error/10 text-error border-error/20";
      default: return "bg-base-200 text-base-content/60";
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-base-content/40" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Problem not found</h2>
          <p className="text-base-content/60 mb-6">The problem you're looking for doesn't exist or has been removed.</p>
          <a href="/problems" className="btn btn-primary">Back to Problems</a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-base-100">
      {/* Header - Compact */}
      <div className="bg-base-100 border-b border-base-content/5 px-4 py-2 flex items-center justify-between shrink-0 h-14">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-2">
            <div className={`badge badge-sm font-bold h-6 ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </div>
            <h1 className="text-lg font-bold truncate max-w-[300px] sm:max-w-md" title={problem.title}>
              {problem.title}
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            {problem.tags?.map((tag, index) => (
              <span key={index} className="badge badge-ghost badge-xs opacity-60">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
            {/* Language Selector Dropdown */}
            <div className="dropdown dropdown-end">
              <div 
                tabIndex={0} 
                role="button" 
                className="btn btn-sm bg-base-200/50 hover:bg-base-200 border-0 font-mono gap-2 min-w-[130px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" />
                  {languageMap[selectedLanguage]?.name || selectedLanguage}
                </div>
                <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow-xl bg-base-100 rounded-box w-52 border border-base-content/10 mt-1">
                {Object.entries(languageMap).map(([key, lang]) => (
                  <li key={key}>
                    <button
                      className={`flex justify-between ${selectedLanguage === key ? "active font-bold" : ""}`}
                      onClick={() => {
                        setSelectedLanguage(key);
                        const elem = document.activeElement;
                        if (elem) elem.blur(); // Close dropdown after selection
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {key === 'JAVASCRIPT' && <span className="text-warning">JS</span>}
                        {key === 'PYTHON' && <span className="text-info">Py</span>}
                        {key === 'JAVA' && <span className="text-error">Java</span>}
                        {lang.name}
                      </span>
                      {selectedLanguage === key && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="join">
               <button
                className="btn btn-ghost btn-xs join-item"
                onClick={handleResetCode}
                title="Reset Code to Default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-2 ml-2">
              <button
                className="btn btn-ghost btn-xs bg-base-200/50 hover:bg-base-200 gap-1.5 h-8 min-h-0 px-3"
                onClick={runCode}
                disabled={isRunning || runCooldown > 0}
                title="Run Code (Ctrl+Enter)"
              >
                {isRunning ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                {runCooldown > 0 ? `${runCooldown}s` : "Run"}
              </button>
              <button
                className="btn btn-primary btn-xs gap-1.5 h-8 min-h-0 px-3 shadow-sm shadow-primary/20"
                onClick={submitCode}
                disabled={isSubmitting || submitCooldown > 0}
                title="Submit Code (Ctrl+Shift+Enter)"
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {submitCooldown > 0 ? `${submitCooldown}s` : "Submit"}
              </button>
              <button
                className="btn btn-ghost btn-xs h-8 min-h-0 px-2"
                onClick={() => setShowShortcutsModal(true)}
                title="Keyboard Shortcuts (?)"
              >
                <Keyboard className="w-4 h-4" />
              </button>
            </div>
        </div>
      </div>

      {/* Main Split Layout - Resizable Panels */}
      <PanelGroup direction="horizontal" autoSaveId="problem-page-layout">
        {/* Left Panel - Description & Hints */}
        <Panel defaultSize={50} minSize={25} className="flex flex-col bg-base-100">
          {/* Tabs */}
          <div className="flex border-b border-base-content/5 bg-base-100 shrink-0">
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "description" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/30"
              }`}
              onClick={() => setActiveTab("description")}
            >
              <FileText className="w-4 h-4" />
              Description
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "hints" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/30"
              }`}
              onClick={() => setActiveTab("hints")}
            >
              <Lightbulb className={`w-4 h-4 ${hints.length > 0 ? "text-warning" : ""}`} />
              Hints 
              {hints.length > 0 && (
                <span className="badge badge-xs badge-ghost">{hints.length}</span>
              )}
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "output" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/30"
              }`}
              onClick={() => setActiveTab("output")}
            >
              <Terminal className="w-4 h-4" />
              Output
              {testResults && (
                <span className={`w-2 h-2 rounded-full ${
                    testResults.status === "Accepted" ? "bg-success" : "bg-error"
                }`}></span>
              )}
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "custom" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-base-content/60 hover:text-base-content hover:bg-base-200/30"
              }`}
              onClick={() => setActiveTab("custom")}
            >
              <FlaskConical className="w-4 h-4 text-accent" />
              Custom
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === "description" && (
              <div className="space-y-8 max-w-none prose prose-sm prose-slate dark:prose-invert">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-base-content">Problem Statement</h3>
                  <div className="text-base leading-7 text-base-content/80 whitespace-pre-wrap">
                    {problem.description}
                  </div>
                </div>

                {problem.examples && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-base-content">Examples</h3>
                    {Object.entries(problem.examples).map(([lang, example]) => (
                      <div key={lang} className="bg-base-200/50 rounded-xl p-4 border border-base-content/5">
                        <div className="space-y-3">
                          <div className="font-mono text-sm">
                            <span className="font-bold select-none text-base-content/50 uppercase text-xs tracking-wide block mb-1">Input</span>
                            <div className="bg-base-300/50 p-2 rounded-lg">{example.input}</div>
                          </div>
                          <div className="font-mono text-sm">
                            <span className="font-bold select-none text-base-content/50 uppercase text-xs tracking-wide block mb-1">Output</span>
                            <div className="bg-base-300/50 p-2 rounded-lg">{example.output}</div>
                          </div>
                          {example.explanation && (
                            <div className="text-sm">
                               <span className="font-bold select-none text-base-content/50 uppercase text-xs tracking-wide block mb-1">Explanation</span>
                              <div className="text-base-content/80 pl-1">{example.explanation}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {problem.constraints && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-base-content">Constraints</h3>
                    <ul className="bg-base-200/50 rounded-xl p-4 border border-base-content/5 space-y-2 font-mono text-sm">
                      {problem.constraints.split('\n').map((constraint, idx) => (
                          <li key={idx} className="flex gap-2">
                              <span className="text-base-content/40 select-none">•</span>
                              {constraint}
                          </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "hints" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-warning/10 rounded-xl text-warning">
                      <Lightbulb className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Need a nudge?</h3>
                    <p className="text-base-content/60 text-sm">Reveal hints one by one without spoiling the solution.</p>
                  </div>
                </div>
                
                {hints.length > 0 ? (
                  <div className="space-y-4">
                    {hints.map((hint, index) => (
                      <div key={index} className={`card border transition-all duration-300 ${
                          revealedHints.has(index) 
                            ? "bg-base-100 border-warning/30 shadow-sm" 
                            : "bg-base-200/30 border-base-content/5 border-dashed"
                      }`}>
                        <div className="card-body p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-base-content/70">Hint {index + 1}</h4>
                            <button
                                className={`btn btn-xs gap-1.5 ${
                                    revealedHints.has(index) 
                                        ? "btn-ghost text-base-content/60" 
                                        : "btn-outline btn-warning"
                                }`}
                                onClick={() => revealedHints.has(index) ? hideHint(index) : revealHint(index)}
                            >
                                {revealedHints.has(index) ? (
                                    <>
                                        <EyeOff className="w-3 h-3" /> Hide
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-3 h-3" /> Reveal
                                    </>
                                )}
                            </button>
                          </div>
                          
                          {revealedHints.has(index) ? (
                            <div className="mt-3 text-base leading-relaxed animate-fade-in text-base-content/80">
                              {hint}
                            </div>
                          ) : (
                            <div className="mt-2 h-6 bg-base-content/5 rounded animate-pulse w-3/4"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-base-200/30 rounded-2xl border border-dashed border-base-content/10">
                    <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium opacity-60">No hints available for this problem</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "output" && (
              <div className="space-y-4 h-full">
                {testResults ? (
                  <div className="space-y-6">
                    {testResults.error && (
                      <div className="alert alert-error shadow-sm">
                        <XCircle className="w-5 h-5" />
                        <div>
                          <h3 className="font-bold">Execution Error</h3>
                          <div className="text-xs mt-1 opacity-90 font-mono bg-black/10 p-2 rounded">
                            {testResults.error.message}
                          </div>
                          {testResults.error.details && (
                              <p className="text-xs mt-2 opacity-80">{testResults.error.details}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {testResults.testCases?.length > 0 && (
                      <div className="grid grid-cols-1 gap-4">
                         {/* Status Summary */}
                         <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                             testResults.status === "Accepted" 
                                ? "bg-success/10 border-success/20 text-success" 
                                : "bg-error/10 border-error/20 text-error"
                         }`}>
                             {testResults.status === "Accepted" ? (
                                 <CheckCircle className="w-6 h-6" />
                             ) : (
                                 <XCircle className="w-6 h-6" />
                             )}
                             <div>
                                 <div className="font-bold text-lg">{testResults.status}</div>
                                 <div className="text-xs opacity-80 font-medium">
                                     {testResults.testCases.filter(tc => tc.passed).length}/{testResults.testCases.length} Test Cases Passed
                                 </div>
                             </div>
                         </div>

                        {testResults.testCases.map((testCase, index) => (
                          <div key={index} className={`collapse collapse-arrow border border-base-content/5 bg-base-100 overflow-hidden ${
                              testCase.passed ? "hover:border-success/30" : "hover:border-error/30"
                          }`}>
                            <input type="checkbox" /> 
                            <div className="collapse-title flex items-center gap-3 py-3 pr-12 min-h-0">
                                {testCase.passed ? (
                                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-error shrink-0" />
                                )}
                                <span className="font-medium text-sm">Test Case {index + 1}</span>
                                {testCase.time && <span className="ml-auto text-xs font-mono opacity-50">{testCase.time}</span>}
                            </div>
                            <div className="collapse-content text-sm">
                                <div className="space-y-3 pt-2 pb-2">
                                    {testCase.compileOutput && (
                                        <div className="bg-error/5 p-3 rounded-lg border border-error/10">
                                            <div className="text-xs font-bold text-error uppercase mb-1">Compilation Error</div>
                                            <pre className="text-xs font-mono overflow-x-auto">{testCase.compileOutput}</pre>
                                        </div>
                                    )}
                                    
                                    {testCase.stderr && (
                                        <div className="bg-error/5 p-3 rounded-lg border border-error/10">
                                            <div className="text-xs font-bold text-error uppercase mb-1">Standard Error</div>
                                            <pre className="text-xs font-mono overflow-x-auto">{testCase.stderr}</pre>
                                        </div>
                                    )}

                                    {!testCase.compileOutput && (
                                        <>
                                            <div>
                                                <div className="text-xs font-bold opacity-50 uppercase mb-1">Input</div>
                                                <pre className="bg-base-200/50 p-2 rounded-lg font-mono text-xs overflow-x-auto">{testCase.input || "(empty)"}</pre>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-xs font-bold opacity-50 uppercase mb-1">Your Output</div>
                                                    <pre className={`p-2 rounded-lg font-mono text-xs overflow-x-auto ${
                                                        testCase.passed ? "bg-success/5 text-success" : "bg-error/5 text-error"
                                                    }`}>{testCase.stdout || "(empty)"}</pre>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold opacity-50 uppercase mb-1">Expected</div>
                                                    <pre className="bg-base-200/50 p-2 rounded-lg font-mono text-xs overflow-x-auto">{testCase.expected || "(empty)"}</pre>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-base-content/40 p-8 text-center">
                    <Terminal className="w-16 h-16 mb-4 opacity-20" />
                    <h3 className="font-bold text-lg mb-2">No output yet</h3>
                    <p className="text-sm max-w-xs">Run or submit your code to see test results and console output here.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "custom" && (
              <CustomTestCasePanel 
                onRunCustomTest={runCustomTest}
                isRunning={isRunning}
              />
            )}
          </div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="w-2 bg-base-200 hover:bg-primary/30 transition-colors duration-200 flex items-center justify-center group cursor-col-resize">
          <GripVertical className="w-4 h-4 text-base-content/30 group-hover:text-primary transition-colors" />
        </PanelResizeHandle>

        {/* Right Panel - Code Editor */}
        <Panel defaultSize={50} minSize={25} className="flex flex-col bg-[#1e1e1e]">
          <div className="flex-1">
            <Suspense fallback={<EditorLoader />}>
              <Editor
                height="100%"
                language={selectedLanguage.toLowerCase() === "javascript" ? "javascript" : selectedLanguage.toLowerCase()}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  tabSize: 2,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  fontLigatures: true,
                  padding: { top: 16 },
                }}
              />
            </Suspense>
          </div>
        </Panel>
      </PanelGroup>

      {/* Reset Code Confirmation Modal */}
      {showResetModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Reset Code?</h3>
            <p className="py-4 text-base-content/70">
              This will discard your current code and restore the default template. 
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-error" 
                onClick={confirmResetCode}
              >
                Reset Code
              </button>
            </div>
          </div>
          <div 
            className="modal-backdrop bg-black/50" 
            onClick={() => setShowResetModal(false)}
          />
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        isOpen={showShortcutsModal} 
        onClose={() => setShowShortcutsModal(false)} 
      />
    </div>
  );
};

export default ProblemDetailPage;
