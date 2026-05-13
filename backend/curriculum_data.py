# NeuraLearn CBSE/ICSE Curriculum Data - Classes 1-12

CURRICULUM_LESSONS = [

  # ─────────────────────────────────────────────
  # CLASS 1 – Numbers 1-100
  # ─────────────────────────────────────────────
  {
    "id": "c1_math_numbers",
    "title": "Numbers 1 to 100",
    "subject": "Mathematics",
    "grade": "class_1",
    "concept_id": "numbers_1_100",
    "difficulty": 1,
    "introduction": (
      "Numbers help us count things around us, like apples, toys, and friends. "
      "We use numbers every day when we count, compare, and order things. "
      "In this lesson, we will learn to read and write numbers from 1 to 100!"
    ),
    "explanation": (
      "Numbers from 1 to 9 are called single-digit numbers. "
      "Numbers from 10 to 99 are called two-digit numbers, and 100 is a three-digit number. "
      "When we count, we say: 1, 2, 3 … all the way up to 100. "
      "We can also arrange numbers in order from smallest to biggest, which is called ascending order."
    ),
    "examples": [
      {
        "problem": "Write the number that comes after 45.",
        "answer": "46",
        "explanation": "When counting forward, the number after 45 is 46. We just add 1 to 45."
      },
      {
        "problem": "Which is greater: 37 or 73?",
        "answer": "73",
        "explanation": "73 is greater because the tens digit (7) is bigger than the tens digit of 37 (3)."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "What number comes just before 50?",
        "options": ["48", "49", "51", "50"],
        "correct_answer": "49"
      },
      {
        "id": "q2",
        "question": "How many tens are in the number 60?",
        "options": ["6", "60", "0", "16"],
        "correct_answer": "6"
      },
      {
        "id": "q3",
        "question": "Which number is the smallest?",
        "options": ["45", "54", "14", "41"],
        "correct_answer": "14"
      },
      {
        "id": "q4",
        "question": "What is 10 more than 23?",
        "options": ["24", "33", "32", "13"],
        "correct_answer": "33"
      },
      {
        "id": "q5",
        "question": "How do you write ninety-nine in digits?",
        "options": ["90", "909", "99", "9"],
        "correct_answer": "99"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 1 – Addition
  # ─────────────────────────────────────────────
  {
    "id": "c1_math_addition",
    "title": "Addition – Putting Numbers Together",
    "subject": "Mathematics",
    "grade": "class_1",
    "concept_id": "addition_basic",
    "difficulty": 1,
    "introduction": (
      "Addition means putting two groups of things together to find the total. "
      "If you have 3 mangoes and your friend gives you 2 more, you now have 5 mangoes! "
      "The '+' sign is used to show addition."
    ),
    "explanation": (
      "When we add two numbers, we combine them to get a bigger number called the sum. "
      "For example, 4 + 3 = 7 means four things plus three things equals seven things. "
      "We can add numbers in any order and still get the same answer — this is called the commutative property. "
      "Adding 0 to any number gives the same number back."
    ),
    "examples": [
      {
        "problem": "There are 5 red balls and 4 blue balls. How many balls are there in all?",
        "answer": "9 balls",
        "explanation": "5 + 4 = 9. We add the two groups together to get the total."
      },
      {
        "problem": "What is 7 + 6?",
        "answer": "13",
        "explanation": "7 + 6 = 13. You can count on from 7: 8, 9, 10, 11, 12, 13."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "What is 8 + 5?",
        "options": ["12", "13", "14", "11"],
        "correct_answer": "13"
      },
      {
        "id": "q2",
        "question": "Riya has 6 pencils. She gets 3 more. How many does she have now?",
        "options": ["8", "9", "10", "7"],
        "correct_answer": "9"
      },
      {
        "id": "q3",
        "question": "What is 0 + 15?",
        "options": ["0", "1", "15", "16"],
        "correct_answer": "15"
      },
      {
        "id": "q4",
        "question": "Which gives the same answer as 4 + 7?",
        "options": ["7 + 4", "4 + 4", "7 + 7", "4 - 7"],
        "correct_answer": "7 + 4"
      },
      {
        "id": "q5",
        "question": "What is 9 + 9?",
        "options": ["17", "19", "18", "16"],
        "correct_answer": "18"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 2 – Subtraction
  # ─────────────────────────────────────────────
  {
    "id": "c2_math_subtraction",
    "title": "Subtraction – Taking Away",
    "subject": "Mathematics",
    "grade": "class_2",
    "concept_id": "subtraction_basic",
    "difficulty": 2,
    "introduction": (
      "Subtraction means taking away some things from a group to find how many are left. "
      "If you have 8 cookies and eat 3, you have 5 cookies left! "
      "The '−' sign is used to show subtraction."
    ),
    "explanation": (
      "When we subtract, we start with a bigger number and take away a smaller number to get the difference. "
      "For example, 9 − 4 = 5 means we start with 9 and remove 4, leaving 5. "
      "Subtraction is the opposite of addition — if 3 + 5 = 8, then 8 − 5 = 3. "
      "We cannot subtract a bigger number from a smaller number in basic subtraction (the answer would be negative, which we learn later)."
    ),
    "examples": [
      {
        "problem": "There are 10 birds on a tree. 4 fly away. How many are left?",
        "answer": "6 birds",
        "explanation": "10 − 4 = 6. We take away 4 from 10 and 6 birds remain."
      },
      {
        "problem": "What is 15 − 7?",
        "answer": "8",
        "explanation": "15 − 7 = 8. Count back 7 steps from 15: 14, 13, 12, 11, 10, 9, 8."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "What is 12 − 5?",
        "options": ["6", "7", "8", "17"],
        "correct_answer": "7"
      },
      {
        "id": "q2",
        "question": "Arjun had 20 toffees. He gave 8 to his friends. How many does he have left?",
        "options": ["28", "12", "11", "13"],
        "correct_answer": "12"
      },
      {
        "id": "q3",
        "question": "What is 18 − 18?",
        "options": ["1", "18", "0", "36"],
        "correct_answer": "0"
      },
      {
        "id": "q4",
        "question": "If 6 + 9 = 15, what is 15 − 9?",
        "options": ["9", "6", "5", "24"],
        "correct_answer": "6"
      },
      {
        "id": "q5",
        "question": "What is 17 − 8?",
        "options": ["8", "10", "9", "11"],
        "correct_answer": "9"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 2 – Plants & Animals
  # ─────────────────────────────────────────────
  {
    "id": "c2_evs_plants_animals",
    "title": "Plants and Animals Around Us",
    "subject": "Environmental Studies",
    "grade": "class_2",
    "concept_id": "plants_animals_basic",
    "difficulty": 1,
    "introduction": (
      "Plants and animals are living things that we see all around us. "
      "Plants give us food, oxygen, and shade, while animals help in many ways too. "
      "Let's learn about how plants and animals are different and how they help each other!"
    ),
    "explanation": (
      "Plants make their own food using sunlight, water, and air — this is called photosynthesis. "
      "Animals cannot make their own food; they eat plants or other animals to get energy. "
      "Plants have roots, stems, leaves, flowers, and fruits, while animals have body parts like legs, wings, or fins. "
      "Both plants and animals need water, air, and food to stay alive and grow."
    ),
    "examples": [
      {
        "problem": "Name two things a plant needs to make its own food.",
        "answer": "Sunlight and water (also needs air/carbon dioxide)",
        "explanation": "Plants use sunlight and water along with carbon dioxide from the air to make food through photosynthesis."
      },
      {
        "problem": "Is a cow a plant-eater or a meat-eater?",
        "answer": "Plant-eater (herbivore)",
        "explanation": "Cows eat grass and other plants, so they are called herbivores or plant-eaters."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Which part of the plant takes in water from the soil?",
        "options": ["Leaves", "Flowers", "Roots", "Stem"],
        "correct_answer": "Roots"
      },
      {
        "id": "q2",
        "question": "Which of these is a plant-eater (herbivore)?",
        "options": ["Lion", "Tiger", "Rabbit", "Eagle"],
        "correct_answer": "Rabbit"
      },
      {
        "id": "q3",
        "question": "What gas do plants give out that helps us breathe?",
        "options": ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
        "correct_answer": "Oxygen"
      },
      {
        "id": "q4",
        "question": "Which of these is NOT a part of a plant?",
        "options": ["Root", "Leaf", "Wing", "Stem"],
        "correct_answer": "Wing"
      },
      {
        "id": "q5",
        "question": "Animals that eat both plants and animals are called:",
        "options": ["Herbivores", "Carnivores", "Omnivores", "Decomposers"],
        "correct_answer": "Omnivores"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 2 – Our Body
  # ─────────────────────────────────────────────
  {
    "id": "c2_evs_our_body",
    "title": "Our Body and Its Parts",
    "subject": "Environmental Studies",
    "grade": "class_2",
    "concept_id": "human_body_basic",
    "difficulty": 1,
    "introduction": (
      "Our body is an amazing machine that helps us walk, talk, eat, and think. "
      "It has many parts, and each part has a special job to do. "
      "Taking care of our body by eating well, exercising, and sleeping keeps us healthy!"
    ),
    "explanation": (
      "Our body has external parts like eyes, ears, nose, hands, and legs that we can see. "
      "Inside our body are organs like the heart, lungs, stomach, and brain that do important jobs. "
      "The brain controls everything we do — thinking, moving, and feeling. "
      "The heart pumps blood all around the body, and the lungs help us breathe in oxygen."
    ),
    "examples": [
      {
        "problem": "What is the job of the lungs?",
        "answer": "The lungs help us breathe — they take in oxygen and release carbon dioxide.",
        "explanation": "When we breathe in, air goes into the lungs. The lungs take the oxygen from the air and send it to the blood."
      },
      {
        "problem": "Which sense organ do we use to smell flowers?",
        "answer": "Nose",
        "explanation": "The nose is our sense organ for smell. It detects different smells in the air."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Which organ pumps blood through our body?",
        "options": ["Brain", "Lungs", "Heart", "Stomach"],
        "correct_answer": "Heart"
      },
      {
        "id": "q2",
        "question": "How many sense organs does our body have?",
        "options": ["3", "4", "5", "6"],
        "correct_answer": "5"
      },
      {
        "id": "q3",
        "question": "Which part of the body helps us think and remember?",
        "options": ["Heart", "Brain", "Stomach", "Lungs"],
        "correct_answer": "Brain"
      },
      {
        "id": "q4",
        "question": "What does the stomach do?",
        "options": ["Pumps blood", "Helps us breathe", "Digests food", "Controls movement"],
        "correct_answer": "Digests food"
      },
      {
        "id": "q5",
        "question": "Which sense organ do we use to see?",
        "options": ["Ears", "Nose", "Eyes", "Tongue"],
        "correct_answer": "Eyes"
      }
    ]
  },


  # ─────────────────────────────────────────────
  # CLASS 3 – Multiplication Tables
  # ─────────────────────────────────────────────
  {
    "id": "c3_math_multiplication",
    "title": "Multiplication Tables",
    "subject": "Mathematics",
    "grade": "class_3",
    "concept_id": "multiplication_tables",
    "difficulty": 2,
    "introduction": (
      "Multiplication is a quick way of adding the same number many times. "
      "Instead of writing 4 + 4 + 4, we can simply write 4 × 3 = 12. "
      "Learning multiplication tables helps us solve problems much faster!"
    ),
    "explanation": (
      "When we multiply two numbers, we get a product. For example, 6 × 7 = 42. "
      "The numbers being multiplied are called factors, and the result is the product. "
      "Multiplying any number by 1 gives the same number, and multiplying by 0 always gives 0. "
      "Like addition, multiplication is also commutative: 3 × 5 = 5 × 3 = 15."
    ),
    "examples": [
      {
        "problem": "A box has 6 chocolates. How many chocolates are in 4 such boxes?",
        "answer": "24 chocolates",
        "explanation": "6 × 4 = 24. We multiply the number of chocolates per box by the number of boxes."
      },
      {
        "problem": "What is 8 × 7?",
        "answer": "56",
        "explanation": "8 × 7 = 56. This is a key multiplication fact from the 8-times table."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "What is 9 × 6?",
        "options": ["54", "56", "63", "45"],
        "correct_answer": "54"
      },
      {
        "id": "q2",
        "question": "What is any number multiplied by 0?",
        "options": ["The number itself", "1", "0", "Undefined"],
        "correct_answer": "0"
      },
      {
        "id": "q3",
        "question": "There are 5 rows of chairs with 8 chairs in each row. How many chairs in total?",
        "options": ["13", "40", "45", "35"],
        "correct_answer": "40"
      },
      {
        "id": "q4",
        "question": "Which of these equals 7 × 4?",
        "options": ["4 × 7", "7 + 4", "7 − 4", "74"],
        "correct_answer": "4 × 7"
      },
      {
        "id": "q5",
        "question": "What is 12 × 3?",
        "options": ["15", "36", "33", "30"],
        "correct_answer": "36"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 3 – Shapes
  # ─────────────────────────────────────────────
  {
    "id": "c3_math_shapes",
    "title": "2D and 3D Shapes",
    "subject": "Mathematics",
    "grade": "class_3",
    "concept_id": "shapes_basic",
    "difficulty": 2,
    "introduction": (
      "Shapes are all around us — the wheel of a bicycle is a circle, a book is a rectangle, and a die is a cube! "
      "Flat shapes like circles and squares are called 2D shapes, while solid shapes like spheres and cubes are 3D shapes. "
      "Learning about shapes helps us understand the world around us."
    ),
    "explanation": (
      "2D (two-dimensional) shapes are flat and have only length and width — examples are triangle, square, rectangle, and circle. "
      "3D (three-dimensional) shapes have length, width, and height — examples are cube, cuboid, sphere, cylinder, and cone. "
      "A square has 4 equal sides and 4 right angles, while a rectangle has 4 sides but only opposite sides are equal. "
      "A triangle has 3 sides and 3 angles, and the sum of its angles is always 180°."
    ),
    "examples": [
      {
        "problem": "How many faces does a cube have?",
        "answer": "6 faces",
        "explanation": "A cube has 6 square faces — top, bottom, front, back, left, and right."
      },
      {
        "problem": "Name the shape that has no corners and no sides.",
        "answer": "Circle",
        "explanation": "A circle is a perfectly round shape with no straight sides or corners (vertices)."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "How many sides does a pentagon have?",
        "options": ["4", "5", "6", "3"],
        "correct_answer": "5"
      },
      {
        "id": "q2",
        "question": "Which 3D shape looks like a ball?",
        "options": ["Cube", "Cylinder", "Cone", "Sphere"],
        "correct_answer": "Sphere"
      },
      {
        "id": "q3",
        "question": "A triangle has how many angles?",
        "options": ["2", "3", "4", "5"],
        "correct_answer": "3"
      },
      {
        "id": "q4",
        "question": "Which shape has all four sides equal and all angles 90°?",
        "options": ["Rectangle", "Rhombus", "Square", "Trapezium"],
        "correct_answer": "Square"
      },
      {
        "id": "q5",
        "question": "How many edges does a cuboid have?",
        "options": ["8", "10", "12", "6"],
        "correct_answer": "12"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 4 – Fractions Basics
  # ─────────────────────────────────────────────
  {
    "id": "c4_math_fractions",
    "title": "Introduction to Fractions",
    "subject": "Mathematics",
    "grade": "class_4",
    "concept_id": "fractions_basic",
    "difficulty": 3,
    "introduction": (
      "A fraction represents a part of a whole. "
      "If you cut a pizza into 4 equal slices and eat 1 slice, you have eaten 1/4 (one-fourth) of the pizza. "
      "Fractions help us describe parts of things in everyday life."
    ),
    "explanation": (
      "A fraction has two parts: the numerator (top number) tells how many parts we have, "
      "and the denominator (bottom number) tells how many equal parts the whole is divided into. "
      "In the fraction 3/5, the numerator is 3 and the denominator is 5. "
      "When the numerator equals the denominator (like 4/4), the fraction equals 1 whole. "
      "Fractions with the same denominator are called like fractions and can be added directly."
    ),
    "examples": [
      {
        "problem": "A ribbon is cut into 8 equal parts. Priya uses 3 parts. What fraction did she use?",
        "answer": "3/8",
        "explanation": "Priya used 3 out of 8 equal parts, so the fraction is 3/8 (three-eighths)."
      },
      {
        "problem": "Which is greater: 3/4 or 2/4?",
        "answer": "3/4",
        "explanation": "Both fractions have the same denominator (4), so we compare numerators. 3 > 2, so 3/4 > 2/4."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "In the fraction 5/8, what is the denominator?",
        "options": ["5", "8", "3", "13"],
        "correct_answer": "8"
      },
      {
        "id": "q2",
        "question": "What fraction of a week is 1 day?",
        "options": ["1/5", "1/6", "1/7", "1/4"],
        "correct_answer": "1/7"
      },
      {
        "id": "q3",
        "question": "Which fraction is equal to one whole?",
        "options": ["3/4", "5/6", "7/7", "2/3"],
        "correct_answer": "7/7"
      },
      {
        "id": "q4",
        "question": "What is 1/4 + 2/4?",
        "options": ["3/8", "3/4", "2/8", "1/2"],
        "correct_answer": "3/4"
      },
      {
        "id": "q5",
        "question": "Which is the smallest fraction?",
        "options": ["3/5", "1/5", "4/5", "2/5"],
        "correct_answer": "1/5"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 4 – Weather & Seasons
  # ─────────────────────────────────────────────
  {
    "id": "c4_evs_weather_seasons",
    "title": "Weather and Seasons",
    "subject": "Environmental Studies",
    "grade": "class_4",
    "concept_id": "weather_seasons",
    "difficulty": 2,
    "introduction": (
      "Weather tells us what the sky and air are like on a particular day — sunny, rainy, cloudy, or windy. "
      "Seasons are longer periods of similar weather that repeat every year. "
      "India experiences four main seasons: summer, monsoon, autumn, and winter."
    ),
    "explanation": (
      "Weather changes from day to day and is measured using instruments like a thermometer (temperature) and a rain gauge (rainfall). "
      "The four seasons in India are: Summer (March–May) which is hot and dry; Monsoon (June–September) which brings heavy rain; "
      "Autumn (October–November) which is pleasant; and Winter (December–February) which is cold. "
      "The Earth's tilt as it revolves around the Sun causes the change of seasons."
    ),
    "examples": [
      {
        "problem": "Which instrument is used to measure temperature?",
        "answer": "Thermometer",
        "explanation": "A thermometer measures how hot or cold the air is. Temperature is measured in degrees Celsius (°C)."
      },
      {
        "problem": "In which season do we get most of our rainfall in India?",
        "answer": "Monsoon season (June to September)",
        "explanation": "The southwest monsoon winds bring heavy rainfall to most parts of India between June and September."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Which season in India is the hottest?",
        "options": ["Winter", "Monsoon", "Summer", "Autumn"],
        "correct_answer": "Summer"
      },
      {
        "id": "q2",
        "question": "What instrument measures rainfall?",
        "options": ["Thermometer", "Barometer", "Rain gauge", "Compass"],
        "correct_answer": "Rain gauge"
      },
      {
        "id": "q3",
        "question": "What causes seasons on Earth?",
        "options": [
          "Earth's distance from the Sun",
          "Earth's tilt as it revolves around the Sun",
          "The Moon's position",
          "Wind direction"
        ],
        "correct_answer": "Earth's tilt as it revolves around the Sun"
      },
      {
        "id": "q4",
        "question": "During which months does the monsoon season occur in India?",
        "options": ["March–May", "December–February", "June–September", "October–November"],
        "correct_answer": "June–September"
      },
      {
        "id": "q5",
        "question": "Which of these is NOT a type of weather?",
        "options": ["Sunny", "Rainy", "Windy", "Seasonal"],
        "correct_answer": "Seasonal"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 4 – Air & Water
  # ─────────────────────────────────────────────
  {
    "id": "c4_evs_air_water",
    "title": "Air and Water",
    "subject": "Environmental Studies",
    "grade": "class_4",
    "concept_id": "air_water",
    "difficulty": 2,
    "introduction": (
      "Air and water are two of the most important things for all living beings on Earth. "
      "We breathe air every second, and our bodies are made up of about 70% water. "
      "Without clean air and water, no plant, animal, or human can survive."
    ),
    "explanation": (
      "Air is a mixture of gases — mainly nitrogen (78%) and oxygen (21%), with small amounts of carbon dioxide and other gases. "
      "We breathe in oxygen and breathe out carbon dioxide. "
      "Water exists in three states: solid (ice), liquid (water), and gas (water vapour). "
      "The water cycle describes how water evaporates from oceans, forms clouds, and falls back as rain or snow."
    ),
    "examples": [
      {
        "problem": "What gas do we breathe in from the air?",
        "answer": "Oxygen",
        "explanation": "Our lungs take in oxygen from the air. Oxygen is needed by our body cells to produce energy."
      },
      {
        "problem": "What happens to water when it is heated?",
        "answer": "It evaporates and turns into water vapour (gas).",
        "explanation": "Heating gives water molecules enough energy to escape into the air as water vapour — this is called evaporation."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Which gas makes up the largest part of air?",
        "options": ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
        "correct_answer": "Nitrogen"
      },
      {
        "id": "q2",
        "question": "What is the process by which water turns into vapour called?",
        "options": ["Condensation", "Evaporation", "Precipitation", "Freezing"],
        "correct_answer": "Evaporation"
      },
      {
        "id": "q3",
        "question": "In which state is water when it is ice?",
        "options": ["Liquid", "Gas", "Solid", "Plasma"],
        "correct_answer": "Solid"
      },
      {
        "id": "q4",
        "question": "What do we call the process of water vapour turning back into liquid water?",
        "options": ["Evaporation", "Condensation", "Precipitation", "Transpiration"],
        "correct_answer": "Condensation"
      },
      {
        "id": "q5",
        "question": "Which gas do plants use to make food?",
        "options": ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
        "correct_answer": "Carbon dioxide"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 5 – Percentages
  # ─────────────────────────────────────────────
  {
    "id": "c5_math_percentages",
    "title": "Percentages",
    "subject": "Mathematics",
    "grade": "class_5",
    "concept_id": "percentages",
    "difficulty": 4,
    "introduction": (
      "Percent means 'out of 100'. The symbol % is used to write percentages. "
      "If you score 75 out of 100 in a test, you scored 75%. "
      "Percentages are used everywhere — in discounts, exam scores, and statistics."
    ),
    "explanation": (
      "To convert a fraction to a percentage, multiply by 100. For example, 3/4 = (3/4) × 100 = 75%. "
      "To find a percentage of a number, multiply the number by the percentage and divide by 100. "
      "For example, 20% of 50 = (20 × 50) / 100 = 10. "
      "Percentages, fractions, and decimals are all different ways of expressing the same value."
    ),
    "examples": [
      {
        "problem": "A student scored 45 out of 50 in a test. What is the percentage score?",
        "answer": "90%",
        "explanation": "Percentage = (45/50) × 100 = 90%. The student scored 90%."
      },
      {
        "problem": "What is 30% of 200?",
        "answer": "60",
        "explanation": "30% of 200 = (30 × 200) / 100 = 6000 / 100 = 60."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "What is 25% of 80?",
        "options": ["15", "20", "25", "40"],
        "correct_answer": "20"
      },
      {
        "id": "q2",
        "question": "What percentage is 1/2?",
        "options": ["25%", "75%", "50%", "100%"],
        "correct_answer": "50%"
      },
      {
        "id": "q3",
        "question": "A shirt costs ₹500. There is a 10% discount. How much is the discount?",
        "options": ["₹10", "₹50", "₹100", "₹5"],
        "correct_answer": "₹50"
      },
      {
        "id": "q4",
        "question": "What is 100% of any number?",
        "options": ["0", "100", "The number itself", "Double the number"],
        "correct_answer": "The number itself"
      },
      {
        "id": "q5",
        "question": "Convert 3/5 to a percentage.",
        "options": ["35%", "53%", "60%", "30%"],
        "correct_answer": "60%"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 5 – Geometry Basics
  # ─────────────────────────────────────────────
  {
    "id": "c5_math_geometry",
    "title": "Geometry Basics – Angles and Lines",
    "subject": "Mathematics",
    "grade": "class_5",
    "concept_id": "geometry_basics",
    "difficulty": 4,
    "introduction": (
      "Geometry is the branch of mathematics that deals with shapes, sizes, and the properties of figures. "
      "Lines and angles are the building blocks of all geometric shapes. "
      "Understanding angles helps us in architecture, art, and even sports!"
    ),
    "explanation": (
      "A line extends infinitely in both directions, while a line segment has two endpoints. "
      "An angle is formed when two rays meet at a point called the vertex. "
      "A right angle is exactly 90°, an acute angle is less than 90°, and an obtuse angle is between 90° and 180°. "
      "Parallel lines never meet, while perpendicular lines meet at exactly 90°."
    ),
    "examples": [
      {
        "problem": "What type of angle is 65°?",
        "answer": "Acute angle",
        "explanation": "An acute angle is any angle less than 90°. Since 65° < 90°, it is an acute angle."
      },
      {
        "problem": "Two lines meet at 90°. What are they called?",
        "answer": "Perpendicular lines",
        "explanation": "When two lines intersect at a right angle (90°), they are called perpendicular lines."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "An angle of 120° is called a/an:",
        "options": ["Acute angle", "Right angle", "Obtuse angle", "Straight angle"],
        "correct_answer": "Obtuse angle"
      },
      {
        "id": "q2",
        "question": "How many degrees are in a straight angle?",
        "options": ["90°", "45°", "360°", "180°"],
        "correct_answer": "180°"
      },
      {
        "id": "q3",
        "question": "Lines that never meet are called:",
        "options": ["Perpendicular", "Intersecting", "Parallel", "Curved"],
        "correct_answer": "Parallel"
      },
      {
        "id": "q4",
        "question": "A right angle measures exactly:",
        "options": ["45°", "90°", "180°", "60°"],
        "correct_answer": "90°"
      },
      {
        "id": "q5",
        "question": "How many right angles are in a complete revolution (full turn)?",
        "options": ["2", "3", "4", "6"],
        "correct_answer": "4"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 5 – Light & Shadow
  # ─────────────────────────────────────────────
  {
    "id": "c5_science_light_shadow",
    "title": "Light and Shadow",
    "subject": "Science",
    "grade": "class_5",
    "concept_id": "light_shadow",
    "difficulty": 3,
    "introduction": (
      "Light helps us see the world around us. "
      "When light falls on an object, a dark area called a shadow is formed behind it. "
      "The Sun is our biggest natural source of light."
    ),
    "explanation": (
      "Light travels in straight lines. When an opaque object blocks light, it creates a shadow on the other side. "
      "Transparent objects (like glass) allow light to pass through, while opaque objects (like wood) block light completely. "
      "The size of a shadow depends on the position of the light source — the closer the light, the bigger the shadow. "
      "Shadows are longest in the morning and evening when the Sun is low, and shortest at noon when the Sun is directly overhead."
    ),
    "examples": [
      {
        "problem": "Why does a shadow form behind an opaque object?",
        "answer": "Because the opaque object blocks light from passing through, creating a dark region behind it.",
        "explanation": "Light travels in straight lines and cannot bend around opaque objects, so a shadow forms in the region where light is blocked."
      },
      {
        "problem": "At what time of day is your shadow the shortest?",
        "answer": "At noon (12 o'clock)",
        "explanation": "At noon, the Sun is directly overhead, so the shadow falls directly below you and is very short."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Which type of material allows light to pass through completely?",
        "options": ["Opaque", "Translucent", "Transparent", "Reflective"],
        "correct_answer": "Transparent"
      },
      {
        "id": "q2",
        "question": "Light travels in:",
        "options": ["Curved lines", "Zigzag lines", "Straight lines", "Circular paths"],
        "correct_answer": "Straight lines"
      },
      {
        "id": "q3",
        "question": "When is your shadow the longest during the day?",
        "options": ["At noon", "In the morning or evening", "At midnight", "At 3 PM"],
        "correct_answer": "In the morning or evening"
      },
      {
        "id": "q4",
        "question": "Which of these is an opaque object?",
        "options": ["Glass window", "Clear water", "Wooden door", "Air"],
        "correct_answer": "Wooden door"
      },
      {
        "id": "q5",
        "question": "What happens to the shadow when you move the light source closer to the object?",
        "options": ["Shadow gets smaller", "Shadow disappears", "Shadow gets bigger", "Shadow stays the same"],
        "correct_answer": "Shadow gets bigger"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 5 – Force & Motion
  # ─────────────────────────────────────────────
  {
    "id": "c5_science_force_motion",
    "title": "Force and Motion",
    "subject": "Science",
    "grade": "class_5",
    "concept_id": "force_motion_basic",
    "difficulty": 3,
    "introduction": (
      "A force is a push or a pull that can make things move, stop, or change direction. "
      "When you kick a ball, you apply a force that makes it move. "
      "Forces are all around us — gravity pulls us down, friction slows us down, and muscles push us forward."
    ),
    "explanation": (
      "Force can change the speed, direction, or shape of an object. "
      "Gravity is the force that pulls everything towards the Earth — that's why things fall down when dropped. "
      "Friction is a force that acts between two surfaces in contact and opposes motion — it slows things down. "
      "A larger force produces a greater change in motion than a smaller force."
    ),
    "examples": [
      {
        "problem": "Why does a rolling ball eventually stop on its own?",
        "answer": "Because of friction between the ball and the ground.",
        "explanation": "Friction acts opposite to the direction of motion and gradually slows the ball down until it stops."
      },
      {
        "problem": "What force pulls a mango from a tree to the ground?",
        "answer": "Gravity",
        "explanation": "Gravity is the force of attraction between the Earth and all objects. It pulls the mango downward."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "What type of force pulls objects towards the Earth?",
        "options": ["Friction", "Magnetic force", "Gravity", "Muscular force"],
        "correct_answer": "Gravity"
      },
      {
        "id": "q2",
        "question": "Friction always acts in which direction relative to motion?",
        "options": ["Same direction", "Opposite direction", "Perpendicular direction", "No direction"],
        "correct_answer": "Opposite direction"
      },
      {
        "id": "q3",
        "question": "Which of these is an example of a push force?",
        "options": ["Pulling a drawer open", "Lifting a bag", "Pushing a door shut", "Picking up a pen"],
        "correct_answer": "Pushing a door shut"
      },
      {
        "id": "q4",
        "question": "What can a force NOT do to an object?",
        "options": ["Change its speed", "Change its direction", "Change its colour", "Change its shape"],
        "correct_answer": "Change its colour"
      },
      {
        "id": "q5",
        "question": "On which surface would a ball roll the farthest before stopping?",
        "options": ["Rough carpet", "Gravel road", "Smooth marble floor", "Grass field"],
        "correct_answer": "Smooth marble floor"
      }
    ]
  },


  # ─────────────────────────────────────────────
  # CLASS 6 – Integers
  # ─────────────────────────────────────────────
  {
    "id": "c6_math_integers",
    "title": "Integers – Positive and Negative Numbers",
    "subject": "Mathematics",
    "grade": "class_6",
    "concept_id": "integers",
    "difficulty": 4,
    "introduction": (
      "Integers include all whole numbers and their negatives: …−3, −2, −1, 0, 1, 2, 3… "
      "Negative numbers are used to represent temperatures below zero, debts, and depths below sea level. "
      "Zero is neither positive nor negative — it is the centre of the number line."
    ),
    "explanation": (
      "On a number line, positive integers are to the right of zero and negative integers are to the left. "
      "The absolute value of an integer is its distance from zero, always positive: |−5| = 5. "
      "When adding integers with the same sign, add and keep the sign. "
      "When adding integers with different signs, subtract the smaller absolute value from the larger and keep the sign of the larger."
    ),
    "examples": [
      {
        "problem": "The temperature in Shimla is −3°C and in Delhi it is 18°C. What is the difference in temperature?",
        "answer": "21°C",
        "explanation": "Difference = 18 − (−3) = 18 + 3 = 21°C. Subtracting a negative is the same as adding."
      },
      {
        "problem": "What is (−7) + 4?",
        "answer": "−3",
        "explanation": "The signs are different. |−7| − |4| = 7 − 4 = 3. The larger absolute value is 7 (negative), so the answer is −3."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Which integer is the smallest: −5, −2, 0, 3?",
        "options": ["0", "3", "−2", "−5"],
        "correct_answer": "−5"
      },
      {
        "id": "q2",
        "question": "What is (−8) + (−4)?",
        "options": ["−12", "12", "−4", "4"],
        "correct_answer": "−12"
      },
      {
        "id": "q3",
        "question": "What is the absolute value of −15?",
        "options": ["−15", "0", "15", "1/15"],
        "correct_answer": "15"
      },
      {
        "id": "q4",
        "question": "What is 6 − (−2)?",
        "options": ["4", "8", "−8", "−4"],
        "correct_answer": "8"
      },
      {
        "id": "q5",
        "question": "On a number line, which direction do negative numbers lie from zero?",
        "options": ["Right", "Left", "Above", "Below"],
        "correct_answer": "Left"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 6 – Nutrition in Plants
  # ─────────────────────────────────────────────
  {
    "id": "c6_science_nutrition_plants",
    "title": "Nutrition in Plants",
    "subject": "Science",
    "grade": "class_6",
    "concept_id": "nutrition_plants",
    "difficulty": 4,
    "introduction": (
      "All living things need food for energy and growth. "
      "Plants are unique because they can make their own food using sunlight — a process called photosynthesis. "
      "This makes plants the primary producers in all food chains."
    ),
    "explanation": (
      "Photosynthesis occurs mainly in the leaves, which contain a green pigment called chlorophyll. "
      "The equation for photosynthesis is: Carbon dioxide + Water → Glucose + Oxygen (in the presence of sunlight). "
      "Plants absorb water and minerals from the soil through their roots, and carbon dioxide from the air through tiny pores called stomata. "
      "Some plants like Cuscuta (dodder) are parasites — they cannot make their own food and depend on host plants."
    ),
    "examples": [
      {
        "problem": "What are the raw materials needed for photosynthesis?",
        "answer": "Carbon dioxide (CO₂) and water (H₂O)",
        "explanation": "Plants take in CO₂ through stomata and water through roots. These are combined using sunlight energy to make glucose."
      },
      {
        "problem": "Why do leaves appear green?",
        "answer": "Because they contain chlorophyll, a green pigment.",
        "explanation": "Chlorophyll absorbs red and blue light for photosynthesis but reflects green light, making leaves appear green."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Which pigment in leaves is essential for photosynthesis?",
        "options": ["Carotene", "Chlorophyll", "Melanin", "Haemoglobin"],
        "correct_answer": "Chlorophyll"
      },
      {
        "id": "q2",
        "question": "Through which pores do plants absorb carbon dioxide?",
        "options": ["Roots", "Stomata", "Flowers", "Bark"],
        "correct_answer": "Stomata"
      },
      {
        "id": "q3",
        "question": "What is the by-product of photosynthesis that is released into the air?",
        "options": ["Carbon dioxide", "Nitrogen", "Oxygen", "Water vapour"],
        "correct_answer": "Oxygen"
      },
      {
        "id": "q4",
        "question": "Cuscuta is an example of a:",
        "options": ["Autotroph", "Parasite", "Saprotroph", "Insectivore"],
        "correct_answer": "Parasite"
      },
      {
        "id": "q5",
        "question": "In which part of the plant does photosynthesis mainly occur?",
        "options": ["Root", "Stem", "Leaf", "Flower"],
        "correct_answer": "Leaf"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 7 – Algebra Basics
  # ─────────────────────────────────────────────
  {
    "id": "c7_math_algebra",
    "title": "Introduction to Algebra",
    "subject": "Mathematics",
    "grade": "class_7",
    "concept_id": "algebra_basics",
    "difficulty": 5,
    "introduction": (
      "Algebra uses letters (called variables) to represent unknown numbers. "
      "Instead of saying 'a number plus 5 equals 12', we write x + 5 = 12. "
      "Algebra helps us solve problems where we don't know all the values yet."
    ),
    "explanation": (
      "A variable is a letter (like x, y, or n) that stands for an unknown number. "
      "An algebraic expression is a combination of variables, numbers, and operations — for example, 3x + 7. "
      "An equation has an equals sign and shows that two expressions are equal: 2x + 3 = 11. "
      "To solve an equation, we find the value of the variable that makes the equation true by performing the same operation on both sides."
    ),
    "examples": [
      {
        "problem": "Solve: x + 8 = 15",
        "answer": "x = 7",
        "explanation": "Subtract 8 from both sides: x + 8 − 8 = 15 − 8, so x = 7."
      },
      {
        "problem": "Simplify: 3a + 5a − 2a",
        "answer": "6a",
        "explanation": "Combine like terms: (3 + 5 − 2)a = 6a."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Solve: y − 6 = 10",
        "options": ["y = 4", "y = 16", "y = 60", "y = −4"],
        "correct_answer": "y = 16"
      },
      {
        "id": "q2",
        "question": "What is the value of 2x when x = 5?",
        "options": ["7", "25", "10", "3"],
        "correct_answer": "10"
      },
      {
        "id": "q3",
        "question": "Simplify: 4m + 3m",
        "options": ["7m²", "12m", "7m", "43m"],
        "correct_answer": "7m"
      },
      {
        "id": "q4",
        "question": "Solve: 3n = 21",
        "options": ["n = 63", "n = 18", "n = 7", "n = 24"],
        "correct_answer": "n = 7"
      },
      {
        "id": "q5",
        "question": "Which of these is an algebraic expression?",
        "options": ["5 + 3 = 8", "2x + 7", "15 − 9", "100"],
        "correct_answer": "2x + 7"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 7 – Heat & Temperature
  # ─────────────────────────────────────────────
  {
    "id": "c7_science_heat_temperature",
    "title": "Heat and Temperature",
    "subject": "Science",
    "grade": "class_7",
    "concept_id": "heat_temperature",
    "difficulty": 5,
    "introduction": (
      "Heat is a form of energy that flows from a hotter object to a cooler one. "
      "Temperature is a measure of how hot or cold something is, measured in degrees Celsius (°C). "
      "Heat and temperature are related but not the same thing."
    ),
    "explanation": (
      "Heat is transferred in three ways: conduction (through solids), convection (through liquids and gases), and radiation (without any medium). "
      "Conduction occurs when heat passes through a material by direct contact — metals are good conductors. "
      "Convection involves the movement of heated fluid (liquid or gas) — warm air rises and cool air sinks. "
      "Radiation is the transfer of heat through electromagnetic waves — the Sun heats the Earth by radiation through the vacuum of space."
    ),
    "examples": [
      {
        "problem": "A metal spoon left in hot soup becomes hot. Which mode of heat transfer is this?",
        "answer": "Conduction",
        "explanation": "Heat travels from the hot soup through the metal spoon by conduction — direct contact between particles."
      },
      {
        "problem": "Why does warm air rise and cool air sink?",
        "answer": "Warm air is less dense than cool air, so it rises. Cool air is denser and sinks.",
        "explanation": "This movement of air due to density differences is called convection and is responsible for wind and weather patterns."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Which mode of heat transfer does not require a medium?",
        "options": ["Conduction", "Convection", "Radiation", "Absorption"],
        "correct_answer": "Radiation"
      },
      {
        "id": "q2",
        "question": "Which material is the best conductor of heat?",
        "options": ["Wood", "Plastic", "Copper", "Rubber"],
        "correct_answer": "Copper"
      },
      {
        "id": "q3",
        "question": "Heat always flows from:",
        "options": [
          "Cold to hot",
          "Hot to cold",
          "High pressure to low pressure",
          "Low density to high density"
        ],
        "correct_answer": "Hot to cold"
      },
      {
        "id": "q4",
        "question": "The instrument used to measure body temperature is:",
        "options": ["Barometer", "Clinical thermometer", "Rain gauge", "Hygrometer"],
        "correct_answer": "Clinical thermometer"
      },
      {
        "id": "q5",
        "question": "Convection currents in water are caused by:",
        "options": [
          "Differences in colour",
          "Differences in density due to temperature",
          "Differences in pressure only",
          "Magnetic forces"
        ],
        "correct_answer": "Differences in density due to temperature"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 7 – Electric Current
  # ─────────────────────────────────────────────
  {
    "id": "c7_science_electric_current",
    "title": "Electric Current and Circuits",
    "subject": "Science",
    "grade": "class_7",
    "concept_id": "electric_current_basic",
    "difficulty": 5,
    "introduction": (
      "Electric current is the flow of electric charges (electrons) through a conductor. "
      "We use electricity every day — to light our homes, run fans, and charge phones. "
      "A simple electric circuit consists of a battery, wires, and a bulb."
    ),
    "explanation": (
      "An electric circuit is a closed path through which current flows. "
      "Current flows from the positive terminal of the battery, through the circuit, and back to the negative terminal. "
      "Conductors (like copper and iron) allow current to flow easily, while insulators (like rubber and plastic) do not. "
      "In a series circuit, components are connected one after another; in a parallel circuit, they are connected side by side."
    ),
    "examples": [
      {
        "problem": "Why does a bulb not glow when the circuit is open (switch off)?",
        "answer": "Because the circuit is incomplete and current cannot flow.",
        "explanation": "Current needs a complete, closed path to flow. An open switch breaks the circuit, stopping the current."
      },
      {
        "problem": "Name two good conductors of electricity.",
        "answer": "Copper and aluminium (also iron, silver, gold)",
        "explanation": "Metals generally have free electrons that can move easily, making them good conductors of electricity."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Which of these is a good conductor of electricity?",
        "options": ["Rubber", "Plastic", "Copper wire", "Wood"],
        "correct_answer": "Copper wire"
      },
      {
        "id": "q2",
        "question": "What is the unit of electric current?",
        "options": ["Volt", "Watt", "Ampere", "Ohm"],
        "correct_answer": "Ampere"
      },
      {
        "id": "q3",
        "question": "In which type of circuit does current have only one path to flow?",
        "options": ["Parallel circuit", "Series circuit", "Open circuit", "Short circuit"],
        "correct_answer": "Series circuit"
      },
      {
        "id": "q4",
        "question": "What happens to other bulbs in a series circuit if one bulb fuses?",
        "options": [
          "They glow brighter",
          "They continue to glow normally",
          "They all go out",
          "Only the fused bulb goes out"
        ],
        "correct_answer": "They all go out"
      },
      {
        "id": "q5",
        "question": "The device that breaks a circuit when switched off is called a:",
        "options": ["Bulb", "Battery", "Switch", "Wire"],
        "correct_answer": "Switch"
      }
    ]
  },


  # ─────────────────────────────────────────────
  # CLASS 8 – Linear Equations
  # ─────────────────────────────────────────────
  {
    "id": "c8_math_linear_equations",
    "title": "Linear Equations in One Variable",
    "subject": "Mathematics",
    "grade": "class_8",
    "concept_id": "linear_equations_one_variable",
    "difficulty": 6,
    "introduction": (
      "A linear equation in one variable is an equation where the variable has a power of 1. "
      "These equations have exactly one solution and are used to model real-life problems. "
      "For example, if a number added to 7 gives 20, we write x + 7 = 20 and solve for x."
    ),
    "explanation": (
      "To solve a linear equation, we isolate the variable by performing inverse operations on both sides. "
      "The golden rule: whatever you do to one side of the equation, you must do to the other side. "
      "Equations can involve fractions and brackets — always expand brackets first and clear fractions by multiplying through. "
      "Word problems can be translated into linear equations by assigning a variable to the unknown quantity."
    ),
    "examples": [
      {
        "problem": "Solve: 2x + 5 = 17",
        "answer": "x = 6",
        "explanation": "Subtract 5 from both sides: 2x = 12. Divide both sides by 2: x = 6."
      },
      {
        "problem": "The sum of three consecutive integers is 48. Find the integers.",
        "answer": "15, 16, 17",
        "explanation": "Let the integers be n, n+1, n+2. Then n + (n+1) + (n+2) = 48 → 3n + 3 = 48 → 3n = 45 → n = 15."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Solve: 3x − 4 = 11",
        "options": ["x = 3", "x = 5", "x = 7", "x = 15"],
        "correct_answer": "x = 5"
      },
      {
        "id": "q2",
        "question": "Solve: x/4 = 7",
        "options": ["x = 3", "x = 11", "x = 28", "x = 1.75"],
        "correct_answer": "x = 28"
      },
      {
        "id": "q3",
        "question": "If 5y + 10 = 40, what is y?",
        "options": ["y = 6", "y = 10", "y = 8", "y = 50"],
        "correct_answer": "y = 6"
      },
      {
        "id": "q4",
        "question": "A number is doubled and then 3 is added to get 19. What is the number?",
        "options": ["7", "8", "11", "16"],
        "correct_answer": "8"
      },
      {
        "id": "q5",
        "question": "Solve: 2(x + 3) = 14",
        "options": ["x = 4", "x = 7", "x = 8", "x = 11"],
        "correct_answer": "x = 4"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 8 – Data Handling
  # ─────────────────────────────────────────────
  {
    "id": "c8_math_data_handling",
    "title": "Data Handling – Mean, Median, Mode",
    "subject": "Mathematics",
    "grade": "class_8",
    "concept_id": "data_handling",
    "difficulty": 5,
    "introduction": (
      "Data handling involves collecting, organising, and interpreting information (data). "
      "We use measures of central tendency — mean, median, and mode — to summarise data. "
      "These are used in everyday life, from calculating average marks to finding the most popular product."
    ),
    "explanation": (
      "Mean (average) = Sum of all values ÷ Number of values. "
      "Median is the middle value when data is arranged in ascending order; if there are two middle values, take their average. "
      "Mode is the value that appears most frequently in the data set. "
      "A data set can have no mode, one mode, or multiple modes."
    ),
    "examples": [
      {
        "problem": "Find the mean of: 4, 8, 6, 10, 12",
        "answer": "8",
        "explanation": "Mean = (4 + 8 + 6 + 10 + 12) / 5 = 40 / 5 = 8."
      },
      {
        "problem": "Find the median of: 3, 7, 2, 9, 5",
        "answer": "5",
        "explanation": "Arrange in order: 2, 3, 5, 7, 9. The middle value (3rd out of 5) is 5."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "What is the mean of 10, 20, 30, 40, 50?",
        "options": ["25", "30", "35", "40"],
        "correct_answer": "30"
      },
      {
        "id": "q2",
        "question": "Find the mode of: 2, 3, 3, 5, 7, 3, 8",
        "options": ["2", "5", "3", "7"],
        "correct_answer": "3"
      },
      {
        "id": "q3",
        "question": "Find the median of: 1, 3, 5, 7, 9, 11",
        "options": ["5", "6", "7", "5.5"],
        "correct_answer": "6"
      },
      {
        "id": "q4",
        "question": "A student scores 70, 80, 90, 60, and 100 in five tests. What is the average score?",
        "options": ["75", "80", "85", "90"],
        "correct_answer": "80"
      },
      {
        "id": "q5",
        "question": "Which measure of central tendency is most affected by an extreme value (outlier)?",
        "options": ["Mode", "Median", "Mean", "Range"],
        "correct_answer": "Mean"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 8 – Chemical Reactions
  # ─────────────────────────────────────────────
  {
    "id": "c8_science_chemical_reactions",
    "title": "Chemical Reactions and Equations",
    "subject": "Science",
    "grade": "class_8",
    "concept_id": "chemical_reactions_basic",
    "difficulty": 6,
    "introduction": (
      "A chemical reaction is a process in which substances (reactants) are transformed into new substances (products). "
      "Signs of a chemical reaction include change in colour, production of gas, formation of a precipitate, or change in temperature. "
      "Chemical reactions are represented using chemical equations."
    ),
    "explanation": (
      "In a chemical equation, reactants are written on the left and products on the right, separated by an arrow (→). "
      "A balanced chemical equation has the same number of atoms of each element on both sides (Law of Conservation of Mass). "
      "Types of reactions include combination (A + B → AB), decomposition (AB → A + B), displacement, and double displacement. "
      "Oxidation involves gain of oxygen or loss of hydrogen; reduction is the opposite."
    ),
    "examples": [
      {
        "problem": "What type of reaction is: 2H₂ + O₂ → 2H₂O?",
        "answer": "Combination reaction",
        "explanation": "Two or more substances combine to form a single product. Here, hydrogen and oxygen combine to form water."
      },
      {
        "problem": "Is the equation Fe + CuSO₄ → FeSO₄ + Cu a displacement reaction?",
        "answer": "Yes, it is a displacement reaction.",
        "explanation": "Iron (Fe) displaces copper (Cu) from copper sulphate solution because iron is more reactive than copper."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "What does the Law of Conservation of Mass state?",
        "options": [
          "Mass is created during a reaction",
          "Mass is destroyed during a reaction",
          "Total mass of reactants equals total mass of products",
          "Mass depends on temperature"
        ],
        "correct_answer": "Total mass of reactants equals total mass of products"
      },
      {
        "id": "q2",
        "question": "Which of these is a sign that a chemical reaction has occurred?",
        "options": [
          "Change in size",
          "Change in state only",
          "Production of a gas with bubbles",
          "Change in position"
        ],
        "correct_answer": "Production of a gas with bubbles"
      },
      {
        "id": "q3",
        "question": "CaCO₃ → CaO + CO₂ is an example of which type of reaction?",
        "options": ["Combination", "Decomposition", "Displacement", "Double displacement"],
        "correct_answer": "Decomposition"
      },
      {
        "id": "q4",
        "question": "In a chemical equation, what are the substances on the left side called?",
        "options": ["Products", "Reactants", "Catalysts", "Precipitates"],
        "correct_answer": "Reactants"
      },
      {
        "id": "q5",
        "question": "Rusting of iron is an example of:",
        "options": ["Decomposition", "Displacement", "Oxidation", "Reduction"],
        "correct_answer": "Oxidation"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 8 – Light: Reflection and Refraction
  # ─────────────────────────────────────────────
  {
    "id": "c8_science_light",
    "title": "Light – Reflection and Refraction",
    "subject": "Science",
    "grade": "class_8",
    "concept_id": "light_reflection_refraction",
    "difficulty": 6,
    "introduction": (
      "Light is a form of energy that travels in straight lines at a speed of about 3 × 10⁸ m/s. "
      "When light hits a surface, it can be reflected (bounced back) or refracted (bent as it passes through). "
      "Mirrors use reflection and lenses use refraction to form images."
    ),
    "explanation": (
      "The Law of Reflection states: the angle of incidence equals the angle of reflection, both measured from the normal. "
      "Refraction occurs when light passes from one medium to another and changes speed, causing it to bend. "
      "A concave mirror converges light rays and can form real or virtual images depending on object position. "
      "A convex lens also converges light and is used in magnifying glasses and cameras."
    ),
    "examples": [
      {
        "problem": "A ray of light hits a mirror at an angle of incidence of 35°. What is the angle of reflection?",
        "answer": "35°",
        "explanation": "By the Law of Reflection, angle of incidence = angle of reflection = 35°."
      },
      {
        "problem": "Why does a pencil appear bent when placed in a glass of water?",
        "answer": "Because of refraction — light bends when it passes from water to air.",
        "explanation": "Light travels at different speeds in water and air. When it crosses the boundary, it bends, making the pencil appear bent."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "The angle of incidence is always measured from the:",
        "options": ["Mirror surface", "Normal to the surface", "Horizontal", "Vertical"],
        "correct_answer": "Normal to the surface"
      },
      {
        "id": "q2",
        "question": "Which type of mirror is used in vehicle rear-view mirrors?",
        "options": ["Plane mirror", "Concave mirror", "Convex mirror", "Parabolic mirror"],
        "correct_answer": "Convex mirror"
      },
      {
        "id": "q3",
        "question": "Refraction of light occurs because light changes its:",
        "options": ["Colour", "Frequency", "Speed", "Amplitude"],
        "correct_answer": "Speed"
      },
      {
        "id": "q4",
        "question": "A concave mirror is also called a:",
        "options": ["Diverging mirror", "Converging mirror", "Flat mirror", "Scattering mirror"],
        "correct_answer": "Converging mirror"
      },
      {
        "id": "q5",
        "question": "The image formed in a plane mirror is:",
        "options": [
          "Real and inverted",
          "Virtual and erect",
          "Real and erect",
          "Virtual and inverted"
        ],
        "correct_answer": "Virtual and erect"
      }
    ]
  },


  # ─────────────────────────────────────────────
  # CLASS 9 – Quadratic Equations
  # ─────────────────────────────────────────────
  {
    "id": "c9_math_quadratic",
    "title": "Quadratic Equations",
    "subject": "Mathematics",
    "grade": "class_9",
    "concept_id": "quadratic_equations",
    "difficulty": 7,
    "introduction": (
      "A quadratic equation is a polynomial equation of degree 2, written in the form ax² + bx + c = 0, where a ≠ 0. "
      "Quadratic equations can have two solutions (roots), one repeated solution, or no real solutions. "
      "They model real-world situations like projectile motion and area problems."
    ),
    "explanation": (
      "The roots of ax² + bx + c = 0 can be found by: (1) factorisation, (2) completing the square, or (3) the quadratic formula: "
      "x = [−b ± √(b² − 4ac)] / 2a. "
      "The discriminant D = b² − 4ac determines the nature of roots: D > 0 gives two distinct real roots, "
      "D = 0 gives two equal real roots, and D < 0 gives no real roots (complex roots). "
      "The sum of roots = −b/a and the product of roots = c/a."
    ),
    "examples": [
      {
        "problem": "Solve: x² − 5x + 6 = 0 by factorisation.",
        "answer": "x = 2 or x = 3",
        "explanation": "Factor: (x − 2)(x − 3) = 0. Setting each factor to zero: x − 2 = 0 → x = 2; x − 3 = 0 → x = 3."
      },
      {
        "problem": "Find the discriminant of 2x² − 4x + 2 = 0 and state the nature of roots.",
        "answer": "D = 0; two equal real roots",
        "explanation": "D = b² − 4ac = (−4)² − 4(2)(2) = 16 − 16 = 0. Since D = 0, the equation has two equal real roots."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "What is the degree of a quadratic equation?",
        "options": ["1", "2", "3", "0"],
        "correct_answer": "2"
      },
      {
        "id": "q2",
        "question": "Solve: x² − 9 = 0",
        "options": ["x = 3 only", "x = −3 only", "x = ±3", "x = 9"],
        "correct_answer": "x = ±3"
      },
      {
        "id": "q3",
        "question": "For the equation x² + 4x + 4 = 0, the discriminant is:",
        "options": ["16", "0", "−16", "8"],
        "correct_answer": "0"
      },
      {
        "id": "q4",
        "question": "If the roots of ax² + bx + c = 0 are α and β, then α + β equals:",
        "options": ["b/a", "−b/a", "c/a", "−c/a"],
        "correct_answer": "−b/a"
      },
      {
        "id": "q5",
        "question": "Which method can always be used to solve any quadratic equation?",
        "options": [
          "Factorisation",
          "Completing the square",
          "Quadratic formula",
          "Trial and error"
        ],
        "correct_answer": "Quadratic formula"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 9 – Circles
  # ─────────────────────────────────────────────
  {
    "id": "c9_math_circles",
    "title": "Circles – Properties and Theorems",
    "subject": "Mathematics",
    "grade": "class_9",
    "concept_id": "circles",
    "difficulty": 7,
    "introduction": (
      "A circle is the set of all points in a plane that are equidistant from a fixed point called the centre. "
      "Circles appear everywhere in nature and engineering — wheels, planets, and clocks are all circular. "
      "Understanding circle theorems helps solve complex geometry problems."
    ),
    "explanation": (
      "Key terms: radius (r) = distance from centre to circumference; diameter (d) = 2r; chord = line segment joining two points on the circle; "
      "arc = part of the circumference; tangent = line touching the circle at exactly one point. "
      "Theorem 1: Equal chords of a circle are equidistant from the centre. "
      "Theorem 2: The angle subtended by an arc at the centre is double the angle subtended at any point on the remaining part of the circle. "
      "Theorem 3: Angles in the same segment of a circle are equal."
    ),
    "examples": [
      {
        "problem": "An arc subtends an angle of 80° at the centre. What angle does it subtend at the circumference?",
        "answer": "40°",
        "explanation": "By the inscribed angle theorem, the angle at the circumference is half the central angle: 80° / 2 = 40°."
      },
      {
        "problem": "If the radius of a circle is 7 cm, what is its circumference? (Use π = 22/7)",
        "answer": "44 cm",
        "explanation": "Circumference = 2πr = 2 × (22/7) × 7 = 44 cm."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "The longest chord of a circle is called the:",
        "options": ["Radius", "Arc", "Diameter", "Tangent"],
        "correct_answer": "Diameter"
      },
      {
        "id": "q2",
        "question": "A tangent to a circle is perpendicular to the radius at the point of:",
        "options": ["Centre", "Tangency", "Intersection", "Chord"],
        "correct_answer": "Tangency"
      },
      {
        "id": "q3",
        "question": "The angle in a semicircle is always:",
        "options": ["60°", "45°", "90°", "180°"],
        "correct_answer": "90°"
      },
      {
        "id": "q4",
        "question": "If a central angle is 120°, the inscribed angle subtending the same arc is:",
        "options": ["120°", "240°", "60°", "30°"],
        "correct_answer": "60°"
      },
      {
        "id": "q5",
        "question": "Area of a circle with radius r is:",
        "options": ["2πr", "πr²", "πd", "2πr²"],
        "correct_answer": "πr²"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 9 – Life Processes
  # ─────────────────────────────────────────────
  {
    "id": "c9_science_life_processes",
    "title": "Life Processes",
    "subject": "Science",
    "grade": "class_9",
    "concept_id": "life_processes",
    "difficulty": 7,
    "introduction": (
      "Life processes are the basic functions that all living organisms must perform to stay alive. "
      "These include nutrition, respiration, transportation, excretion, and reproduction. "
      "Understanding these processes helps us understand how our own bodies work."
    ),
    "explanation": (
      "Nutrition is the process of obtaining and using food for energy and growth. "
      "Respiration is the process of breaking down glucose to release energy: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energy. "
      "In humans, the circulatory system (heart, blood, blood vessels) transports nutrients and oxygen to cells. "
      "Excretion removes metabolic waste products — the kidneys filter blood and produce urine."
    ),
    "examples": [
      {
        "problem": "What is the difference between aerobic and anaerobic respiration?",
        "answer": "Aerobic respiration uses oxygen and produces CO₂, water, and more energy. Anaerobic respiration occurs without oxygen and produces less energy (and lactic acid in muscles or ethanol in yeast).",
        "explanation": "Aerobic: glucose + oxygen → CO₂ + water + 38 ATP. Anaerobic: glucose → lactic acid + 2 ATP (in animals)."
      },
      {
        "problem": "What is the role of the nephron in the kidney?",
        "answer": "The nephron is the functional unit of the kidney that filters blood and forms urine.",
        "explanation": "Blood is filtered in the glomerulus; useful substances are reabsorbed, and waste (urea, excess salts) is excreted as urine."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Which organ is responsible for pumping blood in the human body?",
        "options": ["Lungs", "Liver", "Heart", "Kidney"],
        "correct_answer": "Heart"
      },
      {
        "id": "q2",
        "question": "The functional unit of the kidney is called the:",
        "options": ["Neuron", "Nephron", "Alveolus", "Villus"],
        "correct_answer": "Nephron"
      },
      {
        "id": "q3",
        "question": "Which gas is released during aerobic respiration?",
        "options": ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
        "correct_answer": "Carbon dioxide"
      },
      {
        "id": "q4",
        "question": "Anaerobic respiration in yeast produces:",
        "options": ["Lactic acid", "Ethanol and CO₂", "Glucose", "Water"],
        "correct_answer": "Ethanol and CO₂"
      },
      {
        "id": "q5",
        "question": "Which blood vessels carry oxygenated blood away from the heart?",
        "options": ["Veins", "Capillaries", "Arteries", "Venules"],
        "correct_answer": "Arteries"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 10 – Trigonometry
  # ─────────────────────────────────────────────
  {
    "id": "c10_math_trigonometry",
    "title": "Introduction to Trigonometry",
    "subject": "Mathematics",
    "grade": "class_10",
    "concept_id": "trigonometry",
    "difficulty": 8,
    "introduction": (
      "Trigonometry is the study of relationships between the angles and sides of right-angled triangles. "
      "The three primary trigonometric ratios — sine, cosine, and tangent — are used in navigation, engineering, and physics. "
      "Trigonometry is derived from the Greek words 'trigonon' (triangle) and 'metron' (measure)."
    ),
    "explanation": (
      "For a right-angled triangle with angle θ: sin θ = Opposite/Hypotenuse, cos θ = Adjacent/Hypotenuse, tan θ = Opposite/Adjacent. "
      "The mnemonic SOH-CAH-TOA helps remember these ratios. "
      "Key values: sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1, sin 90° = 1, cos 0° = 1. "
      "The fundamental identity: sin²θ + cos²θ = 1."
    ),
    "examples": [
      {
        "problem": "In a right triangle, the opposite side is 3 cm and the hypotenuse is 5 cm. Find sin θ.",
        "answer": "sin θ = 3/5 = 0.6",
        "explanation": "sin θ = Opposite / Hypotenuse = 3/5."
      },
      {
        "problem": "Find the value of tan 45°.",
        "answer": "tan 45° = 1",
        "explanation": "At 45°, the opposite and adjacent sides are equal, so tan 45° = Opposite/Adjacent = 1."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "What is cos 0°?",
        "options": ["0", "1/2", "1", "√3/2"],
        "correct_answer": "1"
      },
      {
        "id": "q2",
        "question": "In a right triangle, tan θ = Opposite / ___",
        "options": ["Hypotenuse", "Adjacent", "Opposite", "Base"],
        "correct_answer": "Adjacent"
      },
      {
        "id": "q3",
        "question": "What is sin 30°?",
        "options": ["√3/2", "1/√2", "1/2", "1"],
        "correct_answer": "1/2"
      },
      {
        "id": "q4",
        "question": "Which identity is always true?",
        "options": [
          "sin²θ − cos²θ = 1",
          "sin²θ + cos²θ = 1",
          "tan²θ + 1 = sin²θ",
          "cos²θ − sin²θ = 1"
        ],
        "correct_answer": "sin²θ + cos²θ = 1"
      },
      {
        "id": "q5",
        "question": "If sin θ = 0.5, what is θ?",
        "options": ["30°", "45°", "60°", "90°"],
        "correct_answer": "30°"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 10 – Chemical Reactions (CBSE)
  # ─────────────────────────────────────────────
  {
    "id": "c10_science_chemical_reactions",
    "title": "Chemical Reactions and Equations (CBSE Class 10)",
    "subject": "Science",
    "grade": "class_10",
    "concept_id": "chemical_reactions_cbse10",
    "difficulty": 7,
    "introduction": (
      "Chemical reactions involve the breaking and forming of chemical bonds to produce new substances. "
      "In Class 10, we study types of reactions in detail: combination, decomposition, displacement, double displacement, and redox reactions. "
      "Balancing chemical equations is essential to obey the Law of Conservation of Mass."
    ),
    "explanation": (
      "Oxidation is the loss of electrons (or gain of oxygen/loss of hydrogen); reduction is the gain of electrons (or loss of oxygen/gain of hydrogen). "
      "Oxidation and reduction always occur together — these are called redox reactions. "
      "Corrosion is the slow deterioration of metals by reaction with moisture and oxygen (e.g., rusting of iron). "
      "Rancidity is the oxidation of fats and oils in food, causing bad smell and taste — prevented by adding antioxidants or using airtight packaging."
    ),
    "examples": [
      {
        "problem": "Identify the oxidising and reducing agents in: CuO + H₂ → Cu + H₂O",
        "answer": "CuO is the oxidising agent; H₂ is the reducing agent.",
        "explanation": "CuO loses oxygen (gets reduced) and acts as the oxidising agent. H₂ gains oxygen (gets oxidised) and acts as the reducing agent."
      },
      {
        "problem": "Balance the equation: Fe + O₂ → Fe₂O₃",
        "answer": "4Fe + 3O₂ → 2Fe₂O₃",
        "explanation": "Count atoms: 4 Fe on left, 4 Fe on right (2×2). 6 O on left (3×2), 6 O on right (2×3). Balanced."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Which of the following is a redox reaction?",
        "options": [
          "NaCl + AgNO₃ → AgCl + NaNO₃",
          "CaO + H₂O → Ca(OH)₂",
          "2Mg + O₂ → 2MgO",
          "NaOH + HCl → NaCl + H₂O"
        ],
        "correct_answer": "2Mg + O₂ → 2MgO"
      },
      {
        "id": "q2",
        "question": "Rusting of iron requires the presence of:",
        "options": [
          "Only water",
          "Only oxygen",
          "Both water and oxygen",
          "Carbon dioxide"
        ],
        "correct_answer": "Both water and oxygen"
      },
      {
        "id": "q3",
        "question": "In a reaction, a substance that gains electrons is called:",
        "options": ["Reducing agent", "Oxidising agent", "Catalyst", "Precipitate"],
        "correct_answer": "Oxidising agent"
      },
      {
        "id": "q4",
        "question": "Which type of reaction is: AB + CD → AD + CB?",
        "options": ["Combination", "Decomposition", "Displacement", "Double displacement"],
        "correct_answer": "Double displacement"
      },
      {
        "id": "q5",
        "question": "Rancidity in food can be prevented by:",
        "options": [
          "Adding water",
          "Heating the food",
          "Adding antioxidants or using airtight containers",
          "Exposing to sunlight"
        ],
        "correct_answer": "Adding antioxidants or using airtight containers"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 10 – Electricity
  # ─────────────────────────────────────────────
  {
    "id": "c10_science_electricity",
    "title": "Electricity – Ohm's Law and Circuits",
    "subject": "Science",
    "grade": "class_10",
    "concept_id": "electricity_ohms_law",
    "difficulty": 8,
    "introduction": (
      "Electricity powers our modern world. "
      "In Class 10, we study the quantitative relationships between voltage, current, and resistance. "
      "Ohm's Law is the fundamental law that connects these three quantities."
    ),
    "explanation": (
      "Ohm's Law: V = IR, where V is voltage (volts), I is current (amperes), and R is resistance (ohms). "
      "Resistance of a conductor depends on its material, length, and cross-sectional area: R = ρL/A. "
      "In a series circuit, total resistance = R₁ + R₂ + R₃ (resistances add up). "
      "In a parallel circuit, 1/R_total = 1/R₁ + 1/R₂ + 1/R₃ (total resistance is less than the smallest individual resistance). "
      "Electric power P = VI = I²R = V²/R, measured in watts (W)."
    ),
    "examples": [
      {
        "problem": "A bulb has a resistance of 100 Ω and is connected to a 220 V supply. Find the current through it.",
        "answer": "I = 2.2 A",
        "explanation": "Using Ohm's Law: I = V/R = 220/100 = 2.2 A."
      },
      {
        "problem": "Two resistors of 4 Ω and 6 Ω are connected in series. What is the total resistance?",
        "answer": "10 Ω",
        "explanation": "In series: R_total = R₁ + R₂ = 4 + 6 = 10 Ω."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "According to Ohm's Law, if voltage doubles and resistance stays the same, current:",
        "options": ["Halves", "Stays the same", "Doubles", "Quadruples"],
        "correct_answer": "Doubles"
      },
      {
        "id": "q2",
        "question": "The SI unit of resistance is:",
        "options": ["Ampere", "Volt", "Watt", "Ohm"],
        "correct_answer": "Ohm"
      },
      {
        "id": "q3",
        "question": "Two 6 Ω resistors are connected in parallel. What is the equivalent resistance?",
        "options": ["12 Ω", "6 Ω", "3 Ω", "1 Ω"],
        "correct_answer": "3 Ω"
      },
      {
        "id": "q4",
        "question": "Electric power is calculated as:",
        "options": ["P = V + I", "P = V/I", "P = VI", "P = V − I"],
        "correct_answer": "P = VI"
      },
      {
        "id": "q5",
        "question": "Which has higher resistance: a thick wire or a thin wire of the same material and length?",
        "options": [
          "Thick wire",
          "Thin wire",
          "Both have equal resistance",
          "Depends on temperature only"
        ],
        "correct_answer": "Thin wire"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 10 – Human Eye
  # ─────────────────────────────────────────────
  {
    "id": "c10_science_human_eye",
    "title": "The Human Eye and the Colourful World",
    "subject": "Science",
    "grade": "class_10",
    "concept_id": "human_eye",
    "difficulty": 7,
    "introduction": (
      "The human eye is a remarkable optical instrument that allows us to see the world. "
      "It works like a camera — the lens focuses light onto the retina to form an image. "
      "Defects of vision like myopia and hypermetropia can be corrected using lenses."
    ),
    "explanation": (
      "The cornea and lens together focus light onto the retina. The iris controls the amount of light entering the eye. "
      "The ability of the eye to focus on objects at different distances is called accommodation, achieved by changing the curvature of the lens. "
      "Myopia (short-sightedness): distant objects appear blurred — corrected by a concave lens. "
      "Hypermetropia (long-sightedness): near objects appear blurred — corrected by a convex lens. "
      "Dispersion of white light through a prism produces a spectrum (VIBGYOR) because different colours refract by different amounts."
    ),
    "examples": [
      {
        "problem": "A person cannot see objects beyond 2 m clearly. What defect does he have and how is it corrected?",
        "answer": "Myopia (short-sightedness); corrected by a concave (diverging) lens.",
        "explanation": "In myopia, the image forms in front of the retina. A concave lens diverges the rays so they focus correctly on the retina."
      },
      {
        "problem": "Why does a glass prism split white light into a spectrum?",
        "answer": "Because different colours of light have different wavelengths and refract by different amounts in glass.",
        "explanation": "Violet light refracts the most and red light the least, spreading white light into the VIBGYOR spectrum."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Which part of the eye controls the amount of light entering it?",
        "options": ["Retina", "Cornea", "Iris", "Lens"],
        "correct_answer": "Iris"
      },
      {
        "id": "q2",
        "question": "Myopia is corrected using a:",
        "options": ["Convex lens", "Concave lens", "Plane mirror", "Convex mirror"],
        "correct_answer": "Concave lens"
      },
      {
        "id": "q3",
        "question": "The image formed on the retina is:",
        "options": ["Erect and magnified", "Inverted and real", "Erect and virtual", "Upright and diminished"],
        "correct_answer": "Inverted and real"
      },
      {
        "id": "q4",
        "question": "Which colour of light is deviated the most when passing through a prism?",
        "options": ["Red", "Green", "Yellow", "Violet"],
        "correct_answer": "Violet"
      },
      {
        "id": "q5",
        "question": "The ability of the eye lens to adjust its focal length is called:",
        "options": ["Dispersion", "Accommodation", "Persistence of vision", "Scattering"],
        "correct_answer": "Accommodation"
      }
    ]
  },


  # ─────────────────────────────────────────────
  # CLASS 11 – Sets and Functions
  # ─────────────────────────────────────────────
  {
    "id": "c11_math_sets_functions",
    "title": "Sets and Functions",
    "subject": "Mathematics",
    "grade": "class_11",
    "concept_id": "sets_functions",
    "difficulty": 8,
    "introduction": (
      "A set is a well-defined collection of distinct objects. "
      "Sets form the foundation of modern mathematics and are used in logic, probability, and computer science. "
      "A function is a special relation that maps each element of one set to exactly one element of another set."
    ),
    "explanation": (
      "Set operations: Union (A ∪ B) contains all elements in A or B; Intersection (A ∩ B) contains elements in both A and B; "
      "Complement (A') contains elements not in A. De Morgan's Laws: (A ∪ B)' = A' ∩ B' and (A ∩ B)' = A' ∪ B'. "
      "A function f: A → B is injective (one-one) if different inputs give different outputs; surjective (onto) if every element of B is mapped to; "
      "bijective if both injective and surjective. "
      "Domain is the set of all valid inputs; range is the set of all actual outputs."
    ),
    "examples": [
      {
        "problem": "If A = {1, 2, 3, 4} and B = {3, 4, 5, 6}, find A ∪ B and A ∩ B.",
        "answer": "A ∪ B = {1, 2, 3, 4, 5, 6}; A ∩ B = {3, 4}",
        "explanation": "Union includes all elements from both sets (no repetition). Intersection includes only common elements."
      },
      {
        "problem": "Is f(x) = x² a one-one function for x ∈ ℝ?",
        "answer": "No, it is not one-one.",
        "explanation": "f(2) = 4 and f(−2) = 4, so two different inputs give the same output. Hence f is not injective (one-one)."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "If n(A) = 5, n(B) = 7, and n(A ∩ B) = 3, what is n(A ∪ B)?",
        "options": ["15", "9", "12", "8"],
        "correct_answer": "9"
      },
      {
        "id": "q2",
        "question": "Which of the following is an empty set?",
        "options": [
          "{0}",
          "{ }",
          "{x : x is a prime number between 7 and 11}",
          "{x : x² = 4}"
        ],
        "correct_answer": "{x : x is a prime number between 7 and 11}"
      },
      {
        "id": "q3",
        "question": "A function that is both one-one and onto is called:",
        "options": ["Injective", "Surjective", "Bijective", "Inverse"],
        "correct_answer": "Bijective"
      },
      {
        "id": "q4",
        "question": "De Morgan's Law states (A ∪ B)' =",
        "options": ["A' ∪ B'", "A ∩ B", "A' ∩ B'", "A ∪ B'"],
        "correct_answer": "A' ∩ B'"
      },
      {
        "id": "q5",
        "question": "The domain of f(x) = 1/(x − 2) is:",
        "options": [
          "All real numbers",
          "All real numbers except 2",
          "All real numbers except −2",
          "Only positive numbers"
        ],
        "correct_answer": "All real numbers except 2"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 11 – Limits and Derivatives
  # ─────────────────────────────────────────────
  {
    "id": "c11_math_limits_derivatives",
    "title": "Limits and Derivatives",
    "subject": "Mathematics",
    "grade": "class_11",
    "concept_id": "limits_derivatives",
    "difficulty": 9,
    "introduction": (
      "Calculus is the mathematics of change and motion. "
      "A limit describes the value a function approaches as the input approaches a certain point. "
      "The derivative measures the instantaneous rate of change of a function — it is the slope of the tangent to the curve."
    ),
    "explanation": (
      "The limit of f(x) as x → a is written lim(x→a) f(x). If the left-hand limit equals the right-hand limit, the limit exists. "
      "The derivative of f(x) is defined as f'(x) = lim(h→0) [f(x+h) − f(x)] / h. "
      "Standard derivatives: d/dx(xⁿ) = nxⁿ⁻¹, d/dx(sin x) = cos x, d/dx(cos x) = −sin x, d/dx(eˣ) = eˣ, d/dx(ln x) = 1/x. "
      "Rules: Sum rule, Product rule [d/dx(uv) = u'v + uv'], Quotient rule, and Chain rule."
    ),
    "examples": [
      {
        "problem": "Find lim(x→2) (x² − 4)/(x − 2).",
        "answer": "4",
        "explanation": "Factor: (x² − 4)/(x − 2) = (x+2)(x−2)/(x−2) = x + 2. As x → 2, x + 2 → 4."
      },
      {
        "problem": "Find the derivative of f(x) = 3x⁴ − 5x² + 7.",
        "answer": "f'(x) = 12x³ − 10x",
        "explanation": "Using power rule: d/dx(3x⁴) = 12x³, d/dx(−5x²) = −10x, d/dx(7) = 0. So f'(x) = 12x³ − 10x."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "What is lim(x→0) sin(x)/x?",
        "options": ["0", "∞", "1", "Undefined"],
        "correct_answer": "1"
      },
      {
        "id": "q2",
        "question": "What is d/dx(x⁵)?",
        "options": ["x⁴", "5x⁴", "5x⁵", "x⁶/6"],
        "correct_answer": "5x⁴"
      },
      {
        "id": "q3",
        "question": "The derivative of a constant is:",
        "options": ["1", "The constant itself", "0", "Undefined"],
        "correct_answer": "0"
      },
      {
        "id": "q4",
        "question": "Find f'(x) if f(x) = sin x + cos x.",
        "options": [
          "cos x + sin x",
          "cos x − sin x",
          "−sin x − cos x",
          "sin x − cos x"
        ],
        "correct_answer": "cos x − sin x"
      },
      {
        "id": "q5",
        "question": "The derivative represents the _____ of the tangent to the curve at a point.",
        "options": ["Length", "Area", "Slope", "Intercept"],
        "correct_answer": "Slope"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 11 – Probability
  # ─────────────────────────────────────────────
  {
    "id": "c11_math_probability",
    "title": "Probability",
    "subject": "Mathematics",
    "grade": "class_11",
    "concept_id": "probability",
    "difficulty": 8,
    "introduction": (
      "Probability is the measure of the likelihood that an event will occur. "
      "It ranges from 0 (impossible) to 1 (certain). "
      "Probability theory is used in statistics, finance, medicine, and artificial intelligence."
    ),
    "explanation": (
      "P(E) = Number of favourable outcomes / Total number of outcomes (for equally likely outcomes). "
      "The sample space S is the set of all possible outcomes. An event E is a subset of S. "
      "Addition rule: P(A ∪ B) = P(A) + P(B) − P(A ∩ B). "
      "For mutually exclusive events: P(A ∪ B) = P(A) + P(B). "
      "Complementary events: P(E') = 1 − P(E)."
    ),
    "examples": [
      {
        "problem": "A die is rolled. What is the probability of getting an even number?",
        "answer": "P = 3/6 = 1/2",
        "explanation": "Even numbers on a die: {2, 4, 6} — 3 favourable outcomes out of 6 total. P = 3/6 = 1/2."
      },
      {
        "problem": "Two coins are tossed. What is the probability of getting at least one head?",
        "answer": "P = 3/4",
        "explanation": "Sample space: {HH, HT, TH, TT}. At least one head: {HH, HT, TH} — 3 outcomes. P = 3/4."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "A card is drawn from a standard deck of 52 cards. What is the probability of drawing a king?",
        "options": ["1/52", "4/52 = 1/13", "1/4", "4/13"],
        "correct_answer": "4/52 = 1/13"
      },
      {
        "id": "q2",
        "question": "If P(A) = 0.4 and P(B) = 0.5 and A and B are mutually exclusive, what is P(A ∪ B)?",
        "options": ["0.2", "0.9", "0.1", "1.0"],
        "correct_answer": "0.9"
      },
      {
        "id": "q3",
        "question": "The probability of an impossible event is:",
        "options": ["1", "0.5", "0", "−1"],
        "correct_answer": "0"
      },
      {
        "id": "q4",
        "question": "If P(E) = 0.3, what is P(E')?",
        "options": ["0.3", "0.7", "1.3", "0"],
        "correct_answer": "0.7"
      },
      {
        "id": "q5",
        "question": "A bag has 3 red and 5 blue balls. What is the probability of picking a red ball?",
        "options": ["3/5", "5/8", "3/8", "1/3"],
        "correct_answer": "3/8"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 11 – Laws of Motion
  # ─────────────────────────────────────────────
  {
    "id": "c11_physics_laws_of_motion",
    "title": "Laws of Motion",
    "subject": "Physics",
    "grade": "class_11",
    "concept_id": "laws_of_motion",
    "difficulty": 8,
    "introduction": (
      "Newton's three laws of motion form the foundation of classical mechanics. "
      "They describe the relationship between a body and the forces acting upon it, and its motion in response. "
      "These laws explain everything from a ball rolling on the ground to rockets launching into space."
    ),
    "explanation": (
      "Newton's First Law (Law of Inertia): A body at rest stays at rest, and a body in motion stays in motion at constant velocity, "
      "unless acted upon by an external net force. "
      "Newton's Second Law: F = ma — the net force on an object equals its mass times its acceleration. "
      "Newton's Third Law: For every action, there is an equal and opposite reaction. "
      "Momentum p = mv; Impulse = F × t = change in momentum. The Law of Conservation of Momentum states that total momentum is conserved in the absence of external forces."
    ),
    "examples": [
      {
        "problem": "A 5 kg object is pushed with a net force of 20 N. What is its acceleration?",
        "answer": "a = 4 m/s²",
        "explanation": "Using F = ma: a = F/m = 20/5 = 4 m/s²."
      },
      {
        "problem": "Why does a gun recoil when fired?",
        "answer": "By Newton's Third Law, the gun exerts a force on the bullet forward, and the bullet exerts an equal and opposite force on the gun backward (recoil).",
        "explanation": "Action: gun pushes bullet forward. Reaction: bullet pushes gun backward. Both forces are equal in magnitude."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Newton's First Law is also called the Law of:",
        "options": ["Acceleration", "Inertia", "Reaction", "Momentum"],
        "correct_answer": "Inertia"
      },
      {
        "id": "q2",
        "question": "A 10 kg object accelerates at 3 m/s². What is the net force acting on it?",
        "options": ["3.3 N", "13 N", "30 N", "0.3 N"],
        "correct_answer": "30 N"
      },
      {
        "id": "q3",
        "question": "The SI unit of momentum is:",
        "options": ["N", "kg·m/s", "J", "W"],
        "correct_answer": "kg·m/s"
      },
      {
        "id": "q4",
        "question": "When a swimmer pushes the wall of a pool backward, the wall pushes the swimmer:",
        "options": [
          "Backward with less force",
          "Forward with equal force",
          "Downward",
          "There is no reaction force"
        ],
        "correct_answer": "Forward with equal force"
      },
      {
        "id": "q5",
        "question": "An object moving at constant velocity has:",
        "options": [
          "A net force acting on it",
          "Zero net force",
          "Increasing momentum",
          "Decreasing inertia"
        ],
        "correct_answer": "Zero net force"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 11 – Thermodynamics
  # ─────────────────────────────────────────────
  {
    "id": "c11_physics_thermodynamics",
    "title": "Thermodynamics",
    "subject": "Physics",
    "grade": "class_11",
    "concept_id": "thermodynamics",
    "difficulty": 9,
    "introduction": (
      "Thermodynamics is the branch of physics that deals with heat, work, and energy transformations. "
      "It governs everything from car engines to refrigerators and the human body. "
      "The laws of thermodynamics set fundamental limits on energy conversion."
    ),
    "explanation": (
      "Zeroth Law: If two systems are each in thermal equilibrium with a third, they are in equilibrium with each other (basis of temperature measurement). "
      "First Law (Conservation of Energy): ΔU = Q − W, where ΔU is change in internal energy, Q is heat added, and W is work done by the system. "
      "Second Law: Heat flows spontaneously from hot to cold; entropy of an isolated system always increases. "
      "Isothermal process: temperature constant (ΔU = 0, Q = W). Adiabatic process: no heat exchange (Q = 0, ΔU = −W)."
    ),
    "examples": [
      {
        "problem": "A gas absorbs 500 J of heat and does 200 J of work. What is the change in internal energy?",
        "answer": "ΔU = 300 J",
        "explanation": "First Law: ΔU = Q − W = 500 − 200 = 300 J. The internal energy increases by 300 J."
      },
      {
        "problem": "In an isothermal process, if Q = 400 J, what is the work done by the gas?",
        "answer": "W = 400 J",
        "explanation": "In an isothermal process, ΔU = 0 (temperature constant). So Q = W = 400 J."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "The First Law of Thermodynamics is based on conservation of:",
        "options": ["Momentum", "Mass", "Energy", "Charge"],
        "correct_answer": "Energy"
      },
      {
        "id": "q2",
        "question": "In an adiabatic process:",
        "options": [
          "Temperature is constant",
          "Pressure is constant",
          "No heat is exchanged with surroundings",
          "Volume is constant"
        ],
        "correct_answer": "No heat is exchanged with surroundings"
      },
      {
        "id": "q3",
        "question": "Entropy is a measure of:",
        "options": ["Temperature", "Pressure", "Disorder or randomness", "Work done"],
        "correct_answer": "Disorder or randomness"
      },
      {
        "id": "q4",
        "question": "If ΔU = 0 in a process, then Q equals:",
        "options": ["0", "W", "−W", "2W"],
        "correct_answer": "W"
      },
      {
        "id": "q5",
        "question": "Which law of thermodynamics states that heat cannot spontaneously flow from cold to hot?",
        "options": ["Zeroth Law", "First Law", "Second Law", "Third Law"],
        "correct_answer": "Second Law"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 11 – Organic Chemistry Basics
  # ─────────────────────────────────────────────
  {
    "id": "c11_chemistry_organic_basics",
    "title": "Organic Chemistry – Basics and Hydrocarbons",
    "subject": "Chemistry",
    "grade": "class_11",
    "concept_id": "organic_chemistry_basics",
    "difficulty": 8,
    "introduction": (
      "Organic chemistry is the study of carbon-containing compounds. "
      "Carbon's ability to form four bonds and long chains makes it the basis of all life on Earth. "
      "Hydrocarbons — compounds of only carbon and hydrogen — are the simplest organic compounds."
    ),
    "explanation": (
      "Hydrocarbons are classified as: Alkanes (single bonds, CₙH₂ₙ₊₂, e.g., methane CH₄), "
      "Alkenes (one double bond, CₙH₂ₙ, e.g., ethene C₂H₄), and Alkynes (one triple bond, CₙH₂ₙ₋₂, e.g., ethyne C₂H₂). "
      "Functional groups determine the chemical properties of organic molecules: −OH (alcohol), −COOH (carboxylic acid), −CHO (aldehyde), −CO− (ketone). "
      "Isomers are compounds with the same molecular formula but different structural arrangements."
    ),
    "examples": [
      {
        "problem": "Write the molecular formula of butane (an alkane with 4 carbons).",
        "answer": "C₄H₁₀",
        "explanation": "For alkanes: CₙH₂ₙ₊₂. With n = 4: C₄H₂(4)+2 = C₄H₁₀."
      },
      {
        "problem": "Identify the functional group in CH₃COOH.",
        "answer": "Carboxylic acid group (−COOH)",
        "explanation": "The −COOH group is the carboxyl group, characteristic of carboxylic acids. CH₃COOH is acetic acid (ethanoic acid)."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "What is the general formula for alkenes?",
        "options": ["CₙH₂ₙ₊₂", "CₙH₂ₙ", "CₙH₂ₙ₋₂", "CₙHₙ"],
        "correct_answer": "CₙH₂ₙ"
      },
      {
        "id": "q2",
        "question": "Which functional group is present in alcohols?",
        "options": ["−COOH", "−CHO", "−OH", "−NH₂"],
        "correct_answer": "−OH"
      },
      {
        "id": "q3",
        "question": "Ethyne (acetylene) belongs to which class of hydrocarbons?",
        "options": ["Alkane", "Alkene", "Alkyne", "Aromatic"],
        "correct_answer": "Alkyne"
      },
      {
        "id": "q4",
        "question": "Compounds with the same molecular formula but different structures are called:",
        "options": ["Isotopes", "Isomers", "Allotropes", "Polymers"],
        "correct_answer": "Isomers"
      },
      {
        "id": "q5",
        "question": "How many bonds can a carbon atom form?",
        "options": ["2", "3", "4", "6"],
        "correct_answer": "4"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 12 – Electrostatics
  # ─────────────────────────────────────────────
  {
    "id": "c12_physics_electrostatics",
    "title": "Electrostatics – Coulomb's Law and Electric Field",
    "subject": "Physics",
    "grade": "class_12",
    "concept_id": "electrostatics",
    "difficulty": 9,
    "introduction": (
      "Electrostatics is the study of electric charges at rest and the forces between them. "
      "All matter is made of atoms containing protons (positive) and electrons (negative). "
      "Like charges repel and unlike charges attract — this is the fundamental principle of electrostatics."
    ),
    "explanation": (
      "Coulomb's Law: F = kq₁q₂/r², where k = 9 × 10⁹ N·m²/C², q₁ and q₂ are charges, and r is the distance between them. "
      "Electric field E = F/q₀ = kq/r² (field due to a point charge); direction is away from positive charge, towards negative charge. "
      "Electric potential V = kq/r; potential energy U = qV. "
      "Gauss's Law: The total electric flux through a closed surface = Q_enclosed / ε₀."
    ),
    "examples": [
      {
        "problem": "Two charges of +2 μC and +3 μC are placed 0.1 m apart. Find the force between them.",
        "answer": "F = 5.4 N (repulsive)",
        "explanation": "F = kq₁q₂/r² = (9×10⁹ × 2×10⁻⁶ × 3×10⁻⁶) / (0.1)² = (9×10⁹ × 6×10⁻¹²) / 0.01 = 54×10⁻³ / 0.01 = 5.4 N."
      },
      {
        "problem": "What is the electric field at a distance of 0.3 m from a charge of +5 μC?",
        "answer": "E = 5 × 10⁵ N/C",
        "explanation": "E = kq/r² = (9×10⁹ × 5×10⁻⁶) / (0.3)² = 45×10³ / 0.09 = 5×10⁵ N/C."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Coulomb's constant k has the value:",
        "options": ["9 × 10⁶ N·m²/C²", "9 × 10⁹ N·m²/C²", "6.67 × 10⁻¹¹ N·m²/kg²", "8.85 × 10⁻¹² C²/N·m²"],
        "correct_answer": "9 × 10⁹ N·m²/C²"
      },
      {
        "id": "q2",
        "question": "If the distance between two charges is doubled, the force between them becomes:",
        "options": ["Double", "Half", "Four times", "One-fourth"],
        "correct_answer": "One-fourth"
      },
      {
        "id": "q3",
        "question": "Electric field lines originate from:",
        "options": ["Negative charges", "Positive charges", "Neutral objects", "Conductors only"],
        "correct_answer": "Positive charges"
      },
      {
        "id": "q4",
        "question": "The SI unit of electric charge is:",
        "options": ["Ampere", "Volt", "Coulomb", "Farad"],
        "correct_answer": "Coulomb"
      },
      {
        "id": "q5",
        "question": "Inside a conductor in electrostatic equilibrium, the electric field is:",
        "options": ["Maximum", "Minimum", "Zero", "Equal to the external field"],
        "correct_answer": "Zero"
      }
    ]
  },

  # ─────────────────────────────────────────────
  # CLASS 12 – Genetics
  # ─────────────────────────────────────────────
  {
    "id": "c12_biology_genetics",
    "title": "Genetics – Heredity and Variation",
    "subject": "Biology",
    "grade": "class_12",
    "concept_id": "genetics",
    "difficulty": 9,
    "introduction": (
      "Genetics is the branch of biology that studies how traits are inherited from parents to offspring. "
      "Gregor Mendel, the 'Father of Genetics', discovered the fundamental laws of inheritance through his experiments on pea plants. "
      "DNA carries the genetic information that determines our traits."
    ),
    "explanation": (
      "Mendel's Laws: (1) Law of Segregation — alleles separate during gamete formation; each gamete carries one allele. "
      "(2) Law of Independent Assortment — genes for different traits are inherited independently. "
      "Dominant alleles (represented by capital letters) mask recessive alleles (lowercase). "
      "Genotype is the genetic makeup (e.g., Tt); phenotype is the observable trait (e.g., tall). "
      "A Punnett square predicts the probability of offspring genotypes. "
      "Mutations are changes in DNA sequence that can alter traits and may be inherited."
    ),
    "examples": [
      {
        "problem": "In a cross between Tt (tall) × tt (short), what are the expected genotype and phenotype ratios?",
        "answer": "Genotype: 1 Tt : 1 tt (50% Tt, 50% tt). Phenotype: 1 Tall : 1 Short.",
        "explanation": "Punnett square: T × t and t × t gives Tt and tt. Since T is dominant, Tt is tall and tt is short."
      },
      {
        "problem": "What is the difference between homozygous and heterozygous genotypes?",
        "answer": "Homozygous has two identical alleles (TT or tt); heterozygous has two different alleles (Tt).",
        "explanation": "Homozygous dominant (TT) and homozygous recessive (tt) are pure-breeding. Heterozygous (Tt) is a hybrid."
      }
    ],
    "quiz": [
      {
        "id": "q1",
        "question": "Who is known as the Father of Genetics?",
        "options": ["Charles Darwin", "Gregor Mendel", "James Watson", "Francis Crick"],
        "correct_answer": "Gregor Mendel"
      },
      {
        "id": "q2",
        "question": "In a monohybrid cross Tt × Tt, what is the phenotypic ratio?",
        "options": ["1:1", "1:2:1", "3:1", "2:1"],
        "correct_answer": "3:1"
      },
      {
        "id": "q3",
        "question": "An organism with genotype TT is called:",
        "options": ["Heterozygous", "Homozygous recessive", "Homozygous dominant", "Hybrid"],
        "correct_answer": "Homozygous dominant"
      },
      {
        "id": "q4",
        "question": "The observable characteristics of an organism are called its:",
        "options": ["Genotype", "Phenotype", "Allele", "Chromosome"],
        "correct_answer": "Phenotype"
      },
      {
        "id": "q5",
        "question": "Mendel's Law of Independent Assortment applies to genes located on:",
        "options": [
          "The same chromosome",
          "Different (non-homologous) chromosomes",
          "The X chromosome only",
          "Mitochondrial DNA"
        ],
        "correct_answer": "Different (non-homologous) chromosomes"
      }
    ]
  },

]  # end of CURRICULUM_LESSONS
