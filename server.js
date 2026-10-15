const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from 'public' and root
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Roadmap Data
const roadmapData = {
  'web-dev': {
    domain: 'Full-Stack Web Development',
    description: 'Complete MERN stack roadmap from frontend foundations to backend architecture and cloud deployment.',
    milestones: [
      {
        id: 'm1',
        step: 1,
        title: 'HTML5, Modern CSS & Responsive Layouts',
        duration: '2 Weeks',
        prerequisites: ['Basic Computer Literacy', 'Text Editor Setup'],
        videos: [
          { title: 'HTML & CSS Full Course for Beginners', creator: 'Physics Wallah Skills', duration: '4h 15m', url: 'https://www.youtube.com' }
        ]
      },
      {
        id: 'm2',
        step: 2,
        title: 'JavaScript ES6+, DOM & Async Logic',
        duration: '3 Weeks',
        prerequisites: ['HTML Structure', 'CSS Box Model'],
        videos: [
          { title: 'Modern JavaScript & Async/Await Primer', creator: 'Chai aur Code / PW', duration: '6h 30m', url: 'https://www.youtube.com' }
        ]
      },
      {
        id: 'm3',
        step: 3,
        title: 'React.js Component Architecture & Hooks',
        duration: '4 Weeks',
        prerequisites: ['ES6 Array Methods', 'Destructuring', 'Promises'],
        videos: [
          { title: 'Complete React Mastery Course', creator: 'PW Skills Tech', duration: '8h 20m', url: 'https://www.youtube.com' }
        ]
      },
      {
        id: 'm4',
        step: 4,
        title: 'Node.js, Express & RESTful APIs',
        duration: '3 Weeks',
        prerequisites: ['JS Functions', 'HTTP Basics', 'JSON'],
        videos: [
          { title: 'Backend Web Development with Node & Express', creator: 'Striver / PW Skills', duration: '5h 45m', url: 'https://www.youtube.com' }
        ]
      },
      {
        id: 'm5',
        step: 5,
        title: 'MongoDB & Database Modeling',
        duration: '2 Weeks',
        prerequisites: ['CRUD Concepts', 'Backend Routing'],
        videos: [
          { title: 'MongoDB & Mongoose Schema Design', creator: 'PW Skills Mentors', duration: '3h 50m', url: 'https://www.youtube.com' }
        ]
      }
    ]
  },
  'data-science': {
    domain: 'Data Science & Artificial Intelligence',
    description: 'Mathematical foundations, Python data stacks, machine learning algorithms, and deep neural architectures.',
    milestones: [
      {
        id: 'ds1',
        step: 1,
        title: 'Python for Data Science, NumPy & Pandas',
        duration: '3 Weeks',
        prerequisites: ['Basic Math', 'Programming Foundations'],
        videos: [
          { title: 'Python for Data Analysis Complete Course', creator: 'PW Skills AI', duration: '5h 10m', url: 'https://www.youtube.com' }
        ]
      },
      {
        id: 'ds2',
        step: 2,
        title: 'Applied Mathematics & Statistics',
        duration: '3 Weeks',
        prerequisites: ['High School Math', 'Calculus Basics'],
        videos: [
          { title: 'Linear Algebra for Machine Learning', creator: 'MIT / PW Mentors', duration: '4h 00m', url: 'https://www.youtube.com' }
        ]
      },
      {
        id: 'ds3',
        step: 3,
        title: 'Machine Learning Algorithms & Scikit-Learn',
        duration: '4 Weeks',
        prerequisites: ['NumPy', 'Data Preprocessing'],
        videos: [
          { title: 'Machine Learning From Scratch', creator: 'PW Skills Tech', duration: '7h 30m', url: 'https://www.youtube.com' }
        ]
      }
    ]
  },
  'software-engineering': {
    domain: 'Software Engineering & Core DSA',
    description: 'Algorithmic problem-solving, foundational data structures, complexity analysis, and system design patterns.',
    milestones: [
      {
        id: 'se1',
        step: 1,
        title: 'Time & Space Complexity + Arrays & Strings',
        duration: '2 Weeks',
        prerequisites: ['Programming Basics', 'Loops & Conditions'],
        videos: [
          { title: 'Asymptotic Analysis & Array Patterns', creator: 'Striver / TakeUForward', duration: '3h 40m', url: 'https://www.youtube.com' }
        ]
      },
      {
        id: 'se2',
        step: 2,
        title: 'Recursion, Backtracking & Dynamic Programming',
        duration: '4 Weeks',
        prerequisites: ['Call Stack Logic', 'Math Recurrence'],
        videos: [
          { title: 'Recursion to Dynamic Programming Deep Dive', creator: 'PW Skills DSA', duration: '6h 15m', url: 'https://www.youtube.com' }
        ]
      },
      {
        id: 'se3',
        step: 3,
        title: 'Trees, BST & Graph Algorithms',
        duration: '4 Weeks',
        prerequisites: ['Pointers / References', 'Recursion'],
        videos: [
          { title: 'Graph Theory & BFS/DFS Patterns', creator: 'PW Skills Tech', duration: '5h 50m', url: 'https://www.youtube.com' }
        ]
      }
    ]
  }
};

// APIs
app.get('/api/roadmap', (req, res) => {
  const domain = req.query.domain || 'web-dev';
  const data = roadmapData[domain] || roadmapData['web-dev'];
  res.json({ success: true, ...data });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required.' });
  }
  res.json({
    success: true,
    user: { id: Date.now(), name: email.split('@')[0], email, goal: 'Full-Stack Web Dev' }
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, goal } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  res.json({
    success: true,
    user: { id: Date.now(), name, email, goal: goal || 'Full-Stack Web Dev' }
  });
});

app.post('/api/prerequisite-assistant', (req, res) => {
  const { topic } = req.body;
  res.json({
    success: true,
    guidance: {
      detectedTopic: topic || 'General CS',
      recommendedAction: 'Build foundational building blocks before tackling advanced implementations.',
      prerequisites: ['Core Logic Flow', 'Memory Model', 'Step-by-step Trace'],
      foundationVideos: [
        { title: 'Foundation Concepts & Logic Primer', creator: 'Curated Mentors', url: 'https://www.youtube.com' }
      ]
    }
  });
});

// Fallback Route for index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });
});

app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`Edutech Web Platform running at: http://localhost:${PORT}`);
  console.log('====================================================');
});
