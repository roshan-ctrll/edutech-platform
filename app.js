let currentMilestones = [];
let completedMilestoneIds = new Set();
let currentUser = null;

// Three.js instances
let bgScene, bgCamera, bgRenderer, bgPoints;
let fgScene, fgCamera, fgRenderer, fgMesh, fgWireframeMesh;

// 3D Warp Speed flag
let isWarpSpeedActive = false;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Background & Foreground 3D
  initBackground3D();
  initForeground3D();

  // 2. Check Auth Session
  checkAuthSession();

  // 3. Load saved state
  const savedState = localStorage.getItem('edutech_completed_milestones');
  if (savedState) {
    try {
      completedMilestoneIds = new Set(JSON.parse(savedState));
    } catch (e) {
      completedMilestoneIds = new Set();
    }
  }

  // 4. Form listener
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
});

/* =========================================================
   1. 3D HYPERDRIVE WARP NAVIGATION (On Navbar Click)
   ========================================================= */
function navigateToSection3D(targetId, event) {
  if (event) event.preventDefault();

  // A. Update active nav button pill
  document.querySelectorAll('.nav-btn-3d').forEach(btn => btn.classList.remove('active'));
  const clickedBtn = event ? event.currentTarget : null;
  if (clickedBtn && clickedBtn.classList.contains('nav-btn-3d')) {
    clickedBtn.classList.add('active');
  }

  // B. Trigger Three.js Warp Acceleration
  triggerHyperdriveWarp();

  // C. Find Target Section & Apply 3D Perspective Unfold
  const targetElement = document.getElementById(targetId);
  if (!targetElement) return;

  // Restart 3D unfold animation
  targetElement.classList.remove('section-3d-unfold');
  void targetElement.offsetWidth; // force DOM reflow
  targetElement.classList.add('section-3d-unfold');

  // D. Smooth Scroll into view
  targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // E. Special Stagger Flip for Roadmap Milestones
  if (targetId === 'roadmap-section') {
    const cards = targetElement.querySelectorAll('.milestone-card');
    cards.forEach((c, idx) => {
      c.style.animation = 'none';
      void c.offsetWidth;
      c.style.animation = `card3DUnfold 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.12}s both`;
    });
  }

  // F. Highlight 5 Core Logos if Architecture clicked
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

// Hyperdrive Warp effect in Three.js background
function triggerHyperdriveWarp() {
  isWarpSpeedActive = true;
  if (bgCamera) {
    bgCamera.position.z = 24; // Pull camera in for speed feel
  }
  setTimeout(() => {
    isWarpSpeedActive = false;
    if (bgCamera) bgCamera.position.z = 30; // Restore
  }, 700);
}

/* =========================================================
   2. BACKGROUND 3D CANVAS (Three.js Particles)
   ========================================================= */
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

    // Hyperdrive acceleration on button click
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

/* =========================================================
   3. FOREGROUND 3D INTERACTIVE HOLOGRAM
   ========================================================= */
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

  const stage = document.getElementById('front3dStage');
  if (stage) {
    stage.classList.remove('front-3d-pulse');
    void stage.offsetWidth;
    stage.classList.add('front-3d-pulse');
  }

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
   4. USER AUTHENTICATION & SESSIONS
   ========================================================= */
function checkAuthSession() {
  const storedUser = localStorage.getItem('edutech_user');
  const authNavBtn = document.getElementById('authNavBtn');
  const userProfileNav = document.getElementById('userProfileNav');
  const navUserName = document.getElementById('navUserName');
  const navUserAvatar = document.getElementById('navUserAvatar');

  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      if (authNavBtn) authNavBtn.style.display = 'none';
      if (userProfileNav) userProfileNav.style.display = 'flex';
      if (navUserName) navUserName.textContent = currentUser.name;
      if (navUserAvatar) navUserAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    } catch (e) {
      logoutUser();
    }
  } else {
    currentUser = null;
    if (authNavBtn) authNavBtn.style.display = 'flex';
    if (userProfileNav) userProfileNav.style.display = 'none';
  }
}

function openAuthModal(tab = 'login') {
  document.getElementById('authModal').style.display = 'flex';
  hideAuthAlert();
  switchAuthTab(tab);
}

