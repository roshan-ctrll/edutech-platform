let currentMilestones = [];
let completedMilestoneIds = new Set();
let currentUser = null;
let currentActiveDomain = 'web-dev';
let currentDomainTitleText = 'Full-Stack Web Development (MERN)';

let DEFAULT_MASTER_KEY = "EDUTECH-KEY-2026";
let DEFAULT_MASTER_PIN = "948210";
let isAdmin = false;

let bgScene, bgCamera, bgRenderer, bgPoints;
let fgScene, fgCamera, fgRenderer, fgMesh, fgWireframeMesh;

let pomodoroTimer = null;
let pomodoroSeconds = 25 * 60;
let pomodoroRunning = false;
let pomodoroIsBreak = false;

const DEFAULT_ROADMAPS = {
  'web-dev': {
    domain: "Full-Stack Web Development (MERN)",
    description: "Step-by-step pathway from responsive frontend design to scalable backend architecture.",
    milestones: [
      { id: 'm1', step: 1, title: "HTML5, Modern CSS & Responsive Layouts", duration: "1-2 Weeks", prerequisites: ["Web Basics", "VS Code", "DevTools"] },
      { id: 'm2', step: 2, title: "JavaScript ES6+, DOM & Async Logic", duration: "2-3 Weeks", prerequisites: ["HTML/CSS", "Programming Basics"] },
      { id: 'm3', step: 3, title: "React.js Component Architecture & Hooks", duration: "3-4 Weeks", prerequisites: ["Modern JS (ES6)", "DOM Manipulation"] },
      { id: 'm4', step: 4, title: "Node.js, Express & RESTful APIs", duration: "2-3 Weeks", prerequisites: ["Async/Await", "HTTP Methods"] },
      { id: 'm5', step: 5, title: "MongoDB & Database Modeling", duration: "2 Weeks", prerequisites: ["Node.js Basics", "CRUD Operations"] }
    ]
  },
  'data-science': {
    domain: "Data Science, Analytics & AI/ML",
    description: "From data wrangling and statistical analysis to machine learning models.",
    milestones: [
      { id: 'ds1', step: 1, title: "Python for Data Science, NumPy & Pandas", duration: "2 Weeks", prerequisites: ["Basic Programming"] },
      { id: 'ds2', step: 2, title: "Applied Mathematics & Statistics", duration: "2 Weeks", prerequisites: ["Linear Algebra Basics"] },
      { id: 'ds3', step: 3, title: "Machine Learning Algorithms & Scikit-Learn", duration: "3 Weeks", prerequisites: ["Python", "Pandas"] }
    ]
  },
  'software-engineering': {
    domain: "Software Engineering & Data Structures (DSA)",
    description: "Core algorithms, complexity analysis, and scalable system design.",
    milestones: [
      { id: 'se1', step: 1, title: "Time & Space Complexity + Arrays & Strings", duration: "2 Weeks", prerequisites: ["Basic C++/Java/Python"] },
      { id: 'se2', step: 2, title: "Recursion, Backtracking & Dynamic Programming", duration: "3 Weeks", prerequisites: ["Arrays", "Call Stack"] },
      { id: 'se3', step: 3, title: "Trees, BST & Graph Algorithms", duration: "3 Weeks", prerequisites: ["Recursion", "Queues/Stacks"] }
    ]
  }
};

