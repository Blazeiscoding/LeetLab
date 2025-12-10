const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

// Import all problem batches
const batch2 = require('./problems-batch2');
const batch3 = require('./problems-batch3');
const batch4 = require('./problems-batch4');
const batch5 = require('./problems-batch5');

// Get admin user ID (first admin in database)
async function getAdminUserId() {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  if (!admin) {
    throw new Error('No admin user found. Please create an admin user first.');
  }
  return admin.id;
}

const problems = [
  {
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.",
    difficulty: "EASY",
    tags: ["Two Pointers", "String"],
    examples: [
      { input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: "Reverse the characters" },
      { input: '["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]', explanation: "Reverse preserves case" }
    ],
    constraints: "1 <= s.length <= 10^5\ns[i] is a printable ASCII character.",
    testCases: [
      { input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: '["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
      { input: '["a"]', output: '["a"]' }
    ],
    codeSnippet: {
      JAVASCRIPT: "function reverseString(s) {\n  // Your code here\n}",
      PYTHON: "def reverseString(s):\n    # Your code here\n    pass",
      JAVA: "class Solution {\n    public void reverseString(char[] s) {\n        // Your code here\n    }\n}"
    },
    referenceSolution: {
      JAVASCRIPT: "function reverseString(s) {\n  let left = 0, right = s.length - 1;\n  while (left < right) {\n    [s[left], s[right]] = [s[right], s[left]];\n    left++; right--;\n  }\n  return s;\n}",
      PYTHON: "def reverseString(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        s[left], s[right] = s[right], s[left]\n        left += 1\n        right -= 1\n    return s",
      JAVA: "class Solution {\n    public void reverseString(char[] s) {\n        int left = 0, right = s.length - 1;\n        while (left < right) {\n            char temp = s[left];\n            s[left] = s[right];\n            s[right] = temp;\n            left++; right--;\n        }\n    }\n}"
    },
    hints: "Use two pointers starting from both ends."
  },
  {
    title: "Valid Anagram",
    description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    difficulty: "EASY",
    tags: ["Hash Table", "String", "Sorting"],
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: "true", explanation: "Both contain same letters" },
      { input: 's = "rat", t = "car"', output: "false", explanation: "Different letters" }
    ],
    constraints: "1 <= s.length, t.length <= 5 * 10^4\ns and t consist of lowercase English letters.",
    testCases: [
      { input: "anagram\nnagaram", output: "true" },
      { input: "rat\ncar", output: "false" },
      { input: "listen\nsilent", output: "true" }
    ],
    codeSnippet: {
      JAVASCRIPT: "function isAnagram(s, t) {\n  // Your code here\n}",
      PYTHON: "def isAnagram(s, t):\n    # Your code here\n    pass",
      JAVA: "class Solution {\n    public boolean isAnagram(String s, String t) {\n        // Your code here\n    }\n}"
    },
    referenceSolution: {
      JAVASCRIPT: "function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (let c of s) count[c] = (count[c] || 0) + 1;\n  for (let c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}",
      PYTHON: "def isAnagram(s, t):\n    if len(s) != len(t): return False\n    from collections import Counter\n    return Counter(s) == Counter(t)",
      JAVA: "class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] count = new int[26];\n        for (char c : s.toCharArray()) count[c - 'a']++;\n        for (char c : t.toCharArray()) count[c - 'a']--;\n        for (int i : count) if (i != 0) return false;\n        return true;\n    }\n}"
    },
    hints: "Try using a hash map to count character frequencies."
  },
  {
    title: "Maximum Subarray",
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    difficulty: "MEDIUM",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    examples: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "Subarray [4,-1,2,1] has the largest sum 6." },
      { input: "[1]", output: "1", explanation: "Trivial case" },
      { input: "[5,4,-1,7,8]", output: "23", explanation: "Entire array" }
    ],
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    testCases: [
      { input: "-2,1,-3,4,-1,2,1,-5,4", output: "6" },
      { input: "1", output: "1" },
      { input: "5,4,-1,7,8", output: "23" }
    ],
    codeSnippet: {
      JAVASCRIPT: "function maxSubArray(nums) {\n  // Your code here\n}",
      PYTHON: "def maxSubArray(nums):\n    # Your code here\n    pass",
      JAVA: "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Your code here\n    }\n}"
    },
    referenceSolution: {
      JAVASCRIPT: "function maxSubArray(nums) {\n  let maxSum = nums[0], currentSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}",
      PYTHON: "def maxSubArray(nums):\n    max_sum = current_sum = nums[0]\n    for num in nums[1:]:\n        current_sum = max(num, current_sum + num)\n        max_sum = max(max_sum, current_sum)\n    return max_sum",
      JAVA: "class Solution {\n    public int maxSubArray(int[] nums) {\n        int maxSum = nums[0], currentSum = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            currentSum = Math.max(nums[i], currentSum + nums[i]);\n            maxSum = Math.max(maxSum, currentSum);\n        }\n        return maxSum;\n    }\n}"
    },
    hints: "Use Kadane's algorithm - keep track of current sum and max sum."
  },
  {
    title: "Merge Sorted Array",
    description: "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.\n\nMerge nums1 and nums2 into a single array sorted in non-decreasing order.",
    difficulty: "EASY",
    tags: ["Array", "Two Pointers", "Sorting"],
    examples: [
      { input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3", output: "[1,2,2,3,5,6]", explanation: "Merge and sort" }
    ],
    constraints: "nums1.length == m + n\nnums2.length == n\n0 <= m, n <= 200",
    testCases: [
      { input: "1,2,3,0,0,0\n3\n2,5,6\n3", output: "1,2,2,3,5,6" },
      { input: "1\n1\n\n0", output: "1" }
    ],
    codeSnippet: {
      JAVASCRIPT: "function merge(nums1, m, nums2, n) {\n  // Your code here\n}",
      PYTHON: "def merge(nums1, m, nums2, n):\n    # Your code here\n    pass",
      JAVA: "class Solution {\n    public void merge(int[] nums1, int m, int[] nums2, int n) {\n        // Your code here\n    }\n}"
    },
    referenceSolution: {
      JAVASCRIPT: "function merge(nums1, m, nums2, n) {\n  let i = m - 1, j = n - 1, k = m + n - 1;\n  while (j >= 0) {\n    if (i >= 0 && nums1[i] > nums2[j]) {\n      nums1[k--] = nums1[i--];\n    } else {\n      nums1[k--] = nums2[j--];\n    }\n  }\n  return nums1;\n}",
      PYTHON: "def merge(nums1, m, nums2, n):\n    i, j, k = m - 1, n - 1, m + n - 1\n    while j >= 0:\n        if i >= 0 and nums1[i] > nums2[j]:\n            nums1[k] = nums1[i]\n            i -= 1\n        else:\n            nums1[k] = nums2[j]\n            j -= 1\n        k -= 1\n    return nums1",
      JAVA: "class Solution {\n    public void merge(int[] nums1, int m, int[] nums2, int n) {\n        int i = m - 1, j = n - 1, k = m + n - 1;\n        while (j >= 0) {\n            if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];\n            else nums1[k--] = nums2[j--];\n        }\n    }\n}"
    },
    hints: "Start from the end of both arrays to avoid overwriting."
  },
  {
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "EASY",
    tags: ["Math", "Dynamic Programming", "Memoization"],
    examples: [
      { input: "2", output: "2", explanation: "1+1 or 2" },
      { input: "3", output: "3", explanation: "1+1+1, 1+2, or 2+1" }
    ],
    constraints: "1 <= n <= 45",
    testCases: [
      { input: "2", output: "2" },
      { input: "3", output: "3" },
      { input: "4", output: "5" }
    ],
    codeSnippet: {
      JAVASCRIPT: "function climbStairs(n) {\n  // Your code here\n}",
      PYTHON: "def climbStairs(n):\n    # Your code here\n    pass",
      JAVA: "class Solution {\n    public int climbStairs(int n) {\n        // Your code here\n    }\n}"
    },
    referenceSolution: {
      JAVASCRIPT: "function climbStairs(n) {\n  if (n <= 2) return n;\n  let a = 1, b = 2;\n  for (let i = 3; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n}",
      PYTHON: "def climbStairs(n):\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b",
      JAVA: "class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            int temp = b;\n            b = a + b;\n            a = temp;\n        }\n        return b;\n    }\n}"
    },
    hints: "This is a Fibonacci sequence problem!"
  }
];

// Combine all problems from all batches
const allProblems = [...problems, ...batch2, ...batch3, ...batch4, ...batch5];

async function seed() {
  console.log('🌱 Starting seed...');
  console.log(`📦 Total problems to seed: ${allProblems.length}`);
  
  try {
    const adminId = await getAdminUserId();
    console.log(`Found admin user: ${adminId}`);
    
    let created = 0, skipped = 0;
    
    for (const problem of allProblems) {
      const existing = await prisma.problem.findFirst({
        where: { title: problem.title }
      });
      
      if (existing) {
        console.log(`⏭️  Skipping "${problem.title}" (already exists)`);
        skipped++;
        continue;
      }
      
      await prisma.problem.create({
        data: {
          ...problem,
          userId: adminId
        }
      });
      console.log(`✅ Created: ${problem.title}`);
      created++;
    }
    
    console.log(`\n🎉 Seed completed! Created: ${created}, Skipped: ${skipped}`);
  } catch (error) {
    console.error('Error seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
