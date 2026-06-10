# -*- coding: utf-8 -*-
"""Generate complete NCERT/CBSE curriculum (Classes 1-12) -- 270 lessons."""
import re

CBSE_TOPICS = {
    "class_1": {
        "english": ["Alphabet", "Vowels and Consonants", "Simple Words", "Sentences", "Reading Practice"],
        "mathematics": ["Counting Numbers", "Addition", "Subtraction", "Shapes", "Measurement"],
        "evs": ["My Family", "My School", "Animals", "Plants", "Healthy Habits"],
    },
    "class_2": {
        "english": ["Nouns", "Verbs", "Opposites", "Story Reading", "Vocabulary"],
        "mathematics": ["Multiplication", "Division", "Time", "Money", "Patterns"],
        "evs": ["Food", "Water", "Transport", "Weather", "Community Helpers"],
    },
    "class_3": {
        "english": ["Grammar Basics", "Paragraph Writing", "Reading Skills", "Story Writing", "Vocabulary"],
        "mathematics": ["Fractions", "Geometry", "Measurement", "Data Handling", "Multiplication"],
        "evs": ["Human Body", "Environment", "Safety Rules", "Living Things", "Festivals"],
    },
    "class_4": {
        "english": ["Tenses", "Comprehension", "Letter Writing", "Vocabulary", "Storytelling"],
        "mathematics": ["Large Numbers", "Decimals", "Perimeter", "Area", "Factors"],
        "evs": ["Natural Resources", "Pollution", "Food and Nutrition", "Plants", "Animals"],
        "computer_science": ["Computer Basics", "Input Devices", "Output Devices", "Paint", "Internet Basics"],
    },
    "class_5": {
        "english": ["Essay Writing", "Grammar", "Poetry", "Reading Skills", "Vocabulary"],
        "mathematics": ["Percentages", "Decimals", "Geometry", "Data Handling", "Volume"],
        "evs": ["Ecosystem", "Water Conservation", "Health", "Energy Sources", "Environment"],
        "computer_science": ["MS Word", "Paint", "Internet", "Cyber Safety", "Applications"],
    },
    "class_6": {
        "english": ["Reading Skills", "Grammar", "Writing Skills", "Literature", "Vocabulary"],
        "mathematics": ["Whole Numbers", "Integers", "Fractions", "Decimals", "Algebra"],
        "science": ["Food and Nutrition", "Plants", "Human Body", "Motion", "Electricity"],
        "social_studies": ["Ancient History", "Earth and Solar System", "Maps", "Diversity", "Government"],
        "computer_science": ["Computer Components", "Operating System", "Internet", "Coding Basics", "Digital Safety"],
    },
    "class_7": {
        "english": ["Literature", "Grammar", "Writing Skills", "Reading Skills", "Vocabulary"],
        "mathematics": ["Integers", "Fractions", "Algebra", "Geometry", "Data Handling"],
        "science": ["Nutrition", "Heat", "Acids and Bases", "Respiration", "Electric Current"],
        "social_studies": ["Medieval India", "Environment", "Democracy", "Markets", "Geography"],
        "computer_science": ["Algorithms", "Flowcharts", "HTML", "Internet Security", "Programming Basics"],
    },
    "class_8": {
        "english": ["Prose", "Poetry", "Grammar", "Writing Skills", "Reading Skills"],
        "mathematics": ["Rational Numbers", "Linear Equations", "Quadrilaterals", "Statistics", "Squares and Cubes"],
        "science": ["Microorganisms", "Cells", "Force and Pressure", "Friction", "Sound"],
        "social_studies": ["Modern India", "Resources", "Constitution", "Judiciary", "Agriculture"],
        "computer_science": ["HTML", "Scratch Programming", "Data Storage", "Networks", "Cyber Security"],
    },
    "class_9": {
        "english": ["Literature", "Grammar", "Writing Skills", "Reading Skills", "Communication"],
        "mathematics": ["Number Systems", "Polynomials", "Coordinate Geometry", "Triangles", "Statistics"],
        "science": ["Motion", "Atoms and Molecules", "Cell Structure", "Gravitation", "Work and Energy"],
        "social_studies": ["French Revolution", "Democracy", "Physical Features of India", "Economics Basics", "Population"],
        "information_tech": ["Documentation", "Spreadsheets", "Cyber Ethics", "Internet Services", "Databases"],
    },
    "class_10": {
        "english": ["Literature", "Grammar", "Writing Skills", "Public Speaking", "Reading Skills"],
        "mathematics": ["Real Numbers", "Quadratic Equations", "Trigonometry", "Circles", "Probability"],
        "science": ["Chemical Reactions", "Life Processes", "Electricity", "Light", "Heredity"],
        "social_studies": ["Nationalism", "Resources", "Federalism", "Development", "Globalization"],
        "information_tech": ["Web Applications", "Databases", "Cyber Security", "Communication Skills", "Digital Citizenship"],
    },
    "class_11": {
        "english": ["Reading Skills", "Grammar", "Writing Skills", "Literature", "Vocabulary"],
        "mathematics": ["Sets", "Relations and Functions", "Trigonometry", "Complex Numbers", "Probability"],
        "physics": ["Units and Measurements", "Motion", "Laws of Motion", "Work Energy and Power", "Gravitation"],
        "chemistry": ["Basic Concepts of Chemistry", "Structure of Atom", "Chemical Bonding", "States of Matter", "Thermodynamics"],
        "biology": ["Living World", "Biological Classification", "Cell Structure", "Plant Kingdom", "Human Physiology"],
        "computer_science": ["Python Basics", "Data Types", "Conditional Statements", "Loops", "Functions"],
    },
    "class_12": {
        "english": ["Literature", "Grammar", "Writing Skills", "Prose", "Poetry"],
        "mathematics": ["Relations and Functions", "Matrices", "Differentiation", "Integration", "Probability"],
        "physics": ["Electrostatics", "Current Electricity", "Magnetism", "Optics", "Modern Physics"],
        "chemistry": ["Solutions", "Electrochemistry", "Organic Chemistry", "Biomolecules", "Polymers"],
        "biology": ["Reproduction", "Genetics", "Evolution", "Biotechnology", "Ecology"],
        "computer_science": ["Advanced Python", "SQL", "Database Management", "Data Structures", "Computer Networks"],
    },
}