const verifiedVideoLibrary = {
  'm1': { videoId: 'pQN-pnXPaVg', title: 'HTML & CSS Full Course (7.7M+ Views)', creator: 'freeCodeCamp.org', duration: '2 Hours' },
  'm2': { videoId: 'W6NZfCO5SIk', title: 'JavaScript Tutorial for Beginners (15M+ Views)', creator: 'Programming with Mosh', duration: '1 Hour' },
  'm3': { videoId: 'bMknfKXIFA8', title: 'React.js Complete Beginner Course (4.2M+ Views)', creator: 'freeCodeCamp.org', duration: '12 Hours' },
  'm4': { videoId: 'Oe421EPjeBE', title: 'Node.js and Express.js Architecture (4.4M+ Views)', creator: 'freeCodeCamp.org', duration: '8 Hours' },
  'm5': { videoId: 'ofme2o29ngU', title: 'MongoDB Crash Course & Modeling (1.5M+ Views)', creator: 'Web Dev Simplified', duration: '35 Mins' },
  'ds1': { videoId: 'rfscVS0vtbw', title: 'Python for Beginners & Data Science (40M+ Views)', creator: 'freeCodeCamp.org', duration: '4 Hours 20m' },
  'ds2': { videoId: 'fNk_zzaMoSs', title: 'Linear Algebra & Neural Networks (8M+ Views)', creator: '3Blue1Brown', duration: '15 Mins' },
  'ds3': { videoId: 'i_LwzRVP7bg', title: 'Machine Learning for Everybody (10M+ Views)', creator: 'freeCodeCamp.org', duration: '3 Hours 50m' },
  'se1': { videoId: '0IAPZzGSbME', title: 'Analysis of Algorithms & Complexity (7.8M+ Views)', creator: 'Abdul Bari', duration: '19 Mins' },
  'se2': { videoId: '8hly31xKli0', title: 'Algorithms and Data Structures Master Course (6M+ Views)', creator: 'freeCodeCamp.org', duration: '5 Hours 20m' },
  'se3': { videoId: 'DgXR2OWQnLc', title: 'Graph Theory & Algorithmic Traversal (1M+ Views)', creator: 'WilliamFiset', duration: '1 Hour 45m' }
};

const milestoneQuizzes = {
  'm1': [{ q: "HTML me semantic container element kaunsa hai?", opts: ["<div>", "<section>", "<span>", "<font>"], ans: 1, exp: "'<section>' ek semantic HTML5 tag hai." }],
  'm2': [{ q: "JS ES6 me immutable variable declare karne ke liye kya use hota hai?", opts: ["var", "let", "const", "def"], ans: 2, exp: "'const' variable re-assign nahi ho sakta." }],
  'm3': [{ q: "React component me local state ke liye basic hook kaunsa hai?", opts: ["useEffect", "useMemo", "useState", "useRef"], ans: 2, exp: "'useState' state handle karta hai." }],
  'm4': [{ q: "Node.js me REST APIs create karne ka standard routing framework kaunsa hai?", opts: ["Express.js", "Django", "Spring Boot", "Laravel"], ans: 0, exp: "Express.js Node.js ka framework hai." }],
  'm5': [{ q: "MongoDB kis type ka database system hai?", opts: ["Relational SQL", "NoSQL Document-oriented", "Graph Only", "Flat file"], ans: 1, exp: "MongoDB BSON/JSON documents store karta hai." }]
};

document.addEventListener('DOMContentLoaded', () => {
  checkAuthSession();

  try { initBackground3D(); } catch (e) { console.warn("BG 3D load issue:", e); }
  try { initForeground3D(); } catch (e) { console.warn("FG 3D load issue:", e); }

  const saved = localStorage.getItem('edutech_completed_milestones');
  if (saved) {
    try { completedMilestoneIds = new Set(JSON.parse(saved)); } catch (e) { completedMilestoneIds = new Set(); }
  }

  const form = document.getElementById('roadmapForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const domain = document.getElementById('domainSelect').value;
      const level = document.getElementById('levelSelect').value;
      loadTrackWith3DTransition(domain, level);
    });
  }

  loadTrackWith3DTransition('web-dev', 'beginner');
  updatePomodoroDisplay();
});

function playVideoModal(videoId, title, creator) {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoPlayerIframe');
  const titleEl = document.getElementById('videoModalTitle');
  const creatorEl = document.getElementById('videoModalCreator');

  if (titleEl) titleEl.textContent = title;
  if (creatorEl) creatorEl.textContent = creator;
  if (iframe) iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  if (modal) modal.style.display = 'flex';
}

function closeVideoModal() {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoPlayerIframe');
  if (iframe) iframe.src = "";
  if (modal) modal.style.display = 'none';
}

function togglePomodoro() {
  const btn = document.getElementById('pomoStartBtn');
  if (pomodoroRunning) {
    clearInterval(pomodoroTimer);
    pomodoroRunning = false;
    if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
  } else {
    pomodoroRunning = true;
    if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
    pomodoroTimer = setInterval(() => {
      if (pomodoroSeconds > 0) {
        pomodoroSeconds--;
        updatePomodoroDisplay();
      } else {
        clearInterval(pomodoroTimer);
        pomodoroRunning = false;
        alert(pomodoroIsBreak ? "Break over! Time to focus." : "Focus session done! Take a break.");
        switchPomodoroMode();
      }
    }, 1000);
  }
}

