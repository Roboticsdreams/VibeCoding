import json
import os
import random
import json

# Question templates by topic - default templates
QUESTION_TEMPLATES = {
    'java_core': [
        {
            'question': 'Explain the difference between an interface and an abstract class in Java. When would you use one over the other?',
            'difficulty': 'intermediate',
            'expected_answer': 'An abstract class can have implemented methods while interfaces have only method signatures (pre-Java 8). Abstract classes allow for constructor creation and state maintenance through instance variables, while interfaces don\'t. Use abstract classes for "is-a" relationships with common code, and interfaces for unrelated classes that need to implement common behavior.'
        },
    ],
    'design_patterns': [
        {
            'question': 'Explain the Singleton design pattern and its common implementations in Java. What are the advantages and disadvantages?',
            'difficulty': 'intermediate',
            'expected_answer': 'The Singleton pattern ensures a class has only one instance with global access point. Common implementations include: 1) Eager initialization (instance created at class loading), 2) Lazy initialization with double-checked locking, 3) Bill Pugh singleton using static inner helper class, and 4) Enum singleton (Java 5+). Advantages include controlled access to sole instance, reduced memory footprint, and avoiding global variables. Disadvantages include difficult unit testing, potential thread safety issues, and violation of single responsibility principle. In modern Java applications, dependency injection is often preferred over singletons.'
        },
        {
            'question': 'Explain the Decorator design pattern and how it differs from inheritance for extending functionality.',
            'difficulty': 'intermediate',
            'expected_answer': 'The Decorator pattern attaches additional responsibilities to objects dynamically by placing them inside wrapper objects. It consists of a Component interface, Concrete Component, Decorator abstract class, and Concrete Decorators. Unlike inheritance which adds behavior at compile time, Decorator adds behavior at runtime through composition and delegation. It follows the Open/Closed principle and avoids feature-laden classes high in the hierarchy. Java I/O streams (e.g., BufferedInputStream decorating FileInputStream) are classic examples. Decorators are preferred when you need to add responsibilities without affecting other objects, want to add removable responsibilities, or when inheritance would lead to an explosion of subclasses.'
        }
    ],
    # Add default templates for other topics
    'spring_boot': [
        {
            'question': 'Explain the concept of dependency injection in Spring Boot and how it is implemented.',
            'difficulty': 'intermediate',
            'expected_answer': 'Dependency Injection (DI) is a design pattern and core principle in Spring that allows objects to receive their dependencies rather than creating them. Spring Boot implements DI through its IoC (Inversion of Control) container, which manages beans and their dependencies. There are three main types of DI in Spring: Constructor Injection (preferred), Setter Injection, and Field Injection. DI is implemented using annotations like @Autowired, @Component, @Service, @Repository, and @Controller, or through Java configuration with @Bean methods. This approach promotes loose coupling, easier testing through mocking, and modular design.'
        }
    ],
    'microservices': [
        {
            'question': 'Compare and contrast monolithic and microservices architectures. What are the key advantages and challenges of microservices?',
            'difficulty': 'intermediate',
            'expected_answer': 'Monolithic architecture is a single, unified application where all components are tightly integrated, while microservices architecture divides an application into smaller, independent services that communicate via APIs. Advantages of microservices include: technology diversity allowing different services to use appropriate languages/frameworks, independent scaling of services based on demand, isolated failures preventing system-wide outages, focused development teams organized around business capabilities, and easier continuous deployment. Key challenges include: distributed system complexity with network latency and potential failures, data consistency across services, service coordination and discovery, monitoring distributed components, and increased operational overhead. Successful microservices implementation requires mature DevOps practices, strong API design, and careful consideration of service boundaries based on domain-driven design principles.'
        }
    ],
    'sql': [
        {
            'question': 'Explain the differences between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL JOIN in SQL with examples of when each would be appropriate.',
            'difficulty': 'intermediate',
            'expected_answer': 'INNER JOIN returns only the matching records from both tables based on the join condition. Use it when you need only complete data sets where information exists in both tables (e.g., active customers with orders). LEFT JOIN returns all records from the left table and matching records from the right table, with NULL values for non-matches. Use it when you need all records from one table regardless of whether they have corresponding records (e.g., all customers and their orders, including customers who haven\'t ordered). RIGHT JOIN returns all records from the right table and matching records from the left table. Use it when you need all records from the right table (e.g., all products and their orders, including products never ordered). FULL JOIN returns all records from both tables, with NULL values for non-matches on either side. Use it when you need all data from both tables regardless of matches (e.g., combining customer and supplier contact lists). The choice depends on whether you need complete data sets (INNER JOIN) or want to include records without matches (OUTER JOINs).'
        }
    ]
}

