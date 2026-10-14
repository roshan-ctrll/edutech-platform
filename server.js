const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Repository (Roadmaps, Videos, Notes & Practice)
const roadmapDatabase = {
  "web-dev": {
    title: "Full-Stack Web Development",
    description: "Frontend se lekar Backend aur Database tak complete industry-ready path.",
    milestones: [
      {
        id: "wd-m1",
        step: 1,
        title: "Frontend Foundations (HTML5, CSS3 & JavaScript)",
        duration: "3-4 Weeks",
        prerequisites: ["Basic Computer Literacy", "Logical Thinking"],
        videos: [
          {
            title: "Sigma Web Development Course - HTML/CSS/JS",
            creator: "CodeWithHarry / Industry Expert",
            url: "https://www.youtube.com/watch?v=tVzUXW6siu0",
            duration: "25 hrs"
          },
          {
            title: "JavaScript Full Course for Beginners",
            creator: "freeCodeCamp",
            url: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
            duration: "8 hrs"
          }
        ],
        resources: [
          { name: "HTML & CSS Cheat Sheet (PDF)", type: "Cheat Sheet", link: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
          { name: "JavaScript DOM Practice Exercises", type: "Practice", link: "https://javascript30.com/" }
        ]
      },
      {
        id: "wd-m2",
        step: 2,
        title: "Modern Frontend Framework (React.js)",
        duration: "3 Weeks",
        prerequisites: ["JavaScript ES6+", "DOM Manipulation", "Promises & Fetch API"],
        videos: [
          {
            title: "React JS One Shot Complete Course",
            creator: "PW Skills Tech",
            url: "https://www.youtube.com/watch?v=RGKi6LSPDLU",
            duration: "10 hrs"
          },
          {
            title: "Chai aur React Series",
            creator: "Chai aur Code",
            url: "https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige",
            duration: "12 hrs"
          }
        ],
        resources: [
          { name: "React State & Hooks Summary", type: "Curated Notes", link: "https://react.dev/" },
          { name: "Build 5 React Projects - Guide", type: "Practice", link: "https://github.com" }
        ]
      },
      {
        id: "wd-m3",
        step: 3,
        title: "Backend Engineering (Node.js & Express.js)",
        duration: "4 Weeks",
        prerequisites: ["Asynchronous JavaScript", "HTTP Methods & Status Codes"],
        videos: [
          {
            title: "Node.js & Express.js Full Architecture Course",
            creator: "PW Skills Tech / Industry Creators",
            url: "https://www.youtube.com/watch?v=Oe421EPjeBE",
            duration: "15 hrs"
          }
        ],
        resources: [
          { name: "REST API Design Guidelines", type: "Cheat Sheet", link: "https://restfulapi.net/" },
          { name: "CRUD API Practice Challenges", type: "Practice", link: "https://postman.com" }
        ]
      },
      {
        id: "wd-m4",
        step: 4,
        title: "Database Integration (MongoDB & Mongoose)",
        duration: "2 Weeks",
        prerequisites: ["JSON data format", "Backend CRUD Basics"],
        videos: [
          {
            title: "Complete MongoDB Tutorial with Aggregations",
            creator: "Thapa Technical / PW Skills",
            url: "https://www.youtube.com/watch?v=rU9ZOBw8DD0",
            duration: "6 hrs"
          }
        ],
        resources: [
          { name: "MongoDB Schema Design Cheatsheet", type: "Curated Notes", link: "https://www.mongodb.com/docs/" },
          { name: "Database Modeling Practice Tasks", type: "Practice", link: "https://leetcode.com" }
        ]
      }
    ]
  },
  "data-science": {
    title: "Data Science & AI/ML Track",
    description: "Mathematics, Python, Data Analytics aur Deep Learning ka structured roadmap.",
    milestones: [
      {
        id: "ds-m1",
        step: 1,
        title: "Python for Data Science & Math Essentials",
        duration: "3 Weeks",
        prerequisites: ["Linear Algebra", "Calculus Basics", "Probability"],
        videos: [
          {
            title: "Python for Data Science Full Course",
            creator: "Physics Wallah / PW Skills",
            url: "https://www.youtube.com/watch?v=mkv5mxNjUQU",
            duration: "12 hrs"
          }
        ],
        resources: [
          { name: "NumPy & Pandas Quick Reference", type: "Cheat Sheet", link: "https://pandas.pydata.org/" },
          { name: "100 Python Data Exercises", type: "Practice", link: "https://kaggle.com" }
        ]
      },
      {
        id: "ds-m2",
        step: 2,
        title: "Machine Learning Algorithms & Scikit-Learn",
        duration: "5 Weeks",
        prerequisites: ["Python OOP", "Data Preprocessing", "Statistics"],
        videos: [
          {
            title: "Complete Machine Learning Playlist",
            creator: "Krish Naik / CampusX",
            url: "https://www.youtube.com/watch?v=i_LwzRVP7bg",
            duration: "20 hrs"
          }
        ],
        resources: [
          { name: "ML Algorithms Visual Guide", type: "Curated Notes", link: "https://scikit-learn.org" },
          { name: "Kaggle Competitions Starter Kit", type: "Practice", link: "https://kaggle.com/competitions" }
        ]
      }
    ]
  },
  "software-engineering": {
    title: "Software Engineering & DSA",
    description: "Core Computer Science, Data Structures, Algorithms aur System Design.",
    milestones: [
      {
        id: "se-m1",
        step: 1,
        title: "Data Structures & Algorithms (C++ / Java / Python)",
        duration: "6 Weeks",
        prerequisites: ["Basic Programming Syntax", "Time & Space Complexity Basics"],
        videos: [
          {
            title: "Complete DSA Placement Series",
            creator: "Striver (take U forward) / PW Skills",
            url: "https://www.youtube.com/watch?v=EAR7De6Gud4",
            duration: "40 hrs"
          }
        ],
        resources: [
          { name: "DSA Sheet - Top 150 Coding Questions", type: "Curated Notes", link: "https://leetcode.com" },
          { name: "Blind 75 LeetCode Tracker", type: "Practice", link: "https://leetcode.com" }
        ]
      },
      {
        id: "se-m2",
        step: 2,
        title: "System Design & Software Architecture",
        duration: "4 Weeks",
        prerequisites: ["Client-Server Architecture", "Databases (SQL/NoSQL)"],
        videos: [
          {
            title: "System Design Primer for Beginners",
            creator: "Gaurav Sen",
            url: "https://www.youtube.com/watch?v=xpDnVSmNFX0",
            duration: "8 hrs"
          }
        ],
        resources: [
          { name: "High-Level Architecture Cheatsheet", type: "Cheat Sheet", link: "https://github.com/donnemartin/system-design-primer" },
          { name: "Distributed Systems Case Studies", type: "Curated Notes", link: "https://bytebytego.com" }
        ]
      }
    ]
  }
};

// API: Get Roadmap by Domain & Level
app.get('/api/roadmap', (req, res) => {
  const { domain, level } = req.query;
  const selected = roadmapDatabase[domain];

  if (!selected) {
    return res.status(404).json({ success: false, message: "Roadmap domain nahi mila!" });
  }

  // Filter or prioritize milestones according to skill level
  let filteredMilestones = [...selected.milestones];
  if (level === 'intermediate') {
    // Intermediate learners start with advanced milestones or accelerated view
    filteredMilestones = filteredMilestones.map(m => ({
      ...m,
      note: "Recommended fast-track pace for intermediate level"
    }));
  }

  res.json({
    success: true,
    domain: selected.title,
    description: selected.description,
    milestones: filteredMilestones
  });
});

// API: AI-Assisted Prerequisite Guidance Assistant
app.post('/api/prerequisite-assistant', (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Kripya topic provide karein." });
  }

  const query = topic.toLowerCase();
  let guidance = {
    detectedTopic: topic,
    prerequisites: [],
    recommendedAction: "",
    foundationVideos: []
  };

  if (query.includes("react") || query.includes("frontend framework")) {
    guidance.prerequisites = ["JavaScript ES6 (Arrow functions, Destructuring, Promises, Map/Filter)", "HTML DOM Manipulation", "CSS Flexbox & Grid"];
    guidance.recommendedAction = "React start karne se pehle JavaScript async/await aur modular code par 3 din practice karein.";
    guidance.foundationVideos = [
      { title: "JS Prerequisites for React", creator: "PW Skills / Chai aur Code", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg" }
    ];
  } else if (query.includes("node") || query.includes("backend") || query.includes("express")) {
    guidance.prerequisites = ["Client-Server HTTP cycle", "REST conventions", "JSON Handling", "Node event loop basics"];
    guidance.recommendedAction = "Backend logic samajhne se pehle Postman tool ka use aur HTTP verbs (GET, POST, PUT, DELETE) clear karein.";
    guidance.foundationVideos = [
      { title: "HTTP & Networking Fundamentals for Web Developers", creator: "FreeCodeCamp", url: "https://www.youtube.com" }
    ];
  } else if (query.includes("dsa") || query.includes("recursion") || query.includes("algorithm")) {
    guidance.prerequisites = ["Basic Loop logic (For/While)", "Functions & Call Stack", "Pointers / Reference Memory model"];
    guidance.recommendedAction = "Recursion me direct trees ya DP mat karein, pehle mathematical recurrence aur base conditions dry run karein.";
    guidance.foundationVideos = [
      { title: "Recursion Basics & Call Stack Dry Run", creator: "Striver / PW Skills", url: "https://www.youtube.com" }
    ];
  } else if (query.includes("ml") || query.includes("machine learning") || query.includes("ai")) {
    guidance.prerequisites = ["Python Basics", "Linear Algebra (Matrix Multiplication)", "Derivatives & Gradient Descent basics"];
    guidance.recommendedAction = "Black-box libraries chalane se pehle Cost Function aur Optimization math ko visual animation se samjhein.";
    guidance.foundationVideos = [
      { title: "Essential Math for Machine Learning", creator: "3Blue1Brown / Krish Naik", url: "https://www.youtube.com" }
    ];
  } else {
    guidance.prerequisites = ["Core Programming Fundamentals", "Problem Decomposition", "Systematic Debugging Skills"];
    guidance.recommendedAction = `Aapke topic '${topic}' ke liye fundamental concepts pehle master karein, phir advanced libraries par jump karein.`;
    guidance.foundationVideos = [
      { title: "Computer Science Principles", creator: "CrashCourse / Edutech Curated", url: "https://www.youtube.com" }
    ];
  }

  res.json({ success: true, guidance });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Edutech Web Platform running at: http://localhost:${PORT}`);
  console.log(`====================================================`);
});