function resetPomodoro() {
  clearInterval(pomodoroTimer);
  pomodoroRunning = false;
  pomodoroSeconds = pomodoroIsBreak ? 5 * 60 : 25 * 60;
  const btn = document.getElementById('pomoStartBtn');
  if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
  updatePomodoroDisplay();
}

function switchPomodoroMode() {
  pomodoroIsBreak = !pomodoroIsBreak;
  pomodoroSeconds = pomodoroIsBreak ? 5 * 60 : 25 * 60;
  const label = document.getElementById('pomoModeLabel');
  if (label) {
    label.textContent = pomodoroIsBreak ? "Coffee Break (5m)" : "Deep Focus Session (25m)";
    label.style.color = pomodoroIsBreak ? "#34d399" : "#a78bfa";
  }
  resetPomodoro();
}

function updatePomodoroDisplay() {
  const display = document.getElementById('pomoTimerDisplay');
  const m = Math.floor(pomodoroSeconds / 60).toString().padStart(2, '0');
  const s = (pomodoroSeconds % 60).toString().padStart(2, '0');
  if (display) display.textContent = `${m}:${s}`;
}

function checkCertificateEligibility(completedCount, totalCount) {
  const banner = document.getElementById('certClaimBanner');
  if (totalCount > 0 && completedCount === totalCount) {
    if (banner) banner.style.display = 'flex';
    triggerConfetti();
  } else {
    if (banner) banner.style.display = 'none';
  }
}

function openCertificateModal() {
  const modal = document.getElementById('certificateModal');
  const nameEl = document.getElementById('certStudentName');
  const trackEl = document.getElementById('certCourseTrack');
  const dateEl = document.getElementById('certIssueDate');
  const idEl = document.getElementById('certUniqueID');

  if (nameEl) nameEl.textContent = currentUser ? currentUser.name : "Alex Sharma";
  if (trackEl) trackEl.textContent = currentDomainTitleText;
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-GB');
  if (idEl) idEl.textContent = `EDU-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  triggerConfetti();
  if (modal) modal.style.display = 'flex';
}

function closeCertificateModal() {
  const modal = document.getElementById('certificateModal');
  if (modal) modal.style.display = 'none';
}

function printCertificate() {
  window.print();
}

function triggerConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  for (let i = 0; i < 120; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      color: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899'][Math.floor(Math.random() * 4)],
      speed: Math.random() * 3 + 2
    });
  }

  let frame = 0;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 6, 10);
    });
    frame++;
    if (frame < 140) requestAnimationFrame(update);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  update();
}

function toggleMilestoneQuiz(mId) {
  const box = document.getElementById(`quiz-box-${mId}`);
  if (box) box.style.display = box.style.display === 'block' ? 'none' : 'block';
}

function handleQuizAnswer(btn, isCorrect, exp) {
  const parent = btn.parentElement;
  parent.querySelectorAll('.quiz-opt-btn').forEach(b => b.disabled = true);
  btn.classList.add(isCorrect ? 'correct' : 'wrong');

  const expBox = document.createElement('div');
  expBox.style.fontSize = '0.74rem';
  expBox.style.marginTop = '0.4rem';
  expBox.style.color = isCorrect ? '#86efac' : '#fca5a5';
  expBox.innerHTML = `<strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong> ${exp}`;
  parent.parentElement.appendChild(expBox);
}

function toggleMilestoneNotes(mId) {
  const box = document.getElementById(`notes-box-${mId}`);
  if (box) box.style.display = box.style.display === 'block' ? 'none' : 'block';
}

function autoSaveMilestoneNote(mId) {
  const val = document.getElementById(`note-text-${mId}`).value;
  localStorage.setItem(`edutech_notes_${mId}`, val);
}

async function fetchRoadmap(domain, level) {
  try {
    const res = await fetch(`/api/roadmap?domain=${domain}&level=${level}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.milestones) {
        currentMilestones = data.milestones;
        renderRoadmap(data.domain || currentDomainTitleText, data.description || "", data.milestones);
        updateProgress();
        return;
      }
    }
  } catch (e) {
    console.warn("API offline, using built-in fallback.");
  }

  const fallback = DEFAULT_ROADMAPS[domain] || DEFAULT_ROADMAPS['web-dev'];
  currentMilestones = fallback.milestones;
  renderRoadmap(fallback.domain, fallback.description, fallback.milestones);
  updateProgress();
}

