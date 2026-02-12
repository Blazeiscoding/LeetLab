import { useState, useCallback } from "react";
import { IconTestPipe, IconPlayerPlay, IconPlus, IconTrash } from '@tabler/icons-react';

/**
 * Panel for adding and running custom test cases
 */
interface CustomTest {
  id: number;
  input: string;
  expectedOutput: string;
}

interface CustomTestCasePanelProps {
  onRunCustomTest: (tests: CustomTest[]) => void;
  isRunning: boolean;
}

const CustomTestCasePanel = ({ onRunCustomTest, isRunning }: CustomTestCasePanelProps) => {
  const [customTests, setCustomTests] = useState<CustomTest[]>([
    { id: 1, input: "", expectedOutput: "" }
  ]);
  const [activeTestIndex, setActiveTestIndex] = useState(0);

  const addTestCase = useCallback(() => {
    const newId = Math.max(...customTests.map((t) => t.id), 0) + 1;
    setCustomTests((prev) => [...prev, { id: newId, input: "", expectedOutput: "" }]);
    setActiveTestIndex(customTests.length);
  }, [customTests]);

  const removeTestCase = useCallback((id: number) => {
    if (customTests.length <= 1) return;
    const index = customTests.findIndex((t) => t.id === id);
    setCustomTests((prev) => prev.filter((t) => t.id !== id));
    if (activeTestIndex >= index && activeTestIndex > 0) {
      setActiveTestIndex((prev) => prev - 1);
    }
  }, [customTests, activeTestIndex]);

  const updateTestCase = useCallback((id: number, field: keyof Omit<CustomTest, "id">, value: string) => {
    setCustomTests((prev) => 
      prev.map((t) => t.id === id ? { ...t, [field]: value } : t)
    );
  }, []);

  const handleRunCustomTests = useCallback(() => {
    const testsToRun = customTests.filter((t) => t.input.trim());
    if (testsToRun.length === 0) {
      return;
    }
    onRunCustomTest(testsToRun);
  }, [customTests, onRunCustomTest]);

  const activeTest = customTests[activeTestIndex];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <IconTestPipe className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Custom Test Cases</h3>
            <p className="text-xs text-base-content/60">Add your own inputs to test</p>
          </div>
        </div>
        <button
          className="btn btn-accent btn-sm gap-2"
          onClick={handleRunCustomTests}
          disabled={isRunning || !customTests.some(t => t.input.trim())}
        >
          {isRunning ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <IconPlayerPlay className="w-4 h-4 fill-current" />
          )}
          Run Custom
        </button>
      </div>

      {/* Test Case Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {customTests.map((test, index) => (
          <button
            key={test.id}
            className={`btn btn-sm gap-2 shrink-0 ${
              activeTestIndex === index
                ? "btn-primary"
                : "btn-ghost bg-base-200/50"
            }`}
            onClick={() => setActiveTestIndex(index)}
          >
            Case {index + 1}
            {customTests.length > 1 && (
              <span
                className="hover:text-error cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTestCase(test.id);
                }}
              >
                <IconTrash className="w-3 h-3" />
              </span>
            )}
          </button>
        ))}
        <button
          className="btn btn-ghost btn-sm btn-circle"
          onClick={addTestCase}
          title="Add Test Case"
        >
          <IconPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Active Test Case Editor */}
      {activeTest && (
        <div className="flex-1 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-bold mb-2 text-base-content/70">
              Input
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-32 font-mono text-sm bg-base-200/50 focus:bg-base-100"
              placeholder="Enter your test input here...&#10;e.g., [1,2,3,4,5]&#10;or multiple lines of input"
              value={activeTest.input}
              onChange={(e) => updateTestCase(activeTest.id, "input", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-base-content/70">
              Expected Output <span className="font-normal text-base-content/50">(optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-24 font-mono text-sm bg-base-200/50 focus:bg-base-100"
              placeholder="Enter expected output for comparison..."
              value={activeTest.expectedOutput}
              onChange={(e) => updateTestCase(activeTest.id, "expectedOutput", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-4 p-3 bg-base-200/50 rounded-xl border border-base-content/5">
        <p className="text-xs text-base-content/60">
          <span className="font-bold text-base-content/80">💡 Tip:</span> Custom test cases help debug edge cases.
          Results will appear in the Output tab.
        </p>
      </div>
    </div>
  );
};

export default CustomTestCasePanel;
