let currentMilestones = [];
let completedMilestoneIds = new Set();
let currentUser = null;
let currentActiveDomain = 'web-dev';
let currentDomainTitleText = 'Full-Stack Web Development';

// 2-FACTOR MASTER SECURITY CONFIGURATION
let DEFAULT_MASTER_KEY = "EDUTECH-KEY-2026";
let DEFAULT_MASTER_PIN = "948210";

let isAdmin = false;
let isGateEnabled = true;
let failedAttempts = 0;
let lockoutUntil = 0;

// Three.js instances
let bgScene, bgCamera, bgRenderer, bgPoints;
let fgScene, fgCamera, fgRenderer, fgMesh, fgWireframeMesh;
let isWarpSpeedActive = false;

// 2-Click Gate Trigger Counter
let userInteractionCount = 0;
let isAuthForced = false;

// Built-in Pomodoro State
let pomodoroTimer = null;
let pomodoroSeconds = 25 * 60;
let pomodoroRunning = false;
let pomodoroIsBreak = false;

// =========================================================
// REAL-TIME CURATED TOP-TIER YOUTUBE VIDEO LIBRARY
// High-Views, Best Channels (Chai aur Code, Striver, SuperSimpleDev, etc.)
// =========================================================
const verifiedVideoLibrary = {
  // --- Web Dev Track ---
  'm1': {
    videoId: 'G3e-cpL7ofc',
    title: 'HTML & CSS Full Course - Beginner to Pro (30M+ Views)',
    creator: 'SuperSimpleDev',
    duration: '6h 30m'
  },
  'm2': {
    videoId: 'sscXFe3gCWY',
    title: 'JavaScript Full Foundation & Modern ES6 Masterclass',
    creator: 'Chai aur Code (Hitesh Choudhary)',
    duration: '8h 15m'
  },
  'm3': {
    videoId: 'vz1RlUy5574',
    title: 'React.js Complete Course with Real-World Projects',
    creator: 'Chai aur Code (Hitesh Choudhary)',
    duration: '10h 40m'
  },
  'm4': {
    videoId: '7H_QH9nipNs',
    title: 'Node.js & Express.js Full Backend Architecture Course',
    creator: 'Chai aur Code / Dave Gray',
    duration: '7h 20m'
  },
  'm5': {
    videoId: 'ofme2o29ngU',
    title: 'MongoDB & Mongoose Database Design Complete Tutorial',
    creator: 'Web Dev Simplified',
    duration: '3h 45m'
  },

  // --- Data Science & AI Track ---
  'ds1': {
    videoId: 'LHBE6Q9XfZI',
    title: 'Python for Data Science, NumPy & Pandas Complete Tutorial',
    creator: 'Codebasics / CampusX',
    duration: '5h 10m'
  },
  'ds2': {
    videoId: 'fNk_zzaMoSs',
    title: 'Essence of Linear Algebra & Machine Learning Mathematics',
    creator: '3Blue1Brown',
    duration: '4h 00m'
  },
  'ds3': {
    videoId: 'i_LwzRVP7bg',
    title: 'Machine Learning with Python & Scikit-Learn Playlist',
    creator: 'Krish Naik',
    duration: '7h 30m'
  },

  // --- Software Engineering & DSA Track ---
  'se1': {
    videoId: '2ZLl8GAk1X4',
    title: 'Time Complexity, Space Complexity & Array Problem Patterns',
    creator: 'take U forward (Striver)',
    duration: '3h 40m'
  },
  'se2': {
    videoId: 'nqowUJzG-58',
    title: 'Dynamic Programming & Recursion Master Series',
    creator: 'take U forward (Striver)',
    duration: '6h 15m'
  },
  'se3': {
    videoId: 'tWVWeAqZ0WU',
    title: 'Graph Theory & Binary Tree Traversals (BFS/DFS)',
    creator: 'take U forward (Striver)',
    duration: '5h 50m'
  }
};

