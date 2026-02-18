import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconAlertCircle, IconBook, IconBulb, IconCircleCheck, IconCode, IconDeviceFloppy, IconDownload, IconFileText, IconPlus, IconRotate, IconTrash } from '@tabler/icons-react';
import Editor from "@monaco-editor/react";
import { axiosInstance } from "../utils/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { problemSchema } from "../utils/zodSchema";
import { motion, AnimatePresence } from "framer-motion";
import { isAxiosError } from "axios";
import { z } from "zod";

// Components
import FormWizard from "./form/FormWizard";
import WizardStep, { CollapsibleSection } from "./form/WizardStep";
import { useFormDraft } from "../hooks/useFormDraft";
import { SkeletonCodeEditor } from "./ui/Skeleton";

type ProblemFormData = z.infer<typeof problemSchema>;
type Language = keyof ProblemFormData["codeSnippets"];
type StepErrorMap = Record<number, Array<keyof ProblemFormData>>;
type ApiErrorResponse = {
  error?: string;
};

const LANGUAGES: Language[] = ["JAVASCRIPT", "PYTHON", "JAVA"];

// Form step definitions
const FORM_STEPS = [
  { id: 'basic', title: 'Basic Info', icon: IconFileText },
  { id: 'metadata', title: 'Tags & Constraints', icon: IconBook },
  { id: 'testcases', title: 'Test Cases', icon: IconCircleCheck },
  { id: 'code', title: 'Code Templates', icon: IconCode },
  { id: 'solutions', title: 'Solutions', icon: IconBulb },
];

