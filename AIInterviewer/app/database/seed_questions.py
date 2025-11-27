"""
Seed data for question bank
Questions organized by topic with difficulty, question, and sample answer

⚠️ IMPORTANT: This file is the SINGLE SOURCE OF TRUTH for:
   - Topics: Automatically extracted from dictionary keys
   - Difficulties: Automatically extracted from question difficulty fields
   - Questions: All interview questions and sample answers

To add a new topic: Simply add a new key to SEED_QUESTIONS dictionary
To add a new difficulty: Use it in any question, it will be auto-created
To add questions: Add objects to the topic's array

The database initialization (database.py) will automatically:
1. Create Topic entries for all keys in SEED_QUESTIONS
2. Create Difficulty entries for all unique difficulty values
3. Seed all questions from this structure
"""

SEED_QUESTIONS = {
    "Python": [
        {
            "difficulty": "Easy",
            "question": "What are the key differences between lists and tuples in Python?",
            "answer": "Lists are mutable (can be modified) while tuples are immutable. Lists use [] and tuples use (). Lists have more methods like append(). Tuples are faster and use less memory."
        },
        {
            "difficulty": "Easy",
            "question": "Explain what Python's GIL (Global Interpreter Lock) is and its impact.",
            "answer": "The GIL is a mutex that prevents multiple threads from executing Python bytecode simultaneously. This limits parallelism for CPU-bound tasks but doesn't affect I/O-bound operations."
        },
        {
            "difficulty": "Easy",
            "question": "What is the difference between == and is operators in Python?",
            "answer": "== checks for value equality while is checks for identity (same object in memory). Example: [1,2] == [1,2] is True but [1,2] is [1,2] is False."
        },
        {
            "difficulty": "Medium",
            "question": "Explain the concept of generators in Python and their advantages.",
            "answer": "Generators use yield to produce values lazily. They're memory-efficient as they don't store entire sequences, maintain state between calls, and are great for large datasets or infinite sequences."
        },
        {
            "difficulty": "Medium",
            "question": "What are context managers and how do you implement one?",
            "answer": "Context managers handle resources using 'with' statements. Implement __enter__ and __exit__ methods, or use @contextmanager decorator with yield."
        },
        {
            "difficulty": "Hard",
            "question": "Explain how Python's asyncio works and when you would use it.",
            "answer": "asyncio provides single-threaded concurrency using event loops and coroutines with async/await. Best for I/O-bound tasks like network/database operations, not for CPU-bound tasks."
        },
        {
            "difficulty": "Hard",
            "question": "How would you optimize a Python application for performance?",
            "answer": "Profile code first, use appropriate data structures, leverage NumPy/Pandas, implement caching, use generators for large data, consider Cython/PyPy, use multiprocessing for CPU-bound tasks."
        }
    ],
    
    "JavaScript": [
        {
            "difficulty": "Easy",
            "question": "What is the difference between var, let, and const in JavaScript?",
            "answer": "var is function-scoped and can be redeclared. let is block-scoped and can be reassigned. const is block-scoped and cannot be reassigned (but objects/arrays can be mutated)."
        },
        {
            "difficulty": "Easy",
            "question": "Explain what closures are in JavaScript.",
            "answer": "Closures are functions that have access to variables from their outer (enclosing) scope, even after the outer function has returned. They 'remember' their lexical environment."
        },
        {
            "difficulty": "Easy",
            "question": "What is the difference between == and === operators?",
            "answer": "== performs type coercion before comparison (loose equality), while === checks both value and type without coercion (strict equality). Always prefer === for predictable behavior."
        },
        {
            "difficulty": "Medium",
            "question": "Explain the concept of promises and async/await.",
            "answer": "Promises represent future values with states: pending, fulfilled, rejected. async/await is syntactic sugar over promises, making asynchronous code look synchronous and easier to read/debug."
        },
        {
            "difficulty": "Medium",
            "question": "What is the prototype chain in JavaScript?",
            "answer": "Objects inherit properties from their prototypes, forming a chain. When accessing a property, JS searches the object, then its prototype, continuing up until found or reaching null."
        },
        {
            "difficulty": "Hard",
            "question": "Implement debounce and throttle functions from scratch.",
            "answer": "Debounce delays execution until after a wait period of inactivity. Throttle executes at most once per specified time period. Both control function execution rate for performance optimization."
        },
        {
            "difficulty": "Hard",
            "question": "Explain memory leaks in JavaScript and how to prevent them.",
            "answer": "Common causes: forgotten timers, closures retaining large objects, detached DOM nodes, global variables. Prevent by clearing timers, careful closure usage, WeakMap/WeakSet, proper event listener cleanup."
        }
    ],
    
    "Java": [
        {
            "difficulty": "Easy",
            "question": "What are the main principles of OOP in Java?",
            "answer": "The four main principles are: Encapsulation (data hiding), Inheritance (code reuse), Polymorphism (one interface, multiple implementations), and Abstraction (hiding complexity)."
        },
        {
            "difficulty": "Easy",
            "question": "Explain the difference between abstract classes and interfaces.",
            "answer": "Abstract classes can have both abstract and concrete methods, constructors, and instance variables. Interfaces (Java 8+) can have default/static methods but primarily define contracts. A class can implement multiple interfaces but extend only one class."
        },
        {
            "difficulty": "Easy",
            "question": "What is the difference between ArrayList and LinkedList?",
            "answer": "ArrayList uses dynamic arrays (fast random access O(1), slow insertion/deletion). LinkedList uses doubly-linked nodes (slow random access O(n), fast insertion/deletion at ends O(1))."
        },
        {
            "difficulty": "Medium",
            "question": "Explain Java's memory management and garbage collection.",
            "answer": "Java uses automatic memory management with heap (objects) and stack (primitives, references). GC automatically reclaims unused objects. Types: Serial, Parallel, CMS, G1. Triggers based on memory pressure."
        },
        {
            "difficulty": "Medium",
            "question": "What are Java Streams and how do you use them?",
            "answer": "Streams are sequences of elements supporting functional operations (filter, map, reduce). They enable declarative data processing, lazy evaluation, and easy parallelization with parallel streams."
        },
        {
            "difficulty": "Hard",
            "question": "Explain the JVM architecture and how Java code executes.",
            "answer": "JVM has: Class Loader (loads .class files), Runtime Data Areas (heap, stack, method area), Execution Engine (interpreter + JIT compiler). Code flows: .java → .class (bytecode) → JVM → machine code."
        },
        {
            "difficulty": "Hard",
            "question": "Implement a thread-safe singleton in Java.",
            "answer": "Best approaches: 1) Bill Pugh (static inner class - lazy + thread-safe), 2) Enum (simplest), 3) Double-checked locking with volatile, 4) Synchronized method (simple but slower)."
        }
    ],
    
    "SQL": [
        {
            "difficulty": "Easy",
            "question": "What is the difference between INNER JOIN and OUTER JOIN?",
            "answer": "INNER JOIN returns only matching rows from both tables. OUTER JOIN returns matching rows plus unmatched rows from one (LEFT/RIGHT) or both (FULL) tables, filling with NULLs."
        },
        {
            "difficulty": "Easy",
            "question": "Explain what a primary key and foreign key are.",
            "answer": "Primary key uniquely identifies each row in a table (unique, not null). Foreign key is a field that references the primary key of another table, establishing relationships between tables."
        },
        {
            "difficulty": "Easy",
            "question": "What is the difference between WHERE and HAVING clauses?",
            "answer": "WHERE filters rows before grouping (used with individual rows). HAVING filters after grouping (used with aggregate functions like COUNT, SUM on grouped data)."
        },
        {
            "difficulty": "Medium",
            "question": "What are database normalization and its forms?",
            "answer": "Normalization eliminates redundancy. 1NF: atomic values, unique rows. 2NF: 1NF + no partial dependencies. 3NF: 2NF + no transitive dependencies. BCNF: stricter 3NF. Each level reduces redundancy and anomalies."
        },
        {
            "difficulty": "Medium",
            "question": "Explain the difference between clustered and non-clustered indexes.",
            "answer": "Clustered index determines physical data order (one per table, usually primary key). Non-clustered index has separate structure with pointers to data (multiple allowed, slower than clustered)."
        },
        {
            "difficulty": "Hard",
            "question": "Explain query execution plans and how to read them.",
            "answer": "Execution plans show how database executes queries: operations (scan/seek), join types, cost estimates, row counts. Read right-to-left, top-to-bottom. Look for table scans, missing indexes, high costs."
        },
        {
            "difficulty": "Hard",
            "question": "What are database deadlocks and how do you prevent them?",
            "answer": "Deadlocks occur when transactions wait for each other's locks. Prevent by: consistent lock order, short transactions, appropriate isolation levels, deadlock detection/retry, query optimization."
        }
    ],
    
    "React": [
        {
            "difficulty": "Easy",
            "question": "What are React components and the difference between functional and class components?",
            "answer": "Components are reusable UI pieces. Functional components are simpler functions returning JSX (modern, support hooks). Class components use ES6 classes with lifecycle methods (legacy approach)."
        },
        {
            "difficulty": "Easy",
            "question": "Explain what props and state are in React.",
            "answer": "Props are read-only data passed from parent to child components. State is mutable data managed within a component. Props flow down, state changes trigger re-renders."
        },
        {
            "difficulty": "Easy",
            "question": "What is JSX and how does it work?",
            "answer": "JSX is syntax extension allowing HTML-like code in JavaScript. It's transformed to React.createElement() calls by Babel. Combines markup and logic, improves readability, type-safe with TypeScript."
        },
        {
            "difficulty": "Medium",
            "question": "Explain useEffect hook and its use cases.",
            "answer": "useEffect handles side effects (data fetching, subscriptions, DOM manipulation). Runs after render. Dependencies array controls when it runs. Return function for cleanup. Replaces componentDidMount/Update/Unmount."
        },
        {
            "difficulty": "Medium",
            "question": "What is Context API and when would you use it?",
            "answer": "Context provides way to pass data through component tree without props drilling. Use for global data (theme, auth, locale). Alternative to Redux for simpler state management needs."
        },
        {
            "difficulty": "Hard",
            "question": "How would you optimize a React application's performance?",
            "answer": "Strategies: React.memo for component memoization, useMemo/useCallback for expensive computations, code splitting with lazy/Suspense, virtualization for long lists, proper key usage, avoiding inline functions in JSX."
        },
        {
            "difficulty": "Hard",
            "question": "Implement a custom hook for data fetching with caching.",
            "answer": "Create useFetch hook with useState for data/loading/error, useEffect for fetching, useRef for cache. Include abort controller for cleanup, handle race conditions, implement cache invalidation strategy."
        }
    ],
    
    "Data Structures": [
        {
            "difficulty": "Easy",
            "question": "What is the difference between an array and a linked list?",
            "answer": "Arrays have contiguous memory, O(1) random access, fixed size. Linked lists have scattered nodes with pointers, O(n) access, dynamic size, easier insertion/deletion but extra memory for pointers."
        },
        {
            "difficulty": "Easy",
            "question": "Explain what a stack is and provide use cases.",
            "answer": "Stack is LIFO (Last In First Out) structure with push/pop operations. Use cases: function call stack, undo mechanisms, expression evaluation, backtracking algorithms, browser history."
        },
        {
            "difficulty": "Easy",
            "question": "What is a queue and how does it differ from a stack?",
            "answer": "Queue is FIFO (First In First Out) vs Stack's LIFO. Operations: enqueue (add rear), dequeue (remove front). Use cases: task scheduling, breadth-first search, buffering, print queue."
        },
        {
            "difficulty": "Medium",
            "question": "Implement a binary search tree with insert and search operations.",
            "answer": "BST has nodes with left (smaller values) and right (larger values) children. Insert: compare and recurse. Search: O(log n) average, O(n) worst. Need balance for optimal performance."
        },
        {
            "difficulty": "Medium",
            "question": "What is a heap and how is it different from a binary search tree?",
            "answer": "Heap is complete binary tree with heap property (max/min). BST is ordered (left < parent < right). Heap: O(1) find min/max, O(log n) insert/delete. BST: O(log n) search, inorder gives sorted."
        },
        {
            "difficulty": "Hard",
            "question": "Design and implement a trie for autocomplete functionality.",
            "answer": "Trie (prefix tree) stores strings character by character. Each node has children map and isEndOfWord flag. Insert O(L), Search O(L), where L is word length. Efficient prefix matching for autocomplete."
        },
        {
            "difficulty": "Hard",
            "question": "What is a B-tree and when would you use it?",
            "answer": "B-tree is self-balancing multi-way tree optimized for disk I/O. Nodes have multiple keys and children. Used in databases and file systems for efficient range queries and minimal disk accesses."
        }
    ],
    
    "Algorithms": [
        {
            "difficulty": "Easy",
            "question": "Explain binary search and its time complexity.",
            "answer": "Binary search finds element in sorted array by repeatedly halving search space. Compare middle element, discard half. Time: O(log n). Space: O(1) iterative, O(log n) recursive. Requires sorted data."
        },
        {
            "difficulty": "Easy",
            "question": "What is the difference between BFS and DFS?",
            "answer": "BFS explores level by level using queue. DFS explores deep using stack/recursion. BFS finds shortest path, uses more memory. DFS uses less memory, better for deep trees. Both O(V+E) time."
        },
        {
            "difficulty": "Easy",
            "question": "Implement bubble sort and explain its complexity.",
            "answer": "Bubble sort repeatedly swaps adjacent elements if wrong order. Time: O(n²) worst/average, O(n) best. Space: O(1). Stable but inefficient. Educational value, not practical for large datasets."
        },
        {
            "difficulty": "Medium",
            "question": "Implement quicksort or mergesort.",
            "answer": "Quicksort: pick pivot, partition, recurse. Average O(n log n), worst O(n²), space O(log n). Mergesort: divide, sort, merge. Guaranteed O(n log n), space O(n). Mergesort stable, quicksort faster average."
        },
        {
            "difficulty": "Medium",
            "question": "Explain dynamic programming and provide an example.",
            "answer": "DP breaks problem into overlapping subproblems, stores results to avoid recomputation. Requires optimal substructure and overlapping subproblems. Example: Fibonacci, longest common subsequence, knapsack problem."
        },
        {
            "difficulty": "Hard",
            "question": "Solve the longest common subsequence problem.",
            "answer": "Use 2D DP table. dp[i][j] = length of LCS of strings up to i and j. If chars match: dp[i][j] = dp[i-1][j-1] + 1. Else: max(dp[i-1][j], dp[i][j-1]). Time: O(mn), Space: O(mn)."
        },
        {
            "difficulty": "Hard",
            "question": "Design an algorithm for finding the shortest path in a weighted graph.",
            "answer": "Dijkstra's algorithm: use priority queue, greedy approach, O((V+E) log V). For negative weights use Bellman-Ford O(VE). For all pairs use Floyd-Warshall O(V³). A* adds heuristic for faster pathfinding."
        }
    ]
}