function renderRoadmap(title, description, milestones) {
  const titleEl = document.getElementById('currentDomainTitle');
  const descEl = document.getElementById('currentDomainDesc');
  const container = document.getElementById('milestonesContainer');

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = description;
  if (!container) return;
  container.innerHTML = '';

  milestones.forEach((m) => {
    const isDone = completedMilestoneIds.has(m.id);
    const card = document.createElement('div');
    card.className = `milestone-card ${isDone ? 'completed' : ''}`;
    card.id = `card-${m.id}`;

    const prereqs = m.prerequisites || ["Basics"];
    const prereqHTML = prereqs.map(p => `<span class="prereq-pill"><i class="fa-solid fa-check"></i> ${p}</span>`).join(' ');

    const v = verifiedVideoLibrary[m.id] || { videoId: 'pQN-pnXPaVg', title: `${m.title} Tutorial`, creator: 'Top Mentors', duration: '2 Hours' };
    const qList = milestoneQuizzes[m.id] || [{ q: `${m.title} core concept?`, opts: ["Syntax", "Hands-on", "Both", "Skip"], ans: 2, exp: "Both syntax and practice are vital." }];

    const quizHTML = qList.map(q => `
      <div style="margin-bottom: 0.6rem;">
        <p style="font-size: 0.84rem; font-weight: 700; color: #fff;">${q.q}</p>
        <div class="quiz-options">
          ${q.opts.map((opt, idx) => `
            <button class="quiz-opt-btn" onclick="handleQuizAnswer(this, ${idx === q.ans}, '${q.exp}')">${opt}</button>
          `).join('')}
        </div>
      </div>
    `).join('');

    const savedNote = localStorage.getItem(`edutech_notes_${m.id}`) || '';

    card.innerHTML = `
      <div class="milestone-top">
        <div style="display: flex; align-items: center; gap: 0.8rem;">
          <input type="checkbox" class="custom-checkbox" id="check-${m.id}" ${isDone ? 'checked' : ''} onchange="toggleMilestoneCompletion('${m.id}')">
          <span style="font-size: 0.8rem; background: rgba(59,130,246,0.15); padding: 0.2rem 0.6rem; border-radius: 6px; color: #60a5fa; font-weight: 700;">Milestone ${m.step || 1}</span>
          <h3 style="display: inline; font-size: 1.2rem;">${m.title}</h3>
        </div>
        <span style="font-size: 0.8rem; color: #94a3b8;"><i class="fa-regular fa-clock"></i> ${m.duration || 'Flexible'}</span>
      </div>

      <div class="prereq-list">${prereqHTML}</div>

      <div class="video-grid">
        <div class="video-item">
          <h5>${v.title}</h5>
          <span style="font-size: 0.8rem; color: #60a5fa;">${v.creator} • ${v.duration}</span>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.8rem;">
            <button class="watch-modal-btn" onclick="playVideoModal('${v.videoId}', '${v.title}', '${v.creator}')">
              <i class="fa-solid fa-play"></i> Watch in Theater
            </button>
            <a href="https://www.youtube.com/watch?v=${v.videoId}" target="_blank" style="padding: 0.55rem 0.85rem; font-size: 0.78rem; text-decoration: none; border-radius: 8px; background: rgba(255,255,255,0.08); color: white; display: inline-flex; align-items: center; gap: 0.4rem;">
              <i class="fa-brands fa-youtube" style="color: #ef4444;"></i> Open YouTube
            </a>
          </div>
        </div>
      </div>

      <div class="milestone-extras-row">
        <button class="extra-action-btn" onclick="toggleMilestoneQuiz('${m.id}')"><i class="fa-solid fa-list-check"></i> Quick Quiz</button>
        <button class="extra-action-btn" onclick="toggleMilestoneNotes('${m.id}')"><i class="fa-solid fa-pen-nib"></i> Study Notes</button>
      </div>

      <div class="milestone-quiz-box" id="quiz-box-${m.id}">
        <strong style="color: #93c5fd; font-size: 0.84rem; display:block; margin-bottom: 0.5rem;">Knowledge Check:</strong>
        ${quizHTML}
      </div>

      <div class="milestone-notes-box" id="notes-box-${m.id}">
        <strong style="color: #fcd34d; font-size: 0.82rem; display:block; margin-bottom: 0.4rem;">Personal Scratchpad:</strong>
        <textarea class="milestone-notes-textarea" id="note-text-${m.id}" placeholder="Write notes here..." oninput="autoSaveMilestoneNote('${m.id}')">${savedNote}</textarea>
      </div>
    `;

    container.appendChild(card);
  });
}