// Sample data for quick loading
const sampledData = {
  title: "Climbing Stairs",
  description:
    "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
  difficulty: "EASY",
  tags: ["Dynamic Programming", "Math", "Memoization"],
  constraints: "1 <= n <= 45",
  hints:
    "To reach the nth step, you can either come from the (n-1)th step or the (n-2)th step.",
  editorial:
    "This is a classic dynamic programming problem. The number of ways to reach the nth step is the sum of the number of ways to reach the (n-1)th step and the (n-2)th step, forming a Fibonacci-like sequence.",
  testCases: [
    { input: "2", output: "2" },
    { input: "3", output: "3" },
    { input: "4", output: "5" },
  ],
  examples: {
    JAVASCRIPT: {
      input: "n = 2",
      output: "2",
      explanation: "There are two ways to climb to the top:\n1. 1 step + 1 step\n2. 2 steps",
    },
    PYTHON: {
      input: "n = 3",
      output: "3",
      explanation: "There are three ways to climb to the top:\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step",
    },
    JAVA: {
      input: "n = 4",
      output: "5",
      explanation: "There are five ways to climb to the top.",
    },
  },
  codeSnippets: {
    JAVASCRIPT: `function climbStairs(n) {\n  // Write your code here\n}`,
    PYTHON: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        # Write your code here\n        pass`,
    JAVA: `public class Solution {\n    public int climbStairs(int n) {\n        // Write your code here\n        return 0;\n    }\n}`,
  },
  referenceSolutions: {
    JAVASCRIPT: `function climbStairs(n) {\n  if (n <= 2) return n;\n  let dp = new Array(n + 1);\n  dp[1] = 1;\n  dp[2] = 2;\n  for (let i = 3; i <= n; i++) {\n    dp[i] = dp[i - 1] + dp[i - 2];\n  }\n  return dp[n];\n}`,
    PYTHON: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2:\n            return n\n        dp = [0] * (n + 1)\n        dp[1] = 1\n        dp[2] = 2\n        for i in range(3, n + 1):\n            dp[i] = dp[i - 1] + dp[i - 2]\n        return dp[n]`,
    JAVA: `public int climbStairs(int n) {\n    if (n <= 2) return n;\n    int[] dp = new int[n + 1];\n    dp[1] = 1;\n    dp[2] = 2;\n    for (int i = 3; i <= n; i++) {\n        dp[i] = dp[i - 1] + dp[i - 2];\n    }\n    return dp[n];\n}`,
  },
} satisfies ProblemFormData;

const sampleStringProblem = {
  title: "Valid Palindrome",
  description:
    "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
  difficulty: "EASY",
  tags: ["String", "Two Pointers"],
  constraints: "1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
  hints: "Consider using two pointers, one from the start and one from the end.",
  editorial: "We can use two pointers approach to check if the string is a palindrome.",
  testCases: [
    { input: "A man, a plan, a canal: Panama", output: "true" },
    { input: "race a car", output: "false" },
  ],
  examples: {
    JAVASCRIPT: { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
    PYTHON: { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
    JAVA: { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
  },
  codeSnippets: {
    JAVASCRIPT: `function isPalindrome(s) {\n  // Write your code here\n}`,
    PYTHON: `class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        # Write your code here\n        pass`,
    JAVA: `public class Main {\n    public static boolean isPalindrome(String s) {\n        // Write your code here\n        return false;\n    }\n}`,
  },
  referenceSolutions: {
    JAVASCRIPT: `function isPalindrome(s) {\n  s = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  let left = 0, right = s.length - 1;\n  while (left < right) {\n    if (s[left] !== s[right]) return false;\n    left++; right--;\n  }\n  return true;\n}`,
    PYTHON: `class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        filtered = [c.lower() for c in s if c.isalnum()]\n        return filtered == filtered[::-1]`,
    JAVA: `public static boolean isPalindrome(String s) {\n    s = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();\n    int left = 0, right = s.length() - 1;\n    while (left < right) {\n        if (s.charAt(left) != s.charAt(right)) return false;\n        left++; right--;\n    }\n    return true;\n}`,
  },
} satisfies ProblemFormData;

const defaultFormValues: ProblemFormData = {
  title: "",
  description: "",
  difficulty: "EASY",
  testCases: [{ input: "", output: "" }],
  tags: [""],
  constraints: "",
  hints: "",
  editorial: "",
  examples: {
    JAVASCRIPT: { input: "", output: "", explanation: "" },
    PYTHON: { input: "", output: "", explanation: "" },
    JAVA: { input: "", output: "", explanation: "" },
  },
  codeSnippets: {
    JAVASCRIPT: "function solution() {\n  // Write your code here\n}",
    PYTHON: "def solution():\n    # Write your code here\n    pass",
    JAVA: "public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
  },
  referenceSolutions: {
    JAVASCRIPT: "// Add your reference solution here",
    PYTHON: "# Add your reference solution here",
    JAVA: "// Add your reference solution here",
  },
};

const CreateProblemForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [sampleType, setSampleType] = useState<"DP" | "string">("DP");
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigate();

  // Form draft management
  const { hasDraft, debouncedSave, loadDraft, clearDraft, getLastSavedText } = useFormDraft<ProblemFormData>('create-problem', {
    debounceMs: 3000,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<ProblemFormData>({
    resolver: zodResolver(problemSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange',
  });

  const {
    fields: testCaseFields,
    append: appendTestCase,
    remove: removeTestCase,
    replace: replaceTestCase,
  } = useFieldArray({ control, name: "testCases" });
  const tags = watch("tags");

  // Watch form values for auto-save
  const formValues = watch();

  // Check for existing draft on mount
  useEffect(() => {
    if (hasDraft) {
      setShowDraftPrompt(true);
    }
  }, [hasDraft]);

  // Auto-save when form changes
  useEffect(() => {
    if (isDirty) {
      debouncedSave(formValues);
    }
  }, [formValues, isDirty, debouncedSave]);

  // Load draft
  const handleLoadDraft = () => {
    const draft = loadDraft();
    if (draft) {
      reset(draft);
      if (draft.tags) {
        setValue("tags", draft.tags);
      }
      if (draft.testCases) replaceTestCase(draft.testCases);
      toast.success('Draft loaded successfully');
    }
    setShowDraftPrompt(false);
  };

  // Discard draft
  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftPrompt(false);
  };

  // Load sample data
  const loadSampleData = () => {
    const sampleData = sampleType === "DP" ? sampledData : sampleStringProblem;
    setValue("tags", sampleData.tags);
    replaceTestCase(sampleData.testCases);
    reset(sampleData);
    toast.success(`${sampleType === "DP" ? "DP" : "String"} sample loaded`);
  };

  // Form submission
  const onSubmit = async (data: ProblemFormData) => {
    setIsLoading(true);
    try {
      const problemData = {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        tags: data.tags.filter((tag) => tag.trim() !== ""),
        examples: data.examples,
        constraints: data.constraints,
        testCases: data.testCases,
        codeSnippet: data.codeSnippets,
        referenceSolution: data.referenceSolutions,
        hints: data.hints,
        editorial: data.editorial,
      };

      await axiosInstance.post("/problems/create-problem", problemData);
      clearDraft();
      toast.success("Problem created successfully!");
      navigation("/");
    } catch (error) {
      console.error("Error creating problem:", error);
      if (isAxiosError<ApiErrorResponse>(error)) {
        toast.error(error.response?.data?.error || "Failed to create problem");
      } else {
        toast.error("Failed to create problem");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check if current step is valid
  const isCurrentStepValid = useMemo(() => {
    const stepErrors: StepErrorMap = {
      0: ['title', 'description', 'difficulty'],
      1: ['tags', 'constraints'],
      2: ['testCases'],
      3: ['codeSnippets'],
      4: ['referenceSolutions'],
    };
    
    const currentStepFields = stepErrors[currentStep] || [];
    return !currentStepFields.some((field) => Boolean(errors[field]));
  }, [currentStep, errors]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <WizardStep
            title="Basic Information"
            description="Enter the fundamental details of your problem"
            icon={IconFileText}
          >
            <div className="space-y-6">
              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-semibold">Title</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full text-lg ${errors.title ? 'input-error' : ''}`}
                  {...register("title")}
                  placeholder="Enter problem title"
                />
                {errors.title && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.title.message}</span>
                  </label>
                )}
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-semibold">Description</span>
                </label>
                <textarea
                  className={`textarea textarea-bordered min-h-40 w-full text-base p-4 ${errors.description ? 'textarea-error' : ''}`}
                  {...register("description")}
                  placeholder="Describe the problem in detail..."
                />
                {errors.description && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.description.message}</span>
                  </label>
                )}
              </div>

              {/* Difficulty */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg font-semibold">Difficulty</span>
                </label>
                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-3">
                      {(['EASY', 'MEDIUM', 'HARD'] as ProblemFormData["difficulty"][]).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => field.onChange(level)}
                          className={`
                            flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all border-2
                            ${field.value === level
                              ? level === 'EASY' ? 'bg-success/20 border-success text-success'
                              : level === 'MEDIUM' ? 'bg-warning/20 border-warning text-warning'
                              : 'bg-error/20 border-error text-error'
                              : 'bg-base-200 border-base-300 hover:border-base-content/20'
                            }
                          `}
                        >
                          <span className={`w-3 h-3 rounded-full inline-block mr-2 ${
                            level === 'EASY' ? 'bg-success' : level === 'MEDIUM' ? 'bg-warning' : 'bg-error'
                          }`} />
                          {level.charAt(0) + level.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.difficulty && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.difficulty.message}</span>
                  </label>
                )}
              </div>
            </div>
          </WizardStep>
        );

      case 1:
        return (
          <WizardStep
            title="Tags & Constraints"
            description="Add categorization tags and problem constraints"
            icon={IconBook}
          >
            <div className="space-y-6">
              {/* Tags */}
              <CollapsibleSection title="Tags" icon={IconBook} badge={String(tags.length)}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tags.map((_, index) => (
                      <div key={`${index}-${tags[index]}`} className="flex gap-2">
                        <input
                          type="text"
                          className="input input-bordered flex-1"
                          {...register(`tags.${index}`)}
                          placeholder="Enter tag"
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-square"
                          onClick={() => {
                            if (tags.length > 1) {
                              setValue(
                                "tags",
                                tags.filter((_, i) => i !== index),
                                { shouldDirty: true, shouldValidate: true }
                              );
                            }
                          }}
                          disabled={tags.length === 1}
                        >
                          <IconTrash className="w-4 h-4 text-error" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm gap-2"
                    onClick={() =>
                      setValue("tags", [...tags, ""], {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    <IconPlus className="w-4 h-4" /> Add Tag
                  </button>
                </div>
              </CollapsibleSection>

              {/* Constraints */}
              <CollapsibleSection title="Constraints" icon={IconAlertCircle}>
                <textarea
                  className="textarea textarea-bordered min-h-24 w-full"
                  {...register("constraints")}
                  placeholder="Enter problem constraints (e.g., 1 <= n <= 10^5)"
                />
              </CollapsibleSection>

              {/* Hints */}
              <CollapsibleSection title="Hints (Optional)" icon={IconBulb} defaultOpen={false}>
                <textarea
                  className="textarea textarea-bordered min-h-24 w-full"
                  {...register("hints")}
                  placeholder="Enter hints for solving the problem"
                />
              </CollapsibleSection>
            </div>
          </WizardStep>
        );

      case 2:
        return (
          <WizardStep
            title="Test Cases"
            description="Define input/output pairs for testing solutions"
            icon={IconCircleCheck}
          >
            <div className="space-y-4">
              {testCaseFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card bg-base-200 shadow-md"
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold">Test Case #{index + 1}</h4>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => removeTestCase(index)}
                        disabled={testCaseFields.length === 1}
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">Input</span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered min-h-20"
                          {...register(`testCases.${index}.input`)}
                          placeholder="Enter test input"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">Expected Output</span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered min-h-20"
                          {...register(`testCases.${index}.output`)}
                          placeholder="Enter expected output"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <button
                type="button"
                className="btn btn-primary gap-2 w-full"
                onClick={() => appendTestCase({ input: "", output: "" })}
              >
                <IconPlus className="w-4 h-4" /> Add Test Case
              </button>
            </div>
          </WizardStep>
        );

      case 3:
        return (
          <WizardStep
            title="Code Templates"
            description="Provide starter code templates for each language"
            icon={IconCode}
          >
            <div className="space-y-6">
              {LANGUAGES.map((language) => (
                <CollapsibleSection
                  key={language}
                  title={language}
                  icon={IconCode}
                  defaultOpen={language === "JAVASCRIPT"}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="label">
                        <span className="label-text font-medium">Starter Code Template</span>
                      </label>
                      <div className="border rounded-lg overflow-hidden">
                        <Controller
                          name={`codeSnippets.${language}` as const}
                          control={control}
                          render={({ field }) => (
                            <Editor
                              height="250px"
                              language={language.toLowerCase()}
                              theme="vs-dark"
                              value={field.value}
                              onChange={(value) => field.onChange(value ?? "")}
                              loading={<SkeletonCodeEditor height="250px" />}
                              options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: "on",
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                              }}
                            />
                          )}
                        />
                      </div>
                    </div>

                    {/* Examples for this language */}
                    <div className="card bg-base-100 p-4">
                      <h5 className="font-medium mb-3">Example</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label"><span className="label-text">Input</span></label>
                          <input
                            type="text"
                            className="input input-bordered input-sm"
                            {...register(`examples.${language}.input` as const)}
                            placeholder="Example input"
                          />
                        </div>
                        <div className="form-control">
                          <label className="label"><span className="label-text">Output</span></label>
                          <input
                            type="text"
                            className="input input-bordered input-sm"
                            {...register(`examples.${language}.output` as const)}
                            placeholder="Example output"
                          />
                        </div>
                        <div className="form-control md:col-span-2">
                          <label className="label"><span className="label-text">Explanation</span></label>
                          <textarea
                            className="textarea textarea-bordered textarea-sm"
                            {...register(`examples.${language}.explanation` as const)}
                            placeholder="Explain the example"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              ))}
            </div>
          </WizardStep>
        );

      case 4:
        return (
          <WizardStep
            title="Reference Solutions & Editorial"
            description="Provide working solutions and explanation"
            icon={IconBulb}
          >
            <div className="space-y-6">
              {/* Reference Solutions */}
              {LANGUAGES.map((language) => (
                <CollapsibleSection
                  key={language}
                  title={`${language} Solution`}
                  icon={IconCircleCheck}
                  defaultOpen={language === "JAVASCRIPT"}
                >
                  <div className="border rounded-lg overflow-hidden">
                    <Controller
                      name={`referenceSolutions.${language}` as const}
                      control={control}
                      render={({ field }) => (
                        <Editor
                          height="250px"
                          language={language.toLowerCase()}
                          theme="vs-dark"
                          value={field.value}
                          onChange={(value) => field.onChange(value ?? "")}
                          loading={<SkeletonCodeEditor height="250px" />}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                          }}
                        />
                      )}
                    />
                  </div>
                </CollapsibleSection>
              ))}

              {/* Editorial */}
              <CollapsibleSection title="Editorial (Optional)" icon={IconBulb}>
                <textarea
                  className="textarea textarea-bordered min-h-32 w-full"
                  {...register("editorial")}
                  placeholder="Explain the approach and solution..."
                />
              </CollapsibleSection>
            </div>
          </WizardStep>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Draft Recovery Prompt */}
      <AnimatePresence>
        {showDraftPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-xl bg-info/10 border border-info/20"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <IconRotate className="w-5 h-5 text-info" />
                <span className="font-medium">You have an unsaved draft. Would you like to continue?</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={handleDiscardDraft}
                >
                  Discard
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-info"
                  onClick={handleLoadDraft}
                >
                  Load Draft
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <IconFileText className="w-7 h-7 text-primary" />
                Create Problem
              </h2>
              {isDirty && (
                <p className="text-sm text-base-content/50 mt-1">
                  <IconDeviceFloppy className="w-3 h-3 inline mr-1" />
                  {getLastSavedText() ? `Auto-saved ${getLastSavedText()}` : 'Saving...'}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              {/* Sample data buttons */}
              <div className="join">
                <button
                  type="button"
                  className={`btn btn-sm join-item ${sampleType === "DP" ? "btn-active" : ""}`}
                  onClick={() => setSampleType("DP")}
                >
                  DP
                </button>
                <button
                  type="button"
                  className={`btn btn-sm join-item ${sampleType === "string" ? "btn-active" : ""}`}
                  onClick={() => setSampleType("string")}
                >
                  String
                </button>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm gap-2"
                onClick={loadSampleData}
              >
                <IconDownload className="w-4 h-4" />
                Load Sample
              </button>
            </div>
          </div>

          {/* Form Wizard */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormWizard
              steps={FORM_STEPS}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              onComplete={handleSubmit(onSubmit)}
              isLoading={isLoading}
              canProceed={isCurrentStepValid}
            >
              {renderStepContent()}
            </FormWizard>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProblemForm;
