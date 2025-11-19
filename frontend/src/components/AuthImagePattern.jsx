import { Code, Terminal, FileCode, Braces } from "lucide-react";
import { useEffect, useState } from "react";

const CodeBackground = ({ title, subtitle }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Code snippets to display in the background
  const codeSnippets = [
    `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    `class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
  let prev = null;
  let current = head;
  while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  return prev;
}`,
    `function isValid(s) {
  const stack = [];
  const map = {
    '(': ')',
    '{': '}',
    '[': ']'
  };
  
  for (let i = 0; i < s.length; i++) {
    if (s[i] in map) {
      stack.push(s[i]);
    } else {
      const last = stack.pop();
      if (map[last] !== s[i]) return false;
    }
  }
  
  return stack.length === 0;
}`,
  ];

  // Rotate through code snippets
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % codeSnippets.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [codeSnippets.length]);

  return (
    <div className="hidden lg:flex flex-col items-center justify-center bg-base-200 p-12 relative overflow-hidden">
      {/* Animated code symbols in background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] animate-pulse text-primary">
          <Braces size={40} />
        </div>
        <div className="absolute top-[30%] left-[80%] animate-pulse delay-300 text-secondary">
          <FileCode size={50} />
        </div>
        <div className="absolute top-[70%] left-[20%] animate-pulse delay-700 text-accent">
          <Terminal size={45} />
        </div>
        <div className="absolute top-[60%] left-[75%] animate-pulse delay-500 text-primary">
          <Code size={55} />
        </div>
        <div className="absolute top-[85%] left-[45%] animate-pulse delay-200 text-secondary">
          <Braces size={35} />
        </div>
        <div className="absolute top-[15%] left-[60%] animate-pulse delay-100 text-accent">
          <Terminal size={30} />
        </div>
      </div>

      <div className="z-10 max-w-md flex flex-col items-center text-center">
        {/* Code editor mockup */}
        <div className="w-full bg-base-300 rounded-xl shadow-2xl mb-8 overflow-hidden border border-base-content/5 ring-1 ring-base-content/5 transform transition-transform hover:scale-[1.02] duration-500">
          {/* Editor header */}
          <div className="bg-base-100 px-4 py-3 flex items-center border-b border-base-content/5">
            <div className="flex space-x-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-error/80"></div>
              <div className="w-3 h-3 rounded-full bg-warning/80"></div>
              <div className="w-3 h-3 rounded-full bg-success/80"></div>
            </div>
            <div className="text-xs font-mono opacity-50">problem.js</div>
          </div>

          {/* Code content */}
          <div className="p-5 font-mono text-xs sm:text-sm overflow-hidden relative h-64 text-left bg-base-300">
            <pre className="whitespace-pre-wrap text-primary/80 transition-opacity duration-1000 leading-relaxed">
              {codeSnippets[activeIndex]}
            </pre>

            {/* Blinking cursor */}
            <div className="absolute bottom-5 right-5 w-2 h-4 bg-primary animate-pulse"></div>
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 shadow-lg shadow-primary/10">
            <Code className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Text content */}
        <h2 className="text-3xl font-black mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-base-content/60 text-lg leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default CodeBackground;