function toggleMilestoneCompletion(id) {
  const card = document.getElementById(`card-${id}`);
  if (completedMilestoneIds.has(id)) {
    completedMilestoneIds.delete(id);
    if (card) card.classList.remove('completed');
  } else {
    completedMilestoneIds.add(id);
    if (card) card.classList.add('completed');
  }

  localStorage.setItem('edutech_completed_milestones', JSON.stringify(Array.from(completedMilestoneIds)));
  updateProgress();
}

function updateProgress() {
  if (currentMilestones.length === 0) return;
  let done = 0;
  currentMilestones.forEach(m => { if (completedMilestoneIds.has(m.id)) done++; });

  const pct = Math.round((done / currentMilestones.length) * 100);
  const pctEl = document.getElementById('progressPercentage');
  const barEl = document.getElementById('progressBarFill');
  const statusEl = document.getElementById('completionStatus');

  if (pctEl) pctEl.textContent = `${pct}%`;
  if (barEl) barEl.style.width = `${pct}%`;
  if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${done} of ${currentMilestones.length} milestones finished.`;

  checkCertificateEligibility(done, currentMilestones.length);
}

function filterMilestones() {
  const q = document.getElementById('milestoneSearchInput').value.toLowerCase();
  document.querySelectorAll('.milestone-card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(q) ? 'block' : 'none';
  });
}

function initBackground3D() {
  const canvas = document.getElementById('webgl-3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  bgScene = new THREE.Scene();
  bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  bgCamera.position.z = 30;

  bgRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  bgRenderer.setSize(window.innerWidth, window.innerHeight);

  const count = 500;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 80;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  bgPoints = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.5, color: 0x6366f1, transparent: true, opacity: 0.6 }));
  bgScene.add(bgPoints);

  function animate() {
    requestAnimationFrame(animate);
    bgPoints.rotation.y -= 0.0006;
    bgRenderer.render(bgScene, bgCamera);
  }
  animate();
}

function initForeground3D() {
  const canvas = document.getElementById('foreground-3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  fgScene = new THREE.Scene();
  fgCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  fgCamera.position.z = 6;

  fgRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  fgRenderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const light = new THREE.PointLight(0x3b82f6, 2, 50);
  light.position.set(5, 5, 5);
  fgScene.add(light);
  fgScene.add(new THREE.AmbientLight(0xffffff, 0.6));

  buildForegroundMesh('web-dev');

  function animateFG() {
    requestAnimationFrame(animateFG);
    if (fgMesh) {
      fgMesh.rotation.y += 0.01;
      fgMesh.rotation.x += 0.005;
      if (fgWireframeMesh) {
        fgWireframeMesh.rotation.y += 0.01;
        fgWireframeMesh.rotation.x += 0.005;
      }
    }
    fgRenderer.render(fgScene, fgCamera);
  }
  animateFG();
}

function buildForegroundMesh(domain) {
  if (!fgScene || typeof THREE === 'undefined') return;
  if (fgMesh) fgScene.remove(fgMesh);
  if (fgWireframeMesh) fgScene.remove(fgWireframeMesh);

  let geo = new THREE.TorusKnotGeometry(1.5, 0.4, 80, 16);
  let color = 0x38bdf8;

  if (domain === 'data-science') {
    geo = new THREE.IcosahedronGeometry(2, 1);
    color = 0xa855f7;
  } else if (domain === 'software-engineering') {
    geo = new THREE.OctahedronGeometry(2, 0);
    color = 0x10b981;
  }

  fgMesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.35 }));
  fgWireframeMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.85 }));
  fgScene.add(fgMesh);
  fgScene.add(fgWireframeMesh);
}

function loadTrackWith3DTransition(domain, level = 'beginner') {
  currentActiveDomain = domain;
  buildForegroundMesh(domain);

  const titleEl = document.getElementById('holoTrackTitle');
  if (domain === 'web-dev') currentDomainTitleText = "Full-Stack Web Development (MERN)";
  else if (domain === 'data-science') currentDomainTitleText = "Data Science & AI/ML";
  else if (domain === 'software-engineering') currentDomainTitleText = "Software Engineering & DSA";

  if (titleEl) titleEl.textContent = currentDomainTitleText;
  fetchRoadmap(domain, level);
}

function quickSelectTrack(domain) {
  const sel = document.getElementById('domainSelect');
  if (sel) sel.value = domain;
  loadTrackWith3DTransition(domain, 'beginner');
  navigateToSection3D('tracks');
}

function navigateToSection3D(targetId, e) {
  if (e) e.preventDefault();
  const el = document.getElementById(targetId);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function openAuthModal(tab = 'signup') {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'flex';
  switchAuthTab(tab);
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'none';
}

function switchAuthTab(tab) {
  const lForm = document.getElementById('loginForm');
  const sForm = document.getElementById('signupForm');
  const tLogin = document.getElementById('tabLoginBtn');
  const tSignup = document.getElementById('tabSignupBtn');

  if (tab === 'login') {
    if (lForm) lForm.style.display = 'block';
    if (sForm) sForm.style.display = 'none';
    if (tLogin) tLogin.classList.add('active');
    if (tSignup) tSignup.classList.remove('active');
  } else {
    if (lForm) lForm.style.display = 'none';
    if (sForm) sForm.style.display = 'block';
    if (tLogin) tLogin.classList.remove('active');
    if (tSignup) tSignup.classList.add('active');
  }
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  currentUser = { name: email.split('@')[0], email };
  localStorage.setItem('edutech_user', JSON.stringify(currentUser));
  closeAuthModal();
  checkAuthSession();
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  currentUser = { name, email };
  localStorage.setItem('edutech_user', JSON.stringify(currentUser));
  closeAuthModal();
  checkAuthSession();
}

function checkAuthSession() {
  const stored = localStorage.getItem('edutech_user');
  const authBtn = document.getElementById('authNavBtn');
  const prof = document.getElementById('userProfileNav');
  const nameEl = document.getElementById('navUserName');

  if (stored) {
    currentUser = JSON.parse(stored);
    if (authBtn) authBtn.style.display = 'none';
    if (prof) prof.style.display = 'flex';
    if (nameEl) nameEl.textContent = currentUser.name;
  } else {
    if (authBtn) authBtn.style.display = 'inline-flex';
    if (prof) prof.style.display = 'none';
  }
}

function logoutUser() {
  localStorage.removeItem('edutech_user');
  currentUser = null;
  checkAuthSession();
}

function openAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.style.display = 'flex';
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.style.display = 'none';
}

function handleSecureAdminLogin(e) {
  e.preventDefault();
  const k = document.getElementById('adminSecretKeyInput').value.trim();
  const p = document.getElementById('adminPinInput').value.trim();

  if (k === DEFAULT_MASTER_KEY && p === DEFAULT_MASTER_PIN) {
    alert("Admin Authenticated!");
    closeAdminModal();
  } else {
    alert("Invalid Key or PIN!");
  }
}

function openAssistantModal() {
  const modal = document.getElementById('aiModal');
  if (modal) modal.style.display = 'flex';
}

function closeAssistantModal() {
  const modal = document.getElementById('aiModal');
  if (modal) modal.style.display = 'none';
}

function queryAIAssistant() {
  const input = document.getElementById('assistantInput').value.trim();
  const res = document.getElementById('assistantResult');
  if (!input) return;

  res.style.display = 'block';
  res.innerHTML = `<strong>Diagnostic for "${input}":</strong> Master fundamental JavaScript array iterations, call stack tracing, and memory references before advancing into complex application states.`;
}
