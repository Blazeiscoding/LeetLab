// Additional problems - Part 2 (problems 6-15)
export default [
  {
    title: "Best Time to Buy and Sell Stock",
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    difficulty: "EASY",
    tags: ["Array", "Dynamic Programming"],
    examples: [{ input: "[7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6)" }],
    constraints: "1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
    testCases: [{ input: "7,1,5,3,6,4", output: "5" }, { input: "7,6,4,3,1", output: "0" }],
    codeSnippet: { JAVASCRIPT: "function maxProfit(prices) {\n  // Your code here\n}", PYTHON: "def maxProfit(prices):\n    pass", JAVA: "class Solution {\n    public int maxProfit(int[] prices) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function maxProfit(prices) {\n  let minPrice = Infinity, maxProfit = 0;\n  for (let price of prices) {\n    minPrice = Math.min(minPrice, price);\n    maxProfit = Math.max(maxProfit, price - minPrice);\n  }\n  return maxProfit;\n}", PYTHON: "def maxProfit(prices):\n    min_price = float('inf')\n    max_profit = 0\n    for price in prices:\n        min_price = min(min_price, price)\n        max_profit = max(max_profit, price - min_price)\n    return max_profit", JAVA: "class Solution {\n    public int maxProfit(int[] prices) {\n        int minPrice = Integer.MAX_VALUE, maxProfit = 0;\n        for (int price : prices) {\n            minPrice = Math.min(minPrice, price);\n            maxProfit = Math.max(maxProfit, price - minPrice);\n        }\n        return maxProfit;\n    }\n}" }
  },
  {
    title: "Contains Duplicate",
    description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    difficulty: "EASY",
    tags: ["Array", "Hash Table", "Sorting"],
    examples: [{ input: "[1,2,3,1]", output: "true" }, { input: "[1,2,3,4]", output: "false" }],
    constraints: "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
    testCases: [{ input: "1,2,3,1", output: "true" }, { input: "1,2,3,4", output: "false" }],
    codeSnippet: { JAVASCRIPT: "function containsDuplicate(nums) {\n  // Your code here\n}", PYTHON: "def containsDuplicate(nums):\n    pass", JAVA: "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function containsDuplicate(nums) {\n  return new Set(nums).size !== nums.length;\n}", PYTHON: "def containsDuplicate(nums):\n    return len(set(nums)) != len(nums)", JAVA: "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        Set<Integer> set = new HashSet<>();\n        for (int n : nums) if (!set.add(n)) return true;\n        return false;\n    }\n}" }
  },
  {
    title: "Product of Array Except Self",
    description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.",
    difficulty: "MEDIUM",
    tags: ["Array", "Prefix Sum"],
    examples: [{ input: "[1,2,3,4]", output: "[24,12,8,6]" }, { input: "[-1,1,0,-3,3]", output: "[0,0,9,0,0]" }],
    constraints: "2 <= nums.length <= 10^5\n-30 <= nums[i] <= 30",
    testCases: [{ input: "1,2,3,4", output: "24,12,8,6" }, { input: "-1,1,0,-3,3", output: "0,0,9,0,0" }],
    codeSnippet: { JAVASCRIPT: "function productExceptSelf(nums) {\n  // Your code here\n}", PYTHON: "def productExceptSelf(nums):\n    pass", JAVA: "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function productExceptSelf(nums) {\n  const n = nums.length;\n  const result = new Array(n).fill(1);\n  let left = 1, right = 1;\n  for (let i = 0; i < n; i++) {\n    result[i] *= left;\n    left *= nums[i];\n  }\n  for (let i = n - 1; i >= 0; i--) {\n    result[i] *= right;\n    right *= nums[i];\n  }\n  return result;\n}", PYTHON: "def productExceptSelf(nums):\n    n = len(nums)\n    result = [1] * n\n    left = right = 1\n    for i in range(n):\n        result[i] *= left\n        left *= nums[i]\n    for i in range(n - 1, -1, -1):\n        result[i] *= right\n        right *= nums[i]\n    return result", JAVA: "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        int n = nums.length;\n        int[] result = new int[n];\n        Arrays.fill(result, 1);\n        int left = 1, right = 1;\n        for (int i = 0; i < n; i++) { result[i] *= left; left *= nums[i]; }\n        for (int i = n - 1; i >= 0; i--) { result[i] *= right; right *= nums[i]; }\n        return result;\n    }\n}" }
  },
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    difficulty: "EASY",
    tags: ["String", "Stack"],
    examples: [{ input: '"()"', output: "true" }, { input: '"()[]{}"', output: "true" }, { input: '"(]"', output: "false" }],
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
    testCases: [{ input: "()", output: "true" }, { input: "()[]{}", output: "true" }, { input: "(]", output: "false" }],
    codeSnippet: { JAVASCRIPT: "function isValid(s) {\n  // Your code here\n}", PYTHON: "def isValid(s):\n    pass", JAVA: "class Solution {\n    public boolean isValid(String s) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function isValid(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n  for (let c of s) {\n    if (c in map) {\n      if (stack.pop() !== map[c]) return false;\n    } else stack.push(c);\n  }\n  return stack.length === 0;\n}", PYTHON: "def isValid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for c in s:\n        if c in mapping:\n            if not stack or stack.pop() != mapping[c]: return False\n        else: stack.append(c)\n    return len(stack) == 0", JAVA: "class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}" }
  },
  {
    title: "Merge Two Sorted Lists",
    description: "You are given the heads of two sorted linked lists list1 and list2.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
    difficulty: "EASY",
    tags: ["Linked List", "Recursion"],
    examples: [{ input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" }],
    constraints: "The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100",
    testCases: [{ input: "1,2,4\n1,3,4", output: "1,1,2,3,4,4" }, { input: "\n", output: "" }, { input: "\n0", output: "0" }],
    codeSnippet: { JAVASCRIPT: "function mergeTwoLists(list1, list2) {\n  // Your code here\n}", PYTHON: "def mergeTwoLists(list1, list2):\n    pass", JAVA: "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function mergeTwoLists(l1, l2) {\n  if (!l1) return l2;\n  if (!l2) return l1;\n  if (l1.val < l2.val) {\n    l1.next = mergeTwoLists(l1.next, l2);\n    return l1;\n  } else {\n    l2.next = mergeTwoLists(l1, l2.next);\n    return l2;\n  }\n}", PYTHON: "def mergeTwoLists(l1, l2):\n    if not l1: return l2\n    if not l2: return l1\n    if l1.val < l2.val:\n        l1.next = mergeTwoLists(l1.next, l2)\n        return l1\n    else:\n        l2.next = mergeTwoLists(l1, l2.next)\n        return l2", JAVA: "class Solution {\n    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {\n        if (l1 == null) return l2;\n        if (l2 == null) return l1;\n        if (l1.val < l2.val) { l1.next = mergeTwoLists(l1.next, l2); return l1; }\n        else { l2.next = mergeTwoLists(l1, l2.next); return l2; }\n    }\n}" }
  },
  {
    title: "Linked List Cycle",
    description: "Given head, the head of a linked list, determine if the linked list has a cycle in it.\n\nThere is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer.",
    difficulty: "EASY",
    tags: ["Hash Table", "Linked List", "Two Pointers"],
    examples: [{ input: "head = [3,2,0,-4], pos = 1", output: "true", explanation: "There is a cycle where tail connects to node index 1" }],
    constraints: "The number of the nodes in the list is in the range [0, 10^4].\n-10^5 <= Node.val <= 10^5",
    testCases: [{ input: "3,2,0,-4\n1", output: "true" }, { input: "1,2\n0", output: "true" }, { input: "1\n-1", output: "false" }],
    codeSnippet: { JAVASCRIPT: "function hasCycle(head) {\n  // Your code here\n}", PYTHON: "def hasCycle(head):\n    pass", JAVA: "public class Solution {\n    public boolean hasCycle(ListNode head) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function hasCycle(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) return true;\n  }\n  return false;\n}", PYTHON: "def hasCycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast: return True\n    return False", JAVA: "public class Solution {\n    public boolean hasCycle(ListNode head) {\n        ListNode slow = head, fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) return true;\n        }\n        return false;\n    }\n}" }
  },
  {
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    difficulty: "EASY",
    tags: ["Linked List", "Recursion"],
    examples: [{ input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" }, { input: "head = [1,2]", output: "[2,1]" }],
    constraints: "The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000",
    testCases: [{ input: "1,2,3,4,5", output: "5,4,3,2,1" }, { input: "1,2", output: "2,1" }, { input: "", output: "" }],
    codeSnippet: { JAVASCRIPT: "function reverseList(head) {\n  // Your code here\n}", PYTHON: "def reverseList(head):\n    pass", JAVA: "class Solution {\n    public ListNode reverseList(ListNode head) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}", PYTHON: "def reverseList(head):\n    prev, curr = None, head\n    while curr:\n        next_node = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_node\n    return prev", JAVA: "class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null, curr = head;\n        while (curr != null) {\n            ListNode next = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;\n    }\n}" }
  },
  {
    title: "Binary Search",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    difficulty: "EASY",
    tags: ["Array", "Binary Search"],
    examples: [{ input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" }, { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" }],
    constraints: "1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll the integers in nums are unique.\nnums is sorted in ascending order.",
    testCases: [{ input: "-1,0,3,5,9,12\n9", output: "4" }, { input: "-1,0,3,5,9,12\n2", output: "-1" }],
    codeSnippet: { JAVASCRIPT: "function search(nums, target) {\n  // Your code here\n}", PYTHON: "def search(nums, target):\n    pass", JAVA: "class Solution {\n    public int search(int[] nums, int target) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function search(nums, target) {\n  let left = 0, right = nums.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}", PYTHON: "def search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target: return mid\n        if nums[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1", JAVA: "class Solution {\n    public int search(int[] nums, int target) {\n        int left = 0, right = nums.length - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n}" }
  },
  {
    title: "Invert Binary Tree",
    description: "Given the root of a binary tree, invert the tree, and return its root.",
    difficulty: "EASY",
    tags: ["Tree", "DFS", "BFS", "Binary Tree"],
    examples: [{ input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" }],
    constraints: "The number of nodes in the tree is in the range [0, 100].\n-100 <= Node.val <= 100",
    testCases: [{ input: "4,2,7,1,3,6,9", output: "4,7,2,9,6,3,1" }, { input: "2,1,3", output: "2,3,1" }, { input: "", output: "" }],
    codeSnippet: { JAVASCRIPT: "function invertTree(root) {\n  // Your code here\n}", PYTHON: "def invertTree(root):\n    pass", JAVA: "class Solution {\n    public TreeNode invertTree(TreeNode root) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function invertTree(root) {\n  if (!root) return null;\n  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];\n  return root;\n}", PYTHON: "def invertTree(root):\n    if not root: return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root", JAVA: "class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        TreeNode temp = root.left;\n        root.left = invertTree(root.right);\n        root.right = invertTree(temp);\n        return root;\n    }\n}" }
  },
  {
    title: "Maximum Depth of Binary Tree",
    description: "Given the root of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    difficulty: "EASY",
    tags: ["Tree", "DFS", "BFS", "Binary Tree"],
    examples: [{ input: "root = [3,9,20,null,null,15,7]", output: "3" }, { input: "root = [1,null,2]", output: "2" }],
    constraints: "The number of nodes in the tree is in the range [0, 10^4].\n-100 <= Node.val <= 100",
    testCases: [{ input: "3,9,20,null,null,15,7", output: "3" }, { input: "1,null,2", output: "2" }],
    codeSnippet: { JAVASCRIPT: "function maxDepth(root) {\n  // Your code here\n}", PYTHON: "def maxDepth(root):\n    pass", JAVA: "class Solution {\n    public int maxDepth(TreeNode root) {\n    }\n}" },
    referenceSolution: { JAVASCRIPT: "function maxDepth(root) {\n  if (!root) return 0;\n  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}", PYTHON: "def maxDepth(root):\n    if not root: return 0\n    return 1 + max(maxDepth(root.left), maxDepth(root.right))", JAVA: "class Solution {\n    public int maxDepth(TreeNode root) {\n        if (root == null) return 0;\n        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n    }\n}" }
  }
];
