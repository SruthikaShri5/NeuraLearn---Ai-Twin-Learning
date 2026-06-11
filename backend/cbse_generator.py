# -*- coding: utf-8 -*-
"""Generate complete NCERT/CBSE curriculum (Classes 1-12) -- topic-specific quizzes."""
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

# ── Topic-specific quiz bank ──────────────────────────────────────────────────
TOPIC_QUIZZES = {
    # CLASS 1
    "Alphabet": [
        {"id":"q1","question":"How many letters are in the English alphabet?","options":["24","25","26","27"],"correct_answer":"26"},
        {"id":"q2","question":"Which letter comes after 'D'?","options":["E","F","C","B"],"correct_answer":"E"},
        {"id":"q3","question":"Which of these is a capital letter?","options":["a","b","C","d"],"correct_answer":"C"},
        {"id":"q4","question":"What is the last letter of the alphabet?","options":["X","Y","Z","W"],"correct_answer":"Z"},
        {"id":"q5","question":"Which letter comes before 'J'?","options":["H","I","K","L"],"correct_answer":"I"},
    ],
    "Vowels and Consonants": [
        {"id":"q1","question":"Which of these is a vowel?","options":["B","C","A","D"],"correct_answer":"A"},
        {"id":"q2","question":"How many vowels are there in English?","options":["3","4","5","6"],"correct_answer":"5"},
        {"id":"q3","question":"Which word has a vowel in the middle?","options":["cat","sky","try","gym"],"correct_answer":"cat"},
        {"id":"q4","question":"Which of these is NOT a vowel?","options":["A","E","B","I"],"correct_answer":"B"},
        {"id":"q5","question":"How many consonants are in the word 'plant'?","options":["2","3","4","5"],"correct_answer":"4"},
    ],
    "Counting Numbers": [
        {"id":"q1","question":"What number comes after 9?","options":["8","10","11","7"],"correct_answer":"10"},
        {"id":"q2","question":"How many fingers do we have on both hands?","options":["8","9","10","11"],"correct_answer":"10"},
        {"id":"q3","question":"Which number is the smallest?","options":["5","3","8","1"],"correct_answer":"1"},
        {"id":"q4","question":"Count the dots: ● ● ● — how many?","options":["2","3","4","5"],"correct_answer":"3"},
        {"id":"q5","question":"What comes between 4 and 6?","options":["3","5","7","8"],"correct_answer":"5"},
    ],
    "Addition": [
        {"id":"q1","question":"What is 3 + 4?","options":["6","7","8","5"],"correct_answer":"7"},
        {"id":"q2","question":"What is 5 + 5?","options":["9","10","11","8"],"correct_answer":"10"},
        {"id":"q3","question":"What is 2 + 7?","options":["8","9","10","7"],"correct_answer":"9"},
        {"id":"q4","question":"What is 1 + 6?","options":["5","6","7","8"],"correct_answer":"7"},
        {"id":"q5","question":"If you have 4 apples and get 3 more, how many do you have?","options":["6","7","8","9"],"correct_answer":"7"},
    ],
    "Subtraction": [
        {"id":"q1","question":"What is 9 - 4?","options":["3","4","5","6"],"correct_answer":"5"},
        {"id":"q2","question":"What is 10 - 3?","options":["6","7","8","9"],"correct_answer":"7"},
        {"id":"q3","question":"If you have 8 cookies and eat 5, how many are left?","options":["2","3","4","5"],"correct_answer":"3"},
        {"id":"q4","question":"What is 7 - 7?","options":["0","1","2","7"],"correct_answer":"0"},
        {"id":"q5","question":"What is 6 - 2?","options":["2","3","4","5"],"correct_answer":"4"},
    ],
    "Shapes": [
        {"id":"q1","question":"How many sides does a triangle have?","options":["2","3","4","5"],"correct_answer":"3"},
        {"id":"q2","question":"A circle has how many corners?","options":["0","1","2","4"],"correct_answer":"0"},
        {"id":"q3","question":"Which shape has 4 equal sides?","options":["Rectangle","Triangle","Square","Circle"],"correct_answer":"Square"},
        {"id":"q4","question":"How many sides does a rectangle have?","options":["3","4","5","6"],"correct_answer":"4"},
        {"id":"q5","question":"Which shape looks like a ball?","options":["Cube","Sphere","Cone","Cylinder"],"correct_answer":"Sphere"},
    ],
    "My Family": [
        {"id":"q1","question":"Who is your father's mother?","options":["Aunt","Sister","Grandmother","Mother"],"correct_answer":"Grandmother"},
        {"id":"q2","question":"A family with mother, father, and children is called a?","options":["Nuclear family","Joint family","Extended family","Single family"],"correct_answer":"Nuclear family"},
        {"id":"q3","question":"Who takes care of children at home?","options":["Neighbors","Parents","Strangers","Police"],"correct_answer":"Parents"},
        {"id":"q4","question":"Your mother's sister is your?","options":["Cousin","Aunt","Niece","Sister"],"correct_answer":"Aunt"},
        {"id":"q5","question":"What do families do together?","options":["Eat, play, and celebrate","Fight always","Stay apart","Never talk"],"correct_answer":"Eat, play, and celebrate"},
    ],
    "Animals": [
        {"id":"q1","question":"Which animal gives us milk?","options":["Dog","Cat","Cow","Horse"],"correct_answer":"Cow"},
        {"id":"q2","question":"Which is the largest land animal?","options":["Lion","Elephant","Giraffe","Hippo"],"correct_answer":"Elephant"},
        {"id":"q3","question":"What do herbivores eat?","options":["Meat","Plants","Both","Fish"],"correct_answer":"Plants"},
        {"id":"q4","question":"Which animal is called the King of the Jungle?","options":["Tiger","Elephant","Lion","Leopard"],"correct_answer":"Lion"},
        {"id":"q5","question":"A baby dog is called a?","options":["Kitten","Cub","Puppy","Foal"],"correct_answer":"Puppy"},
    ],
    "Plants": [
        {"id":"q1","question":"What do plants need to make food?","options":["Darkness and water","Sunlight, water, and air","Only water","Only soil"],"correct_answer":"Sunlight, water, and air"},
        {"id":"q2","question":"Which part of the plant absorbs water from the soil?","options":["Leaf","Stem","Root","Flower"],"correct_answer":"Root"},
        {"id":"q3","question":"What is the process by which plants make food?","options":["Respiration","Photosynthesis","Digestion","Absorption"],"correct_answer":"Photosynthesis"},
        {"id":"q4","question":"Which part of the plant produces seeds?","options":["Leaf","Root","Stem","Flower"],"correct_answer":"Flower"},
        {"id":"q5","question":"Plants release which gas during photosynthesis?","options":["Carbon dioxide","Nitrogen","Oxygen","Hydrogen"],"correct_answer":"Oxygen"},
    ],
    # CLASS 1 missing
    "Simple Words": [
        {"id":"q1","question":"Which of these is a simple word?","options":["Cat","Extraordinary","Photosynthesis","Constitution"],"correct_answer":"Cat"},
        {"id":"q2","question":"How many letters are in the word 'dog'?","options":["2","3","4","5"],"correct_answer":"3"},
        {"id":"q3","question":"Which word names a fruit?","options":["Run","Apple","Blue","Fast"],"correct_answer":"Apple"},
        {"id":"q4","question":"Which word describes a color?","options":["Jump","Red","Eat","Go"],"correct_answer":"Red"},
        {"id":"q5","question":"Which word is the opposite of 'big'?","options":["Tall","Fast","Small","Loud"],"correct_answer":"Small"},
    ],
    "Sentences": [
        {"id":"q1","question":"A sentence always starts with a?","options":["Small letter","Capital letter","Number","Symbol"],"correct_answer":"Capital letter"},
        {"id":"q2","question":"A sentence ends with a?","options":["Comma","Full stop","Hyphen","Apostrophe"],"correct_answer":"Full stop"},
        {"id":"q3","question":"Which of these is a complete sentence?","options":["Running fast","The dog barks.","Big red","Jumped"],"correct_answer":"The dog barks."},
        {"id":"q4","question":"What does a question sentence end with?","options":["Full stop","Comma","Question mark","Exclamation mark"],"correct_answer":"Question mark"},
        {"id":"q5","question":"How many words must a sentence have at minimum?","options":["One","Two","Three","Four"],"correct_answer":"Two"},
    ],
    "Reading Practice": [
        {"id":"q1","question":"Reading helps us to?","options":["Learn new things","Sleep faster","Run faster","Draw better"],"correct_answer":"Learn new things"},
        {"id":"q2","question":"What do we use to read a book?","options":["Ears","Eyes","Hands","Feet"],"correct_answer":"Eyes"},
        {"id":"q3","question":"Which of these is a reading material?","options":["Ball","Storybook","Pencil","Eraser"],"correct_answer":"Storybook"},
        {"id":"q4","question":"What do we call a person who reads a lot?","options":["Athlete","Artist","Reader","Singer"],"correct_answer":"Reader"},
        {"id":"q5","question":"Reading left to right is the direction for?","options":["Hindi","Urdu","English","Arabic"],"correct_answer":"English"},
    ],
    "Measurement": [
        {"id":"q1","question":"We use a ruler to measure?","options":["Weight","Temperature","Length","Volume"],"correct_answer":"Length"},
        {"id":"q2","question":"Which unit do we use to measure length?","options":["Kilogram","Litre","Metre","Celsius"],"correct_answer":"Metre"},
        {"id":"q3","question":"Which is heavier — 1 kg of iron or 1 kg of cotton?","options":["Iron","Cotton","Both are equal","Neither"],"correct_answer":"Both are equal"},
        {"id":"q4","question":"A scale that measures weight is called a?","options":["Thermometer","Balance","Ruler","Clock"],"correct_answer":"Balance"},
        {"id":"q5","question":"100 centimetres = ?","options":["1 mm","1 km","1 m","10 m"],"correct_answer":"1 m"},
    ],
    "My School": [
        {"id":"q1","question":"Who teaches students in a school?","options":["Doctor","Teacher","Pilot","Chef"],"correct_answer":"Teacher"},
        {"id":"q2","question":"Where do students sit to study?","options":["Kitchen","Bedroom","Classroom","Garden"],"correct_answer":"Classroom"},
        {"id":"q3","question":"What do we use to write on a blackboard?","options":["Pen","Pencil","Chalk","Crayon"],"correct_answer":"Chalk"},
        {"id":"q4","question":"What do we keep our books in?","options":["Fridge","School bag","Wardrobe","Dustbin"],"correct_answer":"School bag"},
        {"id":"q5","question":"What is the place in a school where books are kept?","options":["Laboratory","Library","Cafeteria","Playground"],"correct_answer":"Library"},
    ],
    "Healthy Habits": [
        {"id":"q1","question":"How many times should we brush our teeth daily?","options":["Once","Twice","Three times","Never"],"correct_answer":"Twice"},
        {"id":"q2","question":"What should we do before eating food?","options":["Watch TV","Wash hands","Sleep","Run"],"correct_answer":"Wash hands"},
        {"id":"q3","question":"How many glasses of water should we drink daily?","options":["2","4","8","12"],"correct_answer":"8"},
        {"id":"q4","question":"Exercise helps to keep our body?","options":["Weak","Sick","Fit and healthy","Tired"],"correct_answer":"Fit and healthy"},
        {"id":"q5","question":"Eating fruits and vegetables keeps us?","options":["Unhealthy","Weak","Healthy","Sleepy"],"correct_answer":"Healthy"},
    ],
    # CLASS 4
    "Large Numbers": [
        {"id":"q1","question":"What is the place value of 7 in 57,832?","options":["7","700","7,000","70"],"correct_answer":"7,000"},
        {"id":"q2","question":"How many thousands are in 1,00,000?","options":["10","100","1,000","10,000"],"correct_answer":"100"},
        {"id":"q3","question":"Write 50,000 + 3,000 + 200 + 7 in standard form.","options":["5,327","53,207","53,270","50,327"],"correct_answer":"53,207"},
        {"id":"q4","question":"Which number is greatest?","options":["9,999","10,001","9,998","10,000"],"correct_answer":"10,001"},
        {"id":"q5","question":"Round 47,856 to the nearest thousand.","options":["47,000","48,000","40,000","50,000"],"correct_answer":"48,000"},
    ],
    "Decimals": [
        {"id":"q1","question":"What is 0.5 + 0.3?","options":["0.7","0.8","0.9","1.0"],"correct_answer":"0.8"},
        {"id":"q2","question":"Which decimal is the largest?","options":["0.3","0.03","0.33","0.30"],"correct_answer":"0.33"},
        {"id":"q3","question":"0.1 is equal to?","options":["1/100","1/10","1/1000","10/100"],"correct_answer":"1/10"},
        {"id":"q4","question":"What is 1.5 − 0.7?","options":["0.7","0.8","0.9","1.2"],"correct_answer":"0.8"},
        {"id":"q5","question":"Write 3/10 as a decimal.","options":["0.03","3.0","0.3","30.0"],"correct_answer":"0.3"},
    ],
    "Perimeter": [
        {"id":"q1","question":"Perimeter of a square with side 5 cm is?","options":["10 cm","15 cm","20 cm","25 cm"],"correct_answer":"20 cm"},
        {"id":"q2","question":"Perimeter of a rectangle with length 8 cm and width 3 cm is?","options":["11 cm","22 cm","24 cm","16 cm"],"correct_answer":"22 cm"},
        {"id":"q3","question":"Perimeter means?","options":["Area inside shape","Total boundary length","Number of sides","Height of shape"],"correct_answer":"Total boundary length"},
        {"id":"q4","question":"A triangle has sides 3, 4, 5 cm. Its perimeter is?","options":["10 cm","11 cm","12 cm","13 cm"],"correct_answer":"12 cm"},
        {"id":"q5","question":"The unit of perimeter is?","options":["cm²","cm","kg","m²"],"correct_answer":"cm"},
    ],
    "Area": [
        {"id":"q1","question":"Area of a rectangle with length 6 cm and width 4 cm is?","options":["10 cm²","20 cm²","24 cm²","14 cm²"],"correct_answer":"24 cm²"},
        {"id":"q2","question":"Area of a square with side 5 cm is?","options":["10 cm²","20 cm²","25 cm²","30 cm²"],"correct_answer":"25 cm²"},
        {"id":"q3","question":"Area is measured in?","options":["cm","cm²","kg","m"],"correct_answer":"cm²"},
        {"id":"q4","question":"Which formula gives the area of a rectangle?","options":["l + b","2(l + b)","l × b","l − b"],"correct_answer":"l × b"},
        {"id":"q5","question":"A room is 5 m long and 4 m wide. Its area is?","options":["9 m²","18 m²","20 m²","25 m²"],"correct_answer":"20 m²"},
    ],
    "Factors": [
        {"id":"q1","question":"Which of these is a factor of 12?","options":["5","7","4","8"],"correct_answer":"4"},
        {"id":"q2","question":"The factors of 6 are?","options":["1, 2, 3","1, 2, 3, 6","2, 3, 6","1, 6"],"correct_answer":"1, 2, 3, 6"},
        {"id":"q3","question":"A number with only two factors (1 and itself) is called?","options":["Composite","Prime","Even","Odd"],"correct_answer":"Prime"},
        {"id":"q4","question":"What is the HCF of 8 and 12?","options":["2","4","6","8"],"correct_answer":"4"},
        {"id":"q5","question":"What is the LCM of 4 and 6?","options":["8","10","12","24"],"correct_answer":"12"},
    ],
    # CLASS 4 EVS
    "Natural Resources": [
        {"id":"q1","question":"Which of these is a natural resource?","options":["Plastic","Glass","Water","Paper"],"correct_answer":"Water"},
        {"id":"q2","question":"Coal and petroleum are examples of?","options":["Renewable resources","Non-renewable resources","Inexhaustible resources","Artificial resources"],"correct_answer":"Non-renewable resources"},
        {"id":"q3","question":"Solar energy is an example of a ___ resource.","options":["Non-renewable","Fossil","Renewable","Limited"],"correct_answer":"Renewable"},
        {"id":"q4","question":"Which activity is best for conserving natural resources?","options":["Burning waste","Recycling","Over-farming","Cutting all trees"],"correct_answer":"Recycling"},
        {"id":"q5","question":"Forests are important because they?","options":["Cause pollution","Provide oxygen and timber","Waste water","Increase temperature"],"correct_answer":"Provide oxygen and timber"},
    ],
    "Pollution": [
        {"id":"q1","question":"Smoke from vehicles causes ___ pollution.","options":["Water","Soil","Air","Sound"],"correct_answer":"Air"},
        {"id":"q2","question":"Dumping waste into rivers causes?","options":["Air pollution","Water pollution","Noise pollution","Soil pollution"],"correct_answer":"Water pollution"},
        {"id":"q3","question":"Which gas is the main cause of the greenhouse effect?","options":["Oxygen","Nitrogen","Carbon dioxide","Hydrogen"],"correct_answer":"Carbon dioxide"},
        {"id":"q4","question":"Which of these reduces air pollution?","options":["Burning plastics","Using more vehicles","Planting trees","Using firecrackers"],"correct_answer":"Planting trees"},
        {"id":"q5","question":"Noise pollution is caused by?","options":["Sunlight","Loud machines and traffic","Clean water","Green plants"],"correct_answer":"Loud machines and traffic"},
    ],
    "Food and Nutrition": [
        {"id":"q1","question":"Which nutrient gives us energy?","options":["Vitamins","Minerals","Carbohydrates","Water"],"correct_answer":"Carbohydrates"},
        {"id":"q2","question":"Proteins are essential for?","options":["Energy","Growth and repair","Vision","Blood clotting"],"correct_answer":"Growth and repair"},
        {"id":"q3","question":"Which vitamin is obtained from sunlight?","options":["Vitamin A","Vitamin B","Vitamin C","Vitamin D"],"correct_answer":"Vitamin D"},
        {"id":"q4","question":"Lack of Vitamin C causes?","options":["Rickets","Scurvy","Night blindness","Anaemia"],"correct_answer":"Scurvy"},
        {"id":"q5","question":"Which food is rich in iron?","options":["Rice","Spinach","Sugar","Butter"],"correct_answer":"Spinach"},
    ],
    # CLASS 4 CS
    "Computer Basics": [
        {"id":"q1","question":"A computer processes ___ to give output.","options":["Ideas","Data","Sound","Images only"],"correct_answer":"Data"},
        {"id":"q2","question":"The brain of a computer is the?","options":["Monitor","Keyboard","CPU","Mouse"],"correct_answer":"CPU"},
        {"id":"q3","question":"Which part stores information permanently?","options":["RAM","ROM","CPU","Monitor"],"correct_answer":"ROM"},
        {"id":"q4","question":"A computer without software is like a?","options":["Useful machine","Blank machine that cannot work","Fast calculator","Printer"],"correct_answer":"Blank machine that cannot work"},
        {"id":"q5","question":"Which of these is an example of software?","options":["Keyboard","Mouse","MS Word","Monitor"],"correct_answer":"MS Word"},
    ],
    "Input Devices": [
        {"id":"q1","question":"Which of these is an input device?","options":["Monitor","Printer","Keyboard","Speaker"],"correct_answer":"Keyboard"},
        {"id":"q2","question":"A mouse is used to?","options":["Print documents","Point and click on screen","Display images","Store files"],"correct_answer":"Point and click on screen"},
        {"id":"q3","question":"A microphone is used to?","options":["Display video","Input sound","Print text","Store data"],"correct_answer":"Input sound"},
        {"id":"q4","question":"A scanner converts ___ to digital data.","options":["Sound","Physical documents","Video","Temperature"],"correct_answer":"Physical documents"},
        {"id":"q5","question":"Which device is used to input handwriting directly?","options":["Mouse","Keyboard","Graphics tablet","Monitor"],"correct_answer":"Graphics tablet"},
    ],
    "Output Devices": [
        {"id":"q1","question":"A monitor is an example of an?","options":["Input device","Output device","Storage device","Processing device"],"correct_answer":"Output device"},
        {"id":"q2","question":"Which device produces printed output?","options":["Scanner","Keyboard","Printer","Mouse"],"correct_answer":"Printer"},
        {"id":"q3","question":"Speakers produce ___ output.","options":["Visual","Printed","Audio","Stored"],"correct_answer":"Audio"},
        {"id":"q4","question":"A projector is used to?","options":["Store data","Display images on a large screen","Input text","Scan documents"],"correct_answer":"Display images on a large screen"},
        {"id":"q5","question":"Which output device is used by the visually impaired?","options":["Monitor","Printer","Braille display","Speakers"],"correct_answer":"Braille display"},
    ],
    "Paint": [
        {"id":"q1","question":"MS Paint is a ___ application.","options":["Word processing","Drawing and painting","Spreadsheet","Database"],"correct_answer":"Drawing and painting"},
        {"id":"q2","question":"Which tool in Paint makes straight lines?","options":["Brush","Line tool","Eraser","Fill tool"],"correct_answer":"Line tool"},
        {"id":"q3","question":"The eraser tool in Paint is used to?","options":["Add colour","Draw shapes","Remove parts of a drawing","Save files"],"correct_answer":"Remove parts of a drawing"},
        {"id":"q4","question":"Which file format does Paint save by default?","options":[".docx",".bmp",".mp3",".pdf"],"correct_answer":".bmp"},
        {"id":"q5","question":"The fill tool in Paint fills an area with?","options":["Water","Colour","Text","Patterns"],"correct_answer":"Colour"},
    ],
    "Internet Basics": [
        {"id":"q1","question":"The Internet is a global network of?","options":["Schools","Computers","Roads","Books"],"correct_answer":"Computers"},
        {"id":"q2","question":"WWW stands for?","options":["World Wide Web","World Wide Window","Wide World Web","Web Wide World"],"correct_answer":"World Wide Web"},
        {"id":"q3","question":"A browser is used to?","options":["Print documents","Surf the Internet","Store files","Play music offline"],"correct_answer":"Surf the Internet"},
        {"id":"q4","question":"Which of these is a web browser?","options":["MS Word","Google Chrome","MS Paint","Notepad"],"correct_answer":"Google Chrome"},
        {"id":"q5","question":"A website address is called a?","options":["Email","URL","File","Password"],"correct_answer":"URL"},
    ],
    # CLASS 5
    "Percentages": [
        {"id":"q1","question":"What is 50% of 200?","options":["50","100","150","200"],"correct_answer":"100"},
        {"id":"q2","question":"25% is equal to which fraction?","options":["1/2","1/3","1/4","1/5"],"correct_answer":"1/4"},
        {"id":"q3","question":"Convert 0.75 to percentage.","options":["7.5%","75%","750%","0.75%"],"correct_answer":"75%"},
        {"id":"q4","question":"A student scores 45 out of 50. What is the percentage?","options":["85%","88%","90%","95%"],"correct_answer":"90%"},
        {"id":"q5","question":"What is 10% of 500?","options":["5","50","100","500"],"correct_answer":"50"},
    ],
    "Volume": [
        {"id":"q1","question":"Volume is measured in?","options":["cm","cm²","cm³","kg"],"correct_answer":"cm³"},
        {"id":"q2","question":"Volume of a cube with side 3 cm is?","options":["9 cm³","18 cm³","27 cm³","36 cm³"],"correct_answer":"27 cm³"},
        {"id":"q3","question":"Volume of a rectangular box = length × width × ?","options":["Area","Height","Perimeter","Base"],"correct_answer":"Height"},
        {"id":"q4","question":"Which unit is used to measure liquid volume?","options":["kg","m","litre","m²"],"correct_answer":"litre"},
        {"id":"q5","question":"A box is 4 cm long, 3 cm wide, 2 cm high. Its volume is?","options":["18 cm³","20 cm³","24 cm³","28 cm³"],"correct_answer":"24 cm³"},
    ],
    "Ecosystem": [
        {"id":"q1","question":"An ecosystem includes living things and their?","options":["Only soil","Non-living environment","Only water","Only air"],"correct_answer":"Non-living environment"},
        {"id":"q2","question":"Producers in an ecosystem are?","options":["Animals","Plants","Fungi","Bacteria"],"correct_answer":"Plants"},
        {"id":"q3","question":"A food chain always starts with a?","options":["Carnivore","Herbivore","Producer","Decomposer"],"correct_answer":"Producer"},
        {"id":"q4","question":"Decomposers break down?","options":["Sunlight","Rocks","Dead organisms","Water"],"correct_answer":"Dead organisms"},
        {"id":"q5","question":"Which biome receives the most rainfall?","options":["Desert","Tundra","Rainforest","Grassland"],"correct_answer":"Rainforest"},
    ],
    "Water Conservation": [
        {"id":"q1","question":"Only ___ % of Earth's water is freshwater.","options":["50","25","3","10"],"correct_answer":"3"},
        {"id":"q2","question":"Which method helps conserve rainwater?","options":["Deforestation","Rainwater harvesting","Overuse of groundwater","Paving all land"],"correct_answer":"Rainwater harvesting"},
        {"id":"q3","question":"Drip irrigation conserves water by?","options":["Flooding fields","Delivering water directly to roots","Using more water","Leaving taps open"],"correct_answer":"Delivering water directly to roots"},
        {"id":"q4","question":"Turning off the tap while brushing teeth helps to?","options":["Waste water","Conserve water","Pollute water","Boil water"],"correct_answer":"Conserve water"},
        {"id":"q5","question":"Which of these is a freshwater source?","options":["Ocean","Sea","River","Bay"],"correct_answer":"River"},
    ],
    "Health": [
        {"id":"q1","question":"A balanced diet includes?","options":["Only carbohydrates","Only proteins","All nutrients in right proportion","Only fats"],"correct_answer":"All nutrients in right proportion"},
        {"id":"q2","question":"Regular exercise helps to?","options":["Increase disease","Keep the body fit","Make you lazy","Reduce sleep"],"correct_answer":"Keep the body fit"},
        {"id":"q3","question":"Vaccines help to prevent?","options":["Injuries","Infectious diseases","Hunger","Stress"],"correct_answer":"Infectious diseases"},
        {"id":"q4","question":"Which of these is a communicable disease?","options":["Diabetes","Cancer","Common cold","Arthritis"],"correct_answer":"Common cold"},
        {"id":"q5","question":"Hand washing prevents the spread of?","options":["Injury","Germs and diseases","Hunger","Pollution"],"correct_answer":"Germs and diseases"},
    ],
    "Energy Sources": [
        {"id":"q1","question":"Which is a renewable source of energy?","options":["Coal","Petroleum","Solar energy","Natural gas"],"correct_answer":"Solar energy"},
        {"id":"q2","question":"Wind turbines convert wind energy into?","options":["Heat","Sound","Electricity","Light"],"correct_answer":"Electricity"},
        {"id":"q3","question":"Fossil fuels are formed from?","options":["Rainwater","Rocks","Dead plants and animals","Sunlight"],"correct_answer":"Dead plants and animals"},
        {"id":"q4","question":"Nuclear energy is produced by?","options":["Burning coal","Splitting atoms","Solar panels","Water flow"],"correct_answer":"Splitting atoms"},
        {"id":"q5","question":"Hydropower is generated using?","options":["Wind","Flowing water","Sunlight","Coal"],"correct_answer":"Flowing water"},
    ],
    # CLASS 5 CS
    "MS Word": [
        {"id":"q1","question":"MS Word is used for?","options":["Making spreadsheets","Creating and editing documents","Drawing pictures","Playing games"],"correct_answer":"Creating and editing documents"},
        {"id":"q2","question":"Which shortcut is used to save a document?","options":["Ctrl+P","Ctrl+S","Ctrl+C","Ctrl+V"],"correct_answer":"Ctrl+S"},
        {"id":"q3","question":"Which shortcut copies selected text?","options":["Ctrl+V","Ctrl+X","Ctrl+C","Ctrl+Z"],"correct_answer":"Ctrl+C"},
        {"id":"q4","question":"The default file extension for MS Word is?","options":[".xls",".ppt",".docx",".pdf"],"correct_answer":".docx"},
        {"id":"q5","question":"Bold text can be applied using?","options":["Ctrl+I","Ctrl+U","Ctrl+B","Ctrl+E"],"correct_answer":"Ctrl+B"},
    ],
    "Internet": [
        {"id":"q1","question":"Email stands for?","options":["Electric mail","Electronic mail","External mail","Easy mail"],"correct_answer":"Electronic mail"},
        {"id":"q2","question":"A search engine is used to?","options":["Store files","Find information online","Print documents","Play music"],"correct_answer":"Find information online"},
        {"id":"q3","question":"HTTP stands for?","options":["Hyper Text Transfer Protocol","High Tech Transfer Program","Hyper Transfer Text Protocol","High Text Transfer Protocol"],"correct_answer":"Hyper Text Transfer Protocol"},
        {"id":"q4","question":"Which of these is a search engine?","options":["Facebook","Google","Twitter","YouTube"],"correct_answer":"Google"},
        {"id":"q5","question":"Downloading means?","options":["Sending files to a server","Getting files from the Internet","Deleting files","Sharing passwords"],"correct_answer":"Getting files from the Internet"},
    ],
    "Cyber Safety": [
        {"id":"q1","question":"A strong password should contain?","options":["Only numbers","Only letters","Letters, numbers, and symbols","Your name"],"correct_answer":"Letters, numbers, and symbols"},
        {"id":"q2","question":"You should never share your password with?","options":["Parents","Teachers","Strangers online","No one except parents"],"correct_answer":"Strangers online"},
        {"id":"q3","question":"Cyberbullying is?","options":["Being kind online","Harassing others online","Sharing homework","Playing online games"],"correct_answer":"Harassing others online"},
        {"id":"q4","question":"Phishing attacks try to steal your?","options":["Homework","Personal information","Games","Books"],"correct_answer":"Personal information"},
        {"id":"q5","question":"If you receive a suspicious email, you should?","options":["Click all links","Reply with your details","Delete it and tell an adult","Forward it to friends"],"correct_answer":"Delete it and tell an adult"},
    ],
    "Applications": [
        {"id":"q1","question":"Application software is designed for?","options":["Managing hardware","Specific user tasks","Operating the computer","Networking"],"correct_answer":"Specific user tasks"},
        {"id":"q2","question":"Which of these is an application software?","options":["Windows OS","MS Excel","BIOS","Device drivers"],"correct_answer":"MS Excel"},
        {"id":"q3","question":"A mobile app is a type of?","options":["Hardware","Application software","Operating system","Network"],"correct_answer":"Application software"},
        {"id":"q4","question":"MS Excel is used for?","options":["Editing videos","Creating spreadsheets","Drawing pictures","Browsing internet"],"correct_answer":"Creating spreadsheets"},
        {"id":"q5","question":"Which application is used for making presentations?","options":["MS Word","MS Excel","MS PowerPoint","MS Paint"],"correct_answer":"MS PowerPoint"},
    ],
    # CLASS 2 missing
    "Opposites": [
        {"id":"q1","question":"What is the opposite of 'hot'?","options":["Warm","Cold","Cool","Humid"],"correct_answer":"Cold"},
        {"id":"q2","question":"What is the opposite of 'day'?","options":["Morning","Evening","Night","Noon"],"correct_answer":"Night"},
        {"id":"q3","question":"What is the opposite of 'up'?","options":["Over","Under","Down","Across"],"correct_answer":"Down"},
        {"id":"q4","question":"What is the opposite of 'fast'?","options":["Quick","Slow","Steady","Swift"],"correct_answer":"Slow"},
        {"id":"q5","question":"What is the opposite of 'happy'?","options":["Joyful","Glad","Sad","Excited"],"correct_answer":"Sad"},
    ],
    "Story Reading": [
        {"id":"q1","question":"Who are the main people in a story called?","options":["Authors","Characters","Readers","Editors"],"correct_answer":"Characters"},
        {"id":"q2","question":"The person who writes a story is called the?","options":["Reader","Character","Author","Narrator"],"correct_answer":"Author"},
        {"id":"q3","question":"Where a story takes place is called the?","options":["Plot","Setting","Theme","Moral"],"correct_answer":"Setting"},
        {"id":"q4","question":"The lesson we learn from a story is called the?","options":["Title","Setting","Moral","Character"],"correct_answer":"Moral"},
        {"id":"q5","question":"A very short story with a moral is called a?","options":["Novel","Poem","Fable","Biography"],"correct_answer":"Fable"},
    ],
    "Vocabulary": [
        {"id":"q1","question":"Vocabulary means?","options":["A set of numbers","A collection of words","A type of grammar","A story"],"correct_answer":"A collection of words"},
        {"id":"q2","question":"A word that means the same as another is called a?","options":["Antonym","Synonym","Homonym","Prefix"],"correct_answer":"Synonym"},
        {"id":"q3","question":"A word that means the opposite is called an?","options":["Synonym","Homonym","Antonym","Suffix"],"correct_answer":"Antonym"},
        {"id":"q4","question":"Which tool helps us find the meaning of a word?","options":["Atlas","Dictionary","Almanac","Thesaurus"],"correct_answer":"Dictionary"},
        {"id":"q5","question":"'Happy' and 'joyful' are?","options":["Antonyms","Synonyms","Homonyms","Prefixes"],"correct_answer":"Synonyms"},
    ],
    "Time": [
        {"id":"q1","question":"How many hours are in a day?","options":["12","24","36","48"],"correct_answer":"24"},
        {"id":"q2","question":"How many minutes are in one hour?","options":["30","45","60","90"],"correct_answer":"60"},
        {"id":"q3","question":"How many seconds are in one minute?","options":["30","60","100","120"],"correct_answer":"60"},
        {"id":"q4","question":"How many days are in a week?","options":["5","6","7","8"],"correct_answer":"7"},
        {"id":"q5","question":"What instrument is used to measure time?","options":["Ruler","Thermometer","Clock","Balance"],"correct_answer":"Clock"},
    ],
    "Money": [
        {"id":"q1","question":"The currency used in India is?","options":["Dollar","Pound","Rupee","Euro"],"correct_answer":"Rupee"},
        {"id":"q2","question":"How many paise make one rupee?","options":["10","50","100","1000"],"correct_answer":"100"},
        {"id":"q3","question":"If a book costs ₹15 and you pay ₹20, how much change do you get?","options":["₹3","₹4","₹5","₹6"],"correct_answer":"₹5"},
        {"id":"q4","question":"Which coin has the highest value?","options":["25 paise","50 paise","₹1","₹2"],"correct_answer":"₹2"},
        {"id":"q5","question":"Buying and selling goods uses?","options":["Time","Money","Weight","Length"],"correct_answer":"Money"},
    ],
    "Patterns": [
        {"id":"q1","question":"What comes next: 2, 4, 6, 8, ___?","options":["9","10","11","12"],"correct_answer":"10"},
        {"id":"q2","question":"What comes next: A, B, A, B, ___?","options":["C","A","D","B"],"correct_answer":"A"},
        {"id":"q3","question":"What comes next: 1, 3, 5, 7, ___?","options":["8","9","10","11"],"correct_answer":"9"},
        {"id":"q4","question":"A pattern that repeats is called a?","options":["Random sequence","Repeating pattern","Number line","Fraction"],"correct_answer":"Repeating pattern"},
        {"id":"q5","question":"What comes next: 10, 20, 30, 40, ___?","options":["45","48","50","60"],"correct_answer":"50"},
    ],
    "Food": [
        {"id":"q1","question":"Which food gives us energy?","options":["Water","Rice","Air","Soap"],"correct_answer":"Rice"},
        {"id":"q2","question":"Which of these is a fruit?","options":["Carrot","Potato","Mango","Onion"],"correct_answer":"Mango"},
        {"id":"q3","question":"Milk comes from?","options":["Plant","Sea","Cow","Ground"],"correct_answer":"Cow"},
        {"id":"q4","question":"Which food is rich in protein?","options":["Rice","Egg","Sugar","Oil"],"correct_answer":"Egg"},
        {"id":"q5","question":"We should eat ___ to stay healthy?","options":["Only junk food","Balanced diet","Only sweets","Nothing"],"correct_answer":"Balanced diet"},
    ],
    "Water": [
        {"id":"q1","question":"Water is found in how many states?","options":["1","2","3","4"],"correct_answer":"3"},
        {"id":"q2","question":"Water freezes at?","options":["100°C","50°C","0°C","-10°C"],"correct_answer":"0°C"},
        {"id":"q3","question":"Water boils at?","options":["50°C","75°C","100°C","120°C"],"correct_answer":"100°C"},
        {"id":"q4","question":"Which is the largest source of water on Earth?","options":["Rivers","Lakes","Ocean","Ponds"],"correct_answer":"Ocean"},
        {"id":"q5","question":"Water that is safe to drink is called?","options":["Salt water","Dirty water","Potable water","Sea water"],"correct_answer":"Potable water"},
    ],
    "Transport": [
        {"id":"q1","question":"An aeroplane travels through?","options":["Water","Land","Air","Underground"],"correct_answer":"Air"},
        {"id":"q2","question":"A ship travels on?","options":["Road","Rail","Water","Air"],"correct_answer":"Water"},
        {"id":"q3","question":"Which vehicle runs on rails?","options":["Bus","Car","Train","Bicycle"],"correct_answer":"Train"},
        {"id":"q4","question":"An ambulance is used for?","options":["Carrying goods","Transporting patients","Fire fighting","Police work"],"correct_answer":"Transporting patients"},
        {"id":"q5","question":"The fastest mode of transport is?","options":["Car","Ship","Train","Aeroplane"],"correct_answer":"Aeroplane"},
    ],
    "Weather": [
        {"id":"q1","question":"What instrument measures temperature?","options":["Barometer","Thermometer","Rain gauge","Compass"],"correct_answer":"Thermometer"},
        {"id":"q2","question":"Rain is measured using a?","options":["Thermometer","Barometer","Rain gauge","Wind vane"],"correct_answer":"Rain gauge"},
        {"id":"q3","question":"India receives most rain during which season?","options":["Winter","Summer","Monsoon","Spring"],"correct_answer":"Monsoon"},
        {"id":"q4","question":"Which cloud brings heavy rain?","options":["Cirrus","Cumulus","Stratus","Cumulonimbus"],"correct_answer":"Cumulonimbus"},
        {"id":"q5","question":"Wind direction is measured by a?","options":["Thermometer","Wind vane","Barometer","Rain gauge"],"correct_answer":"Wind vane"},
    ],
    "Community Helpers": [
        {"id":"q1","question":"Who treats sick people?","options":["Teacher","Doctor","Farmer","Engineer"],"correct_answer":"Doctor"},
        {"id":"q2","question":"Who protects us from criminals?","options":["Nurse","Pilot","Police","Chef"],"correct_answer":"Police"},
        {"id":"q3","question":"Who grows food for us?","options":["Doctor","Farmer","Soldier","Actor"],"correct_answer":"Farmer"},
        {"id":"q4","question":"Who puts out fires?","options":["Plumber","Electrician","Firefighter","Carpenter"],"correct_answer":"Firefighter"},
        {"id":"q5","question":"Who delivers letters and parcels?","options":["Milkman","Postman","Newspaper boy","Driver"],"correct_answer":"Postman"},
    ],
    # CLASS 3 missing
    "Grammar Basics": [
        {"id":"q1","question":"Grammar is the set of rules for a?","options":["Game","Language","Sport","Dance"],"correct_answer":"Language"},
        {"id":"q2","question":"A sentence that asks something is called a?","options":["Statement","Command","Question","Exclamation"],"correct_answer":"Question"},
        {"id":"q3","question":"An adjective is a word that describes a?","options":["Verb","Noun","Pronoun","Adverb"],"correct_answer":"Noun"},
        {"id":"q4","question":"'Quickly' is an example of an?","options":["Adjective","Noun","Adverb","Verb"],"correct_answer":"Adverb"},
        {"id":"q5","question":"Which punctuation is used to separate items in a list?","options":["Full stop","Comma","Colon","Hyphen"],"correct_answer":"Comma"},
    ],
    "Paragraph Writing": [
        {"id":"q1","question":"The first sentence of a paragraph that states the main idea is called?","options":["Concluding sentence","Topic sentence","Supporting sentence","Detail sentence"],"correct_answer":"Topic sentence"},
        {"id":"q2","question":"A paragraph is a group of?","options":["Words","Letters","Sentences","Chapters"],"correct_answer":"Sentences"},
        {"id":"q3","question":"When starting a new paragraph, we?","options":["Use a full stop","Indent","Use capital letters for all words","Skip a page"],"correct_answer":"Indent"},
        {"id":"q4","question":"The last sentence of a paragraph is called the?","options":["Topic sentence","Supporting sentence","Concluding sentence","Opening sentence"],"correct_answer":"Concluding sentence"},
        {"id":"q5","question":"A good paragraph focuses on?","options":["Many topics","One main idea","Random thoughts","No idea"],"correct_answer":"One main idea"},
    ],
    "Story Writing": [
        {"id":"q1","question":"Every story has a beginning, middle, and?","options":["Question","End","Title","Paragraph"],"correct_answer":"End"},
        {"id":"q2","question":"The problem in a story is called the?","options":["Setting","Moral","Conflict","Theme"],"correct_answer":"Conflict"},
        {"id":"q3","question":"The solution to the problem in a story is called?","options":["Conflict","Resolution","Setting","Plot"],"correct_answer":"Resolution"},
        {"id":"q4","question":"A story told in order of events uses?","options":["Flashback","Chronological order","Random order","Reverse order"],"correct_answer":"Chronological order"},
        {"id":"q5","question":"Dialogue in a story is shown using?","options":["Brackets","Quotation marks","Asterisks","Hyphens"],"correct_answer":"Quotation marks"},
    ],
    "Geometry": [
        {"id":"q1","question":"How many sides does a pentagon have?","options":["4","5","6","7"],"correct_answer":"5"},
        {"id":"q2","question":"A line that goes on forever in both directions is called a?","options":["Ray","Line segment","Line","Point"],"correct_answer":"Line"},
        {"id":"q3","question":"An angle less than 90° is called?","options":["Right angle","Obtuse angle","Acute angle","Straight angle"],"correct_answer":"Acute angle"},
        {"id":"q4","question":"A polygon with 6 sides is called a?","options":["Pentagon","Hexagon","Octagon","Heptagon"],"correct_answer":"Hexagon"},
        {"id":"q5","question":"The perimeter of a square with side 4 cm is?","options":["8 cm","12 cm","16 cm","20 cm"],"correct_answer":"16 cm"},
    ],
    "Data Handling": [
        {"id":"q1","question":"A pictograph uses ___ to show data?","options":["Numbers only","Pictures or symbols","Only letters","Colours only"],"correct_answer":"Pictures or symbols"},
        {"id":"q2","question":"A bar graph uses ___ to show information?","options":["Lines","Circles","Bars","Dots"],"correct_answer":"Bars"},
        {"id":"q3","question":"The number that appears most often in a set of data is called the?","options":["Mean","Median","Mode","Range"],"correct_answer":"Mode"},
        {"id":"q4","question":"Collecting information to study is called?","options":["Drawing","Data collection","Painting","Writing"],"correct_answer":"Data collection"},
        {"id":"q5","question":"A tally mark of |||| represents?","options":["3","4","5","6"],"correct_answer":"4"},
    ],
    "Environment": [
        {"id":"q1","question":"The natural surroundings we live in is called?","options":["School","Environment","City","House"],"correct_answer":"Environment"},
        {"id":"q2","question":"Cutting down trees is called?","options":["Afforestation","Deforestation","Reforestation","Plantation"],"correct_answer":"Deforestation"},
        {"id":"q3","question":"Planting more trees is called?","options":["Deforestation","Pollution","Afforestation","Erosion"],"correct_answer":"Afforestation"},
        {"id":"q4","question":"Which gas do plants absorb from air?","options":["Oxygen","Nitrogen","Carbon dioxide","Hydrogen"],"correct_answer":"Carbon dioxide"},
        {"id":"q5","question":"The 3 Rs of environment protection are?","options":["Read, Write, Arithmetic","Reduce, Reuse, Recycle","Run, Rest, Repeat","Red, Round, Right"],"correct_answer":"Reduce, Reuse, Recycle"},
    ],
    "Safety Rules": [
        {"id":"q1","question":"At a road crossing, we should?","options":["Run fast","Look both ways then cross","Close eyes and cross","Talk on phone"],"correct_answer":"Look both ways then cross"},
        {"id":"q2","question":"We should wear a helmet when?","options":["Walking","Swimming","Riding a bicycle","Sleeping"],"correct_answer":"Riding a bicycle"},
        {"id":"q3","question":"In case of fire, we should call?","options":["101","100","102","108"],"correct_answer":"101"},
        {"id":"q4","question":"We should never talk to?","options":["Teachers","Parents","Strangers","Friends"],"correct_answer":"Strangers"},
        {"id":"q5","question":"At school, we should walk ___ the corridor?","options":["Run through","Carefully through","Jump through","Skip through"],"correct_answer":"Carefully through"},
    ],
    "Living Things": [
        {"id":"q1","question":"Which of these is a living thing?","options":["Stone","Water","Tree","Cloud"],"correct_answer":"Tree"},
        {"id":"q2","question":"Living things need ___ to survive?","options":["Gold","Food, water, and air","Only sunlight","Only water"],"correct_answer":"Food, water, and air"},
        {"id":"q3","question":"Which of these is NOT a living thing?","options":["Dog","Mushroom","Chair","Grass"],"correct_answer":"Chair"},
        {"id":"q4","question":"Living things can?","options":["Grow and reproduce","Only move","Only eat","Only breathe"],"correct_answer":"Grow and reproduce"},
        {"id":"q5","question":"Which of these is a characteristic of all living things?","options":["They are all green","They all breathe","They all fly","They all swim"],"correct_answer":"They all breathe"},
    ],
    "Festivals": [
        {"id":"q1","question":"Diwali is the festival of?","options":["Colours","Lights","Harvest","Water"],"correct_answer":"Lights"},
        {"id":"q2","question":"Holi is the festival of?","options":["Lights","Colours","Music","Dance"],"correct_answer":"Colours"},
        {"id":"q3","question":"Which festival marks the birth of Jesus Christ?","options":["Easter","Halloween","Christmas","Thanksgiving"],"correct_answer":"Christmas"},
        {"id":"q4","question":"Eid is celebrated by?","options":["Hindus","Christians","Sikhs","Muslims"],"correct_answer":"Muslims"},
        {"id":"q5","question":"Baisakhi is mainly celebrated in which state?","options":["Maharashtra","Tamil Nadu","Punjab","Kerala"],"correct_answer":"Punjab"},
    ],
    # CLASS 2 missing
    "Multiplication": [
        {"id":"q1","question":"What is 3 × 4?","options":["10","11","12","13"],"correct_answer":"12"},
        {"id":"q2","question":"What is 5 × 5?","options":["20","25","30","15"],"correct_answer":"25"},
        {"id":"q3","question":"What is 2 × 8?","options":["14","15","16","17"],"correct_answer":"16"},
        {"id":"q4","question":"What is 6 × 3?","options":["15","17","18","21"],"correct_answer":"18"},
        {"id":"q5","question":"If there are 4 bags with 3 apples each, how many apples total?","options":["10","11","12","13"],"correct_answer":"12"},
    ],
    "Division": [
        {"id":"q1","question":"What is 12 ÷ 4?","options":["2","3","4","6"],"correct_answer":"3"},
        {"id":"q2","question":"What is 20 ÷ 5?","options":["3","4","5","6"],"correct_answer":"4"},
        {"id":"q3","question":"What is 15 ÷ 3?","options":["4","5","6","7"],"correct_answer":"5"},
        {"id":"q4","question":"If you share 10 candies equally among 2 friends, how many does each get?","options":["4","5","6","7"],"correct_answer":"5"},
        {"id":"q5","question":"What is 8 ÷ 2?","options":["2","3","4","5"],"correct_answer":"4"},
    ],
    "Nouns": [
        {"id":"q1","question":"A noun is a?","options":["Action word","Naming word","Describing word","Connecting word"],"correct_answer":"Naming word"},
        {"id":"q2","question":"Which of these is a noun?","options":["Run","Happy","Dog","Quickly"],"correct_answer":"Dog"},
        {"id":"q3","question":"'India' is what type of noun?","options":["Common noun","Proper noun","Abstract noun","Collective noun"],"correct_answer":"Proper noun"},
        {"id":"q4","question":"Which is a collective noun?","options":["Boy","Flock","River","Book"],"correct_answer":"Flock"},
        {"id":"q5","question":"'Happiness' is an example of?","options":["Proper noun","Common noun","Abstract noun","Collective noun"],"correct_answer":"Abstract noun"},
    ],
    "Verbs": [
        {"id":"q1","question":"A verb is a?","options":["Naming word","Action word","Describing word","Joining word"],"correct_answer":"Action word"},
        {"id":"q2","question":"Which of these is a verb?","options":["Happy","Blue","Run","Quickly"],"correct_answer":"Run"},
        {"id":"q3","question":"In the sentence 'She sings', what is the verb?","options":["She","Sings","Both","Neither"],"correct_answer":"Sings"},
        {"id":"q4","question":"Which is the past tense of 'go'?","options":["Goes","Going","Went","Gone"],"correct_answer":"Went"},
        {"id":"q5","question":"'Is', 'am', 'are' are examples of?","options":["Main verbs","Helping verbs","Adjectives","Nouns"],"correct_answer":"Helping verbs"},
    ],
    # CLASS 3
    "Fractions": [
        {"id":"q1","question":"What is the top number of a fraction called?","options":["Denominator","Numerator","Divisor","Dividend"],"correct_answer":"Numerator"},
        {"id":"q2","question":"What fraction of a pizza is one slice out of 4 equal slices?","options":["1/2","1/3","1/4","1/5"],"correct_answer":"1/4"},
        {"id":"q3","question":"Which fraction is the largest?","options":["1/4","1/2","1/6","1/8"],"correct_answer":"1/2"},
        {"id":"q4","question":"2/4 is equal to?","options":["1/3","1/2","2/3","3/4"],"correct_answer":"1/2"},
        {"id":"q5","question":"The bottom number in a fraction is called?","options":["Numerator","Divisor","Denominator","Quotient"],"correct_answer":"Denominator"},
    ],
    "Human Body": [
        {"id":"q1","question":"How many bones does an adult human body have?","options":["106","206","306","406"],"correct_answer":"206"},
        {"id":"q2","question":"Which organ pumps blood in our body?","options":["Lungs","Liver","Heart","Kidney"],"correct_answer":"Heart"},
        {"id":"q3","question":"Which organ is responsible for breathing?","options":["Heart","Lungs","Brain","Stomach"],"correct_answer":"Lungs"},
        {"id":"q4","question":"What is the largest organ of the human body?","options":["Heart","Brain","Liver","Skin"],"correct_answer":"Skin"},
        {"id":"q5","question":"Which part of the body controls all activities?","options":["Heart","Lungs","Brain","Stomach"],"correct_answer":"Brain"},
    ],
    # CLASS 6
    "Whole Numbers": [
        {"id":"q1","question":"Which of these is NOT a whole number?","options":["0","5","-3","100"],"correct_answer":"-3"},
        {"id":"q2","question":"The smallest whole number is?","options":["-1","0","1","2"],"correct_answer":"0"},
        {"id":"q3","question":"Successor of 999 is?","options":["998","1000","1001","100"],"correct_answer":"1000"},
        {"id":"q4","question":"Which property states a + b = b + a?","options":["Associative","Distributive","Commutative","Identity"],"correct_answer":"Commutative"},
        {"id":"q5","question":"Predecessor of 1000 is?","options":["999","1001","998","900"],"correct_answer":"999"},
    ],
    "Integers": [
        {"id":"q1","question":"Which of the following is a negative integer?","options":["5","-3","0","7"],"correct_answer":"-3"},
        {"id":"q2","question":"What is (-5) + 3?","options":["-8","-2","2","8"],"correct_answer":"-2"},
        {"id":"q3","question":"What is the absolute value of -7?","options":["-7","0","7","14"],"correct_answer":"7"},
        {"id":"q4","question":"Which integer is neither positive nor negative?","options":["-1","0","1","2"],"correct_answer":"0"},
        {"id":"q5","question":"What is (-4) × (-3)?","options":["-12","-7","7","12"],"correct_answer":"12"},
    ],
        {"id":"q1","question":"Which of the following is a negative integer?","options":["5","-3","0","7"],"correct_answer":"-3"},
        {"id":"q2","question":"What is (-5) + 3?","options":["-8","-2","2","8"],"correct_answer":"-2"},
        {"id":"q3","question":"What is the absolute value of -7?","options":["-7","0","7","14"],"correct_answer":"7"},
        {"id":"q4","question":"Which integer is neither positive nor negative?","options":["-1","0","1","2"],"correct_answer":"0"},
        {"id":"q5","question":"What is (-4) × (-3)?","options":["-12","-7","7","12"],"correct_answer":"12"},
    ],
    "Algebra": [
        {"id":"q1","question":"In algebra, letters used to represent unknown values are called?","options":["Constants","Variables","Coefficients","Terms"],"correct_answer":"Variables"},
        {"id":"q2","question":"Solve: x + 5 = 10. What is x?","options":["3","4","5","6"],"correct_answer":"5"},
        {"id":"q3","question":"What is 2x when x = 4?","options":["6","8","10","12"],"correct_answer":"8"},
        {"id":"q4","question":"Simplify: 3x + 2x","options":["5","5x","6x","x5"],"correct_answer":"5x"},
        {"id":"q5","question":"If 3y = 15, what is y?","options":["3","4","5","6"],"correct_answer":"5"},
    ],
    "Electricity": [
        {"id":"q1","question":"What is the SI unit of electric current?","options":["Volt","Watt","Ampere","Ohm"],"correct_answer":"Ampere"},
        {"id":"q2","question":"Good conductors of electricity are made of?","options":["Plastic","Rubber","Metal","Wood"],"correct_answer":"Metal"},
        {"id":"q3","question":"Which device converts electrical energy to light energy?","options":["Fan","Bulb","Motor","Heater"],"correct_answer":"Bulb"},
        {"id":"q4","question":"What is the unit of electrical resistance?","options":["Volt","Ampere","Ohm","Watt"],"correct_answer":"Ohm"},
        {"id":"q5","question":"A material that does not allow electricity to pass through is called?","options":["Conductor","Semiconductor","Insulator","Resistor"],"correct_answer":"Insulator"},
    ],
    "Food and Nutrition": [
        {"id":"q1","question":"Which nutrient gives us energy?","options":["Vitamins","Minerals","Carbohydrates","Water"],"correct_answer":"Carbohydrates"},
        {"id":"q2","question":"Proteins are essential for?","options":["Energy","Growth and repair","Vision","Blood clotting"],"correct_answer":"Growth and repair"},
        {"id":"q3","question":"Which vitamin is obtained from sunlight?","options":["Vitamin A","Vitamin B","Vitamin C","Vitamin D"],"correct_answer":"Vitamin D"},
        {"id":"q4","question":"Lack of Vitamin C causes?","options":["Rickets","Scurvy","Night blindness","Anaemia"],"correct_answer":"Scurvy"},
        {"id":"q5","question":"Which food is rich in iron?","options":["Rice","Spinach","Sugar","Butter"],"correct_answer":"Spinach"},
    ],
    # CLASS 6 Science
    "Motion": [
        {"id":"q1","question":"Speed = Distance / ?","options":["Mass","Time","Force","Velocity"],"correct_answer":"Time"},
        {"id":"q2","question":"A body moving in a straight line with constant speed has?","options":["Zero acceleration","Positive acceleration","Negative acceleration","Variable acceleration"],"correct_answer":"Zero acceleration"},
        {"id":"q3","question":"What is the SI unit of speed?","options":["m","m/s²","m/s","km"],"correct_answer":"m/s"},
        {"id":"q4","question":"The slope of a distance-time graph gives?","options":["Acceleration","Speed","Force","Mass"],"correct_answer":"Speed"},
        {"id":"q5","question":"A car travels 100 km in 2 hours. Its average speed is?","options":["25 km/h","50 km/h","100 km/h","200 km/h"],"correct_answer":"50 km/h"},
    ],
    "Electricity": [
        {"id":"q1","question":"What is the SI unit of electric current?","options":["Volt","Watt","Ampere","Ohm"],"correct_answer":"Ampere"},
        {"id":"q2","question":"Good conductors of electricity are made of?","options":["Plastic","Rubber","Metal","Wood"],"correct_answer":"Metal"},
        {"id":"q3","question":"Which device converts electrical energy to light energy?","options":["Fan","Bulb","Motor","Heater"],"correct_answer":"Bulb"},
        {"id":"q4","question":"What is the unit of electrical resistance?","options":["Volt","Ampere","Ohm","Watt"],"correct_answer":"Ohm"},
        {"id":"q5","question":"A material that does not allow electricity to pass through is called?","options":["Conductor","Semiconductor","Insulator","Resistor"],"correct_answer":"Insulator"},
    ],
    # CLASS 7
    "Nutrition": [
        {"id":"q1","question":"The process by which organisms obtain and use food is called?","options":["Respiration","Nutrition","Excretion","Reproduction"],"correct_answer":"Nutrition"},
        {"id":"q2","question":"Plants prepare their food by the process of?","options":["Respiration","Digestion","Photosynthesis","Absorption"],"correct_answer":"Photosynthesis"},
        {"id":"q3","question":"Animals that eat only plants are called?","options":["Carnivores","Omnivores","Herbivores","Decomposers"],"correct_answer":"Herbivores"},
        {"id":"q4","question":"Digestion of starch begins in the?","options":["Stomach","Intestine","Mouth","Liver"],"correct_answer":"Mouth"},
        {"id":"q5","question":"The enzyme amylase is found in?","options":["Gastric juice","Bile","Saliva","Pancreatic juice"],"correct_answer":"Saliva"},
    ],
    "Heat": [
        {"id":"q1","question":"Heat flows from ___ to ___ objects.","options":["Cold to hot","Hot to cold","Both directions","It doesn't flow"],"correct_answer":"Hot to cold"},
        {"id":"q2","question":"The SI unit of heat is?","options":["Celsius","Kelvin","Joule","Watt"],"correct_answer":"Joule"},
        {"id":"q3","question":"Transfer of heat through a medium without actual movement of particles is?","options":["Convection","Radiation","Conduction","Absorption"],"correct_answer":"Conduction"},
        {"id":"q4","question":"Dark coloured surfaces are ___ absorbers of heat.","options":["Poor","Good","Average","Zero"],"correct_answer":"Good"},
        {"id":"q5","question":"Transfer of heat through electromagnetic waves is called?","options":["Conduction","Convection","Radiation","Absorption"],"correct_answer":"Radiation"},
    ],
    "Respiration": [
        {"id":"q1","question":"The process of breaking down food to release energy is called?","options":["Photosynthesis","Respiration","Digestion","Transpiration"],"correct_answer":"Respiration"},
        {"id":"q2","question":"The organelle where respiration occurs is?","options":["Nucleus","Chloroplast","Mitochondria","Vacuole"],"correct_answer":"Mitochondria"},
        {"id":"q3","question":"Which gas is used in aerobic respiration?","options":["Carbon dioxide","Nitrogen","Oxygen","Hydrogen"],"correct_answer":"Oxygen"},
        {"id":"q4","question":"Anaerobic respiration in yeast produces?","options":["Water","Lactic acid","Ethanol and CO₂","Only CO₂"],"correct_answer":"Ethanol and CO₂"},
        {"id":"q5","question":"Breathing rate increases during exercise because?","options":["Less oxygen is needed","More energy is needed","Lungs get tired","Heart stops"],"correct_answer":"More energy is needed"},
    ],
    "Electric Current": [
        {"id":"q1","question":"Electric current is the flow of?","options":["Protons","Neutrons","Electrons","Atoms"],"correct_answer":"Electrons"},
        {"id":"q2","question":"Ohm's Law states V = ?","options":["I/R","IR","R/I","I+R"],"correct_answer":"IR"},
        {"id":"q3","question":"In a series circuit, current is ___ everywhere.","options":["Different","Zero","Same","Negative"],"correct_answer":"Same"},
        {"id":"q4","question":"A fuse protects a circuit from?","options":["Low voltage","Excess current","Reverse current","Low resistance"],"correct_answer":"Excess current"},
        {"id":"q5","question":"The unit of electric power is?","options":["Volt","Ampere","Ohm","Watt"],"correct_answer":"Watt"},
    ],
    # CLASS 7
    "Acids and Bases": [
        {"id":"q1","question":"What is the pH of pure water?","options":["0","5","7","14"],"correct_answer":"7"},
        {"id":"q2","question":"Acids have a pH value of?","options":["More than 7","Equal to 7","Less than 7","None"],"correct_answer":"Less than 7"},
        {"id":"q3","question":"Which of the following is an acid?","options":["Baking soda","Vinegar","Bleach","Soap"],"correct_answer":"Vinegar"},
        {"id":"q4","question":"Litmus paper turns red in?","options":["Base","Neutral","Acid","Salt"],"correct_answer":"Acid"},
        {"id":"q5","question":"When an acid reacts with a base, it forms?","options":["Water only","Salt only","Salt and water","Gas"],"correct_answer":"Salt and water"},
    ],
    # CLASS 7 Math
    "Fractions": [
        {"id":"q1","question":"What is the top number of a fraction called?","options":["Denominator","Numerator","Divisor","Dividend"],"correct_answer":"Numerator"},
        {"id":"q2","question":"What fraction of a pizza is one slice out of 4 equal slices?","options":["1/2","1/3","1/4","1/5"],"correct_answer":"1/4"},
        {"id":"q3","question":"Which fraction is the largest?","options":["1/4","1/2","1/6","1/8"],"correct_answer":"1/2"},
        {"id":"q4","question":"2/4 is equal to?","options":["1/3","1/2","2/3","3/4"],"correct_answer":"1/2"},
        {"id":"q5","question":"The bottom number in a fraction is called?","options":["Numerator","Divisor","Denominator","Quotient"],"correct_answer":"Denominator"},
    ],
    "Algebra": [
        {"id":"q1","question":"In algebra, letters used to represent unknown values are called?","options":["Constants","Variables","Coefficients","Terms"],"correct_answer":"Variables"},
        {"id":"q2","question":"Solve: x + 5 = 10. What is x?","options":["3","4","5","6"],"correct_answer":"5"},
        {"id":"q3","question":"What is 2x when x = 4?","options":["6","8","10","12"],"correct_answer":"8"},
        {"id":"q4","question":"Simplify: 3x + 2x","options":["5","5x","6x","x5"],"correct_answer":"5x"},
        {"id":"q5","question":"If 3y = 15, what is y?","options":["3","4","5","6"],"correct_answer":"5"},
    ],
    "Geometry": [
        {"id":"q1","question":"How many sides does a pentagon have?","options":["4","5","6","7"],"correct_answer":"5"},
        {"id":"q2","question":"A line that goes on forever in both directions is called a?","options":["Ray","Line segment","Line","Point"],"correct_answer":"Line"},
        {"id":"q3","question":"An angle less than 90° is called?","options":["Right angle","Obtuse angle","Acute angle","Straight angle"],"correct_answer":"Acute angle"},
        {"id":"q4","question":"A polygon with 6 sides is called a?","options":["Pentagon","Hexagon","Octagon","Heptagon"],"correct_answer":"Hexagon"},
        {"id":"q5","question":"The perimeter of a square with side 4 cm is?","options":["8 cm","12 cm","16 cm","20 cm"],"correct_answer":"16 cm"},
    ],
    "Data Handling": [
        {"id":"q1","question":"A pictograph uses ___ to show data?","options":["Numbers only","Pictures or symbols","Only letters","Colours only"],"correct_answer":"Pictures or symbols"},
        {"id":"q2","question":"A bar graph uses ___ to show information?","options":["Lines","Circles","Bars","Dots"],"correct_answer":"Bars"},
        {"id":"q3","question":"The number that appears most often in a set of data is called the?","options":["Mean","Median","Mode","Range"],"correct_answer":"Mode"},
        {"id":"q4","question":"Collecting information to study is called?","options":["Drawing","Data collection","Painting","Writing"],"correct_answer":"Data collection"},
        {"id":"q5","question":"A tally mark of |||| represents?","options":["3","4","5","6"],"correct_answer":"4"},
    ],
    "Linear Equations": [
        {"id":"q1","question":"Solve: 2x + 3 = 11. What is x?","options":["3","4","5","6"],"correct_answer":"4"},
        {"id":"q2","question":"A linear equation has the highest power of variable as?","options":["0","1","2","3"],"correct_answer":"1"},
        {"id":"q3","question":"Solve: 5x = 25. What is x?","options":["4","5","6","7"],"correct_answer":"5"},
        {"id":"q4","question":"Which of the following is a linear equation?","options":["x² + 2 = 0","2x + 1 = 7","x³ = 8","x² - 1 = 0"],"correct_answer":"2x + 1 = 7"},
        {"id":"q5","question":"Solve: x - 4 = 10. What is x?","options":["6","12","14","16"],"correct_answer":"14"},
    ],
    # CLASS 8
    "Rational Numbers": [
        {"id":"q1","question":"A rational number is a number that can be written as?","options":["p/q where q≠0","p/q where q=0","Any decimal","Any integer"],"correct_answer":"p/q where q≠0"},
        {"id":"q2","question":"Which of the following is a rational number?","options":["√2","π","3/4","√3"],"correct_answer":"3/4"},
        {"id":"q3","question":"What is 1/2 + 1/3?","options":["2/5","5/6","2/6","1/5"],"correct_answer":"5/6"},
        {"id":"q4","question":"The additive inverse of 3/5 is?","options":["5/3","-3/5","3/5","-5/3"],"correct_answer":"-3/5"},
        {"id":"q5","question":"What is 3/4 × 4/3?","options":["0","1","2","3"],"correct_answer":"1"},
    ],
    "Cells": [
        {"id":"q1","question":"Who discovered the cell?","options":["Darwin","Newton","Robert Hooke","Pasteur"],"correct_answer":"Robert Hooke"},
        {"id":"q2","question":"The powerhouse of the cell is?","options":["Nucleus","Ribosome","Mitochondria","Chloroplast"],"correct_answer":"Mitochondria"},
        {"id":"q3","question":"Which organelle controls cell activities?","options":["Mitochondria","Nucleus","Vacuole","Ribosome"],"correct_answer":"Nucleus"},
        {"id":"q4","question":"Plant cells have ___ which animal cells do not.","options":["Nucleus","Cell wall","Mitochondria","Ribosome"],"correct_answer":"Cell wall"},
        {"id":"q5","question":"What is the basic unit of life?","options":["Tissue","Organ","Cell","Organism"],"correct_answer":"Cell"},
    ],
    "Quadrilaterals": [
        {"id":"q1","question":"A quadrilateral has how many sides?","options":["3","4","5","6"],"correct_answer":"4"},
        {"id":"q2","question":"A parallelogram has opposite sides that are?","options":["Equal and parallel","Unequal","Perpendicular","Random"],"correct_answer":"Equal and parallel"},
        {"id":"q3","question":"A quadrilateral with all sides equal and all angles 90° is a?","options":["Rectangle","Rhombus","Square","Trapezium"],"correct_answer":"Square"},
        {"id":"q4","question":"The sum of angles of a quadrilateral is?","options":["180°","270°","360°","90°"],"correct_answer":"360°"},
        {"id":"q5","question":"A trapezium has exactly ___ pair(s) of parallel sides.","options":["0","1","2","3"],"correct_answer":"1"},
    ],
    "Statistics": [
        {"id":"q1","question":"The mean (average) of 4, 6, 8 is?","options":["5","6","7","8"],"correct_answer":"6"},
        {"id":"q2","question":"The median of 3, 5, 7, 9, 11 is?","options":["5","7","9","11"],"correct_answer":"7"},
        {"id":"q3","question":"The mode of 2, 3, 3, 4, 5 is?","options":["2","3","4","5"],"correct_answer":"3"},
        {"id":"q4","question":"Range = Maximum value − ?","options":["Mean","Mode","Median","Minimum value"],"correct_answer":"Minimum value"},
        {"id":"q5","question":"A histogram is used to represent?","options":["Categorical data","Continuous data","Only integers","Pie charts"],"correct_answer":"Continuous data"},
    ],
    "Squares and Cubes": [
        {"id":"q1","question":"What is the square of 9?","options":["18","27","81","72"],"correct_answer":"81"},
        {"id":"q2","question":"What is √144?","options":["10","11","12","14"],"correct_answer":"12"},
        {"id":"q3","question":"What is 2³ (2 cubed)?","options":["4","6","8","16"],"correct_answer":"8"},
        {"id":"q4","question":"A perfect square is a number whose square root is a?","options":["Fraction","Decimal","Whole number","Negative number"],"correct_answer":"Whole number"},
        {"id":"q5","question":"What is the cube root of 27?","options":["2","3","4","9"],"correct_answer":"3"},
    ],
    "Microorganisms": [
        {"id":"q1","question":"Microorganisms are organisms that are?","options":["Visible to naked eye","Too small to see without a microscope","Only found in water","Always harmful"],"correct_answer":"Too small to see without a microscope"},
        {"id":"q2","question":"Bacteria are used to make?","options":["Bread and beer","Curd and cheese","Both curd/cheese and bread/beer","None of these"],"correct_answer":"Curd and cheese"},
        {"id":"q3","question":"Viruses cause diseases like?","options":["Malaria","Flu and COVID-19","Typhoid","Cholera"],"correct_answer":"Flu and COVID-19"},
        {"id":"q4","question":"Penicillin, the first antibiotic, was discovered from a?","options":["Bacterium","Virus","Fungus","Algae"],"correct_answer":"Fungus"},
        {"id":"q5","question":"Nitrogen-fixing bacteria live in the roots of?","options":["Rice","Wheat","Leguminous plants","Cactus"],"correct_answer":"Leguminous plants"},
    ],
    "Force and Pressure": [
        {"id":"q1","question":"Force is a ___ quantity.","options":["Scalar","Vector","Dimensionless","Constant"],"correct_answer":"Vector"},
        {"id":"q2","question":"Pressure = Force / ?","options":["Volume","Mass","Area","Length"],"correct_answer":"Area"},
        {"id":"q3","question":"The SI unit of pressure is?","options":["Newton","Pascal","Joule","Watt"],"correct_answer":"Pascal"},
        {"id":"q4","question":"Atmospheric pressure is caused by the weight of?","options":["Water","Soil","Air","Rocks"],"correct_answer":"Air"},
        {"id":"q5","question":"A sharp knife cuts better because it has a smaller ___ which increases pressure.","options":["Force","Area","Mass","Volume"],"correct_answer":"Area"},
    ],
    "Friction": [
        {"id":"q1","question":"Friction acts in the ___ direction of motion.","options":["Same","Opposite","Perpendicular","Random"],"correct_answer":"Opposite"},
        {"id":"q2","question":"Which surface produces more friction?","options":["Ice","Glass","Rough concrete","Oil"],"correct_answer":"Rough concrete"},
        {"id":"q3","question":"Ball bearings reduce friction by replacing ___ friction with ___ friction.","options":["Rolling, sliding","Sliding, rolling","Static, kinetic","Kinetic, static"],"correct_answer":"Sliding, rolling"},
        {"id":"q4","question":"Lubricants like oil are used to?","options":["Increase friction","Reduce friction","Stop motion","Change direction"],"correct_answer":"Reduce friction"},
        {"id":"q5","question":"Walking is possible due to ___ between feet and ground.","options":["Gravity","Friction","Magnetism","Pressure"],"correct_answer":"Friction"},
    ],
    "Sound": [
        {"id":"q1","question":"Sound is a form of ___ energy.","options":["Light","Mechanical","Electrical","Nuclear"],"correct_answer":"Mechanical"},
        {"id":"q2","question":"Sound travels fastest in?","options":["Vacuum","Air","Water","Solids"],"correct_answer":"Solids"},
        {"id":"q3","question":"The unit of loudness of sound is?","options":["Hertz","Decibel","Metre","Watt"],"correct_answer":"Decibel"},
        {"id":"q4","question":"The number of vibrations per second is called?","options":["Amplitude","Wavelength","Frequency","Pitch"],"correct_answer":"Frequency"},
        {"id":"q5","question":"Sound cannot travel through?","options":["Water","Iron","Vacuum","Wood"],"correct_answer":"Vacuum"},
    ],
    # CLASS 9
    "Number Systems": [
        {"id":"q1","question":"Which of these is an irrational number?","options":["3/4","√4","√2","0.5"],"correct_answer":"√2"},
        {"id":"q2","question":"Every integer is a?","options":["Natural number","Rational number","Irrational number","Complex number"],"correct_answer":"Rational number"},
        {"id":"q3","question":"The decimal expansion of √2 is?","options":["Terminating","Recurring","Non-terminating non-recurring","Zero"],"correct_answer":"Non-terminating non-recurring"},
        {"id":"q4","question":"Between any two rational numbers, there exist?","options":["No number","Finite numbers","Infinitely many rational numbers","Only one"],"correct_answer":"Infinitely many rational numbers"},
        {"id":"q5","question":"The set of natural numbers is represented by?","options":["Q","Z","N","R"],"correct_answer":"N"},
    ],
    "Coordinate Geometry": [
        {"id":"q1","question":"In coordinate geometry, the x-axis and y-axis divide the plane into ___ quadrants.","options":["2","3","4","6"],"correct_answer":"4"},
        {"id":"q2","question":"The coordinates of the origin are?","options":["(1, 0)","(0, 1)","(0, 0)","(1, 1)"],"correct_answer":"(0, 0)"},
        {"id":"q3","question":"A point (3, -2) lies in which quadrant?","options":["I","II","III","IV"],"correct_answer":"IV"},
        {"id":"q4","question":"The x-coordinate is also called the?","options":["Ordinate","Abscissa","Origin","Intercept"],"correct_answer":"Abscissa"},
        {"id":"q5","question":"Distance of point (3, 4) from origin is?","options":["3","4","5","7"],"correct_answer":"5"},
    ],
    "Triangles": [
        {"id":"q1","question":"The sum of angles of a triangle is?","options":["90°","180°","270°","360°"],"correct_answer":"180°"},
        {"id":"q2","question":"In a right triangle, the longest side is called?","options":["Base","Height","Hypotenuse","Median"],"correct_answer":"Hypotenuse"},
        {"id":"q3","question":"Two triangles are congruent if they have the same?","options":["Colour","Size and shape","Only shape","Only size"],"correct_answer":"Size and shape"},
        {"id":"q4","question":"Pythagoras theorem: c² = a² + b² applies to?","options":["All triangles","Equilateral triangles","Right triangles","Isosceles triangles"],"correct_answer":"Right triangles"},
        {"id":"q5","question":"A triangle with all sides equal is called?","options":["Scalene","Isosceles","Equilateral","Right"],"correct_answer":"Equilateral"},
    ],
    "Atoms and Molecules": [
        {"id":"q1","question":"An atom is the smallest unit of an element that retains its?","options":["Mass","Chemical properties","Colour","Shape"],"correct_answer":"Chemical properties"},
        {"id":"q2","question":"The chemical formula of water is?","options":["HO","H2O","H2O2","HO2"],"correct_answer":"H2O"},
        {"id":"q3","question":"Avogadro's number is approximately?","options":["6.022 × 10²³","3.14 × 10²³","1.6 × 10¹⁹","9.8 × 10²³"],"correct_answer":"6.022 × 10²³"},
        {"id":"q4","question":"The molecular formula of glucose is?","options":["C6H12O6","C12H22O11","CH4","C2H5OH"],"correct_answer":"C6H12O6"},
        {"id":"q5","question":"Molar mass of NaCl (table salt) is approximately?","options":["23 g/mol","35.5 g/mol","58.5 g/mol","40 g/mol"],"correct_answer":"58.5 g/mol"},
    ],
    "Cell Structure": [
        {"id":"q1","question":"The cell membrane is made of?","options":["Cellulose","Phospholipid bilayer","Protein only","Carbohydrates"],"correct_answer":"Phospholipid bilayer"},
        {"id":"q2","question":"Which organelle is responsible for protein synthesis?","options":["Mitochondria","Ribosome","Golgi body","Lysosome"],"correct_answer":"Ribosome"},
        {"id":"q3","question":"Chloroplasts are found in?","options":["Animal cells","Bacterial cells","Plant cells","Fungal cells"],"correct_answer":"Plant cells"},
        {"id":"q4","question":"The Golgi apparatus is involved in?","options":["Energy production","Protein packaging and transport","DNA replication","Photosynthesis"],"correct_answer":"Protein packaging and transport"},
        {"id":"q5","question":"Lysosomes contain?","options":["DNA","Digestive enzymes","Chlorophyll","RNA"],"correct_answer":"Digestive enzymes"},
    ],
    "Work and Energy": [
        {"id":"q1","question":"Work done = Force × ?","options":["Time","Mass","Displacement","Velocity"],"correct_answer":"Displacement"},
        {"id":"q2","question":"The SI unit of energy is?","options":["Watt","Newton","Joule","Pascal"],"correct_answer":"Joule"},
        {"id":"q3","question":"Kinetic energy = (1/2)mv². What is 'v'?","options":["Volume","Velocity","Voltage","Vacuum"],"correct_answer":"Velocity"},
        {"id":"q4","question":"A ball at rest on a table has ___ energy.","options":["Kinetic","Potential","No","Sound"],"correct_answer":"Potential"},
        {"id":"q5","question":"Power = Work / ?","options":["Force","Distance","Time","Mass"],"correct_answer":"Time"},
    ],
    # CLASS 9
    "Motion": [
        {"id":"q1","question":"Speed = Distance / ?","options":["Mass","Time","Force","Velocity"],"correct_answer":"Time"},
        {"id":"q2","question":"A body moving in a straight line with constant speed has?","options":["Zero acceleration","Positive acceleration","Negative acceleration","Variable acceleration"],"correct_answer":"Zero acceleration"},
        {"id":"q3","question":"What is the SI unit of speed?","options":["m","m/s²","m/s","km"],"correct_answer":"m/s"},
        {"id":"q4","question":"The slope of a distance-time graph gives?","options":["Acceleration","Speed","Force","Mass"],"correct_answer":"Speed"},
        {"id":"q5","question":"A car travels 100 km in 2 hours. Its average speed is?","options":["25 km/h","50 km/h","100 km/h","200 km/h"],"correct_answer":"50 km/h"},
    ],
    "Polynomials": [
        {"id":"q1","question":"A polynomial with one term is called?","options":["Binomial","Trinomial","Monomial","Quadratic"],"correct_answer":"Monomial"},
        {"id":"q2","question":"The degree of the polynomial 3x² + 2x + 1 is?","options":["1","2","3","0"],"correct_answer":"2"},
        {"id":"q3","question":"Which is a zero of the polynomial p(x) = x - 3?","options":["0","1","2","3"],"correct_answer":"3"},
        {"id":"q4","question":"A polynomial with two terms is called?","options":["Monomial","Binomial","Trinomial","Quadratic"],"correct_answer":"Binomial"},
        {"id":"q5","question":"What is the coefficient of x in 5x + 3?","options":["3","5","8","0"],"correct_answer":"5"},
    ],
    "Gravitation": [
        {"id":"q1","question":"Who proposed the Law of Universal Gravitation?","options":["Einstein","Galileo","Newton","Faraday"],"correct_answer":"Newton"},
        {"id":"q2","question":"The value of g (acceleration due to gravity) on Earth is approximately?","options":["9.8 m/s²","6.7 m/s²","8.9 m/s²","10.8 m/s²"],"correct_answer":"9.8 m/s²"},
        {"id":"q3","question":"Gravitational force is always?","options":["Repulsive","Attractive","Zero","Variable"],"correct_answer":"Attractive"},
        {"id":"q4","question":"The weight of an object on Moon compared to Earth is?","options":["Same","Double","One-sixth","One-tenth"],"correct_answer":"One-sixth"},
        {"id":"q5","question":"What keeps planets in orbit around the Sun?","options":["Magnetic force","Gravitational force","Electric force","Nuclear force"],"correct_answer":"Gravitational force"},
    ],
    # CLASS 10
    "Real Numbers": [
        {"id":"q1","question":"Every rational number is a ___ number.","options":["Natural","Real","Irrational","Complex"],"correct_answer":"Real"},
        {"id":"q2","question":"Euclid's Division Lemma: a = bq + r where 0 ≤ r < ?","options":["a","b","q","r"],"correct_answer":"b"},
        {"id":"q3","question":"HCF of 12 and 18 using prime factorisation is?","options":["2","3","6","9"],"correct_answer":"6"},
        {"id":"q4","question":"√3 is?","options":["Rational","Integer","Irrational","Whole"],"correct_answer":"Irrational"},
        {"id":"q5","question":"The product of two irrational numbers is?","options":["Always irrational","Always rational","May be rational or irrational","Always zero"],"correct_answer":"May be rational or irrational"},
    ],
    "Quadratic Equations": [
        {"id":"q1","question":"The standard form of a quadratic equation is?","options":["ax + b = 0","ax² + bx + c = 0","ax³ + bx = 0","a/x + b = 0"],"correct_answer":"ax² + bx + c = 0"},
        {"id":"q2","question":"The discriminant of ax² + bx + c = 0 is?","options":["b² + 4ac","b² − 4ac","b + 4ac","√(b² − 4ac)"],"correct_answer":"b² − 4ac"},
        {"id":"q3","question":"If discriminant > 0, the equation has?","options":["No real roots","One real root","Two distinct real roots","Infinite roots"],"correct_answer":"Two distinct real roots"},
        {"id":"q4","question":"Roots of x² − 5x + 6 = 0 are?","options":["2, 3","1, 6","2, 4","3, 4"],"correct_answer":"2, 3"},
        {"id":"q5","question":"The sum of roots of ax² + bx + c = 0 is?","options":["c/a","-b/a","b/a","-c/a"],"correct_answer":"-b/a"},
    ],
    "Circles": [
        {"id":"q1","question":"A tangent to a circle touches it at?","options":["Two points","One point","Three points","The centre"],"correct_answer":"One point"},
        {"id":"q2","question":"The angle in a semicircle is?","options":["45°","60°","90°","180°"],"correct_answer":"90°"},
        {"id":"q3","question":"Area of a circle with radius r is?","options":["πr","2πr","πr²","2πr²"],"correct_answer":"πr²"},
        {"id":"q4","question":"Two tangents drawn from an external point to a circle are?","options":["Unequal","Parallel","Equal","Perpendicular to each other"],"correct_answer":"Equal"},
        {"id":"q5","question":"The longest chord of a circle is?","options":["Radius","Secant","Diameter","Arc"],"correct_answer":"Diameter"},
    ],
    "Probability": [
        {"id":"q1","question":"Probability of an impossible event is?","options":["1","0.5","0","-1"],"correct_answer":"0"},
        {"id":"q2","question":"Probability of getting a head when flipping a fair coin is?","options":["0","1/4","1/2","1"],"correct_answer":"1/2"},
        {"id":"q3","question":"The sum of probabilities of all outcomes is?","options":["0","0.5","1","2"],"correct_answer":"1"},
        {"id":"q4","question":"Probability of rolling a 6 on a fair die is?","options":["1/2","1/4","1/6","1/3"],"correct_answer":"1/6"},
        {"id":"q5","question":"If P(A) = 0.3, then P(not A) is?","options":["0.3","0.6","0.7","1.3"],"correct_answer":"0.7"},
    ],
    "Light": [
        {"id":"q1","question":"The speed of light in vacuum is?","options":["3 × 10⁶ m/s","3 × 10⁸ m/s","3 × 10¹° m/s","3 × 10⁴ m/s"],"correct_answer":"3 × 10⁸ m/s"},
        {"id":"q2","question":"The bending of light as it passes from one medium to another is?","options":["Reflection","Refraction","Diffraction","Absorption"],"correct_answer":"Refraction"},
        {"id":"q3","question":"A concave mirror is also known as a ___ mirror.","options":["Convex","Diverging","Converging","Flat"],"correct_answer":"Converging"},
        {"id":"q4","question":"A prism splits white light into?","options":["2 colours","3 colours","7 colours","1 colour"],"correct_answer":"7 colours"},
        {"id":"q5","question":"The lens in the human eye is?","options":["Concave","Convex","Cylindrical","Flat"],"correct_answer":"Convex"},
    ],
    "Life Processes": [
        {"id":"q1","question":"The process by which living organisms obtain energy from food is?","options":["Nutrition","Respiration","Excretion","Reproduction"],"correct_answer":"Respiration"},
        {"id":"q2","question":"Stomata in leaves help in?","options":["Absorption of water","Gas exchange and transpiration","Food preparation","Reproduction"],"correct_answer":"Gas exchange and transpiration"},
        {"id":"q3","question":"The heart is a ___ pump.","options":["Single","Double","Triple","No"],"correct_answer":"Double"},
        {"id":"q4","question":"Nephrons are the functional units of the?","options":["Heart","Lungs","Kidney","Liver"],"correct_answer":"Kidney"},
        {"id":"q5","question":"Haemoglobin carries ___ in blood.","options":["Carbon dioxide","Nutrients","Oxygen","Water"],"correct_answer":"Oxygen"},
    ],
    # CLASS 10
    "Trigonometry": [
        {"id":"q1","question":"In a right triangle, sin θ = ?","options":["Base/Hypotenuse","Perpendicular/Hypotenuse","Perpendicular/Base","Base/Perpendicular"],"correct_answer":"Perpendicular/Hypotenuse"},
        {"id":"q2","question":"What is sin 90°?","options":["0","1","√2/2","√3/2"],"correct_answer":"1"},
        {"id":"q3","question":"cos 0° = ?","options":["0","1","-1","√3/2"],"correct_answer":"1"},
        {"id":"q4","question":"tan 45° = ?","options":["0","1","√3","1/√3"],"correct_answer":"1"},
        {"id":"q5","question":"sin²θ + cos²θ = ?","options":["0","1","2","sin θ"],"correct_answer":"1"},
    ],
    "Chemical Reactions": [
        {"id":"q1","question":"A reaction in which two substances combine to form one product is called?","options":["Decomposition","Combination","Displacement","Double displacement"],"correct_answer":"Combination"},
        {"id":"q2","question":"Rusting of iron is an example of?","options":["Decomposition","Combination","Oxidation","Reduction"],"correct_answer":"Oxidation"},
        {"id":"q3","question":"What is produced when acid reacts with metal?","options":["Water","Salt","Hydrogen gas","Oxygen gas"],"correct_answer":"Hydrogen gas"},
        {"id":"q4","question":"A chemical equation is balanced to obey the law of?","options":["Gravity","Conservation of mass","Motion","Energy"],"correct_answer":"Conservation of mass"},
        {"id":"q5","question":"The chemical formula of water is?","options":["HO","H2O","H2O2","HO2"],"correct_answer":"H2O"},
    ],
    "Heredity": [
        {"id":"q1","question":"The father of genetics is?","options":["Darwin","Mendel","Watson","Lamarck"],"correct_answer":"Mendel"},
        {"id":"q2","question":"DNA stands for?","options":["Deoxyribonucleic Acid","Deoxyribose Nucleic Acid","Dextrose Nucleic Acid","Dual Nucleic Acid"],"correct_answer":"Deoxyribonucleic Acid"},
        {"id":"q3","question":"Chromosomes are found in the?","options":["Cytoplasm","Cell wall","Nucleus","Mitochondria"],"correct_answer":"Nucleus"},
        {"id":"q4","question":"Humans have ___ pairs of chromosomes.","options":["21","23","24","46"],"correct_answer":"23"},
        {"id":"q5","question":"A trait that is expressed in an organism is called?","options":["Recessive","Dominant","Hybrid","Genotype"],"correct_answer":"Dominant"},
    ],
    # CLASS 11
    "Sets": [
        {"id":"q1","question":"A set is a ___ collection of objects.","options":["Random","Well-defined","Ordered","Finite"],"correct_answer":"Well-defined"},
        {"id":"q2","question":"The set with no elements is called?","options":["Universal set","Singleton set","Empty set","Power set"],"correct_answer":"Empty set"},
        {"id":"q3","question":"A ∪ B represents?","options":["Intersection","Difference","Union","Complement"],"correct_answer":"Union"},
        {"id":"q4","question":"If A = {1, 2} then the number of subsets is?","options":["2","4","6","8"],"correct_answer":"4"},
        {"id":"q5","question":"A ∩ B represents elements that are in?","options":["Only A","Only B","Both A and B","Neither A nor B"],"correct_answer":"Both A and B"},
    ],
    "Relations and Functions": [
        {"id":"q1","question":"A function maps each input to?","options":["Multiple outputs","Exactly one output","No output","Random output"],"correct_answer":"Exactly one output"},
        {"id":"q2","question":"The set of all inputs of a function is called the?","options":["Range","Codomain","Domain","Image"],"correct_answer":"Domain"},
        {"id":"q3","question":"f(x) = x² is an example of a ___ function.","options":["Linear","Constant","Quadratic","Cubic"],"correct_answer":"Quadratic"},
        {"id":"q4","question":"A one-to-one function is also called?","options":["Onto","Injective","Bijective","Surjective"],"correct_answer":"Injective"},
        {"id":"q5","question":"If f(x) = 2x + 3, then f(2) is?","options":["5","6","7","8"],"correct_answer":"7"},
    ],
    "Trigonometry": [
        {"id":"q1","question":"sin²θ + cos²θ = ?","options":["0","1","2","θ"],"correct_answer":"1"},
        {"id":"q2","question":"tanθ = sinθ / ?","options":["tanθ","cosθ","secθ","cotθ"],"correct_answer":"cosθ"},
        {"id":"q3","question":"π radians = ___ degrees.","options":["90","180","270","360"],"correct_answer":"180"},
        {"id":"q4","question":"The value of sin 30° is?","options":["0","1/2","√3/2","1"],"correct_answer":"1/2"},
        {"id":"q5","question":"1 + tan²θ = ?","options":["cos²θ","sin²θ","sec²θ","cot²θ"],"correct_answer":"sec²θ"},
    ],
    "Complex Numbers": [
        {"id":"q1","question":"i² = ?","options":["1","-1","0","i"],"correct_answer":"-1"},
        {"id":"q2","question":"The real part of 3 + 4i is?","options":["4","3","7","0"],"correct_answer":"3"},
        {"id":"q3","question":"The modulus of 3 + 4i is?","options":["3","4","5","7"],"correct_answer":"5"},
        {"id":"q4","question":"The conjugate of a + bi is?","options":["a - bi","a + bi","-a + bi","-a - bi"],"correct_answer":"a - bi"},
        {"id":"q5","question":"(1 + i)² = ?","options":["1 + 2i","2i","1 - 2i","2"],"correct_answer":"2i"},
    ],
    "Units and Measurements": [
        {"id":"q1","question":"The SI unit of length is?","options":["Centimetre","Metre","Kilometre","Inch"],"correct_answer":"Metre"},
        {"id":"q2","question":"1 km = ___ m?","options":["10","100","1000","10000"],"correct_answer":"1000"},
        {"id":"q3","question":"The SI unit of time is?","options":["Minute","Hour","Second","Millisecond"],"correct_answer":"Second"},
        {"id":"q4","question":"Dimensional formula of velocity is?","options":["[MLT]","[ML²T]","[LT⁻¹]","[ML⁻¹T]"],"correct_answer":"[LT⁻¹]"},
        {"id":"q5","question":"Significant figures in 0.00230 are?","options":["2","3","5","6"],"correct_answer":"3"},
    ],
    "Basic Concepts of Chemistry": [
        {"id":"q1","question":"One mole of any substance contains ___ entities.","options":["6.022 × 10²³","3.14 × 10²³","1.6 × 10⁻¹⁹","9.1 × 10⁻³¹"],"correct_answer":"6.022 × 10²³"},
        {"id":"q2","question":"Atomic mass of Carbon is?","options":["6","12","14","16"],"correct_answer":"12"},
        {"id":"q3","question":"Molar mass of H₂O is?","options":["16 g/mol","18 g/mol","20 g/mol","14 g/mol"],"correct_answer":"18 g/mol"},
        {"id":"q4","question":"The law of conservation of mass states that mass is?","options":["Created in reactions","Destroyed in reactions","Neither created nor destroyed","Always increasing"],"correct_answer":"Neither created nor destroyed"},
        {"id":"q5","question":"Percentage composition tells us the?","options":["State of a compound","Mass percentage of each element","Volume of compound","Colour of compound"],"correct_answer":"Mass percentage of each element"},
    ],
    "Chemical Bonding": [
        {"id":"q1","question":"An ionic bond is formed by the ___ of electrons.","options":["Sharing","Transfer","Both sharing and transfer","Loss only"],"correct_answer":"Transfer"},
        {"id":"q2","question":"A covalent bond is formed by the ___ of electrons.","options":["Transfer","Sharing","Loss","Gain"],"correct_answer":"Sharing"},
        {"id":"q3","question":"NaCl is an example of an ___ compound.","options":["Covalent","Metallic","Ionic","Hydrogen-bonded"],"correct_answer":"Ionic"},
        {"id":"q4","question":"The shape of CH₄ is?","options":["Linear","Bent","Tetrahedral","Trigonal"],"correct_answer":"Tetrahedral"},
        {"id":"q5","question":"Hydrogen bonding is strongest in?","options":["CH₄","H₂S","HF","HCl"],"correct_answer":"HF"},
    ],
    "States of Matter": [
        {"id":"q1","question":"Matter exists in ___ states.","options":["2","3","4","5"],"correct_answer":"3"},
        {"id":"q2","question":"Gas has ___ shape and ___ volume.","options":["Fixed, fixed","Fixed, no fixed","No fixed, no fixed","No fixed, fixed"],"correct_answer":"No fixed, no fixed"},
        {"id":"q3","question":"Boyle’s Law states that at constant temperature, P × V is?","options":["Increasing","Decreasing","Constant","Zero"],"correct_answer":"Constant"},
        {"id":"q4","question":"The intermolecular forces in solids are?","options":["Weakest","Moderate","Strongest","Zero"],"correct_answer":"Strongest"},
        {"id":"q5","question":"Pressure of a gas increases when temperature increases at constant volume. This is?","options":["Boyle’s Law","Charles’ Law","Gay-Lussac’s Law","Avogadro’s Law"],"correct_answer":"Gay-Lussac’s Law"},
    ],
    "Thermodynamics": [
        {"id":"q1","question":"The first law of thermodynamics states that energy is?","options":["Created in a system","Destroyed in a system","Neither created nor destroyed","Always lost as heat"],"correct_answer":"Neither created nor destroyed"},
        {"id":"q2","question":"A reaction that releases heat is called?","options":["Endothermic","Exothermic","Isothermal","Adiabatic"],"correct_answer":"Exothermic"},
        {"id":"q3","question":"Enthalpy change (ΔH) < 0 means the reaction is?","options":["Endothermic","Exothermic","Neutral","Spontaneous always"],"correct_answer":"Exothermic"},
        {"id":"q4","question":"Entropy is a measure of?","options":["Energy","Temperature","Disorder or randomness","Pressure"],"correct_answer":"Disorder or randomness"},
        {"id":"q5","question":"Gibbs free energy ΔG < 0 means the reaction is?","options":["Non-spontaneous","Spontaneous","At equilibrium","Impossible"],"correct_answer":"Spontaneous"},
    ],
    "Living World": [
        {"id":"q1","question":"Taxonomy is the science of?","options":["Studying fossils","Classification of organisms","Studying cells","Genetics"],"correct_answer":"Classification of organisms"},
        {"id":"q2","question":"The basic unit of classification is?","options":["Class","Order","Species","Family"],"correct_answer":"Species"},
        {"id":"q3","question":"The scientific name of humans is?","options":["Homo erectus","Homo habilis","Homo sapiens","Pan troglodytes"],"correct_answer":"Homo sapiens"},
        {"id":"q4","question":"Binomial nomenclature was given by?","options":["Darwin","Mendel","Linnaeus","Watson"],"correct_answer":"Linnaeus"},
        {"id":"q5","question":"The correct sequence of taxonomic hierarchy is?","options":["Species-Genus-Family-Order-Class-Phylum-Kingdom","Kingdom-Phylum-Class-Order-Family-Genus-Species","Kingdom-Class-Order-Phylum-Family-Genus-Species","Species-Family-Order-Class-Genus-Phylum-Kingdom"],"correct_answer":"Kingdom-Phylum-Class-Order-Family-Genus-Species"},
    ],
    "Biological Classification": [
        {"id":"q1","question":"The five-kingdom classification was proposed by?","options":["Linnaeus","Whittaker","Darwin","Haeckel"],"correct_answer":"Whittaker"},
        {"id":"q2","question":"Bacteria belong to kingdom?","options":["Plantae","Fungi","Monera","Protista"],"correct_answer":"Monera"},
        {"id":"q3","question":"Fungi obtain nutrition by?","options":["Photosynthesis","Absorption","Ingestion","Chemosynthesis"],"correct_answer":"Absorption"},
        {"id":"q4","question":"Viruses are considered non-living because they?","options":["Have cells","Lack cells and cannot reproduce independently","Perform photosynthesis","Have metabolism"],"correct_answer":"Lack cells and cannot reproduce independently"},
        {"id":"q5","question":"Amoeba belongs to kingdom?","options":["Monera","Protista","Fungi","Plantae"],"correct_answer":"Protista"},
    ],
    "Plant Kingdom": [
        {"id":"q1","question":"Bryophytes are called the ___ of the plant kingdom.","options":["Flowers","Amphibians","Seeds","Giants"],"correct_answer":"Amphibians"},
        {"id":"q2","question":"Plants that bear seeds but no flowers are?","options":["Bryophytes","Pteridophytes","Gymnosperms","Angiosperms"],"correct_answer":"Gymnosperms"},
        {"id":"q3","question":"The dominant phase in bryophytes is?","options":["Sporophyte","Gametophyte","Both equally","Neither"],"correct_answer":"Gametophyte"},
        {"id":"q4","question":"Angiosperms are plants that have?","options":["No seeds","Naked seeds","Seeds enclosed in fruit","Spores only"],"correct_answer":"Seeds enclosed in fruit"},
        {"id":"q5","question":"Ferns belong to?","options":["Bryophyta","Pteridophyta","Gymnospermae","Angiospermae"],"correct_answer":"Pteridophyta"},
    ],
    "Human Physiology": [
        {"id":"q1","question":"The process of digestion begins in the?","options":["Stomach","Intestine","Mouth","Liver"],"correct_answer":"Mouth"},
        {"id":"q2","question":"The largest gland in the human body is the?","options":["Pancreas","Thyroid","Liver","Kidney"],"correct_answer":"Liver"},
        {"id":"q3","question":"The normal human body temperature is?","options":["36°C","37°C","38°C","35°C"],"correct_answer":"37°C"},
        {"id":"q4","question":"Insulin is secreted by the?","options":["Liver","Thyroid","Pancreas","Adrenal gland"],"correct_answer":"Pancreas"},
        {"id":"q5","question":"The functional unit of kidney is?","options":["Nephron","Neuron","Alveolus","Villus"],"correct_answer":"Nephron"},
    ],
    # CLASS 11 CS
    "Python Basics": [
        {"id":"q1","question":"Python is a ___ language.","options":["Low-level","Machine","High-level interpreted","Assembly"],"correct_answer":"High-level interpreted"},
        {"id":"q2","question":"Which function is used to display output in Python?","options":["input()","print()","show()","display()"],"correct_answer":"print()"},
        {"id":"q3","question":"What is the output of print(2 + 3)?","options":["23","5","2+3","Error"],"correct_answer":"5"},
        {"id":"q4","question":"Python uses ___ for code blocks instead of braces.","options":["Semicolons","Parentheses","Indentation","Brackets"],"correct_answer":"Indentation"},
        {"id":"q5","question":"Which symbol is used for comments in Python?","options":["//","/*","#","--"],"correct_answer":"#"},
    ],
    "Data Types": [
        {"id":"q1","question":"Which data type stores whole numbers in Python?","options":["float","str","int","bool"],"correct_answer":"int"},
        {"id":"q2","question":"The data type of 'Hello' in Python is?","options":["int","float","str","bool"],"correct_answer":"str"},
        {"id":"q3","question":"True and False are values of which data type?","options":["int","str","bool","float"],"correct_answer":"bool"},
        {"id":"q4","question":"type(3.14) in Python returns?","options":["<class 'int'>","<class 'str'>","<class 'float'>","<class 'bool'>"],"correct_answer":"<class 'float'>"},
        {"id":"q5","question":"A list in Python is?","options":["Immutable","Mutable and ordered","Unordered","Fixed size only"],"correct_answer":"Mutable and ordered"},
    ],
    "Conditional Statements": [
        {"id":"q1","question":"Which keyword is used for a conditional statement in Python?","options":["for","while","if","def"],"correct_answer":"if"},
        {"id":"q2","question":"What does 'elif' stand for?","options":["else if","else in loop","end if","extra if"],"correct_answer":"else if"},
        {"id":"q3","question":"What is the output: x=5; print('Yes' if x > 3 else 'No')?","options":["No","Yes","Error","5"],"correct_answer":"Yes"},
        {"id":"q4","question":"The operator != means?","options":["Equal to","Not equal to","Greater than","Less than"],"correct_answer":"Not equal to"},
        {"id":"q5","question":"Which block runs when the if condition is False?","options":["if","elif","else","for"],"correct_answer":"else"},
    ],
    "Loops": [
        {"id":"q1","question":"Which loop runs a fixed number of times?","options":["while","for","do-while","repeat"],"correct_answer":"for"},
        {"id":"q2","question":"What does 'break' do in a loop?","options":["Skips current iteration","Exits the loop","Restarts loop","Does nothing"],"correct_answer":"Exits the loop"},
        {"id":"q3","question":"range(5) generates numbers?","options":["1 to 5","0 to 5","0 to 4","1 to 4"],"correct_answer":"0 to 4"},
        {"id":"q4","question":"'continue' in a loop?","options":["Exits loop","Skips current iteration and continues","Repeats current iteration","Pauses loop"],"correct_answer":"Skips current iteration and continues"},
        {"id":"q5","question":"A while loop runs as long as its condition is?","options":["False","Zero","True","Negative"],"correct_answer":"True"},
    ],
    "Functions": [
        {"id":"q1","question":"A function in Python is defined using?","options":["func","define","def","function"],"correct_answer":"def"},
        {"id":"q2","question":"What keyword sends a value back from a function?","options":["send","output","return","yield"],"correct_answer":"return"},
        {"id":"q3","question":"A function with no return statement returns?","options":["0","Empty string","None","Error"],"correct_answer":"None"},
        {"id":"q4","question":"Parameters in function definition are?","options":["Values passed during call","Variables that receive values","Global variables","Constants"],"correct_answer":"Variables that receive values"},
        {"id":"q5","question":"A function that calls itself is called?","options":["Iterative","Recursive","Lambda","Anonymous"],"correct_answer":"Recursive"},
    ],
    # CLASS 11
    "Laws of Motion": [
        {"id":"q1","question":"Newton's First Law of Motion is also called the law of?","options":["Force","Inertia","Acceleration","Momentum"],"correct_answer":"Inertia"},
        {"id":"q2","question":"Force = Mass × ?","options":["Speed","Velocity","Acceleration","Momentum"],"correct_answer":"Acceleration"},
        {"id":"q3","question":"The SI unit of force is?","options":["Joule","Watt","Newton","Pascal"],"correct_answer":"Newton"},
        {"id":"q4","question":"Newton's Third Law states: For every action, there is an equal and opposite?","options":["Force","Reaction","Acceleration","Momentum"],"correct_answer":"Reaction"},
        {"id":"q5","question":"A body at rest remains at rest unless acted upon by?","options":["Gravity","External force","Friction","Inertia"],"correct_answer":"External force"},
    ],
    "Structure of Atom": [
        {"id":"q1","question":"Who discovered the electron?","options":["Rutherford","Bohr","J.J. Thomson","Chadwick"],"correct_answer":"J.J. Thomson"},
        {"id":"q2","question":"The nucleus of an atom contains?","options":["Electrons and protons","Protons and neutrons","Only protons","Electrons and neutrons"],"correct_answer":"Protons and neutrons"},
        {"id":"q3","question":"The charge of an electron is?","options":["Positive","Negative","Neutral","Variable"],"correct_answer":"Negative"},
        {"id":"q4","question":"Atomic number is equal to the number of?","options":["Neutrons","Electrons","Protons","Nucleons"],"correct_answer":"Protons"},
        {"id":"q5","question":"Who proposed the planetary model of atom?","options":["Thomson","Bohr","Rutherford","Dalton"],"correct_answer":"Rutherford"},
    ],
    "Cell Structure": [
        {"id":"q1","question":"The cell membrane is made of?","options":["Cellulose","Phospholipid bilayer","Protein only","Carbohydrates"],"correct_answer":"Phospholipid bilayer"},
        {"id":"q2","question":"Which organelle is responsible for protein synthesis?","options":["Mitochondria","Ribosome","Golgi body","Lysosome"],"correct_answer":"Ribosome"},
        {"id":"q3","question":"Chloroplasts are found in?","options":["Animal cells","Bacterial cells","Plant cells","Fungal cells"],"correct_answer":"Plant cells"},
        {"id":"q4","question":"The Golgi apparatus is involved in?","options":["Energy production","Protein packaging and transport","DNA replication","Photosynthesis"],"correct_answer":"Protein packaging and transport"},
        {"id":"q5","question":"Lysosomes contain?","options":["DNA","Digestive enzymes","Chlorophyll","RNA"],"correct_answer":"Digestive enzymes"},
    ],
    # CLASS 12
    "Matrices": [
        {"id":"q1","question":"A matrix with equal number of rows and columns is called a?","options":["Row matrix","Column matrix","Square matrix","Zero matrix"],"correct_answer":"Square matrix"},
        {"id":"q2","question":"The order of matrix A with 3 rows and 2 columns is?","options":["2×3","3×3","3×2","2×2"],"correct_answer":"3×2"},
        {"id":"q3","question":"The transpose of matrix A is denoted by?","options":["A⁻¹","Aᵀ","Aʲ","|A|"],"correct_answer":"Aᵀ"},
        {"id":"q4","question":"A matrix with all elements zero is called a?","options":["Identity matrix","Diagonal matrix","Zero matrix","Scalar matrix"],"correct_answer":"Zero matrix"},
        {"id":"q5","question":"AB = BA is the ___ property of matrices.","options":["Associative","Commutative","Not generally true","Distributive"],"correct_answer":"Not generally true"},
    ],
    "Current Electricity": [
        {"id":"q1","question":"Ohm's law: V = IR. The unit of resistance is?","options":["Volt","Ampere","Ohm","Watt"],"correct_answer":"Ohm"},
        {"id":"q2","question":"In a series circuit, resistances are?","options":["Added inversely","Added directly","Multiplied","Unchanged"],"correct_answer":"Added directly"},
        {"id":"q3","question":"The device used to measure current is?","options":["Voltmeter","Galvanometer","Ammeter","Ohmmeter"],"correct_answer":"Ammeter"},
        {"id":"q4","question":"Kirchhoff's current law states that the sum of currents at a junction is?","options":["Maximum","Minimum","Zero","Infinite"],"correct_answer":"Zero"},
        {"id":"q5","question":"The EMF of a battery is measured in?","options":["Ampere","Ohm","Watt","Volt"],"correct_answer":"Volt"},
    ],
    "Magnetism": [
        {"id":"q1","question":"Like poles of a magnet?","options":["Attract","Repel","Have no effect","Cancel"],"correct_answer":"Repel"},
        {"id":"q2","question":"The SI unit of magnetic field is?","options":["Gauss","Tesla","Weber","Henry"],"correct_answer":"Tesla"},
        {"id":"q3","question":"A current-carrying conductor in a magnetic field experiences?","options":["Gravitational force","Electrostatic force","Magnetic force","Nuclear force"],"correct_answer":"Magnetic force"},
        {"id":"q4","question":"The phenomenon of electromagnetic induction was discovered by?","options":["Maxwell","Faraday","Ampere","Ohm"],"correct_answer":"Faraday"},
        {"id":"q5","question":"Lenz's law is based on the conservation of?","options":["Charge","Momentum","Energy","Mass"],"correct_answer":"Energy"},
    ],
    "Optics": [
        {"id":"q1","question":"The focal length of a convex lens is?","options":["Negative","Positive","Zero","Infinite"],"correct_answer":"Positive"},
        {"id":"q2","question":"Total internal reflection occurs when light travels from?","options":["Rarer to denser medium","Denser to rarer medium","Air to glass","Glass to water"],"correct_answer":"Denser to rarer medium"},
        {"id":"q3","question":"The power of a lens is measured in?","options":["Metre","Dioptre","Candela","Lux"],"correct_answer":"Dioptre"},
        {"id":"q4","question":"Optical fibre works on the principle of?","options":["Refraction","Reflection","Total internal reflection","Diffraction"],"correct_answer":"Total internal reflection"},
        {"id":"q5","question":"A human eye defect where distant objects are blurred is called?","options":["Hypermetropia","Myopia","Astigmatism","Presbyopia"],"correct_answer":"Myopia"},
    ],
    "Modern Physics": [
        {"id":"q1","question":"Einstein's photoelectric equation: E = hf - ?","options":["KE","Work function","Potential energy","Kinetic energy of photon"],"correct_answer":"Work function"},
        {"id":"q2","question":"The dual nature of light means it behaves as both?","options":["Wave and sound","Particle and wave","Particle and heat","Wave and heat"],"correct_answer":"Particle and wave"},
        {"id":"q3","question":"In radioactive decay, alpha particle is a nucleus of?","options":["Hydrogen","Helium","Lithium","Carbon"],"correct_answer":"Helium"},
        {"id":"q4","question":"Nuclear fission releases energy by?","options":["Combining nuclei","Splitting heavy nuclei","Electron emission","Proton decay"],"correct_answer":"Splitting heavy nuclei"},
        {"id":"q5","question":"De Broglie wavelength λ = h/mv shows that matter has?","options":["Only particle nature","Only wave nature","Wave-particle duality","No definite nature"],"correct_answer":"Wave-particle duality"},
    ],
    "Solutions": [
        {"id":"q1","question":"A solution in which solvent is water is called a ___ solution.","options":["Non-aqueous","Aqueous","Saturated","Concentrated"],"correct_answer":"Aqueous"},
        {"id":"q2","question":"Molarity is defined as moles of solute per ___ of solution.","options":["100 mL","Litre","Gram","Kilogram"],"correct_answer":"Litre"},
        {"id":"q3","question":"Raoult's law relates to?","options":["Boiling point","Vapour pressure of solutions","Osmosis","Conductivity"],"correct_answer":"Vapour pressure of solutions"},
        {"id":"q4","question":"Osmotic pressure is a ___ property.","options":["Intensive","Additive","Colligative","Physical"],"correct_answer":"Colligative"},
        {"id":"q5","question":"A solution with solute concentration equal to body fluids is?","options":["Hypertonic","Hypotonic","Isotonic","Dilute"],"correct_answer":"Isotonic"},
    ],
    "Electrochemistry": [
        {"id":"q1","question":"In electrolysis, oxidation occurs at the?","options":["Cathode","Anode","Both electrodes","Electrolyte"],"correct_answer":"Anode"},
        {"id":"q2","question":"A galvanic cell converts ___ energy to ___ energy.","options":["Electrical to chemical","Chemical to electrical","Heat to electrical","Light to chemical"],"correct_answer":"Chemical to electrical"},
        {"id":"q3","question":"The standard electrode potential of hydrogen electrode is?","options":["-1.0 V","0.0 V","1.0 V","1.5 V"],"correct_answer":"0.0 V"},
        {"id":"q4","question":"Faraday's first law states that mass deposited is proportional to?","options":["Temperature","Voltage","Charge passed","Electrode size"],"correct_answer":"Charge passed"},
        {"id":"q5","question":"In a dry cell, the electrolyte is?","options":["Dilute H₂SO₄","KOH solution","Moist paste of NH₄Cl and ZnCl₂","NaCl solution"],"correct_answer":"Moist paste of NH₄Cl and ZnCl₂"},
    ],
    "Biomolecules": [
        {"id":"q1","question":"The monomer of proteins is?","options":["Glucose","Fatty acid","Amino acid","Nucleotide"],"correct_answer":"Amino acid"},
        {"id":"q2","question":"DNA and RNA are examples of?","options":["Carbohydrates","Proteins","Nucleic acids","Lipids"],"correct_answer":"Nucleic acids"},
        {"id":"q3","question":"The monomer of carbohydrates is?","options":["Amino acid","Fatty acid","Monosaccharide","Nucleotide"],"correct_answer":"Monosaccharide"},
        {"id":"q4","question":"Enzymes are biological?","options":["Carbohydrates","Lipids","Catalysts (proteins)","Nucleic acids"],"correct_answer":"Catalysts (proteins)"},
        {"id":"q5","question":"The double helix model of DNA was proposed by?","options":["Mendel and Morgan","Watson and Crick","Franklin and Wilkins","Avery and Chase"],"correct_answer":"Watson and Crick"},
    ],
    "Polymers": [
        {"id":"q1","question":"Polymers are large molecules made of repeating units called?","options":["Isotopes","Monomers","Isomers","Elements"],"correct_answer":"Monomers"},
        {"id":"q2","question":"Nylon is an example of a ___ polymer.","options":["Natural","Synthetic","Biopolymer","Rubber"],"correct_answer":"Synthetic"},
        {"id":"q3","question":"Starch and cellulose are natural polymers of?","options":["Amino acids","Glucose","Fatty acids","Nucleotides"],"correct_answer":"Glucose"},
        {"id":"q4","question":"PVC stands for?","options":["Polyvinyl chloride","Polyvinyl carbon","Polyvinylidene chloride","Polyvalent compound"],"correct_answer":"Polyvinyl chloride"},
        {"id":"q5","question":"Vulcanisation of rubber involves adding?","options":["Nitrogen","Sulphur","Carbon","Oxygen"],"correct_answer":"Sulphur"},
    ],
    "Reproduction": [
        {"id":"q1","question":"Asexual reproduction requires ___ parent(s).","options":["Two","Three","One","Four"],"correct_answer":"One"},
        {"id":"q2","question":"Fertilisation occurs in the ___ in humans.","options":["Ovary","Uterus","Fallopian tube","Cervix"],"correct_answer":"Fallopian tube"},
        {"id":"q3","question":"The male gamete in flowering plants is found in?","options":["Ovule","Pollen grain","Sepal","Pistil"],"correct_answer":"Pollen grain"},
        {"id":"q4","question":"Double fertilisation is a feature of?","options":["Gymnosperms","Bryophytes","Angiosperms","Pteridophytes"],"correct_answer":"Angiosperms"},
        {"id":"q5","question":"The human gestation period is approximately?","options":["6 months","9 months","12 months","3 months"],"correct_answer":"9 months"},
    ],
    "Evolution": [
        {"id":"q1","question":"Darwin's theory of evolution is based on?","options":["Inheritance of acquired characters","Natural selection and survival of fittest","Mutation only","Random mating"],"correct_answer":"Natural selection and survival of fittest"},
        {"id":"q2","question":"The origin of life on Earth is approximately ___ years ago.","options":["1 billion","2 billion","3.5 billion","10 billion"],"correct_answer":"3.5 billion"},
        {"id":"q3","question":"Homologous organs have the same ___ but different functions.","options":["Function","Structure/origin","Colour","Size"],"correct_answer":"Structure/origin"},
        {"id":"q4","question":"The process of formation of new species from existing ones is called?","options":["Mutation","Speciation","Adaptation","Migration"],"correct_answer":"Speciation"},
        {"id":"q5","question":"Fossils are evidence of?","options":["Future organisms","Past organisms","Living organisms","Microscopic organisms"],"correct_answer":"Past organisms"},
    ],
    "Biotechnology": [
        {"id":"q1","question":"Recombinant DNA technology involves combining DNA from?","options":["Same organism","Different organisms","Only bacteria","Only viruses"],"correct_answer":"Different organisms"},
        {"id":"q2","question":"Restriction enzymes cut DNA at?","options":["Random positions","Specific recognition sequences","Only ends","Promoter regions"],"correct_answer":"Specific recognition sequences"},
        {"id":"q3","question":"PCR (Polymerase Chain Reaction) is used to?","options":["Destroy DNA","Amplify specific DNA sequences","Sequence proteins","Create mRNA"],"correct_answer":"Amplify specific DNA sequences"},
        {"id":"q4","question":"Bt crops are genetically modified to produce?","options":["More vitamins","Toxin against insects","Extra protein","Disease resistance only"],"correct_answer":"Toxin against insects"},
        {"id":"q5","question":"Cloning produces organisms that are ___ to the parent.","options":["Different","Genetically identical","Larger","More evolved"],"correct_answer":"Genetically identical"},
    ],
    "Ecology": [
        {"id":"q1","question":"Ecology is the study of the relationship between organisms and their?","options":["Cells","Genes","Environment","Fossils"],"correct_answer":"Environment"},
        {"id":"q2","question":"The maximum population a habitat can support is called?","options":["Biotic potential","Carrying capacity","Natality","Mortality"],"correct_answer":"Carrying capacity"},
        {"id":"q3","question":"Lichen is an example of?","options":["Parasitism","Commensalism","Mutualism","Predation"],"correct_answer":"Mutualism"},
        {"id":"q4","question":"The greenhouse effect leads to?","options":["Cooling of Earth","Global warming","Ozone increase","More rainfall"],"correct_answer":"Global warming"},
        {"id":"q5","question":"Biodiversity hotspot has more than ___ endemic plant species.","options":["500","1000","1500","2000"],"correct_answer":"1500"},
    ],
    # CLASS 12 CS
    "Advanced Python": [
        {"id":"q1","question":"A decorator in Python is used to?","options":["Delete functions","Modify function behaviour","Create classes","Import modules"],"correct_answer":"Modify function behaviour"},
        {"id":"q2","question":"List comprehension [x**2 for x in range(3)] gives?","options":["[1, 4, 9]","[0, 1, 4]","[0, 2, 4]","[1, 2, 3]"],"correct_answer":"[0, 1, 4]"},
        {"id":"q3","question":"Which statement is used for exception handling?","options":["if-else","try-except","for-while","def-return"],"correct_answer":"try-except"},
        {"id":"q4","question":"A generator function uses the ___ keyword.","options":["return","send","yield","give"],"correct_answer":"yield"},
        {"id":"q5","question":"lambda x: x*2 is an example of?","options":["Regular function","Class method","Anonymous/lambda function","Recursive function"],"correct_answer":"Anonymous/lambda function"},
    ],
    "SQL": [
        {"id":"q1","question":"SQL stands for?","options":["Structured Query Language","Simple Query Language","System Query Logic","Standard Query Loop"],"correct_answer":"Structured Query Language"},
        {"id":"q2","question":"Which SQL command retrieves data?","options":["INSERT","DELETE","SELECT","UPDATE"],"correct_answer":"SELECT"},
        {"id":"q3","question":"The WHERE clause is used to?","options":["Sort data","Group data","Filter rows","Join tables"],"correct_answer":"Filter rows"},
        {"id":"q4","question":"PRIMARY KEY ensures?","options":["Duplicate records","Null values","Unique identification of each row","Foreign relationships"],"correct_answer":"Unique identification of each row"},
        {"id":"q5","question":"Which clause sorts results in ascending order?","options":["GROUP BY","HAVING","ORDER BY ASC","WHERE"],"correct_answer":"ORDER BY ASC"},
    ],
    "Database Management": [
        {"id":"q1","question":"A DBMS is used to?","options":["Write programs","Manage and organise data","Design hardware","Build networks"],"correct_answer":"Manage and organise data"},
        {"id":"q2","question":"RDBMS stores data in?","options":["Files","Tables with rows and columns","Arrays","Binary trees"],"correct_answer":"Tables with rows and columns"},
        {"id":"q3","question":"The concept of normalisation reduces?","options":["Speed","Data redundancy","Number of tables","Security"],"correct_answer":"Data redundancy"},
        {"id":"q4","question":"A foreign key in a table references the ___ of another table.","options":["Foreign key","Primary key","All columns","Index"],"correct_answer":"Primary key"},
        {"id":"q5","question":"ACID properties ensure?","options":["Fast queries","Reliable transactions","Large storage","Network speed"],"correct_answer":"Reliable transactions"},
    ],
    "Data Structures": [
        {"id":"q1","question":"A stack follows ___ order.","options":["FIFO","LIFO","Random","Sorted"],"correct_answer":"LIFO"},
        {"id":"q2","question":"A queue follows ___ order.","options":["LIFO","FIFO","Sorted","Random"],"correct_answer":"FIFO"},
        {"id":"q3","question":"Binary search requires the array to be?","options":["Unsorted","Sorted","Reversed","Duplicated"],"correct_answer":"Sorted"},
        {"id":"q4","question":"The time complexity of linear search in worst case is?","options":["O(1)","O(log n)","O(n)","O(n²)"],"correct_answer":"O(n)"},
        {"id":"q5","question":"A linked list node contains data and a?","options":["Value","Array","Pointer to next node","Stack"],"correct_answer":"Pointer to next node"},
    ],
    "Computer Networks": [
        {"id":"q1","question":"LAN stands for?","options":["Large Area Network","Local Area Network","Linked Area Network","Long Access Network"],"correct_answer":"Local Area Network"},
        {"id":"q2","question":"IP address identifies a device on a?","options":["Hard drive","Network","Keyboard","Screen"],"correct_answer":"Network"},
        {"id":"q3","question":"The protocol used for web browsing is?","options":["FTP","SMTP","HTTP","POP3"],"correct_answer":"HTTP"},
        {"id":"q4","question":"A router is used to?","options":["Store data","Connect different networks","Display images","Input text"],"correct_answer":"Connect different networks"},
        {"id":"q5","question":"The OSI model has ___ layers.","options":["4","5","6","7"],"correct_answer":"7"},
    ],
    # CLASS 12
    "Differentiation": [
        {"id":"q1","question":"The derivative of xⁿ is?","options":["xⁿ⁻¹","nxⁿ","nxⁿ⁻¹","nx"],"correct_answer":"nxⁿ⁻¹"},
        {"id":"q2","question":"The derivative of a constant is?","options":["1","0","The constant itself","∞"],"correct_answer":"0"},
        {"id":"q3","question":"d/dx (sin x) = ?","options":["cos x","-cos x","sin x","-sin x"],"correct_answer":"cos x"},
        {"id":"q4","question":"The derivative of eˣ is?","options":["eˣ","xeˣ⁻¹","1","0"],"correct_answer":"eˣ"},
        {"id":"q5","question":"If f(x) = x², then f'(x) = ?","options":["x","2x","x²","2x²"],"correct_answer":"2x"},
    ],
    "Integration": [
        {"id":"q1","question":"∫xⁿ dx = ?","options":["xⁿ⁺¹","xⁿ⁺¹/(n+1) + C","nxⁿ⁻¹","xⁿ/n + C"],"correct_answer":"xⁿ⁺¹/(n+1) + C"},
        {"id":"q2","question":"∫cos x dx = ?","options":["sin x + C","-sin x + C","cos x + C","-cos x + C"],"correct_answer":"sin x + C"},
        {"id":"q3","question":"Integration is the reverse of?","options":["Addition","Multiplication","Differentiation","Division"],"correct_answer":"Differentiation"},
        {"id":"q4","question":"∫eˣ dx = ?","options":["eˣ + C","eˣ⁺¹ + C","xeˣ + C","eˣ/x + C"],"correct_answer":"eˣ + C"},
        {"id":"q5","question":"The constant added in indefinite integration is called?","options":["Coefficient","Constant of integration","Limit","Derivative"],"correct_answer":"Constant of integration"},
    ],
    "Electrostatics": [
        {"id":"q1","question":"Like charges?","options":["Attract each other","Repel each other","Have no effect","Cancel out"],"correct_answer":"Repel each other"},
        {"id":"q2","question":"The SI unit of electric charge is?","options":["Ampere","Volt","Coulomb","Farad"],"correct_answer":"Coulomb"},
        {"id":"q3","question":"Electric field lines start from?","options":["Negative charge","Positive charge","Neutral point","Earth"],"correct_answer":"Positive charge"},
        {"id":"q4","question":"Coulomb's law gives the force between two?","options":["Magnets","Point charges","Neutral bodies","Current-carrying wires"],"correct_answer":"Point charges"},
        {"id":"q5","question":"The SI unit of electric potential is?","options":["Joule","Coulomb","Volt","Ampere"],"correct_answer":"Volt"},
    ],
    "Organic Chemistry": [
        {"id":"q1","question":"Organic chemistry is the study of compounds containing?","options":["Nitrogen","Carbon","Oxygen","Hydrogen"],"correct_answer":"Carbon"},
        {"id":"q2","question":"The simplest organic compound is?","options":["Ethane","Propane","Methane","Butane"],"correct_answer":"Methane"},
        {"id":"q3","question":"Functional group -OH is found in?","options":["Aldehyde","Ketone","Alcohol","Acid"],"correct_answer":"Alcohol"},
        {"id":"q4","question":"The IUPAC name for CH₄ is?","options":["Ethane","Propane","Methane","Butane"],"correct_answer":"Methane"},
        {"id":"q5","question":"Isomers have the same molecular formula but different?","options":["Mass","Atomic number","Structural arrangement","Number of atoms"],"correct_answer":"Structural arrangement"},
    ],
    "Genetics": [
        {"id":"q1","question":"The complete genetic material of an organism is called its?","options":["Genome","Gene","Chromosome","Allele"],"correct_answer":"Genome"},
        {"id":"q2","question":"RNA stands for?","options":["Ribonucleic Acid","Reverse Nucleic Acid","Ribosome Nucleic Acid","Rapid Nucleic Acid"],"correct_answer":"Ribonucleic Acid"},
        {"id":"q3","question":"A change in the DNA sequence is called?","options":["Mitosis","Meiosis","Mutation","Replication"],"correct_answer":"Mutation"},
        {"id":"q4","question":"Which type of cell division produces gametes?","options":["Mitosis","Meiosis","Amitosis","Binary fission"],"correct_answer":"Meiosis"},
        {"id":"q5","question":"The two strands of DNA are held together by?","options":["Covalent bonds","Ionic bonds","Hydrogen bonds","Peptide bonds"],"correct_answer":"Hydrogen bonds"},
    ],
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