SUBJECT_PREFIX = {
    "english": "eng", "mathematics": "math", "evs": "evs", "science": "sci",
    "social_studies": "sst", "computer_science": "cs", "information_tech": "it",
    "physics": "phy", "chemistry": "che", "biology": "bio",
}


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")


def _grade_num(grade: str) -> int:
    return int(grade.replace("class_", ""))


def _difficulty(grade: str) -> int:
    n = _grade_num(grade)
    if n <= 3: return 1
    if n <= 5: return 2
    if n <= 8: return 3
    if n <= 10: return 4
    return 5


def _build_explanation(topic: str, subject: str, grade: str) -> str:
    n = _grade_num(grade)
    level = "young learners" if n <= 3 else "middle school students" if n <= 6 else "secondary students" if n <= 9 else "senior students"
    labels = {
        "english": "English language learning",
        "mathematics": "mathematical thinking",
        "evs": "Environmental Studies",
        "science": "NCERT Science",
        "social_studies": "Social Studies",
        "computer_science": "Computer Science",
        "information_tech": "Information Technology",
        "physics": "Physics",
        "chemistry": "Chemistry",
        "biology": "Biology",
    }
    label = labels.get(subject, subject.replace("_", " ").title())
    return (
        f"{topic} is a key {label} topic for {level} in {grade.replace('_', ' ').title()}. "
        f"This CBSE-aligned lesson explains {topic.lower()} with clear definitions, step-by-step ideas, and practice. "
        f"You will learn why {topic.lower()} matters in exams and daily life. "
        f"Read the examples carefully, try the activity, use flashcards for revision, and test yourself with the quiz. "
        f"Mastering {topic.lower()} builds a strong foundation for the next topics in {label}."
    )