# Path to extended question templates file
EXTENDED_TEMPLATES_FILE = 'question_templates.json'

def load_question_templates():
    """Load and merge question templates from the default set and extended file if it exists"""
    templates = QUESTION_TEMPLATES.copy()
    
    # Try to load extended templates from file
    if os.path.exists(EXTENDED_TEMPLATES_FILE):
        try:
            with open(EXTENDED_TEMPLATES_FILE, 'r') as f:
                extended_templates = json.load(f)
            
            # Merge templates
            for topic, questions in extended_templates.items():
                if topic in templates:
                    templates[topic].extend(questions)
                else:
                    templates[topic] = questions
                    
            print(f"Loaded extended question templates for {len(extended_templates)} topics")
        except Exception as e:
            print(f"Error loading extended templates: {e}")
    
    return templates

def get_questions_by_topic(topics, difficulty, count_per_topic):
    """Get a specific number of questions for each selected topic."""
    selected_questions = []
    templates = load_question_templates()
    
    for topic in topics:
        if topic not in templates:
            print(f"Warning: No questions available for topic '{topic}'")
            continue
            
        # Filter questions by difficulty
        available_questions = [q for q in templates[topic] 
                              if q.get('difficulty') == difficulty or difficulty == 'all']
        
        # If not enough questions of the specified difficulty, include other difficulties
        if len(available_questions) < count_per_topic:
            available_questions = templates[topic]
        
        # Skip if still no questions available
        if not available_questions:
            continue
        
        # Randomly select questions
        selected = random.sample(available_questions, min(count_per_topic, len(available_questions)))
        for q in selected:
            selected_questions.append({
                'category': topic,
                'question': q['question'],
                'expected_answer': q.get('expected_answer', 'No expected answer provided.')
            })
    
    # Shuffle questions from different topics
    random.shuffle(selected_questions)
    return selected_questions

def generate_questions(topics, difficulty, duration):
    """Generate appropriate number of questions based on topics and duration."""
    if not topics:
        return []
        
    # Calculate number of questions based on duration (approx 2.5-3 minutes per question)
    total_questions = max(4, min(int(duration / 3), 15))
    
    # Calculate questions per topic
    count_per_topic = max(1, total_questions // len(topics))
    
    return get_questions_by_topic(topics, difficulty, count_per_topic)

# Create a function to generate a template file with example questions
def generate_template_file():
    """Generate a template file with example questions if it doesn't exist"""
    if not os.path.exists(EXTENDED_TEMPLATES_FILE):
        example = {
            "react": [
                {
                    "question": "Explain React's Virtual DOM and how it improves performance.",
                    "difficulty": "intermediate",
                    "expected_answer": "React's Virtual DOM is an in-memory representation of the real DOM. When state changes, React creates a new Virtual DOM tree, compares it with the previous one (diffing), and updates only the necessary parts of the actual DOM. This approach minimizes direct DOM manipulation, which is expensive, and batches updates for better performance. The reconciliation process (finding differences) uses heuristics to achieve O(n) complexity rather than O(n³). By updating only what has changed rather than re-rendering everything, React significantly improves UI performance, especially in complex applications with frequent updates."
                }
            ],
            "javascript": [
                {
                    "question": "Explain the event loop in JavaScript and how it handles asynchronous operations.",
                    "difficulty": "advanced",
                    "expected_answer": "JavaScript's event loop is a mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded. It works by processing pending tasks from the task queue only when the call stack is empty. The process involves: 1) When an asynchronous operation (like setTimeout, fetch, or event listener) occurs, it's handed off to the browser's Web APIs, freeing up the call stack; 2) Once completed, the callback is placed in the task queue; 3) The event loop continuously checks if the call stack is empty, and if so, moves the first task from the queue to the stack for execution. Promises use a separate microtask queue which has priority over the regular task queue. This architecture allows JavaScript to handle I/O operations efficiently without freezing the UI, making it ideal for web applications. Understanding the event loop is crucial for managing asynchronous code flow and avoiding performance bottlenecks."
                }
            ]
        }
        
        with open(EXTENDED_TEMPLATES_FILE, 'w') as f:
            json.dump(example, f, indent=2)
        
        print(f"Created template file: {EXTENDED_TEMPLATES_FILE}")

if __name__ == "__main__":
    # Generate template file when run directly
    generate_template_file()