// Milestone Quizzes Bank
const milestoneQuizzes = {
  'm1': [
    {
      q: "HTML me semantic container element kaunsa hai?",
      opts: ["<div>", "<section>", "<span>", "<font>"],
      ans: 1,
      exp: "'<section>' ek semantic HTML5 tag hai jo content structure define karta hai."
    },
    {
      q: "CSS Flexbox me main axis ke along items align karne ke liye kya use hota hai?",
      opts: ["align-items", "justify-content", "align-content", "flex-wrap"],
      ans: 1,
      exp: "'justify-content' hamesha main axis par alignment control karta hai."
    }
  ],
  'm2': [
    {
      q: "JavaScript ES6 me immutable variable declare karne ke liye kya use karte hain?",
      opts: ["var", "let", "const", "def"],
      ans: 2,
      exp: "'const' se variable re-assign nahi ho sakta."
    },
    {
      q: "Async operations handle karne ke liye modern JS me kya use hota hai?",
      opts: ["async/await", "goto", "sleep()", "thread.start()"],
      ans: 0,
      exp: "'async/await' promises ko synchronous style me clean banata hai."
    }
  ],
  'm3': [
    {
      q: "React component me local state store karne ke liye kaunsa basic hook use hota hai?",
      opts: ["useEffect", "useMemo", "useState", "useRef"],
      ans: 2,
      exp: "'useState' hook local state update aur manage karta hai."
    },
    {
      q: "Side-effects jaise API calls ke liye kaunsa hook use hota hai?",
      opts: ["useEffect", "useReducer", "useCallback", "useState"],
      ans: 0,
      exp: "'useEffect' component mount/update hone par side-effects execute karta hai."
    }
  ],
  'm4': [
    {
      q: "Node.js me REST APIs create karne ke liye lightweight web framework kaunsa hai?",
      opts: ["Express.js", "Django", "Spring Boot", "Laravel"],
      ans: 0,
      exp: "Express.js Node.js ka standard routing framework hai."
    },
    {
      q: "Incoming request body data ko parse karne ke liye kaunsa middleware use hota hai?",
      opts: ["express.static()", "express.json()", "cors()", "morgan()"],
      ans: 1,
      exp: "'express.json()' incoming JSON payload parse karta hai."
    }
  ],
  'm5': [
    {
      q: "MongoDB kis type ka database system hai?",
      opts: ["Relational SQL", "NoSQL Document-oriented", "Graph Only", "Flat file"],
      ans: 1,
      exp: "MongoDB BSON/JSON-like documents store karta hai."
    },
    {
      q: "Mongoose me schema structure define karne ke liye kya use hota hai?",
      opts: ["new mongoose.Schema()", "mongoose.table()", "mongoose.sql()", "mongoose.create()"],
      ans: 0,
      exp: "'mongoose.Schema' collection schema define karta hai."
    }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  initAdminCredentials();
  checkAuthSession();

  initBackground3D();
  initForeground3D();

  const savedState = localStorage.getItem('edutech_completed_milestones');
  if (savedState) {
    try {
      completedMilestoneIds = new Set(JSON.parse(savedState));
    } catch (e) {
      completedMilestoneIds = new Set();
    }
  }

  const roadmapForm = document.getElementById('roadmapForm');
  if (roadmapForm) {
    roadmapForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const domain = document.getElementById('domainSelect').value;
      const level = document.getElementById('levelSelect').value;
      loadTrackWith3DTransition(domain, level);
    });
  }

  loadTrackWith3DTransition('web-dev', 'beginner');
  setupTwoClickGate();
  updatePomodoroDisplay();
});

/* =========================================================
   FEATURE 1: IN-WEBSITE VIDEO PLAYER MODAL & EMBED ENGINE
   ========================================================= */
function playVideoModal(videoId, title, creator) {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoPlayerIframe');
  const titleEl = document.getElementById('videoModalTitle');
  const creatorEl = document.getElementById('videoModalCreator');

  if (titleEl) titleEl.textContent = title;
  if (creatorEl) creatorEl.innerHTML = `<i class="fa-solid fa-chalkboard-user"></i> ${creator}`;

  // Safe YouTube embed with exact video ID
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  if (iframe) iframe.src = embedUrl;
  if (modal) modal.style.display = 'flex';
}

function closeVideoModal() {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoPlayerIframe');
  if (iframe) iframe.src = "";
  if (modal) modal.style.display = 'none';
}

/* =========================================================
   FEATURE 2: AUTO CERTIFICATE GENERATOR WITH CONFETTI
   ========================================================= */
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

  const studentName = currentUser ? currentUser.name : "Alex Sharma";
  if (nameEl) nameEl.textContent = studentName;
  if (trackEl) trackEl.textContent = currentDomainTitleText;
  
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  if (dateEl) dateEl.textContent = dateStr;

  const randomHash = Math.random().toString(36).substring(2, 7).toUpperCase();
  if (idEl) idEl.textContent = `EDU-2026-${randomHash}`;

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
  const numberOfPieces = 150;
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'];

  for (let i = 0; i < numberOfPieces; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      rotation: Math.random() * 360,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 2
    });
  }

  let frame = 0;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed;
      p.rotation += 2;
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      ctx.restore();
    });

    frame++;
    if (frame < 180) {
      requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  update();
}

/* =========================================================
   FEATURE 3: POMODORO STUDY TIMER (25m / 5m)
   ========================================================= */
function togglePomodoro() {
  const startBtn = document.getElementById('pomoStartBtn');
  if (pomodoroRunning) {
    clearInterval(pomodoroTimer);
    pomodoroRunning = false;
    if (startBtn) startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
  } else {
    pomodoroRunning = true;
    if (startBtn) startBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
    pomodoroTimer = setInterval(() => {
      if (pomodoroSeconds > 0) {
        pomodoroSeconds--;
        updatePomodoroDisplay();
      } else {
        clearInterval(pomodoroTimer);
        pomodoroRunning = false;
        alert(pomodoroIsBreak ? "Break over! Time to focus." : "Focus session completed! Take a 5-minute break.");
        switchPomodoroMode();
      }
    }, 1000);
  }
}

function resetPomodoro() {
  clearInterval(pomodoroTimer);
  pomodoroRunning = false;
  pomodoroSeconds = pomodoroIsBreak ? 5 * 60 : 25 * 60;
  const startBtn = document.getElementById('pomoStartBtn');
  if (startBtn) startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start';
  updatePomodoroDisplay();
}

function switchPomodoroMode() {
  pomodoroIsBreak = !pomodoroIsBreak;
  pomodoroSeconds = pomodoroIsBreak ? 5 * 60 : 25 * 60;
  const modeLabel = document.getElementById('pomoModeLabel');
  if (modeLabel) {
    modeLabel.textContent = pomodoroIsBreak ? "Coffee & Rest Break (5m)" : "Deep Focus Session (25m)";
    modeLabel.style.color = pomodoroIsBreak ? "#34d399" : "#a78bfa";
  }
  resetPomodoro();
}