function closeAuthModal() {
  document.getElementById('authModal').style.display = 'none';
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabSignupBtn = document.getElementById('tabSignupBtn');
  const title = document.getElementById('authModalTitle');

  hideAuthAlert();

  if (tab === 'login') {
    loginForm.style.display = 'flex';
    signupForm.style.display = 'none';
    tabLoginBtn.classList.add('active');
    tabSignupBtn.classList.remove('active');
    title.textContent = 'Sign In to Edutech';
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'flex';
    tabLoginBtn.classList.remove('active');
    tabSignupBtn.classList.add('active');
    title.textContent = 'Create Student Account';
  }
}

function showAuthAlert(msg, type = 'error') {
  const alertBox = document.getElementById('authAlert');
  alertBox.textContent = msg;
  alertBox.className = `auth-alert ${type}`;
  alertBox.style.display = 'block';
}

function hideAuthAlert() {
  const alertBox = document.getElementById('authAlert');
  alertBox.style.display = 'none';
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
      showAuthAlert('Welcome back! Logging in...', 'success');
      localStorage.setItem('edutech_user', JSON.stringify(data.user));
      setTimeout(() => {
        closeAuthModal();
        checkAuthSession();
      }, 700);
    } else {
      showAuthAlert(data.message || 'Login failed.');
    }
  } catch (err) {
    showAuthAlert('Server connect nahi ho raha hai.');
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
      showAuthAlert('Account created successfully! Logging in...', 'success');
      localStorage.setItem('edutech_user', JSON.stringify(data.user));
      setTimeout(() => {
        closeAuthModal();
        checkAuthSession();
      }, 700);
    } else {
      showAuthAlert(data.message || 'Registration failed.');
    }
  } catch (err) {
    showAuthAlert('Server connection error.');
  }
}

function logoutUser() {
  localStorage.removeItem('edutech_user');
  checkAuthSession();
}

/* =========================================================
   5. ROADMAP API & PROGRESS
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

  milestones.forEach((milestone, idx) => {
    const isCompleted = completedMilestoneIds.has(milestone.id);

    const card = document.createElement('div');
    card.className = `milestone-card ${isCompleted ? 'completed' : ''}`;
    card.id = `card-${milestone.id}`;
    card.style.animationDelay = `${idx * 0.1}s`;

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
        <strong style="font-size: 0.8rem; color: #94a3b8;">Prerequisites required:</strong>
        <div class="prereq-list">${prereqHTML}</div>
      </div>

      <div style="margin-top: 1rem;">
        <strong style="font-size: 0.82rem; color: #f8fafc;"><i class="fa-solid fa-play"></i> Curated Lectures (Physics Wallah & Mentors):</strong>
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
  if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${completedCount} of ${currentMilestones.length} milestones finished.`;
}

/* =========================================================
   6. AI ASSISTANT MODAL
   ========================================================= */
function openAssistantModal() {
  document.getElementById('aiModal').style.display = 'flex';
}

function closeAssistantModal() {
  document.getElementById('aiModal').style.display = 'none';
}

function setQuickTopic(topic) {
  document.getElementById('assistantInput').value = topic;
  queryAIAssistant();
}

async function queryAIAssistant() {
  const input = document.getElementById('assistantInput').value.trim();
  const resultBox = document.getElementById('assistantResult');

  if (!input) return;

  resultBox.style.display = 'block';
  resultBox.innerHTML = '<p><i class="fa-solid fa-spinner fa-spin"></i> Analyzing foundation bottlenecks...</p>';

  try {
    const res = await fetch('/api/prerequisite-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: input })
    });
    const data = await res.json();

    if (data.success && data.guidance) {
      const g = data.guidance;
      const prereqsList = g.prerequisites.map(p => `<li>${p}</li>`).join('');
      const videoLinks = g.foundationVideos.map(v => `<a href="${v.url}" target="_blank" style="color:#60a5fa; font-weight:600;">${v.title} (${v.creator})</a>`).join(', ');

      resultBox.innerHTML = `
        <h4 style="color: #a78bfa; margin-bottom: 0.5rem;"><i class="fa-solid fa-lightbulb"></i> Foundation Diagnostic: ${g.detectedTopic}</h4>
        <p style="margin-bottom: 0.5rem;"><strong>Analysis:</strong> ${g.recommendedAction}</p>
        <p><strong>Core Prerequisites to master first:</strong></p>
        <ul style="margin: 0.4rem 0 0.8rem 1.4rem;">${prereqsList}</ul>
        <p><strong>Recommended Foundation Lecture:</strong> ${videoLinks}</p>
      `;
    }
  } catch (err) {
    resultBox.innerHTML = '<p style="color: #f87171;">Diagnostic fetch failed.</p>';
  }
}