// Additional problems - Part 3 (problems 16-30)
module.exports = [
  {
    title: "Same Tree",
    description: "Given the roots of two binary trees p and q, write a function to check if they are the same or not.\n\nTwo binary trees are considered the same if they are structurally identical, and the nodes have the same value.",
    difficulty: "EASY",
    tags: ["Tree", "DFS", "BFS", "Binary Tree"],
    examples: [{ input: "p = [1,2,3], q = [1,2,3]", output: "true" }],
    constraints: "The number of nodes in both trees is in the range [0, 100].",
    testCases: [{ input: "1,2,3\n1,2,3", output: "true" }, { input: "1,2\n1,null,2", output: "false" }],
    codeSnippet: { JAVASCRIPT: "function isSameTree(p, q) {\n  // Your code here\n}", PYTHON: "def isSameTree(p, q):\n    pass", JAVA: "class Solution {\n    public boolean isSameTree(TreeNode p, TreeNode q) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function isSameTree(p, q) {\n  if (!p && !q) return true;\n  if (!p || !q || p.val !== q.val) return false;\n  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);\n}", PYTHON: "def isSameTree(p, q):\n    if not p and not q: return True\n    if not p or not q or p.val != q.val: return False\n    return isSameTree(p.left, q.left) and isSameTree(p.right, q.right)", JAVA: "class Solution {\n    public boolean isSameTree(TreeNode p, TreeNode q) {\n        if (p == null && q == null) return true;\n        if (p == null || q == null || p.val != q.val) return false;\n        return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);\n    }\n}" }
  },
  {
    title: "Symmetric Tree",
    description: "Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).",
    difficulty: "EASY",
    tags: ["Tree", "DFS", "BFS", "Binary Tree"],
    examples: [{ input: "root = [1,2,2,3,4,4,3]", output: "true" }],
    constraints: "The number of nodes in the tree is in the range [1, 1000].",
    testCases: [{ input: "1,2,2,3,4,4,3", output: "true" }, { input: "1,2,2,null,3,null,3", output: "false" }],
    codeSnippet: { JAVASCRIPT: "function isSymmetric(root) {\n  // Your code here\n}", PYTHON: "def isSymmetric(root):\n    pass", JAVA: "class Solution {\n    public boolean isSymmetric(TreeNode root) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function isSymmetric(root) {\n  const check = (l, r) => {\n    if (!l && !r) return true;\n    if (!l || !r || l.val !== r.val) return false;\n    return check(l.left, r.right) && check(l.right, r.left);\n  };\n  return check(root.left, root.right);\n}", PYTHON: "def isSymmetric(root):\n    def check(l, r):\n        if not l and not r: return True\n        if not l or not r or l.val != r.val: return False\n        return check(l.left, r.right) and check(l.right, r.left)\n    return check(root.left, root.right)", JAVA: "class Solution {\n    public boolean isSymmetric(TreeNode root) {\n        return check(root.left, root.right);\n    }\n    boolean check(TreeNode l, TreeNode r) {\n        if (l == null && r == null) return true;\n        if (l == null || r == null || l.val != r.val) return false;\n        return check(l.left, r.right) && check(l.right, r.left);\n    }\n}" }
  },
  {
    title: "Single Number",
    description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.",
    difficulty: "EASY",
    tags: ["Array", "Bit Manipulation"],
    examples: [{ input: "[2,2,1]", output: "1" }, { input: "[4,1,2,1,2]", output: "4" }],
    constraints: "1 <= nums.length <= 3 * 10^4\n-3 * 10^4 <= nums[i] <= 3 * 10^4",
    testCases: [{ input: "2,2,1", output: "1" }, { input: "4,1,2,1,2", output: "4" }],
    codeSnippet: { JAVASCRIPT: "function singleNumber(nums) {\n  // Your code here\n}", PYTHON: "def singleNumber(nums):\n    pass", JAVA: "class Solution {\n    public int singleNumber(int[] nums) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function singleNumber(nums) {\n  return nums.reduce((a, b) => a ^ b, 0);\n}", PYTHON: "def singleNumber(nums):\n    result = 0\n    for n in nums: result ^= n\n    return result", JAVA: "class Solution {\n    public int singleNumber(int[] nums) {\n        int result = 0;\n        for (int n : nums) result ^= n;\n        return result;\n    }\n}" }
  },
  {
    title: "Number of 1 Bits",
    description: "Write a function that takes the binary representation of a positive integer and returns the number of set bits it has (also known as the Hamming weight).",
    difficulty: "EASY",
    tags: ["Divide and Conquer", "Bit Manipulation"],
    examples: [{ input: "n = 11", output: "3", explanation: "Binary is 1011" }],
    constraints: "1 <= n <= 2^31 - 1",
    testCases: [{ input: "11", output: "3" }, { input: "128", output: "1" }, { input: "2147483645", output: "30" }],
    codeSnippet: { JAVASCRIPT: "function hammingWeight(n) {\n  // Your code here\n}", PYTHON: "def hammingWeight(n):\n    pass", JAVA: "class Solution {\n    public int hammingWeight(int n) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function hammingWeight(n) {\n  let count = 0;\n  while (n) { count += n & 1; n >>>= 1; }\n  return count;\n}", PYTHON: "def hammingWeight(n):\n    count = 0\n    while n:\n        count += n & 1\n        n >>= 1\n    return count", JAVA: "class Solution {\n    public int hammingWeight(int n) {\n        int count = 0;\n        while (n != 0) { count += (n & 1); n >>>= 1; }\n        return count;\n    }\n}" }
  },
  {
    title: "Counting Bits",
    description: "Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i.",
    difficulty: "EASY",
    tags: ["Dynamic Programming", "Bit Manipulation"],
    examples: [{ input: "2", output: "[0,1,1]" }, { input: "5", output: "[0,1,1,2,1,2]" }],
    constraints: "0 <= n <= 10^5",
    testCases: [{ input: "2", output: "0,1,1" }, { input: "5", output: "0,1,1,2,1,2" }],
    codeSnippet: { JAVASCRIPT: "function countBits(n) {\n  // Your code here\n}", PYTHON: "def countBits(n):\n    pass", JAVA: "class Solution {\n    public int[] countBits(int n) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function countBits(n) {\n  const dp = new Array(n + 1).fill(0);\n  for (let i = 1; i <= n; i++) dp[i] = dp[i >> 1] + (i & 1);\n  return dp;\n}", PYTHON: "def countBits(n):\n    dp = [0] * (n + 1)\n    for i in range(1, n + 1): dp[i] = dp[i >> 1] + (i & 1)\n    return dp", JAVA: "class Solution {\n    public int[] countBits(int n) {\n        int[] dp = new int[n + 1];\n        for (int i = 1; i <= n; i++) dp[i] = dp[i >> 1] + (i & 1);\n        return dp;\n    }\n}" }
  },
  {
    title: "Missing Number",
    description: "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
    difficulty: "EASY",
    tags: ["Array", "Hash Table", "Math", "Bit Manipulation"],
    examples: [{ input: "[3,0,1]", output: "2" }, { input: "[0,1]", output: "2" }],
    constraints: "n == nums.length\n1 <= n <= 10^4",
    testCases: [{ input: "3,0,1", output: "2" }, { input: "0,1", output: "2" }, { input: "9,6,4,2,3,5,7,0,1", output: "8" }],
    codeSnippet: { JAVASCRIPT: "function missingNumber(nums) {\n  // Your code here\n}", PYTHON: "def missingNumber(nums):\n    pass", JAVA: "class Solution {\n    public int missingNumber(int[] nums) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function missingNumber(nums) {\n  const n = nums.length;\n  return n * (n + 1) / 2 - nums.reduce((a, b) => a + b, 0);\n}", PYTHON: "def missingNumber(nums):\n    n = len(nums)\n    return n * (n + 1) // 2 - sum(nums)", JAVA: "class Solution {\n    public int missingNumber(int[] nums) {\n        int n = nums.length, sum = 0;\n        for (int num : nums) sum += num;\n        return n * (n + 1) / 2 - sum;\n    }\n}" }
  },
  {
    title: "Pascal's Triangle",
    description: "Given an integer numRows, return the first numRows of Pascal's triangle.\n\nIn Pascal's triangle, each number is the sum of the two numbers directly above it.",
    difficulty: "EASY",
    tags: ["Array", "Dynamic Programming"],
    examples: [{ input: "5", output: "[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]" }],
    constraints: "1 <= numRows <= 30",
    testCases: [{ input: "5", output: "[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]" }, { input: "1", output: "[[1]]" }],
    codeSnippet: { JAVASCRIPT: "function generate(numRows) {\n  // Your code here\n}", PYTHON: "def generate(numRows):\n    pass", JAVA: "class Solution {\n    public List<List<Integer>> generate(int numRows) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function generate(numRows) {\n  const result = [];\n  for (let i = 0; i < numRows; i++) {\n    const row = new Array(i + 1).fill(1);\n    for (let j = 1; j < i; j++) row[j] = result[i-1][j-1] + result[i-1][j];\n    result.push(row);\n  }\n  return result;\n}", PYTHON: "def generate(numRows):\n    result = []\n    for i in range(numRows):\n        row = [1] * (i + 1)\n        for j in range(1, i):\n            row[j] = result[i-1][j-1] + result[i-1][j]\n        result.append(row)\n    return result", JAVA: "class Solution {\n    public List<List<Integer>> generate(int numRows) {\n        List<List<Integer>> result = new ArrayList<>();\n        for (int i = 0; i < numRows; i++) {\n            List<Integer> row = new ArrayList<>();\n            for (int j = 0; j <= i; j++) {\n                if (j == 0 || j == i) row.add(1);\n                else row.add(result.get(i-1).get(j-1) + result.get(i-1).get(j));\n            }\n            result.add(row);\n        }\n        return result;\n    }\n}" }
  },
  {
    title: "Move Zeroes",
    description: "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements.\n\nNote that you must do this in-place without making a copy of the array.",
    difficulty: "EASY",
    tags: ["Array", "Two Pointers"],
    examples: [{ input: "[0,1,0,3,12]", output: "[1,3,12,0,0]" }],
    constraints: "1 <= nums.length <= 10^4\n-2^31 <= nums[i] <= 2^31 - 1",
    testCases: [{ input: "0,1,0,3,12", output: "1,3,12,0,0" }, { input: "0", output: "0" }],
    codeSnippet: { JAVASCRIPT: "function moveZeroes(nums) {\n  // Your code here\n}", PYTHON: "def moveZeroes(nums):\n    pass", JAVA: "class Solution {\n    public void moveZeroes(int[] nums) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function moveZeroes(nums) {\n  let insertPos = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] !== 0) nums[insertPos++] = nums[i];\n  }\n  while (insertPos < nums.length) nums[insertPos++] = 0;\n  return nums;\n}", PYTHON: "def moveZeroes(nums):\n    insert_pos = 0\n    for i in range(len(nums)):\n        if nums[i] != 0:\n            nums[insert_pos] = nums[i]\n            insert_pos += 1\n    while insert_pos < len(nums):\n        nums[insert_pos] = 0\n        insert_pos += 1\n    return nums", JAVA: "class Solution {\n    public void moveZeroes(int[] nums) {\n        int insertPos = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (nums[i] != 0) nums[insertPos++] = nums[i];\n        }\n        while (insertPos < nums.length) nums[insertPos++] = 0;\n    }\n}" }
  },
  {
    title: "3Sum",
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nNotice that the solution set must not contain duplicate triplets.",
    difficulty: "MEDIUM",
    tags: ["Array", "Two Pointers", "Sorting"],
    examples: [{ input: "[-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" }],
    constraints: "3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5",
    testCases: [{ input: "-1,0,1,2,-1,-4", output: "-1,-1,2;-1,0,1" }, { input: "0,1,1", output: "" }, { input: "0,0,0", output: "0,0,0" }],
    codeSnippet: { JAVASCRIPT: "function threeSum(nums) {\n  // Your code here\n}", PYTHON: "def threeSum(nums):\n    pass", JAVA: "class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function threeSum(nums) {\n  nums.sort((a, b) => a - b);\n  const result = [];\n  for (let i = 0; i < nums.length - 2; i++) {\n    if (i > 0 && nums[i] === nums[i-1]) continue;\n    let left = i + 1, right = nums.length - 1;\n    while (left < right) {\n      const sum = nums[i] + nums[left] + nums[right];\n      if (sum === 0) {\n        result.push([nums[i], nums[left], nums[right]]);\n        while (left < right && nums[left] === nums[left+1]) left++;\n        while (left < right && nums[right] === nums[right-1]) right--;\n        left++; right--;\n      } else if (sum < 0) left++;\n      else right--;\n    }\n  }\n  return result;\n}", PYTHON: "def threeSum(nums):\n    nums.sort()\n    result = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i-1]: continue\n        left, right = i + 1, len(nums) - 1\n        while left < right:\n            s = nums[i] + nums[left] + nums[right]\n            if s == 0:\n                result.append([nums[i], nums[left], nums[right]])\n                while left < right and nums[left] == nums[left+1]: left += 1\n                while left < right and nums[right] == nums[right-1]: right -= 1\n                left += 1; right -= 1\n            elif s < 0: left += 1\n            else: right -= 1\n    return result", JAVA: "class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        Arrays.sort(nums);\n        List<List<Integer>> result = new ArrayList<>();\n        for (int i = 0; i < nums.length - 2; i++) {\n            if (i > 0 && nums[i] == nums[i-1]) continue;\n            int left = i + 1, right = nums.length - 1;\n            while (left < right) {\n                int sum = nums[i] + nums[left] + nums[right];\n                if (sum == 0) {\n                    result.add(Arrays.asList(nums[i], nums[left], nums[right]));\n                    while (left < right && nums[left] == nums[left+1]) left++;\n                    while (left < right && nums[right] == nums[right-1]) right--;\n                    left++; right--;\n                } else if (sum < 0) left++;\n                else right--;\n            }\n        }\n        return result;\n    }\n}" }
  },
  {
    title: "Container With Most Water",
    description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
    difficulty: "MEDIUM",
    tags: ["Array", "Two Pointers", "Greedy"],
    examples: [{ input: "[1,8,6,2,5,4,8,3,7]", output: "49", explanation: "Lines at index 1 and 8" }],
    constraints: "n == height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4",
    testCases: [{ input: "1,8,6,2,5,4,8,3,7", output: "49" }, { input: "1,1", output: "1" }],
    codeSnippet: { JAVASCRIPT: "function maxArea(height) {\n  // Your code here\n}", PYTHON: "def maxArea(height):\n    pass", JAVA: "class Solution {\n    public int maxArea(int[] height) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function maxArea(height) {\n  let left = 0, right = height.length - 1, max = 0;\n  while (left < right) {\n    max = Math.max(max, Math.min(height[left], height[right]) * (right - left));\n    if (height[left] < height[right]) left++;\n    else right--;\n  }\n  return max;\n}", PYTHON: "def maxArea(height):\n    left, right, max_area = 0, len(height) - 1, 0\n    while left < right:\n        max_area = max(max_area, min(height[left], height[right]) * (right - left))\n        if height[left] < height[right]: left += 1\n        else: right -= 1\n    return max_area", JAVA: "class Solution {\n    public int maxArea(int[] height) {\n        int left = 0, right = height.length - 1, max = 0;\n        while (left < right) {\n            max = Math.max(max, Math.min(height[left], height[right]) * (right - left));\n            if (height[left] < height[right]) left++;\n            else right--;\n        }\n        return max;\n    }\n}" }
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    difficulty: "MEDIUM",
    tags: ["Hash Table", "String", "Sliding Window"],
    examples: [{ input: '"abcabcbb"', output: "3", explanation: "The answer is 'abc'" }],
    constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
    testCases: [{ input: "abcabcbb", output: "3" }, { input: "bbbbb", output: "1" }, { input: "pwwkew", output: "3" }],
    codeSnippet: { JAVASCRIPT: "function lengthOfLongestSubstring(s) {\n  // Your code here\n}", PYTHON: "def lengthOfLongestSubstring(s):\n    pass", JAVA: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function lengthOfLongestSubstring(s) {\n  const seen = new Map();\n  let left = 0, max = 0;\n  for (let right = 0; right < s.length; right++) {\n    if (seen.has(s[right])) left = Math.max(left, seen.get(s[right]) + 1);\n    seen.set(s[right], right);\n    max = Math.max(max, right - left + 1);\n  }\n  return max;\n}", PYTHON: "def lengthOfLongestSubstring(s):\n    seen = {}\n    left = max_len = 0\n    for right, char in enumerate(s):\n        if char in seen: left = max(left, seen[char] + 1)\n        seen[char] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len", JAVA: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        Map<Character, Integer> seen = new HashMap<>();\n        int left = 0, max = 0;\n        for (int right = 0; right < s.length(); right++) {\n            char c = s.charAt(right);\n            if (seen.containsKey(c)) left = Math.max(left, seen.get(c) + 1);\n            seen.put(c, right);\n            max = Math.max(max, right - left + 1);\n        }\n        return max;\n    }\n}" }
  },
  {
    title: "Group Anagrams",
    description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    difficulty: "MEDIUM",
    tags: ["Array", "Hash Table", "String", "Sorting"],
    examples: [{ input: '["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }],
    constraints: "1 <= strs.length <= 10^4\n0 <= strs[i].length <= 100",
    testCases: [{ input: "eat,tea,tan,ate,nat,bat", output: "bat;nat,tan;ate,eat,tea" }],
    codeSnippet: { JAVASCRIPT: "function groupAnagrams(strs) {\n  // Your code here\n}", PYTHON: "def groupAnagrams(strs):\n    pass", JAVA: "class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function groupAnagrams(strs) {\n  const map = new Map();\n  for (let str of strs) {\n    const key = str.split('').sort().join('');\n    if (!map.has(key)) map.set(key, []);\n    map.get(key).push(str);\n  }\n  return [...map.values()];\n}", PYTHON: "def groupAnagrams(strs):\n    from collections import defaultdict\n    groups = defaultdict(list)\n    for s in strs:\n        groups[''.join(sorted(s))].append(s)\n    return list(groups.values())", JAVA: "class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        Map<String, List<String>> map = new HashMap<>();\n        for (String s : strs) {\n            char[] arr = s.toCharArray();\n            Arrays.sort(arr);\n            String key = new String(arr);\n            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);\n        }\n        return new ArrayList<>(map.values());\n    }\n}" }
  },
  {
    title: "Top K Frequent Elements",
    description: "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.",
    difficulty: "MEDIUM",
    tags: ["Array", "Hash Table", "Divide and Conquer", "Sorting", "Heap", "Bucket Sort"],
    examples: [{ input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]" }],
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4\nk is in the range [1, the number of unique elements]",
    testCases: [{ input: "1,1,1,2,2,3\n2", output: "1,2" }, { input: "1\n1", output: "1" }],
    codeSnippet: { JAVASCRIPT: "function topKFrequent(nums, k) {\n  // Your code here\n}", PYTHON: "def topKFrequent(nums, k):\n    pass", JAVA: "class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function topKFrequent(nums, k) {\n  const count = {};\n  for (let n of nums) count[n] = (count[n] || 0) + 1;\n  return Object.entries(count)\n    .sort((a, b) => b[1] - a[1])\n    .slice(0, k)\n    .map(x => parseInt(x[0]));\n}", PYTHON: "def topKFrequent(nums, k):\n    from collections import Counter\n    return [x[0] for x in Counter(nums).most_common(k)]", JAVA: "class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        Map<Integer, Integer> count = new HashMap<>();\n        for (int n : nums) count.merge(n, 1, Integer::sum);\n        return count.entrySet().stream()\n            .sorted((a, b) -> b.getValue() - a.getValue())\n            .limit(k)\n            .mapToInt(Map.Entry::getKey)\n            .toArray();\n    }\n}" }
  },
  {
    title: "Encode and Decode Strings",
    description: "Design an algorithm to encode a list of strings to a single string. The encoded string is then decoded back to the original list of strings.\n\nImplement encode and decode methods.",
    difficulty: "MEDIUM",
    tags: ["Array", "String", "Design"],
    examples: [{ input: '["lint","code","love","you"]', output: '["lint","code","love","you"]' }],
    constraints: "0 <= strs.length < 100\n0 <= strs[i].length < 200",
    testCases: [{ input: "lint,code,love,you", output: "lint,code,love,you" }],
    codeSnippet: { JAVASCRIPT: "function encode(strs) {\n  // Your code here\n}\nfunction decode(s) {\n  // Your code here\n}", PYTHON: "def encode(strs):\n    pass\ndef decode(s):\n    pass", JAVA: "class Codec {\n    public String encode(List<String> strs) {\n    }\n    public List<String> decode(String s) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function encode(strs) {\n  return strs.map(s => s.length + '#' + s).join('');\n}\nfunction decode(s) {\n  const result = [];\n  let i = 0;\n  while (i < s.length) {\n    let j = i;\n    while (s[j] !== '#') j++;\n    const len = parseInt(s.substring(i, j));\n    result.push(s.substring(j + 1, j + 1 + len));\n    i = j + 1 + len;\n  }\n  return result;\n}", PYTHON: "def encode(strs):\n    return ''.join(str(len(s)) + '#' + s for s in strs)\ndef decode(s):\n    result, i = [], 0\n    while i < len(s):\n        j = i\n        while s[j] != '#': j += 1\n        length = int(s[i:j])\n        result.append(s[j+1:j+1+length])\n        i = j + 1 + length\n    return result", JAVA: "class Codec {\n    public String encode(List<String> strs) {\n        StringBuilder sb = new StringBuilder();\n        for (String s : strs) sb.append(s.length()).append('#').append(s);\n        return sb.toString();\n    }\n    public List<String> decode(String s) {\n        List<String> result = new ArrayList<>();\n        int i = 0;\n        while (i < s.length()) {\n            int j = i;\n            while (s.charAt(j) != '#') j++;\n            int len = Integer.parseInt(s.substring(i, j));\n            result.add(s.substring(j + 1, j + 1 + len));\n            i = j + 1 + len;\n        }\n        return result;\n    }\n}" }
  },
  {
    title: "Longest Consecutive Sequence",
    description: "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.\n\nYou must write an algorithm that runs in O(n) time.",
    difficulty: "MEDIUM",
    tags: ["Array", "Hash Table", "Union Find"],
    examples: [{ input: "[100,4,200,1,3,2]", output: "4", explanation: "The longest consecutive sequence is [1, 2, 3, 4]" }],
    constraints: "0 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
    testCases: [{ input: "100,4,200,1,3,2", output: "4" }, { input: "0,3,7,2,5,8,4,6,0,1", output: "9" }],
    codeSnippet: { JAVASCRIPT: "function longestConsecutive(nums) {\n  // Your code here\n}", PYTHON: "def longestConsecutive(nums):\n    pass", JAVA: "class Solution {\n    public int longestConsecutive(int[] nums) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function longestConsecutive(nums) {\n  const set = new Set(nums);\n  let longest = 0;\n  for (let n of set) {\n    if (!set.has(n - 1)) {\n      let len = 1;\n      while (set.has(n + len)) len++;\n      longest = Math.max(longest, len);\n    }\n  }\n  return longest;\n}", PYTHON: "def longestConsecutive(nums):\n    num_set = set(nums)\n    longest = 0\n    for n in num_set:\n        if n - 1 not in num_set:\n            length = 1\n            while n + length in num_set: length += 1\n            longest = max(longest, length)\n    return longest", JAVA: "class Solution {\n    public int longestConsecutive(int[] nums) {\n        Set<Integer> set = new HashSet<>();\n        for (int n : nums) set.add(n);\n        int longest = 0;\n        for (int n : set) {\n            if (!set.contains(n - 1)) {\n                int len = 1;\n                while (set.contains(n + len)) len++;\n                longest = Math.max(longest, len);\n            }\n        }\n        return longest;\n    }\n}" }
  }
];