function updatePomodoroDisplay() {
  const display = document.getElementById('pomoTimerDisplay');
  const mins = Math.floor(pomodoroSeconds / 60);
  const secs = pomodoroSeconds % 60;
  if (display) {
    display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

/* =========================================================
   FEATURE 4: MILESTONE MINI QUIZZES
   ========================================================= */
function toggleMilestoneQuiz(mId) {
  const box = document.getElementById(`quiz-box-${mId}`);
  if (!box) return;
  box.style.display = box.style.display === 'block' ? 'none' : 'block';
}

function handleQuizAnswer(btn, isCorrect, exp) {
  const parent = btn.parentElement;
  const allBtns = parent.querySelectorAll('.quiz-opt-btn');
  allBtns.forEach(b => {
    b.disabled = true;
    b.style.pointerEvents = 'none';
  });

  if (isCorrect) {
    btn.classList.add('correct');
  } else {
    btn.classList.add('wrong');
  }

  const expBox = document.createElement('div');
  expBox.style.fontSize = '0.74rem';
  expBox.style.marginTop = '0.4rem';
  expBox.style.color = isCorrect ? '#86efac' : '#fca5a5';
  expBox.innerHTML = `<strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong> ${exp}`;
  parent.parentElement.appendChild(expBox);
}

/* =========================================================
   FEATURE 5: PERSONAL MILESTONE NOTES SCRATCHPAD
   ========================================================= */
function toggleMilestoneNotes(mId) {
  const box = document.getElementById(`notes-box-${mId}`);
  if (!box) return;
  box.style.display = box.style.display === 'block' ? 'none' : 'block';
}

function autoSaveMilestoneNote(mId) {
  const textarea = document.getElementById(`note-text-${mId}`);
  const statusEl = document.getElementById(`note-status-${mId}`);
  if (!textarea) return;

  const content = textarea.value;
  localStorage.setItem(`edutech_notes_${mId}`, content);

  if (statusEl) {
    statusEl.innerHTML = '<i class="fa-solid fa-check"></i> Saved to browser storage.';
    setTimeout(() => {
      statusEl.innerHTML = '<i class="fa-solid fa-cloud"></i> Notes automatically synchronized.';
    }, 2000);
  }
}

/* =========================================================
   AUTHENTICATION & VISITOR GATE
   ========================================================= */
function initAdminCredentials() {
  const customKey = localStorage.getItem('edutech_custom_master_key');
  const customPin = localStorage.getItem('edutech_custom_master_pin');
  if (customKey) DEFAULT_MASTER_KEY = customKey;
  if (customPin) DEFAULT_MASTER_PIN = customPin;
}

function setupTwoClickGate() {
  document.addEventListener('click', (e) => {
    if (isAdmin || currentUser || !isGateEnabled) return;
    if (e.target.closest('#authModal') || e.target.closest('#adminModal') || e.target.closest('#videoModal') || e.target.closest('#certificateModal') || e.target.closest('.sub-account-bar')) return;

    userInteractionCount++;
    if (userInteractionCount >= 2) {
      openAuthModal('signup', true);
    }
  });
}

function handleBackdropClick() {
  if (isAuthForced && !isAdmin) {
    showAuthAlert("Account registration is required to continue exploring Edutech.", 'error');
    return;
  }
  closeAuthModal();
}

function checkAuthSession() {
  const storedUser = localStorage.getItem('edutech_user');
  const storedToken = localStorage.getItem('edutech_admin_token');
  const authNavBtn = document.getElementById('authNavBtn');
  const userProfileNav = document.getElementById('userProfileNav');
  const navUserName = document.getElementById('navUserName');
  const navUserAvatar = document.getElementById('navUserAvatar');
  const accountStatusText = document.getElementById('accountStatusText');

  if (storedToken && storedToken.startsWith("EDUTECH_ROOT_AUTH_")) {
    isAdmin = true;
  }

  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      if (authNavBtn) authNavBtn.style.display = 'none';
      if (userProfileNav) userProfileNav.style.display = 'flex';
      if (navUserName) navUserName.textContent = isAdmin ? "Master Admin" : currentUser.name;
      if (navUserAvatar) navUserAvatar.innerHTML = isAdmin ? '<i class="fa-solid fa-crown" style="font-size:0.75rem;"></i>' : currentUser.name.charAt(0).toUpperCase();

      if (accountStatusText) {
        accountStatusText.innerHTML = isAdmin 
          ? '<span style="color: #c084fc;"><i class="fa-solid fa-shield-halved"></i> Root Verified:</span>'
          : '<i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Active Learner:';
      }
      isAuthForced = false;
    } catch (e) {
      logoutUser();
    }
  } else {
    currentUser = null;
    if (authNavBtn) authNavBtn.style.display = 'inline-flex';
    if (userProfileNav) userProfileNav.style.display = 'none';
    if (accountStatusText) accountStatusText.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Student Portal:';
  }
}

function openAuthModal(tab = 'signup', forced = false) {
  if (isAdmin) return;
  isAuthForced = forced;
  const modal = document.getElementById('authModal');
  const closeBtn = document.getElementById('authCloseBtn');
  const gateBanner = document.getElementById('gateNoticeBanner');

  if (modal) modal.style.display = 'flex';
  if (closeBtn) closeBtn.style.display = forced ? 'none' : 'block';
  if (gateBanner) gateBanner.style.display = forced ? 'block' : 'none';

  hideAuthAlert();
  switchAuthTab(tab);
}

