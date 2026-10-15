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

// Milestone Quizzes Bank
const milestoneQuizzes = {
  'm1': [
    {
      q: "HTML me semantic container element kaunsa hai?",
      opts: ["<div>", "<section>", "<span>", "<font>"],
      ans: 1,
      exp: "'<section>' ek semantic HTML5 tag hai jo meaning define karta hai."
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
      exp: "'async/await' promises ko readable synchronous style me handle karta hai."
    }
  ],
  'm3': [
    {
      q: "React component me state manage karne ke liye kaunsa basic hook use hota hai?",
      opts: ["useEffect", "useMemo", "useState", "useRef"],
      ans: 2,
      exp: "'useState' hook local component state store aur update karta hai."
    },
    {
      q: "Side-effects jaise API calls ya DOM updates ke liye kaunsa hook use hota hai?",
      opts: ["useEffect", "useReducer", "useCallback", "useState"],
      ans: 0,
      exp: "'useEffect' component ke lifecycle side-effects execute karta hai."
    }
  ],
  'm4': [
    {
      q: "Node.js me backend REST APIs create karne ke liye sabse popular web framework kaunsa hai?",
      opts: ["Express.js", "Django", "Spring Boot", "Laravel"],
      ans: 0,
      exp: "Express.js lightweight aur fast framework hai jo REST routes handle karta hai."
    },
    {
      q: "HTTP Request ke body data ko parse karne ke liye kaunsa middleware use hota hai?",
      opts: ["express.static()", "express.json()", "cors()", "morgan()"],
      ans: 1,
      exp: "'express.json()' incoming request ke JSON payload ko parse karta hai."
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
      q: "Mongoose me database schema define karne ke liye kya use hota hai?",
      opts: ["new mongoose.Schema()", "mongoose.table()", "mongoose.sql()", "mongoose.create()"],
      ans: 0,
      exp: "'mongoose.Schema' collection structure aur data types define karta hai."
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
   FEATURE 1: IN-WEBSITE VIDEO PLAYER MODAL (NO REDIRECT)
   ========================================================= */
function playVideoModal(videoUrl, title, creator) {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoPlayerIframe');
  const titleEl = document.getElementById('videoModalTitle');
  const creatorEl = document.getElementById('videoModalCreator');

  if (titleEl) titleEl.textContent = title;
  if (creatorEl) creatorEl.innerHTML = `<i class="fa-solid fa-chalkboard-user"></i> ${creator}`;

  // Safe YouTube embed logic
  let embedUrl = "https://www.youtube.com/embed/mJgBOIoGihA?autoplay=1";
  if (videoUrl.includes("watch?v=")) {
    const vidId = videoUrl.split("watch?v=")[1].split("&")[0];
    embedUrl = `https://www.youtube.com/embed/${vidId}?autoplay=1`;
  } else if (videoUrl.includes("youtu.be/")) {
    const vidId = videoUrl.split("youtu.be/")[1].split("?")[0];
    embedUrl = `https://www.youtube.com/embed/${vidId}?autoplay=1`;
  }

  if (iframe) iframe.src = embedUrl;
  if (modal) modal.style.display = 'flex';
}

function closeVideoModal() {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoPlayerIframe');
  if (iframe) iframe.src = ""; // Stop audio/video instantly
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

// Built-in Pure HTML5 Canvas Confetti Engine (No External CDN Dependency)
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
      speed: Math.random() * 3 + 2,
      oscillationSpeed: Math.random() * 0.05 + 0.02
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
   FEATURE 3: BUILT-IN POMODORO STUDY TIMER (25m / 5m)
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
   AUTHENTICATION & VISITOR GATE (Bypassed for Admin)
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

