let currentMilestones = [];
let completedMilestoneIds = new Set();
let currentUser = null;

// ==========================================
// 2-FACTOR MASTER SECURITY CONFIGURATION
// ==========================================
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

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize credentials & active user session
  initAdminCredentials();
  checkAuthSession();

  // 2. Initialize 3D Engine (Background + Foreground)
  initBackground3D();
  initForeground3D();

  // 3. Load saved milestone checklist state
  const savedState = localStorage.getItem('edutech_completed_milestones');
  if (savedState) {
    try {
      completedMilestoneIds = new Set(JSON.parse(savedState));
    } catch (e) {
      completedMilestoneIds = new Set();
    }
  }

  // 4. Form listener for career track changes
  const roadmapForm = document.getElementById('roadmapForm');
  if (roadmapForm) {
    roadmapForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const domain = document.getElementById('domainSelect').value;
      const level = document.getElementById('levelSelect').value;
      loadTrackWith3DTransition(domain, level);
    });
  }

  // 5. Default initial load
  loadTrackWith3DTransition('web-dev', 'beginner');

  // 6. Set up 2-Click Mandatory Visitor Gate
  setupTwoClickGate();
});

/* =========================================================
   CREDENTIAL INITIALIZATION
   ========================================================= */
function initAdminCredentials() {
  const customKey = localStorage.getItem('edutech_custom_master_key');
  const customPin = localStorage.getItem('edutech_custom_master_pin');
  if (customKey) DEFAULT_MASTER_KEY = customKey;
  if (customPin) DEFAULT_MASTER_PIN = customPin;
}

/* =========================================================
   2-CLICK MANDATORY VISITOR GATE
   ========================================================= */
function setupTwoClickGate() {
  document.addEventListener('click', (e) => {
    // If admin is active OR user is logged in OR gate disabled: DO NOT INTERRUPT
    if (isAdmin || currentUser || !isGateEnabled) return;

    // Do not count clicks inside auth/admin modals or navbar
    if (e.target.closest('#authModal') || e.target.closest('#adminModal') || e.target.closest('.sub-account-bar')) return;

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

/* =========================================================
   USER AUTHENTICATION (LOGIN & SIGNUP)
   ========================================================= */
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
  if (isAdmin) return; // Do not disturb admin

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

  // Check lockout
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
  const userListEl = document.getElementById('adminUserList');

  let userRoster = [];
  try {
    const raw = localStorage.getItem('edutech_user_roster');
    if (raw) userRoster = JSON.parse(raw);
  } catch (e) { userRoster = []; }

  if (usersEl) usersEl.textContent = Math.max(1, userRoster.length + 1);
  if (milestonesEl) milestonesEl.textContent = completedMilestoneIds.size;

  if (userListEl) {
    if (userRoster.length === 0) {
      userListEl.innerHTML = `
        <div style="font-size: 0.78rem; color: #94a3b8; padding: 0.2rem;">
          <i class="fa-solid fa-crown" style="color: #c084fc;"></i> <strong>Master Admin</strong> (admin@edutech.io) — Active Session
        </div>
      `;
    } else {
      userListEl.innerHTML = userRoster.map(u => `
        <div style="font-size: 0.78rem; color: #cbd5e1; padding: 0.3rem; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <i class="fa-solid fa-user" style="color:#60a5fa;"></i> <strong>${u.name}</strong> (${u.email}) - Track: ${u.goal}
        </div>
      `).join('');
    }
  }
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

  if (targetId === 'features') {
    const badges = targetElement.querySelectorAll('.custom-logo-badge');
    badges.forEach((b, idx) => {
      setTimeout(() => {
        b.style.transform = 'translateY(-8px) scale(1.2)';
        setTimeout(() => { b.style.transform = ''; }, 350);
      }, idx * 100);
    });
  }
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
  buildForegroundMesh(domain);

  const holoTitle = document.getElementById('holoTrackTitle');
  const holoDesc = document.getElementById('holoTrackDesc');

  if (domain === 'web-dev') {
    if (holoTitle) holoTitle.textContent = "Full-Stack Web Development (MERN)";
    if (holoDesc) holoDesc.textContent = "Interactive 3D Viewport demonstrating Client-Server handshake, Component Trees, and REST-MongoDB layers.";
  } else if (domain === 'data-science') {
    if (holoTitle) holoTitle.textContent = "Data Science & AI Neural Core";
    if (holoDesc) holoDesc.textContent = "Interactive 3D Viewport displaying multi-layer Neural Network synapses, Matrix computations, and Gradient Descent models.";
  } else if (domain === 'software-engineering') {
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
   ROADMAP RENDERING & CHECKLIST
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

    const videosHTML = milestone.videos.map(v => `
      <div class="video-item">
        <div class="video-info">
          <h5>${v.title}</h5>
          <span class="video-creator"><i class="fa-solid fa-chalkboard-user"></i> ${v.creator}</span>
          <span class="video-duration"> • ${v.duration}</span>
        </div>
        <a href="${v.url}" target="_blank" class="watch-btn">
          <i class="fa-brands fa-youtube"></i> Watch Lecture
        </a>
      </div>
    `).join('');

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
        <strong style="font-size: 0.82rem; color: #f8fafc;"><i class="fa-solid fa-play"></i> Curated Lectures (Physics Wallah & Top Mentors):</strong>
        <div class="video-grid">${videosHTML}</div>
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
        lecture: { title: "Recursion Basics & Call Stack Dry Run", creator: "Striver / PW Skills", url: "https://www.youtube.com" }
      };
    } else if (q.includes("react") || q.includes("hooks")) {
      diagnostic = {
        topic: "React.js State & Hooks",
        analysis: "Before managing complex component states or Redux, ensure complete fluency in JavaScript ES6 array methods, immutability, and closures.",
        prereqs: ["JavaScript ES6 (Arrow functions, Map/Filter)", "Immutability & Closures", "DOM Events Basics"],
        lecture: { title: "JavaScript Prerequisites for React Mastery", creator: "PW Skills / FreeCodeCamp", url: "https://www.youtube.com" }
      };
    } else if (q.includes("node") || q.includes("express") || q.includes("backend")) {
      diagnostic = {
        topic: "Node.js & Express APIs",
        analysis: "Focus on understanding the asynchronous event loop and client-server HTTP request/response cycle prior to writing REST controllers.",
        prereqs: ["HTTP Verbs (GET, POST, PUT, DELETE)", "JSON Payload structure", "Promises & Async/Await"],
        lecture: { title: "HTTP Networking & Backend Essentials", creator: "PW Skills Tech", url: "https://www.youtube.com" }
      };
    } else {
      diagnostic = {
        topic: input,
        analysis: `Before diving deep into '${input}', reinforce core computer science fundamentals and structured problem decomposition.`,
        prereqs: ["Core Programming Logic", "Algorithmic Decomposition", "Systematic Debugging"],
        lecture: { title: "Core Foundations for Software Engineers", creator: "Curated Mentors", url: "https://www.youtube.com" }
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