def _get_quiz(topic: str, subject: str, grade: str) -> list:
    """Return topic-specific quiz or generate a subject-specific fallback."""
    if topic in TOPIC_QUIZZES:
        return TOPIC_QUIZZES[topic]

    n = _grade_num(grade)
    subj = subject.replace("_", " ").title()

    # Subject-aware fallback questions that at least reference the topic
    return [
        {
            "id": "q1",
            "question": f"What is the main concept studied in '{topic}' for Class {n} {subj}?",
            "options": [
                f"The fundamental principles of {topic}",
                "A type of weather pattern",
                "A musical term",
                "A cooking technique"
            ],
            "correct_answer": f"The fundamental principles of {topic}"
        },
        {
            "id": "q2",
            "question": f"Which subject area does '{topic}' belong to in NCERT Class {n}?",
            "options": [subj, "History", "Music", "Physical Education"],
            "correct_answer": subj
        },
        {
            "id": "q3",
            "question": f"Why is learning '{topic}' important for Class {n} students?",
            "options": [
                f"It builds a strong foundation for advanced {subj}",
                "It is not important",
                "Only for entertainment",
                "It is only for exams"
            ],
            "correct_answer": f"It builds a strong foundation for advanced {subj}"
        },
        {
            "id": "q4",
            "question": f"Which NCERT subject includes '{topic}' in Class {n}?",
            "options": [subj, "Sanskrit", "Art", "Sports"],
            "correct_answer": subj
        },
        {
            "id": "q5",
            "question": f"What should you do after studying '{topic}' to remember it better?",
            "options": [
                "Review notes and practice problems",
                "Close the book immediately",
                "Watch unrelated videos",
                "Skip revision"
            ],
            "correct_answer": "Review notes and practice problems"
        },
    ]


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
        ],
        "key_concepts": objectives,
        "real_life_example": f"Think about how {topic.lower()} affects everything from the food we eat to the technology we use.",
        "flashcards": [
            {"front": f"Define {topic}", "back": f"A core topic in {subject.replace('_', ' ')} focusing on fundamental principles."},
            {"front": f"Significance of {topic}", "back": "Essential for board exams and competitive test preparation."},
            {"front": "Key Term", "back": f"Main component related to {topic.lower()}."},
            {"front": "Revision Strategy", "back": "Use the 5-step method: Read, Watch, Practice, Quiz, Revise."},
        ],
        "revision_notes": f"Quick Revision for {topic}\n\n- Core Definition: Master the basic meaning first.\n- Formula/Rule: Practice the main method 3 times.\n- Examples: Review the provided examples.\n- Checklist: Complete the interactive activity.",
        "activity": f"Interactive Task: Create a Concept Map for {topic}. Draw the main idea in the center and add 4 branches showing its applications.",
        "quiz": _get_quiz(topic, subject, grade),
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