def _build_lesson(grade: str, subject: str, topic: str, index: int) -> dict:
    prefix = SUBJECT_PREFIX.get(subject, subject[:4])
    lesson_id = f"{prefix}_{grade}_{index:03d}"
    concept_id = f"{prefix}_{grade}_{_slug(topic)}"
    n = _grade_num(grade)
    explanation = _build_explanation(topic, subject, grade)

    objectives = [
        f"Understand the fundamental principles of {topic}.",
        f"Apply {topic} concepts to solve practical problems.",
        f"Recognize the importance of {topic} in Class {n} curriculum.",
        f"Connect {topic} with real-world observations and data.",
        f"Master the terminology and key definitions for {topic}."
    ]

    return {
        "id": lesson_id,
        "title": topic,
        "subject": subject,
        "grade": grade,
        "concept_id": concept_id,
        "difficulty": _difficulty(grade),
        "introduction": f"Welcome to an exciting journey into {topic}! This lesson is designed for Class {n} students following the NCERT CBSE guidelines.",
        "explanation": explanation,
        "examples": [
            {
                "problem": f"Practical Application: How does {topic} appear in your daily routine?",
                "answer": f"By observing patterns and applying {topic.lower()} logic.",
                "explanation": "Example: If you are organizing your bookshelf, you use classification principles similar to this lesson."
            },
            {
                "problem": f"Critical Thinking: Why is {topic} considered a pillar of {subject.replace('_', ' ')}?",
                "answer": "Because it provides the logical framework for advanced study.",
                "explanation": f"Class {n} builds upon basic concepts to understand more complex structures."
            },
            {
                "problem": f"Problem Solving: Identify a specific instance of {topic}.",
                "answer": "Follow the step-by-step methodology discussed in the lesson.",
                "explanation": "Remember to check your definitions before finalizing your answer."
            },
        ],
        "key_concepts": objectives,
        "real_life_example": f"Think about how {topic.lower()} affects everything from the food we eat to the technology we use. In {subject.replace('_', ' ')}, {topic.lower()} helps us predict and understand natural phenomena.",
        "flashcards": [
            {"front": f"Define {topic}", "back": f"A core topic in {subject.replace('_', ' ')} focusing on fundamental principles."},
            {"front": f"Significance of {topic}", "back": "Essential for board exams and competitive test preparation."},
            {"front": "Key Term 1", "back": f"Main component related to {topic.lower()}."},
            {"front": "Revision Strategy", "back": "Use the 5-step method: Read, Watch, Practice, Quiz, Revise."},
            {"front": "Real-world link", "back": f"Connects {topic.lower()} with environment and industry."}
        ],
        "revision_notes": f"Quick Revision for {topic}\n\n- Core Definition: Master the basic meaning first.\n- Formula/Rule: Practice the main method 3 times.\n- Examples: Review the 3 provided examples.\n- Checklist: Ensure you have completed the interactive activity.",
        "activity": f"Interactive Task: Create a Concept Map for {topic}. Draw the main idea in the center and add 4 branches showing its applications.",
        "quiz": [
            {
                "id": "q1",
                "question": f"Which of the following best defines {topic} for a Class {n} student?",
                "options": [f"Fundamental principle of {subject.replace('_', ' ')}", "A type of sport", "A musical instrument", "None of these"],
                "correct_answer": f"Fundamental principle of {subject.replace('_', ' ')}"
            },
            {
                "id": "q2",
                "question": f"In which scenario would you most likely apply {topic.lower()}?",
                "options": ["Solving curriculum problems", "Sleeping", "Walking", "Watching a random movie"],
                "correct_answer": "Solving curriculum problems"
            },
            {
                "id": "q3",
                "question": f"What is the first step in mastering {topic}?",
                "options": ["Understanding the core definition", "Skipping the introduction", "Only doing the quiz", "Waiting for exams"],
                "correct_answer": "Understanding the core definition"
            },
            {
                "id": "q4",
                "question": f"How does {topic} connect with other topics in {subject.replace('_', ' ')}?",
                "options": ["It forms a logical foundation", "It is completely isolated", "It is only for fun", "It has no connection"],
                "correct_answer": "It forms a logical foundation"
            },
            {
                "id": "q5",
                "question": f"What should you do after completing the quiz for {topic}?",
                "options": ["Review mistakes and check revision notes", "Close the app immediately", "Forget everything", "Delete the progress"],
                "correct_answer": "Review mistakes and check revision notes"
            },
        ],
        "video_url": None,
        "visual_adaptation": {
            "visual": f"Descriptive audio for {topic}. Image descriptions provided for all diagrams.",
            "audio": f"Audio-first lesson focusing on narrative explanation of {topic}.",
            "reading": f"Structured text version of {topic} with high readability.",
            "interactive": f"Hands-on activity version of {topic} for experimental learning."
        },
        "hearing_adaptation": f"Full captions for {topic}. All audio cues have visual alternatives.",
        "cognitive_adaptation": f"Simplified language and step-by-step mode for {topic}. One idea per page.",
        "motor_adaptation": f"Full keyboard accessibility. Voice command 'Next' or 'Select' enabled.",
        "dyslexia_adaptation": f"Dyslexia-friendly font. Wide spacing and color-coded keywords for {topic}.",
    }


def build_curriculum() -> list:
    lessons = []
    for grade, subjects in CBSE_TOPICS.items():
        for subject, topics in subjects.items():
            for idx, topic in enumerate(topics, start=1):
                lessons.append(_build_lesson(grade, subject, topic, idx))
    return lessons


CURRICULUM_LESSONS = build_curriculum()