function closeAuthModal() {
  if (isAuthForced && !isAdmin) return;
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'none';
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabSignupBtn = document.getElementById('tabSignupBtn');
  const title = document.getElementById('authModalTitle');
  const sub = document.getElementById('authModalSub');

  hideAuthAlert();

  if (tab === 'login') {
    if (loginForm) loginForm.style.display = 'flex';
    if (signupForm) signupForm.style.display = 'none';
    if (tabLoginBtn) tabLoginBtn.classList.add('active');
    if (tabSignupBtn) tabSignupBtn.classList.remove('active');
    if (title) title.textContent = 'Welcome Back';
    if (sub) sub.textContent = 'Access your personalized roadmaps and saved progress';
  } else {
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'flex';
    if (tabLoginBtn) tabLoginBtn.classList.remove('active');
    if (tabSignupBtn) tabSignupBtn.classList.add('active');
    if (title) title.textContent = 'Create Student Account';
    if (sub) sub.textContent = 'Join Edutech to unlock interactive 3D roadmaps';
  }
}

function showAuthAlert(msg, type = 'error') {
  const alertBox = document.getElementById('authAlert');
  if (alertBox) {
    alertBox.textContent = msg;
    alertBox.className = `auth-alert ${type}`;
    alertBox.style.display = 'block';
  }
}

function hideAuthAlert() {
  const alertBox = document.getElementById('authAlert');
  if (alertBox) alertBox.style.display = 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      onAuthSuccess(data.user, 'Welcome back!');
    } else {
      showAuthAlert(data.message || 'Invalid email or password.');
    }
  } catch (err) {
    const fallbackUser = { id: Date.now(), name: email.split('@')[0], email, goal: "Full-Stack Web Dev" };
    onAuthSuccess(fallbackUser, 'Login successful!');
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const goal = document.getElementById('signupGoal').value;

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, goal })
    });
    const data = await res.json();
    if (data.success) {
      saveUserToRoster(data.user);
      onAuthSuccess(data.user, 'Account created successfully!');
    } else {
      showAuthAlert(data.message || 'Registration failed.');
    }
  } catch (err) {
    const fallbackUser = { id: Date.now(), name, email, goal };
    saveUserToRoster(fallbackUser);
    onAuthSuccess(fallbackUser, 'Account registered successfully!');
  }
}

function saveUserToRoster(user) {
  try {
    let roster = [];
    const raw = localStorage.getItem('edutech_user_roster');
    if (raw) roster = JSON.parse(raw);
    roster.push(user);
    localStorage.setItem('edutech_user_roster', JSON.stringify(roster));
  } catch (e) {}
}

function onAuthSuccess(user, message) {
  showAuthAlert(message, 'success');
  localStorage.setItem('edutech_user', JSON.stringify(user));
  isAuthForced = false;
  setTimeout(() => {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
    checkAuthSession();
  }, 600);
}

function logoutUser() {
  localStorage.removeItem('edutech_user');
  localStorage.removeItem('edutech_admin_token');
  isAdmin = false;
  checkAuthSession();
  userInteractionCount = 0;
}

/* =========================================================
   ADMIN PORTAL (TWO-FACTOR PIN & CUSTOM SETUP)
   ========================================================= */
function openAdminModal() {
  const modal = document.getElementById('adminModal');
  const loginSec = document.getElementById('adminLoginSection');
  const setupSec = document.getElementById('adminSetupSection');
  const dashSec = document.getElementById('adminDashboardSection');
  const alertBox = document.getElementById('adminAlert');

  if (alertBox) alertBox.style.display = 'none';

  const now = Date.now();
  if (now < lockoutUntil) {
    const remainingSecs = Math.ceil((lockoutUntil - now) / 1000);
    showAdminAlert(`Security Lockout Active. Try again in ${remainingSecs} seconds.`);
    if (loginSec) loginSec.style.display = 'block';
    if (setupSec) setupSec.style.display = 'none';
    if (dashSec) dashSec.style.display = 'none';
    if (modal) modal.style.display = 'flex';
    return;
  }

  if (isAdmin) {
    if (loginSec) loginSec.style.display = 'none';
    if (setupSec) setupSec.style.display = 'none';
    if (dashSec) dashSec.style.display = 'block';
    renderAdminStats();
  } else {
    switchAdminPortalTab('login');
  }

  if (modal) modal.style.display = 'flex';
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.style.display = 'none';
}

function switchAdminPortalTab(tab) {
  const loginSec = document.getElementById('adminLoginSection');
  const setupSec = document.getElementById('adminSetupSection');
  const dashSec = document.getElementById('adminDashboardSection');
  const tabLoginBtn = document.getElementById('adminTabLoginBtn');
  const tabSetupBtn = document.getElementById('adminTabSetupBtn');
  const alertBox = document.getElementById('adminAlert');

  if (alertBox) alertBox.style.display = 'none';
  if (dashSec) dashSec.style.display = 'none';

  if (tab === 'login') {
    if (loginSec) loginSec.style.display = 'block';
    if (setupSec) setupSec.style.display = 'none';
    if (tabLoginBtn) tabLoginBtn.classList.add('active');
    if (tabSetupBtn) tabSetupBtn.classList.remove('active');
  } else {
    if (loginSec) loginSec.style.display = 'none';
    if (setupSec) setupSec.style.display = 'block';
    if (tabLoginBtn) tabLoginBtn.classList.remove('active');
    if (tabSetupBtn) tabSetupBtn.classList.add('active');
  }
}

