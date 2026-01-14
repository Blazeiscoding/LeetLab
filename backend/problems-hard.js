// Hard problems batch - Challenging algorithmic problems
export default [
  {
    title: "Median of Two Sorted Arrays",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
    difficulty: "HARD",
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000", explanation: "merged array = [1,2,3] and median is 2." },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000", explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5." }
    ],
    constraints: "nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000\n-10^6 <= nums1[i], nums2[i] <= 10^6",
    testCases: [
      { input: "1,3\n2", output: "2.0" },
      { input: "1,2\n3,4", output: "2.5" },
      { input: "0,0\n0,0", output: "0.0" },
      { input: "\n1", output: "1.0" },
      { input: "2\n", output: "2.0" }
    ],
    codeSnippet: {
      JAVASCRIPT: "function findMedianSortedArrays(nums1, nums2) {\n  // Your code here\n}",
      PYTHON: "def findMedianSortedArrays(nums1, nums2):\n    # Your code here\n    pass",
      JAVA: "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Your code here\n    }\n}"
    },
    referenceSolution: {
      JAVASCRIPT: "function findMedianSortedArrays(nums1, nums2) {\n  if (nums1.length > nums2.length) [nums1, nums2] = [nums2, nums1];\n  const m = nums1.length, n = nums2.length;\n  let lo = 0, hi = m;\n  while (lo <= hi) {\n    const i = Math.floor((lo + hi) / 2);\n    const j = Math.floor((m + n + 1) / 2) - i;\n    const maxLeft1 = i === 0 ? -Infinity : nums1[i - 1];\n    const minRight1 = i === m ? Infinity : nums1[i];\n    const maxLeft2 = j === 0 ? -Infinity : nums2[j - 1];\n    const minRight2 = j === n ? Infinity : nums2[j];\n    if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {\n      if ((m + n) % 2 === 0) return (Math.max(maxLeft1, maxLeft2) + Math.min(minRight1, minRight2)) / 2;\n      return Math.max(maxLeft1, maxLeft2);\n    } else if (maxLeft1 > minRight2) hi = i - 1;\n    else lo = i + 1;\n  }\n}",
      PYTHON: "def findMedianSortedArrays(nums1, nums2):\n    if len(nums1) > len(nums2): nums1, nums2 = nums2, nums1\n    m, n = len(nums1), len(nums2)\n    lo, hi = 0, m\n    while lo <= hi:\n        i = (lo + hi) // 2\n        j = (m + n + 1) // 2 - i\n        maxLeft1 = float('-inf') if i == 0 else nums1[i - 1]\n        minRight1 = float('inf') if i == m else nums1[i]\n        maxLeft2 = float('-inf') if j == 0 else nums2[j - 1]\n        minRight2 = float('inf') if j == n else nums2[j]\n        if maxLeft1 <= minRight2 and maxLeft2 <= minRight1:\n            if (m + n) % 2 == 0: return (max(maxLeft1, maxLeft2) + min(minRight1, minRight2)) / 2\n            return max(maxLeft1, maxLeft2)\n        elif maxLeft1 > minRight2: hi = i - 1\n        else: lo = i + 1",
      JAVA: "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);\n        int m = nums1.length, n = nums2.length;\n        int lo = 0, hi = m;\n        while (lo <= hi) {\n            int i = (lo + hi) / 2, j = (m + n + 1) / 2 - i;\n            int maxLeft1 = i == 0 ? Integer.MIN_VALUE : nums1[i - 1];\n            int minRight1 = i == m ? Integer.MAX_VALUE : nums1[i];\n            int maxLeft2 = j == 0 ? Integer.MIN_VALUE : nums2[j - 1];\n            int minRight2 = j == n ? Integer.MAX_VALUE : nums2[j];\n            if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {\n                if ((m + n) % 2 == 0) return (Math.max(maxLeft1, maxLeft2) + Math.min(minRight1, minRight2)) / 2.0;\n                return Math.max(maxLeft1, maxLeft2);\n            } else if (maxLeft1 > minRight2) hi = i - 1;\n            else lo = i + 1;\n        }\n        return 0;\n    }\n}"
    },
    hints: "Use binary search on the smaller array. Think about partitioning both arrays such that all elements on the left are smaller than all elements on the right."
  },
  {
    title: "Merge K Sorted Lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
    difficulty: "HARD",
    tags: ["Linked List", "Divide and Conquer", "Heap", "Merge Sort"],
    examples: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]", explanation: "Merge all lists into one sorted list" },
      { input: "lists = []", output: "[]" },
      { input: "lists = [[]]", output: "[]" }
    ],
    constraints: "k == lists.length\n0 <= k <= 10^4\n0 <= lists[i].length <= 500\n-10^4 <= lists[i][j] <= 10^4\nlists[i] is sorted in ascending order.\nThe sum of lists[i].length will not exceed 10^4.",
    testCases: [
      { input: "1,4,5;1,3,4;2,6", output: "1,1,2,3,4,4,5,6" },
      { input: "", output: "" },
      { input: "1;2;3", output: "1,2,3" }
    ],
    codeSnippet: {
      JAVASCRIPT: "function mergeKLists(lists) {\n  // Your code here\n}",
      PYTHON: "def mergeKLists(lists):\n    # Your code here\n    pass",
      JAVA: "class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        // Your code here\n    }\n}"
    },
    referenceSolution: {
      JAVASCRIPT: "function mergeKLists(lists) {\n  if (!lists.length) return null;\n  function merge(l1, l2) {\n    const dummy = { next: null };\n    let curr = dummy;\n    while (l1 && l2) {\n      if (l1.val < l2.val) { curr.next = l1; l1 = l1.next; }\n      else { curr.next = l2; l2 = l2.next; }\n      curr = curr.next;\n    }\n    curr.next = l1 || l2;\n    return dummy.next;\n  }\n  while (lists.length > 1) {\n    const merged = [];\n    for (let i = 0; i < lists.length; i += 2) {\n      const l1 = lists[i], l2 = lists[i + 1] || null;\n      merged.push(merge(l1, l2));\n    }\n    lists = merged;\n  }\n  return lists[0];\n}",
      PYTHON: "def mergeKLists(lists):\n    import heapq\n    heap = []\n    for i, l in enumerate(lists):\n        if l: heapq.heappush(heap, (l.val, i, l))\n    dummy = ListNode(0)\n    curr = dummy\n    while heap:\n        val, i, node = heapq.heappop(heap)\n        curr.next = node\n        curr = curr.next\n        if node.next:\n            heapq.heappush(heap, (node.next.val, i, node.next))\n    return dummy.next",
      JAVA: "class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        if (lists.length == 0) return null;\n        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);\n        for (ListNode l : lists) if (l != null) pq.offer(l);\n        ListNode dummy = new ListNode(0), curr = dummy;\n        while (!pq.isEmpty()) {\n            ListNode node = pq.poll();\n            curr.next = node;\n            curr = curr.next;\n            if (node.next != null) pq.offer(node.next);\n        }\n        return dummy.next;\n    }\n}"
    },
    hints: "Use a min-heap to always get the smallest element among all list heads. Alternatively, use divide and conquer to merge lists pairwise."
  },
  {
    title: "Trapping Rain Water",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    difficulty: "HARD",
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack", "Monotonic Stack"],
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped." },
      { input: "height = [4,2,0,3,2,5]", output: "9" }
    ],
    constraints: "n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5",
    testCases: [
      { input: "0,1,0,2,1,0,1,3,2,1,2,1", output: "6" },
      { input: "4,2,0,3,2,5", output: "9" },
      { input: "1,2,3,4,5", output: "0" },
      { input: "5,4,3,2,1", output: "0" }
    ],
    codeSnippet: {
      JAVASCRIPT: "function trap(height) {\n  // Your code here\n}",
      PYTHON: "def trap(height):\n    # Your code here\n    pass",
      JAVA: "class Solution {\n    public int trap(int[] height) {\n        // Your code here\n    }\n}"
    },
    referenceSolution: {
      JAVASCRIPT: "function trap(height) {\n  let left = 0, right = height.length - 1;\n  let leftMax = 0, rightMax = 0, water = 0;\n  while (left < right) {\n    if (height[left] < height[right]) {\n      if (height[left] >= leftMax) leftMax = height[left];\n      else water += leftMax - height[left];\n      left++;\n    } else {\n      if (height[right] >= rightMax) rightMax = height[right];\n      else water += rightMax - height[right];\n      right--;\n    }\n  }\n  return water;\n}",
      PYTHON: "def trap(height):\n    left, right = 0, len(height) - 1\n    left_max = right_max = water = 0\n    while left < right:\n        if height[left] < height[right]:\n            if height[left] >= left_max: left_max = height[left]\n            else: water += left_max - height[left]\n            left += 1\n        else:\n            if height[right] >= right_max: right_max = height[right]\n            else: water += right_max - height[right]\n            right -= 1\n    return water",
      JAVA: "class Solution {\n    public int trap(int[] height) {\n        int left = 0, right = height.length - 1;\n        int leftMax = 0, rightMax = 0, water = 0;\n        while (left < right) {\n            if (height[left] < height[right]) {\n                if (height[left] >= leftMax) leftMax = height[left];\n                else water += leftMax - height[left];\n                left++;\n            } else {\n                if (height[right] >= rightMax) rightMax = height[right];\n                else water += rightMax - height[right];\n                right--;\n            }\n        }\n        return water;\n    }\n}"
    },
    hints: "Use two pointers from both ends. Water trapped at each position depends on the minimum of max heights on both sides minus current height."
  },
  {
    title: "N-Queens",
    description: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.\n\nGiven an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order.\n\nEach solution contains a distinct board configuration of the n-queens' placement, where 'Q' and '.' both indicate a queen and an empty space, respectively.",
    difficulty: "HARD",
    tags: ["Array", "Backtracking"],
    examples: [
      { input: "n = 4", output: "[[\".Q..\",\"...Q\",\"Q...\",\"..Q.\"],[\"..Q.\",\"Q...\",\"...Q\",\".Q..\"]]", explanation: "There exist two distinct solutions to the 4-queens puzzle." },
      { input: "n = 1", output: "[[\"Q\"]]" }
    ],
    constraints: "1 <= n <= 9",
    testCases: [
      { input: "4", output: "2" },
      { input: "1", output: "1" },
      { input: "8", output: "92" }
    ],
    codeSnippet: {
      JAVASCRIPT: "function solveNQueens(n) {\n  // Your code here\n}",
      PYTHON: "def solveNQueens(n):\n    # Your code here\n    pass",
      JAVA: "class Solution {\n    public List<List<String>> solveNQueens(int n) {\n        // Your code here\n    }\n}"
    },
    referenceSolution: {
      JAVASCRIPT: "function solveNQueens(n) {\n  const solutions = [];\n  const board = Array(n).fill().map(() => Array(n).fill('.'));\n  const cols = new Set(), diag1 = new Set(), diag2 = new Set();\n  function backtrack(row) {\n    if (row === n) {\n      solutions.push(board.map(r => r.join('')));\n      return;\n    }\n    for (let col = 0; col < n; col++) {\n      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) continue;\n      board[row][col] = 'Q';\n      cols.add(col); diag1.add(row - col); diag2.add(row + col);\n      backtrack(row + 1);\n      board[row][col] = '.';\n      cols.delete(col); diag1.delete(row - col); diag2.delete(row + col);\n    }\n  }\n  backtrack(0);\n  return solutions;\n}",
      PYTHON: "def solveNQueens(n):\n    solutions = []\n    cols, diag1, diag2 = set(), set(), set()\n    board = [['.' for _ in range(n)] for _ in range(n)]\n    def backtrack(row):\n        if row == n:\n            solutions.append([''.join(r) for r in board])\n            return\n        for col in range(n):\n            if col in cols or row - col in diag1 or row + col in diag2: continue\n            board[row][col] = 'Q'\n            cols.add(col); diag1.add(row - col); diag2.add(row + col)\n            backtrack(row + 1)\n            board[row][col] = '.'\n            cols.remove(col); diag1.remove(row - col); diag2.remove(row + col)\n    backtrack(0)\n    return solutions",
      JAVA: "class Solution {\n    List<List<String>> solutions = new ArrayList<>();\n    public List<List<String>> solveNQueens(int n) {\n        char[][] board = new char[n][n];\n        for (char[] row : board) Arrays.fill(row, '.');\n        backtrack(board, 0, new HashSet<>(), new HashSet<>(), new HashSet<>());\n        return solutions;\n    }\n    void backtrack(char[][] board, int row, Set<Integer> cols, Set<Integer> d1, Set<Integer> d2) {\n        if (row == board.length) {\n            List<String> sol = new ArrayList<>();\n            for (char[] r : board) sol.add(new String(r));\n            solutions.add(sol);\n            return;\n        }\n        for (int col = 0; col < board.length; col++) {\n            if (cols.contains(col) || d1.contains(row - col) || d2.contains(row + col)) continue;\n            board[row][col] = 'Q';\n            cols.add(col); d1.add(row - col); d2.add(row + col);\n            backtrack(board, row + 1, cols, d1, d2);\n            board[row][col] = '.';\n            cols.remove(col); d1.remove(row - col); d2.remove(row + col);\n        }\n    }\n}"
    },
    hints: "Use backtracking. Track which columns and diagonals are already attacked using sets."
  },
  {
    title: "Largest Rectangle in Histogram",
    description: "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
    difficulty: "HARD",
    tags: ["Array", "Stack", "Monotonic Stack"],
    examples: [
      { input: "heights = [2,1,5,6,2,3]", output: "10", explanation: "The largest rectangle has an area = 10 units (formed by heights 5 and 6)." },
      { input: "heights = [2,4]", output: "4" }
    ],
    constraints: "1 <= heights.length <= 10^5\n0 <= heights[i] <= 10^4",
    testCases: [
      { input: "2,1,5,6,2,3", output: "10" },
      { input: "2,4", output: "4" },
      { input: "1", output: "1" },
      { input: "2,1,2", output: "3" }
    ],
    codeSnippet: {
      JAVASCRIPT: "function largestRectangleArea(heights) {\n  // Your code here\n}",
      PYTHON: "def largestRectangleArea(heights):\n    # Your code here\n    pass",
      JAVA: "class Solution {\n    public int largestRectangleArea(int[] heights) {\n        // Your code here\n    }\n}"
    },
    referenceSolution: {
      JAVASCRIPT: "function largestRectangleArea(heights) {\n  const stack = [-1];\n  let maxArea = 0;\n  for (let i = 0; i < heights.length; i++) {\n    while (stack[stack.length - 1] !== -1 && heights[stack[stack.length - 1]] >= heights[i]) {\n      const h = heights[stack.pop()];\n      const w = i - stack[stack.length - 1] - 1;\n      maxArea = Math.max(maxArea, h * w);\n    }\n    stack.push(i);\n  }\n  while (stack[stack.length - 1] !== -1) {\n    const h = heights[stack.pop()];\n    const w = heights.length - stack[stack.length - 1] - 1;\n    maxArea = Math.max(maxArea, h * w);\n  }\n  return maxArea;\n}",
      PYTHON: "def largestRectangleArea(heights):\n    stack = [-1]\n    max_area = 0\n    for i, h in enumerate(heights):\n        while stack[-1] != -1 and heights[stack[-1]] >= h:\n            height = heights[stack.pop()]\n            width = i - stack[-1] - 1\n            max_area = max(max_area, height * width)\n        stack.append(i)\n    while stack[-1] != -1:\n        height = heights[stack.pop()]\n        width = len(heights) - stack[-1] - 1\n        max_area = max(max_area, height * width)\n    return max_area",
      JAVA: "class Solution {\n    public int largestRectangleArea(int[] heights) {\n        Stack<Integer> stack = new Stack<>();\n        stack.push(-1);\n        int maxArea = 0;\n        for (int i = 0; i < heights.length; i++) {\n            while (stack.peek() != -1 && heights[stack.peek()] >= heights[i]) {\n                int h = heights[stack.pop()];\n                int w = i - stack.peek() - 1;\n                maxArea = Math.max(maxArea, h * w);\n            }\n            stack.push(i);\n        }\n        while (stack.peek() != -1) {\n            int h = heights[stack.pop()];\n            int w = heights.length - stack.peek() - 1;\n            maxArea = Math.max(maxArea, h * w);\n        }\n        return maxArea;\n    }\n}"
    },
    hints: "Use a monotonic stack. For each bar, find the first smaller bar on left and right to calculate the max width."
  },
  {
    title: "Word Ladder",
    description: "A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that:\n\n- Every adjacent pair of words differs by a single letter.\n- Every si for 1 <= i <= k is in wordList. Note that beginWord does not need to be in wordList.\n- sk == endWord\n\nGiven two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.",
    difficulty: "HARD",
    tags: ["Hash Table", "String", "BFS"],
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: "5", explanation: 'One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog"' },
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: "0", explanation: "The endWord 'cog' is not in wordList" }
    ],
    constraints: "1 <= beginWord.length <= 10\nendWord.length == beginWord.length\n1 <= wordList.length <= 5000\nwordList[i].length == beginWord.length\nbeginWord, endWord, and wordList[i] consist of lowercase English letters.\nbeginWord != endWord\nAll the words in wordList are unique.",
    testCases: [
      { input: "hit\ncog\nhot,dot,dog,lot,log,cog", output: "5" },
      { input: "hit\ncog\nhot,dot,dog,lot,log", output: "0" },
      { input: "a\nc\na,b,c", output: "2" }
    ],
    codeSnippet: {
      JAVASCRIPT: "function ladderLength(beginWord, endWord, wordList) {\n  // Your code here\n}",
      PYTHON: "def ladderLength(beginWord, endWord, wordList):\n    # Your code here\n    pass",
      JAVA: "class Solution {\n    public int ladderLength(String beginWord, String endWord, List<String> wordList) {\n        // Your code here\n    }\n}"
    },
    referenceSolution: {
      JAVASCRIPT: "function ladderLength(beginWord, endWord, wordList) {\n  const wordSet = new Set(wordList);\n  if (!wordSet.has(endWord)) return 0;\n  const queue = [[beginWord, 1]];\n  const visited = new Set([beginWord]);\n  while (queue.length) {\n    const [word, steps] = queue.shift();\n    if (word === endWord) return steps;\n    for (let i = 0; i < word.length; i++) {\n      for (let c = 97; c <= 122; c++) {\n        const newWord = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);\n        if (wordSet.has(newWord) && !visited.has(newWord)) {\n          visited.add(newWord);\n          queue.push([newWord, steps + 1]);\n        }\n      }\n    }\n  }\n  return 0;\n}",
      PYTHON: "def ladderLength(beginWord, endWord, wordList):\n    from collections import deque\n    wordSet = set(wordList)\n    if endWord not in wordSet: return 0\n    queue = deque([(beginWord, 1)])\n    visited = {beginWord}\n    while queue:\n        word, steps = queue.popleft()\n        if word == endWord: return steps\n        for i in range(len(word)):\n            for c in 'abcdefghijklmnopqrstuvwxyz':\n                newWord = word[:i] + c + word[i+1:]\n                if newWord in wordSet and newWord not in visited:\n                    visited.add(newWord)\n                    queue.append((newWord, steps + 1))\n    return 0",
      JAVA: "class Solution {\n    public int ladderLength(String beginWord, String endWord, List<String> wordList) {\n        Set<String> wordSet = new HashSet<>(wordList);\n        if (!wordSet.contains(endWord)) return 0;\n        Queue<String> queue = new LinkedList<>();\n        queue.offer(beginWord);\n        Set<String> visited = new HashSet<>();\n        visited.add(beginWord);\n        int steps = 1;\n        while (!queue.isEmpty()) {\n            int size = queue.size();\n            for (int i = 0; i < size; i++) {\n                String word = queue.poll();\n                if (word.equals(endWord)) return steps;\n                char[] chars = word.toCharArray();\n                for (int j = 0; j < chars.length; j++) {\n                    char original = chars[j];\n                    for (char c = 'a'; c <= 'z'; c++) {\n                        chars[j] = c;\n                        String newWord = new String(chars);\n                        if (wordSet.contains(newWord) && !visited.contains(newWord)) {\n                            visited.add(newWord);\n                            queue.offer(newWord);\n                        }\n                    }\n                    chars[j] = original;\n                }\n            }\n            steps++;\n        }\n        return 0;\n    }\n}"
    },
    hints: "Use BFS to find the shortest path. Generate all possible one-letter transformations and check if they exist in the word list."
  },
  {
    title: "Serialize and Deserialize Binary Tree",
    description: "Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment.\n\nDesign an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.",
    difficulty: "HARD",
    tags: ["String", "Tree", "DFS", "BFS", "Binary Tree", "Design"],
    examples: [
      { input: "root = [1,2,3,null,null,4,5]", output: "[1,2,3,null,null,4,5]" },
      { input: "root = []", output: "[]" }
    ],
    constraints: "The number of nodes in the tree is in the range [0, 10^4].\n-1000 <= Node.val <= 1000",
    testCases: [
      { input: "1,2,3,null,null,4,5", output: "1,2,3,null,null,4,5" },
      { input: "", output: "" },
      { input: "1", output: "1" }
    ],
    codeSnippet: {
      JAVASCRIPT: "function serialize(root) {\n  // Your code here\n}\n\nfunction deserialize(data) {\n  // Your code here\n}",
      PYTHON: "class Codec:\n    def serialize(self, root):\n        # Your code here\n        pass\n    \n    def deserialize(self, data):\n        # Your code here\n        pass",
      JAVA: "public class Codec {\n    public String serialize(TreeNode root) {\n        // Your code here\n    }\n    \n    public TreeNode deserialize(String data) {\n        // Your code here\n    }\n}"
    },
    referenceSolution: {
      JAVASCRIPT: "function serialize(root) {\n  if (!root) return 'null';\n  return root.val + ',' + serialize(root.left) + ',' + serialize(root.right);\n}\n\nfunction deserialize(data) {\n  const vals = data.split(',');\n  let idx = 0;\n  function build() {\n    const val = vals[idx++];\n    if (val === 'null') return null;\n    const node = { val: parseInt(val), left: null, right: null };\n    node.left = build();\n    node.right = build();\n    return node;\n  }\n  return build();\n}",
      PYTHON: "class Codec:\n    def serialize(self, root):\n        def dfs(node):\n            if not node: return 'null,'\n            return str(node.val) + ',' + dfs(node.left) + dfs(node.right)\n        return dfs(root)\n    \n    def deserialize(self, data):\n        vals = iter(data.split(','))\n        def build():\n            val = next(vals)\n            if val == 'null': return None\n            node = TreeNode(int(val))\n            node.left = build()\n            node.right = build()\n            return node\n        return build()",
      JAVA: "public class Codec {\n    public String serialize(TreeNode root) {\n        if (root == null) return \"null\";\n        return root.val + \",\" + serialize(root.left) + \",\" + serialize(root.right);\n    }\n    \n    int idx = 0;\n    public TreeNode deserialize(String data) {\n        String[] vals = data.split(\",\");\n        idx = 0;\n        return build(vals);\n    }\n    \n    TreeNode build(String[] vals) {\n        String val = vals[idx++];\n        if (val.equals(\"null\")) return null;\n        TreeNode node = new TreeNode(Integer.parseInt(val));\n        node.left = build(vals);\n        node.right = build(vals);\n        return node;\n    }\n}"
    },
    hints: "Use preorder traversal for serialization. Include null markers to reconstruct the tree structure."
  },
  {
    title: "Longest Valid Parentheses",
    description: "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
    difficulty: "HARD",
    tags: ["String", "Dynamic Programming", "Stack"],
    examples: [
      { input: 's = "(()"', output: "2", explanation: "The longest valid parentheses substring is \"()\"." },
      { input: 's = ")()())"', output: "4", explanation: "The longest valid parentheses substring is \"()()\"." },
      { input: 's = ""', output: "0" }
    ],
    constraints: "0 <= s.length <= 3 * 10^4\ns[i] is '(' or ')'.",
    testCases: [
      { input: "(()", output: "2" },
      { input: ")()())", output: "4" },
      { input: "", output: "0" },
      { input: "()()", output: "4" },
      { input: "()(()", output: "2" }
    ],
    codeSnippet: {
      JAVASCRIPT: "function longestValidParentheses(s) {\n  // Your code here\n}",
      PYTHON: "def longestValidParentheses(s):\n    # Your code here\n    pass",
      JAVA: "class Solution {\n    public int longestValidParentheses(String s) {\n        // Your code here\n    }\n}"
    },
    referenceSolution: {
      JAVASCRIPT: "function longestValidParentheses(s) {\n  const stack = [-1];\n  let maxLen = 0;\n  for (let i = 0; i < s.length; i++) {\n    if (s[i] === '(') stack.push(i);\n    else {\n      stack.pop();\n      if (stack.length === 0) stack.push(i);\n      else maxLen = Math.max(maxLen, i - stack[stack.length - 1]);\n    }\n  }\n  return maxLen;\n}",
      PYTHON: "def longestValidParentheses(s):\n    stack = [-1]\n    max_len = 0\n    for i, c in enumerate(s):\n        if c == '(': stack.append(i)\n        else:\n            stack.pop()\n            if not stack: stack.append(i)\n            else: max_len = max(max_len, i - stack[-1])\n    return max_len",
      JAVA: "class Solution {\n    public int longestValidParentheses(String s) {\n        Stack<Integer> stack = new Stack<>();\n        stack.push(-1);\n        int maxLen = 0;\n        for (int i = 0; i < s.length(); i++) {\n            if (s.charAt(i) == '(') stack.push(i);\n            else {\n                stack.pop();\n                if (stack.isEmpty()) stack.push(i);\n                else maxLen = Math.max(maxLen, i - stack.peek());\n            }\n        }\n        return maxLen;\n    }\n}"
    },
    hints: "Use a stack to track indices. The base of the stack represents the last unmatched ')' position."
  }
];