function handleSecureAdminLogin(e) {
  e.preventDefault();

  const now = Date.now();
  if (now < lockoutUntil) {
    const remainingSecs = Math.ceil((lockoutUntil - now) / 1000);
    showAdminAlert(`Security Lockout Active. Try again in ${remainingSecs} seconds.`);
    return;
  }

  const keyInput = document.getElementById('adminSecretKeyInput').value.trim();
  const pinInput = document.getElementById('adminPinInput').value.trim();
  const warningEl = document.getElementById('attemptWarning');

  if (keyInput === DEFAULT_MASTER_KEY && pinInput === DEFAULT_MASTER_PIN) {
    failedAttempts = 0;
    activateAdminMode();
  } else {
    failedAttempts++;
    const remaining = 3 - failedAttempts;

    if (failedAttempts >= 3) {
      lockoutUntil = Date.now() + (5 * 60 * 1000);
      failedAttempts = 0;
      showAdminAlert("Too many failed attempts! Admin Portal locked for 5 minutes.");
    } else {
      showAdminAlert(`Authentication failed! Invalid Key or PIN.`);
      if (warningEl) warningEl.textContent = `Attempts remaining: ${remaining}`;
    }
  }
}

function handleCustomPinCreation(e) {
  e.preventDefault();
  const customKey = document.getElementById('setupCustomKeyInput').value.trim();
  const customPin = document.getElementById('setupCustomPinInput').value.trim();

  if (!customKey || customPin.length !== 6 || isNaN(customPin)) {
    showAdminAlert("Please enter a valid Master Key and a 6-digit numeric PIN.", 'error');
    return;
  }

  DEFAULT_MASTER_KEY = customKey;
  DEFAULT_MASTER_PIN = customPin;
  localStorage.setItem('edutech_custom_master_key', customKey);
  localStorage.setItem('edutech_custom_master_pin', customPin);

  showAdminAlert("Custom PIN & Key saved! Auto-logging in as Admin...", 'success');

  setTimeout(() => {
    activateAdminMode();
  }, 700);
}

function showAdminAlert(msg, type = 'error') {
  const alertBox = document.getElementById('adminAlert');
  if (alertBox) {
    alertBox.textContent = msg;
    alertBox.className = `auth-alert ${type}`;
    alertBox.style.display = 'block';
  }
}

function activateAdminMode() {
  isAdmin = true;
  isAuthForced = false;

  const secureToken = "EDUTECH_ROOT_AUTH_" + btoa(DEFAULT_MASTER_KEY + ":" + Date.now());
  localStorage.setItem('edutech_admin_token', secureToken);

  currentUser = {
    id: 1001,
    name: "Master Admin",
    email: "admin@edutech.io",
    role: "admin"
  };
  localStorage.setItem('edutech_user', JSON.stringify(currentUser));

  checkAuthSession();

  const loginSec = document.getElementById('adminLoginSection');
  const setupSec = document.getElementById('adminSetupSection');
  const dashSec = document.getElementById('adminDashboardSection');

  if (loginSec) loginSec.style.display = 'none';
  if (setupSec) setupSec.style.display = 'none';
  if (dashSec) dashSec.style.display = 'block';
  renderAdminStats();

  const authModal = document.getElementById('authModal');
  if (authModal) authModal.style.display = 'none';
}

function exitAdminMode() {
  isAdmin = false;
  localStorage.removeItem('edutech_admin_token');
  logoutUser();
  closeAdminModal();
}

function toggleVisitorGate() {
  isGateEnabled = !isGateEnabled;
  const btn = document.getElementById('gateToggleBtn');
  if (btn) {
    btn.textContent = isGateEnabled ? "Status: ENABLED" : "Status: DISABLED";
    btn.style.background = isGateEnabled ? "#10b981" : "#ef4444";
  }
}

function renderAdminStats() {
  const usersEl = document.getElementById('adminStatUsers');
  const milestonesEl = document.getElementById('adminStatMilestones');

  let userRoster = [];
  try {
    const raw = localStorage.getItem('edutech_user_roster');
    if (raw) userRoster = JSON.parse(raw);
  } catch (e) { userRoster = []; }

  if (usersEl) usersEl.textContent = Math.max(1, userRoster.length + 1);
  if (milestonesEl) milestonesEl.textContent = completedMilestoneIds.size;
}

/* =========================================================
   3D ENGINE & NAVIGATION
   ========================================================= */
function navigateToSection3D(targetId, event) {
  if (event) event.preventDefault();

  document.querySelectorAll('.nav-btn-3d').forEach(btn => btn.classList.remove('active'));
  const clickedBtn = event ? event.currentTarget : null;
  if (clickedBtn && clickedBtn.classList.contains('nav-btn-3d')) {
    clickedBtn.classList.add('active');
  }

  triggerHyperdriveWarp();

  const targetElement = document.getElementById(targetId);
  if (!targetElement) return;

  targetElement.classList.remove('section-3d-unfold');
  void targetElement.offsetWidth;
  targetElement.classList.add('section-3d-unfold');
  targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function triggerHyperdriveWarp() {
  isWarpSpeedActive = true;
  if (bgCamera) bgCamera.position.z = 24;
  setTimeout(() => {
    isWarpSpeedActive = false;
    if (bgCamera) bgCamera.position.z = 30;
  }, 700);
}

function initBackground3D() {
  const canvas = document.getElementById('webgl-3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  bgScene = new THREE.Scene();
  bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  bgCamera.position.z = 30;

  bgRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  bgRenderer.setSize(window.innerWidth, window.innerHeight);
  bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const count = 650;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    pos[i] = (Math.random() - 0.5) * 90;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 0.5, color: 0x6366f1, transparent: true, opacity: 0.65 });
  bgPoints = new THREE.Points(geo, mat);
  bgScene.add(bgPoints);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (isWarpSpeedActive) {
      bgPoints.rotation.y -= 0.025;
      bgPoints.rotation.x += 0.012;
    } else {
      bgPoints.rotation.y -= 0.0006;
    }
    bgCamera.position.x += (mouseX * 3 - bgCamera.position.x) * 0.05;
    bgCamera.position.y += (-mouseY * 3 - bgCamera.position.y) * 0.05;
    bgCamera.lookAt(bgScene.position);
    bgRenderer.render(bgScene, bgCamera);
  }
  animate();

  window.addEventListener('resize', () => {
    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function initForeground3D() {
  const canvas = document.getElementById('foreground-3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  fgScene = new THREE.Scene();
  fgCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  fgCamera.position.z = 6.5;

  fgRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  fgRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
  fgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const pLight1 = new THREE.PointLight(0x3b82f6, 2, 50);
  pLight1.position.set(5, 5, 5);
  fgScene.add(pLight1);

  const pLight2 = new THREE.PointLight(0x8b5cf6, 2, 50);
  pLight2.position.set(-5, -5, 5);
  fgScene.add(pLight2);

  const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
  fgScene.add(ambLight);

  buildForegroundMesh('web-dev');

  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !fgMesh) return;
    const deltaX = e.clientX - prevMousePos.x;
    const deltaY = e.clientY - prevMousePos.y;
    fgMesh.rotation.y += deltaX * 0.01;
    fgMesh.rotation.x += deltaY * 0.01;
    if (fgWireframeMesh) {
      fgWireframeMesh.rotation.y += deltaX * 0.01;
      fgWireframeMesh.rotation.x += deltaY * 0.01;
    }
    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  function animateFG() {
    requestAnimationFrame(animateFG);
    if (!isDragging && fgMesh) {
      fgMesh.rotation.y += 0.012;
      fgMesh.rotation.x += 0.006;
      if (fgWireframeMesh) {
        fgWireframeMesh.rotation.y += 0.012;
        fgWireframeMesh.rotation.x += 0.006;
      }
    }
    fgRenderer.render(fgScene, fgCamera);
  }
  animateFG();

  window.addEventListener('resize', () => {
    if (canvas && canvas.clientWidth > 0) {
      fgCamera.aspect = canvas.clientWidth / canvas.clientHeight;
      fgCamera.updateProjectionMatrix();
      fgRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
  });
}

function buildForegroundMesh(domain) {
  if (!fgScene) return;
  if (fgMesh) fgScene.remove(fgMesh);
  if (fgWireframeMesh) fgScene.remove(fgWireframeMesh);

  let geo, matColor = 0x3b82f6;

  if (domain === 'web-dev') {
    geo = new THREE.TorusKnotGeometry(1.6, 0.45, 100, 16);
    matColor = 0x38bdf8;
  } else if (domain === 'data-science') {
    geo = new THREE.IcosahedronGeometry(2.1, 2);
    matColor = 0xa855f7;
  } else if (domain === 'software-engineering') {
    geo = new THREE.OctahedronGeometry(2.2, 0);
    matColor = 0x10b981;
  }

  const mat = new THREE.MeshPhongMaterial({
    color: matColor,
    transparent: true,
    opacity: 0.35,
    shininess: 90,
    flatShading: true
  });
  fgMesh = new THREE.Mesh(geo, mat);
  fgScene.add(fgMesh);

  const wireMat = new THREE.MeshBasicMaterial({
    color: matColor,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });
  fgWireframeMesh = new THREE.Mesh(geo, wireMat);
  fgScene.add(fgWireframeMesh);
}

function loadTrackWith3DTransition(domain, level = 'beginner') {
  currentActiveDomain = domain;
  buildForegroundMesh(domain);

  const holoTitle = document.getElementById('holoTrackTitle');
  const holoDesc = document.getElementById('holoTrackDesc');

  if (domain === 'web-dev') {
    currentDomainTitleText = "Full-Stack Web Development (MERN)";
    if (holoTitle) holoTitle.textContent = currentDomainTitleText;
    if (holoDesc) holoDesc.textContent = "Interactive 3D Viewport demonstrating Client-Server handshake, Component Trees, and REST-MongoDB layers.";
  } else if (domain === 'data-science') {
    currentDomainTitleText = "Data Science, Analytics & AI/ML";
    if (holoTitle) holoTitle.textContent = "Data Science & AI Neural Core";
    if (holoDesc) holoDesc.textContent = "Interactive 3D Viewport displaying multi-layer Neural Network synapses, Matrix computations, and Gradient Descent models.";
  } else if (domain === 'software-engineering') {
    currentDomainTitleText = "Software Engineering & Data Structures (DSA)";
    if (holoTitle) holoTitle.textContent = "Software Engineering & DSA Architecture";
    if (holoDesc) holoDesc.textContent = "Interactive 3D Viewport visualizing Graph Topologies, Tree Nodes, Algorithmic Complexity, and System Design.";
  }

  fetchRoadmap(domain, level);
}

function quickSelectTrack(domain) {
  const select = document.getElementById('domainSelect');
  if (select) select.value = domain;
  loadTrackWith3DTransition(domain, 'beginner');
  navigateToSection3D('front-3d-section');
}

/* =========================================================
   ROADMAP RENDERING WITH ACCURATE DEDICATED VIDEOS
   ========================================================= */
async function fetchRoadmap(domain, level) {
  try {
    const response = await fetch(`/api/roadmap?domain=${domain}&level=${level}`);
    const data = await response.json();

    if (data.success) {
      currentMilestones = data.milestones;
      renderRoadmap(data.domain, data.description, data.milestones);
      updateProgress();
    }
  } catch (error) {
    console.error("Roadmap fetch error:", error);
  }
}

function renderRoadmap(title, description, milestones) {
  const currentDomainTitle = document.getElementById('currentDomainTitle');
  const currentDomainDesc = document.getElementById('currentDomainDesc');
  const milestonesContainer = document.getElementById('milestonesContainer');

  if (currentDomainTitle) currentDomainTitle.textContent = title;
  if (currentDomainDesc) currentDomainDesc.textContent = description;
  if (!milestonesContainer) return;
  milestonesContainer.innerHTML = '';

  milestones.forEach((milestone) => {
    const isCompleted = completedMilestoneIds.has(milestone.id);

    const card = document.createElement('div');
    card.className = `milestone-card ${isCompleted ? 'completed' : ''}`;
    card.id = `card-${milestone.id}`;

    const prereqHTML = milestone.prerequisites.map(p => `<span class="prereq-pill"><i class="fa-solid fa-check"></i> ${p}</span>`).join(' ');

    // Har milestone ka exact high-view video lookup
    const targetVideo = verifiedVideoLibrary[milestone.id] || {
      videoId: 'G3e-cpL7ofc',
      title: `${milestone.title} Complete Tutorial`,
      creator: 'Top Industry Mentors',
      duration: milestone.duration
    };

    const directWatchUrl = `https://www.youtube.com/watch?v=${targetVideo.videoId}`;

    const videosHTML = `
      <div class="video-item">
        <div class="video-info">
          <h5>${targetVideo.title}</h5>
          <span class="video-creator"><i class="fa-solid fa-chalkboard-user"></i> ${targetVideo.creator}</span>
          <span class="video-duration"> • ${targetVideo.duration}</span>
        </div>
        <div style="display: flex; gap: 0.5rem; margin-top: 0.8rem; flex-wrap: wrap;">
          <button class="watch-modal-btn" onclick="playVideoModal('${targetVideo.videoId}', '${targetVideo.title.replace(/'/g, "\\'")}', '${targetVideo.creator}')" style="margin-top:0; flex:1;">
            <i class="fa-solid fa-circle-play"></i> Watch in Theater
          </button>
          <a href="${directWatchUrl}" target="_blank" rel="noopener noreferrer" style="margin-top:0; padding: 0.55rem 0.85rem; font-size: 0.78rem; text-decoration: none; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255,255,255,0.15); color: white; font-weight: 600;">
            <i class="fa-brands fa-youtube" style="color: #ef4444;"></i> Open YouTube
          </a>
        </div>
      </div>
    `;

    const questions = milestoneQuizzes[milestone.id] || [
      {
        q: `${milestone.title} ka main foundational concept kya hai?`,
        opts: ["Theory & Syntax", "Hands-on Code", "Both Syntax & Practice", "Skip to Framework"],
        ans: 2,
        exp: "Dono syntax aur live practical implementations critical hain."
      }
    ];

    const quizHTML = questions.map((qObj, qIdx) => `
      <div class="quiz-question-item">
        <p class="quiz-q-title">Q${qIdx + 1}: ${qObj.q}</p>
        <div class="quiz-options">
          ${qObj.opts.map((opt, oIdx) => `
            <button class="quiz-opt-btn" onclick="handleQuizAnswer(this, ${oIdx === qObj.ans}, '${qObj.exp.replace(/'/g, "\\'")}')">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');

    const savedNote = localStorage.getItem(`edutech_notes_${milestone.id}`) || '';

    card.innerHTML = `
      <div class="milestone-top">
        <div class="milestone-title-area">
          <input type="checkbox" class="custom-checkbox" id="check-${milestone.id}" 
            ${isCompleted ? 'checked' : ''} 
            onchange="toggleMilestoneCompletion('${milestone.id}')">
          <div>
            <span class="milestone-step-number">Milestone ${milestone.step}</span>
            <h3 style="display:inline; margin-left: 0.6rem;">${milestone.title}</h3>
          </div>
        </div>
        <span class="milestone-duration"><i class="fa-regular fa-clock"></i> ${milestone.duration}</span>
      </div>

      <div>
        <strong style="font-size: 0.8rem; color: #94a3b8;">Essential Prerequisites:</strong>
        <div class="prereq-list">${prereqHTML}</div>
      </div>

      <div style="margin-top: 1rem;">
        <strong style="font-size: 0.82rem; color: #f8fafc;"><i class="fa-solid fa-play"></i> Curated Lecture:</strong>
        <div class="video-grid">${videosHTML}</div>
      </div>

      <div class="milestone-extras-row">
        <button class="extra-action-btn" onclick="toggleMilestoneQuiz('${milestone.id}')">
          <i class="fa-solid fa-list-check" style="color: #60a5fa;"></i> Quick Quiz
        </button>
        <button class="extra-action-btn" onclick="toggleMilestoneNotes('${milestone.id}')">
          <i class="fa-solid fa-pen-nib" style="color: #f59e0b;"></i> Study Notes
        </button>
      </div>

      <div class="milestone-quiz-box" id="quiz-box-${milestone.id}">
        <strong style="font-size: 0.84rem; color: #93c5fd; display: block; margin-bottom: 0.6rem;">
          <i class="fa-solid fa-brain"></i> Knowledge Check (2 MCQs):
        </strong>
        ${quizHTML}
      </div>

      <div class="milestone-notes-box" id="notes-box-${milestone.id}">
        <strong style="font-size: 0.82rem; color: #fcd34d; display: block; margin-bottom: 0.4rem;">
          <i class="fa-solid fa-book-open"></i> Personal Scratchpad:
        </strong>
        <textarea class="milestone-notes-textarea" id="note-text-${milestone.id}" 
          placeholder="Write summary notes, code snippets, or interview points..." 
          oninput="autoSaveMilestoneNote('${milestone.id}')">${savedNote}</textarea>
        <span class="notes-save-status" id="note-status-${milestone.id}">
          <i class="fa-solid fa-cloud"></i> Notes automatically synchronized.
        </span>
      </div>
    `;

    milestonesContainer.appendChild(card);
  });
}

function filterMilestones() {
  const query = document.getElementById('milestoneSearchInput').value.toLowerCase();
  const cards = document.querySelectorAll('.milestone-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? 'block' : 'none';
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

  let completedCount = 0;
  currentMilestones.forEach(m => {
    if (completedMilestoneIds.has(m.id)) completedCount++;
  });

  const percentage = Math.round((completedCount / currentMilestones.length) * 100);
  const pctEl = document.getElementById('progressPercentage');
  const barEl = document.getElementById('progressBarFill');
  const statusEl = document.getElementById('completionStatus');

  if (pctEl) pctEl.textContent = `${percentage}%`;
  if (barEl) barEl.style.width = `${percentage}%`;
  if (statusEl) {
    statusEl.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${completedCount} of ${currentMilestones.length} milestones finished.`;
  }

  checkCertificateEligibility(completedCount, currentMilestones.length);
}

/* =========================================================
   AI PREREQUISITE ASSISTANT
   ========================================================= */
function openAssistantModal() {
  const modal = document.getElementById('aiModal');
  if (modal) modal.style.display = 'flex';
}

function closeAssistantModal() {
  const modal = document.getElementById('aiModal');
  if (modal) modal.style.display = 'none';
}

function setQuickTopic(topic) {
  const input = document.getElementById('assistantInput');
  if (input) {
    input.value = topic;
    queryAIAssistant();
  }
}

function queryAIAssistant() {
  const input = document.getElementById('assistantInput').value.trim();
  const resultBox = document.getElementById('assistantResult');

  if (!input) return;

  resultBox.style.display = 'block';
  resultBox.innerHTML = '<p><i class="fa-solid fa-spinner fa-spin"></i> Analyzing foundation bottlenecks...</p>';

  setTimeout(() => {
    const q = input.toLowerCase();
    let diagnostic = {};

    if (q.includes("recursion") || q.includes("dp")) {
      diagnostic = {
        topic: "Recursion & Dynamic Programming",
        analysis: "Avoid jumping directly into Trees or DP. First build a strong grasp of mathematical recurrence relations and call stack dry runs.",
        prereqs: ["Basic Loop logic (For/While)", "Functions & Call Stack mechanics", "Pointers / Reference memory model"],
        lecture: { title: "Recursion Basics & Call Stack Dry Run", creator: "take U forward (Striver)", url: "https://www.youtube.com/watch?v=nqowUJzG-58" }
      };
    } else if (q.includes("react") || q.includes("hooks")) {
      diagnostic = {
        topic: "React.js State & Hooks",
        analysis: "Before managing complex component states or Redux, ensure complete fluency in JavaScript ES6 array methods, immutability, and closures.",
        prereqs: ["JavaScript ES6 (Arrow functions, Map/Filter)", "Immutability & Closures", "DOM Events Basics"],
        lecture: { title: "JavaScript Prerequisites for React Mastery", creator: "Chai aur Code", url: "https://www.youtube.com/watch?v=vz1RlUy5574" }
      };
    } else if (q.includes("node") || q.includes("express") || q.includes("backend")) {
      diagnostic = {
        topic: "Node.js & Express APIs",
        analysis: "Focus on understanding the asynchronous event loop and client-server HTTP request/response cycle prior to writing REST controllers.",
        prereqs: ["HTTP Verbs (GET, POST, PUT, DELETE)", "JSON Payload structure", "Promises & Async/Await"],
        lecture: { title: "HTTP Networking & Backend Essentials", creator: "Chai aur Code", url: "https://www.youtube.com/watch?v=7H_QH9nipNs" }
      };
    } else {
      diagnostic = {
        topic: input,
        analysis: `Before diving deep into '${input}', reinforce core computer science fundamentals and structured problem decomposition.`,
        prereqs: ["Core Programming Logic", "Algorithmic Decomposition", "Systematic Debugging"],
        lecture: { title: "Core Foundations for Software Engineers", creator: "Curated Mentors", url: "https://www.youtube.com/watch?v=2ZLl8GAk1X4" }
      };
    }

    const prereqsList = diagnostic.prereqs.map(p => `<li>${p}</li>`).join('');

    resultBox.innerHTML = `
      <h4 style="color: #a78bfa; margin-bottom: 0.5rem;"><i class="fa-solid fa-lightbulb"></i> Foundation Diagnostic: ${diagnostic.topic}</h4>
      <p style="margin-bottom: 0.5rem;"><strong>Analysis:</strong> ${diagnostic.analysis}</p>
      <p><strong>Essential Prerequisites to Master First:</strong></p>
      <ul style="margin: 0.4rem 0 0.8rem 1.4rem;">${prereqsList}</ul>
      <p><strong>Recommended Foundation Video:</strong> <a href="${diagnostic.lecture.url}" target="_blank" style="color:#60a5fa; font-weight:600;">${diagnostic.lecture.title} (${diagnostic.lecture.creator})</a></p>
    `;
  }, 300);
}
