/**
 * Nishant Singh - Portfolio Interactive Application Logic
 * Modern, Rich, 3D & Responsive Interactions
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==================== WEB AUDIO SYNTHESIZER ====================
  // Generates subtle sci-fi UI clicks and chimes without external mp3 dependencies
  let audioEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playUiSound(type = 'click') {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'pop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'chime') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // Audio playback fails silently if restricted
    }
  }

  // Clear any light theme setting to ensure permanent cyber-luxe dark mode
  document.documentElement.removeAttribute('data-theme');
  try { localStorage.removeItem('portfolio-theme'); } catch (e) {}

  // Audio Toggle Button
  const audioToggleBtn = document.getElementById('audioToggle');
  const audioIcon = document.getElementById('audioIcon');
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      if (audioEnabled) {
        audioIcon.className = 'fa-solid fa-volume-high';
        audioToggleBtn.style.color = 'var(--accent-cyan)';
        playUiSound('chime');
        showToast('UI Sound Effects: Enabled');
      } else {
        audioIcon.className = 'fa-solid fa-volume-xmark';
        audioToggleBtn.style.color = 'var(--text-muted)';
        showToast('UI Sound Effects: Muted');
      }
    });
  }

  // Attach click sound to buttons
  document.querySelectorAll('button, .btn, .nav-link, .skill-tab, .social-link').forEach(el => {
    el.addEventListener('mouseenter', () => playUiSound('click'));
  });

  // ==================== GLOWING CURSOR FOLLOWER ====================
  const cursorGlow = document.getElementById('cursorGlow');
  const cursorDot = document.getElementById('cursorDot');

  if (cursorGlow && cursorDot && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    function renderCursor() {
      glowX += (mouseX - glowX) * 0.15;
      glowY += (mouseY - glowY) * 0.15;
      cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px)`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();
  }

  // ==================== NAVBAR SCROLL & ACTIVE SPY ====================
  const navbar = document.getElementById('navbar');
  const backToTopBtn = document.getElementById('backToTop');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    // Header Blur Enhancement
    if (scrollPos > 50) {
      navbar.classList.add('scrolled');
      if (backToTopBtn) backToTopBtn.classList.add('visible');
    } else {
      navbar.classList.remove('scrolled');
      if (backToTopBtn) backToTopBtn.classList.remove('visible');
    }

    // Scroll Spy for active nav link
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      playUiSound('pop');
    });
  }

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      playUiSound('pop');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // ==================== HERO ROLE TYPING EFFECT ====================
  const typedRoleEl = document.getElementById('typedRole');
  if (typedRoleEl) {
    const roles = [
      'Full Stack MERN Developer',
      'AI Integration Enthusiast',
      'AZ-900 Azure Certified Engineer',
      'Real-Time WebSocket Specialist',
      'Scalable Systems Architect'
    ];

    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typingDelay = 100;

    function typeRoles() {
      const currentRole = roles[roleIdx];

      if (isDeleting) {
        typedRoleEl.textContent = currentRole.substring(0, charIdx - 1);
        charIdx--;
        typingDelay = 40;
      } else {
        typedRoleEl.textContent = currentRole.substring(0, charIdx + 1);
        charIdx++;
        typingDelay = 90;
      }

      if (!isDeleting && charIdx === currentRole.length) {
        typingDelay = 2200; // Pause at end of word
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        typingDelay = 400;
      }

      setTimeout(typeRoles, typingDelay);
    }

    setTimeout(typeRoles, 800);
  }

  // ==================== 3D CARD TILT EFFECT ====================
  // Pure JS lightweight tilt physics with perspective
  const tiltCards = document.querySelectorAll('[data-tilt]');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.transition = 'transform 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease-out';
    });
  });

  // ==================== NUMBER COUNTER ANIMATION ====================
  const counters = document.querySelectorAll('.counter');
  let countersAnimated = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        counters.forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const isDecimal = target % 1 !== 0;
          let current = 0;
          const duration = 1800;
          const stepTime = 25;
          const steps = duration / stepTime;
          const increment = target / steps;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = isDecimal ? target.toFixed(1) : target;
              clearInterval(timer);
            } else {
              counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('stats');
  if (statsSection) counterObserver.observe(statsSection);

  // ==================== SKILLS MATRIX FILTER ====================
  const skillTabs = document.querySelectorAll('.skill-tab');
  const skillCards = document.querySelectorAll('.skill-card');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playUiSound('pop');
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px) scale(0.97)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ==================== PROJECT DATA & MODAL ====================
  const projectData = {
    tourism: {
      title: "Jharkhand Tourism Platform",
      tag: "Full Stack MERN & AI Travel Portal",
      image: "assets/images/tourism.jpg",
      browserUrl: "https://jharkhandtourismm.netlify.app/",
      github: "https://github.com/nishantsingh95/Jharkhand-Tourism.git",
      demo: "https://jharkhandtourismm.netlify.app/",
      overview: "Built an AI-enabled state tourism and cultural commerce solution for Jharkhand. It empowers travelers to explore verified natural destinations, book complete itineraries, purchase authentic tribal handicrafts directly from regional artisans, and converse with an intelligent AI travel concierge.",
      pills: ["React.js", "Node.js", "Express.js", "MongoDB", "Tailwind CSS", "AI Integration", "RESTful APIs", "JWT Security"],
      arch: `[Client: React.js + Tailwind CSS + Interactive Map View]
         │
         ▼  (HTTPS / REST APIs)
[Express.js / Node.js API Gateway]
         ├─► [AI Travel Concierge Service (Prompt Processing / Recommendations)]
         ├─► [Tour Booking & Handicraft Marketplace Service]
         ├─► [Role-Based Dynamic Admin Analytics Dashboard]
         │
         ▼
[MongoDB Atlas Database: Destinations, Crafts, Orders, Users]`,
      bullets: [
        "Architected an AI-powered conversational travel concierge offering personalized trip planning, budget estimation, and destination advice.",
        "Engineered an indigenous artisan marketplace, enabling native handicraft creators to showcase and monetize tribal art, bamboo craft, and brassware.",
        "Built a responsive administrator dashboard to manage tourism spots, booking verification, inventory management, and platform analytics.",
        "Implemented secure JWT authentication and scalable RESTful API services with comprehensive validation."
      ]
    },
    gymee: {
      title: "Gymee: Gym Management System",
      tag: "MERN SaaS with Google Gemini AI",
      image: "assets/images/gymee.jpg",
      browserUrl: "https://gymmeee.netlify.app/",
      github: "https://github.com/nishantsingh95/Gymme.git",
      demo: "https://gymmeee.netlify.app/",
      overview: "An enterprise-ready Gym Management platform built with the MERN stack. Features comprehensive membership billing, workout scheduling, automated communications, and an integrated Google Gemini AI virtual fitness assistant that responds to customer queries in real-time.",
      pills: ["React.js", "Node.js", "Express.js", "MongoDB", "Google Gemini AI", "JWT Authentication", "Framer Motion", "Tailwind CSS", "Nodemailer"],
      arch: `[Client: React.js + Framer Motion + Tailwind UI]
         │
         ▼  (RESTful Endpoints / JSON Payloads)
[Node.js / Express Backend Engine]
         ├─► [Google Gemini AI API (Client Support & Workout Planning)]
         ├─► [Automated Cron Email Scheduler (Renewals & Reminders)]
         ├─► [JWT Token Auth & Role-Based Access Control]
         │
         ▼
[MongoDB Database: Members, Memberships, Attendance, Classes]`,
      bullets: [
        "Integrated Google Gemini AI model to provide instantaneous answers to membership policies, customized workout regimens, and fitness guidance.",
        "Built automated background email notification cron services for membership expiry notices, attendance alerts, and payment receipts.",
        "Designed high-converting, accessible user interfaces using Framer Motion micro-animations and Tailwind CSS.",
        "Implemented granular RBAC for Gym Owners, Fitness Trainers, and Members."
      ]
    },
    foodie: {
      title: "Foodie: MERN Food Delivery System",
      tag: "Real-Time Logistics & Multi-Dashboard Platform",
      image: "assets/images/foodie.jpg",
      browserUrl: "https://fodieee.netlify.app/",
      github: "https://github.com/nishantsingh95/Foodie.git",
      demo: "https://fodieee.netlify.app/",
      overview: "A high-performance full-stack food ordering and delivery ecosystem powered by Socket.IO. Features real-time courier GPS coordinates, dynamic status updates, and synchronized role-based dashboards for Customers, Delivery Couriers, and Restaurant Kitchens.",
      pills: ["React.js", "Node.js", "Express.js", "MongoDB", "Socket.IO", "Tailwind CSS", "REST APIs", "JWT Auth", "Leaflet/Mapbox"],
      arch: `[Client Web Apps: User App | Courier App | Kitchen Dashboard]
         │
         ├─► [WebSocket / Socket.IO Channel: Live GPS Coordinates & Order Events]
         ▼
[Express.js / Node.js High-Throughput Server]
         ├─► [Order State Machine: Placed ➔ Accepted ➔ In Kitchen ➔ Dispatched ➔ Delivered]
         ├─► [Location Broadcast Dispatcher]
         │
         ▼
[MongoDB Database: Orders, Menus, Geo-Coordinates, Users]`,
      bullets: [
        "Constructed low-latency bidirectional Socket.IO channels for live order status updates and courier GPS map route broadcasting.",
        "Architected triple role-based dashboards: Customer storefront & order tracker, Courier navigation dispatch queue, and Restaurant order preparation queue.",
        "Engineered transactional MongoDB backend handling concurrent order statuses with full data consistency.",
        "Secured customer accounts and administrative actions using encrypted JWT tokens and authorization middleware."
      ]
    }
  };

  const projectModal = document.getElementById('projectModal');
  const closeProjectModal = document.getElementById('closeProjectModal');
  const modalProjectTag = document.getElementById('modalProjectTag');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const modalProjectImage = document.getElementById('modalProjectImage');
  const modalBrowserUrl = document.getElementById('modalBrowserUrl');
  const modalProjectOverviewText = document.getElementById('modalProjectOverviewText');
  const modalProjectPills = document.getElementById('modalProjectPills');
  const modalProjectArch = document.getElementById('modalProjectArch');
  const modalProjectBullets = document.getElementById('modalProjectBullets');
  const modalRepoBtn = document.getElementById('modalRepoBtn');
  const modalLiveDemoBtn = document.getElementById('modalLiveDemoBtn');

  document.querySelectorAll('.view-project-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pKey = btn.getAttribute('data-project');
      const data = projectData[pKey];
      if (!data) return;

      modalProjectTag.textContent = data.tag;
      modalProjectTitle.textContent = data.title;
      modalProjectImage.src = data.image;
      modalBrowserUrl.innerHTML = `<i class="fa-solid fa-lock"></i> ${data.browserUrl}`;
      modalProjectOverviewText.textContent = data.overview;

      modalProjectPills.innerHTML = data.pills.map(p => `<span class="tech-pill">${p}</span>`).join('');
      modalProjectArch.textContent = data.arch;
      modalProjectBullets.innerHTML = data.bullets.map(b => `<li>${b}</li>`).join('');

      modalRepoBtn.href = data.github;
      modalLiveDemoBtn.href = data.demo;

      // Reset to first tab
      document.querySelectorAll('.modal-tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      document.querySelector('.modal-tab-btn[data-tab="overview"]').classList.add('active');
      document.getElementById('pane-overview').classList.add('active');

      projectModal.classList.add('active');
      playUiSound('chime');
    });
  });

  if (closeProjectModal) {
    closeProjectModal.addEventListener('click', () => {
      projectModal.classList.remove('active');
      playUiSound('click');
    });
  }

  // Modal Tabs Navigation
  document.querySelectorAll('.modal-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      playUiSound('pop');
      document.querySelectorAll('.modal-tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const tabTarget = tab.getAttribute('data-tab');
      const pane = document.getElementById(`pane-${tabTarget}`);
      if (pane) pane.classList.add('active');
    });
  });

  // ==================== CERTIFICATES MODAL ====================
  const certData = {
    az900: {
      org: "Microsoft Certified",
      name: "Microsoft Certified: Azure Fundamentals (AZ-900)",
      year: "Sep 27, 2023",
      domain: "Cloud Architecture & Azure Services",
      credentialId: "EAr2-uTbx",
      verifyUrl: "https://verify.certiport.com",
      image: "assets/images/certificates/cert-azure.png",
      signatory: "Satya Nadella (CEO, Microsoft)",
      desc: "Demonstrates verified foundational knowledge of cloud concepts, Azure architectural services, security, privacy, compliance, and cloud lifecycle cost management."
    },
    msai: {
      org: "Microsoft Skills Program",
      name: "Microsoft AI Skills Challenge - Certificate of Completion",
      year: "January 2024",
      domain: "Artificial Intelligence & Azure OpenAI",
      credentialId: "#MicrosoftLearn",
      verifyUrl: "https://learn.microsoft.com",
      image: "assets/images/certificates/cert-msai.png",
      signatory: "Puneet Chandok (President, Microsoft India & South Asia)",
      desc: "Validation of applied machine learning fundamentals, prompt engineering architectures, Azure OpenAI services integration, and responsible AI implementation best practices."
    },
    compiler: {
      org: "NPTEL / IIT Kharagpur",
      name: "NPTEL Online Certification: Compiler Design",
      year: "Jan-Apr 2025",
      domain: "Computer Science & Engineering",
      credentialId: "NPTEL25CS13S1146400277",
      verifyUrl: "https://nptel.ac.in/noc",
      image: "assets/images/certificates/cert-compiler.png",
      score: "Elite (Consolidated Score: 60%)",
      signatory: "Prof. Haimanti Banerji (Coordinator, NPTEL IIT Kharagpur)",
      desc: "Rigorous 12-week computer science engineering certification covering lexical analysis, top-down and bottom-up LR/LL parsing, syntax-directed translation, symbol tables, intermediate code representation, and runtime storage management."
    },
    internpe: {
      org: "InternPe (ISO 9001:2015 & MSME Accredited)",
      name: "Web Development Internship Completion Certificate",
      year: "02-Sep-2024 to 29-Sep-2024",
      domain: "Full-Stack Web Engineering",
      credentialId: "CID: IPI#41873",
      verifyUrl: "https://www.internpe.in",
      image: "assets/images/certificates/cert-internpe.png",
      signatory: "Lateef B.T. (Co-Founder, InternPe)",
      desc: "Awarded to Nishant Singh for successfully completing the Web Development Internship. Commended for building responsive UI components in React.js, optimizing API workflows, reducing page load times by 35%, and demonstrating professional technical excellence."
    }
  };

  const certModal = document.getElementById('certModal');
  const closeCertModal = document.getElementById('closeCertModal');
  const certModalOrg = document.getElementById('certModalOrg');
  const certModalName = document.getElementById('certModalName');
  const certModalYear = document.getElementById('certModalYear');
  const certModalDomain = document.getElementById('certModalDomain');
  const certModalCredId = document.getElementById('certModalCredId');
  const certModalDesc = document.getElementById('certModalDesc');
  const certModalImg = document.getElementById('certModalImg');
  const certModalOpenFull = document.getElementById('certModalOpenFull');
  const certModalVerifyBtn = document.getElementById('certModalVerifyBtn');
  const certShareBtn = document.getElementById('certShareBtn');

  document.querySelectorAll('.cert-modal-trigger, .btn-verify-cert').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cKey = btn.getAttribute('data-cert');
      const data = certData[cKey];
      if (!data) return;

      if (certModalOrg) certModalOrg.textContent = data.org;
      if (certModalName) certModalName.textContent = data.name;
      if (certModalYear) certModalYear.textContent = data.year;
      if (certModalDomain) certModalDomain.textContent = data.domain;
      if (certModalCredId) certModalCredId.textContent = data.credentialId;
      if (certModalDesc) certModalDesc.textContent = data.desc;
      if (certModalImg) {
        certModalImg.src = data.image;
        certModalImg.alt = data.name;
      }
      if (certModalOpenFull) {
        certModalOpenFull.href = data.image;
      }
      if (certModalVerifyBtn) {
        certModalVerifyBtn.href = data.verifyUrl;
      }

      certModal.classList.add('active');
      playUiSound('chime');
    });
  });

  if (closeCertModal) {
    closeCertModal.addEventListener('click', () => {
      certModal.classList.remove('active');
      playUiSound('click');
    });
  }

  if (certShareBtn) {
    certShareBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href);
      showToast('Credential link copied to clipboard!');
      playUiSound('pop');
    });
  }

  // ==================== RESUME MODAL & PRINTING ====================
  const resumeModal = document.getElementById('resumeModal');
  const closeResumeModal = document.getElementById('closeResumeModal');
  const openResumeModalBtn = document.getElementById('openResumeModalBtn');
  const heroResumeBtn = document.getElementById('heroResumeBtn');
  const printResumeBtn = document.getElementById('printResumeBtn');

  function openResume() {
    resumeModal.classList.add('active');
    playUiSound('chime');
  }

  if (openResumeModalBtn) openResumeModalBtn.addEventListener('click', openResume);
  if (heroResumeBtn) heroResumeBtn.addEventListener('click', openResume);

  if (closeResumeModal) {
    closeResumeModal.addEventListener('click', () => {
      resumeModal.classList.remove('active');
      playUiSound('click');
    });
  }

  const toggleResumeFormatBtn = document.getElementById('toggleResumeFormatBtn');
  const toggleResumeFormatText = document.getElementById('toggleResumeFormatText');
  const printableResumeArea = document.getElementById('printableResumeArea');
  const originalResumeDocArea = document.getElementById('originalResumeDocArea');

  if (toggleResumeFormatBtn && printableResumeArea && originalResumeDocArea) {
    toggleResumeFormatBtn.addEventListener('click', () => {
      playUiSound('click');
      const isOriginalShowing = originalResumeDocArea.style.display !== 'none';
      if (isOriginalShowing) {
        originalResumeDocArea.style.display = 'none';
        printableResumeArea.style.display = 'block';
        if (toggleResumeFormatText) toggleResumeFormatText.textContent = 'View Original PDF';
        const icon = toggleResumeFormatBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-file-pdf';
      } else {
        originalResumeDocArea.style.display = 'block';
        printableResumeArea.style.display = 'none';
        if (toggleResumeFormatText) toggleResumeFormatText.textContent = 'Interactive Format';
        const icon = toggleResumeFormatBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-laptop-code';
      }
    });
  }

  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => {
      playUiSound('pop');
      if (originalResumeDocArea && originalResumeDocArea.style.display !== 'none') {
        originalResumeDocArea.style.display = 'none';
        if (printableResumeArea) printableResumeArea.style.display = 'block';
        if (toggleResumeFormatText) toggleResumeFormatText.textContent = 'View Original PDF';
        if (toggleResumeFormatBtn) {
          const icon = toggleResumeFormatBtn.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-file-pdf';
        }
      }
      window.print();
    });
  }

  // Photo mode toggle (AI Studio Portrait vs Original Photo)
  const photoModeToggle = document.getElementById('photoModeToggle');
  const heroAvatarImg = document.getElementById('heroAvatarImg');
  const photoModeText = document.getElementById('photoModeText');

  if (photoModeToggle && heroAvatarImg) {
    let isAiMode = true;
    photoModeToggle.addEventListener('click', () => {
      playUiSound('click');
      isAiMode = !isAiMode;
      if (isAiMode) {
        heroAvatarImg.src = 'assets/images/profile.jpg?v=' + Date.now();
        if (photoModeText) photoModeText.textContent = 'AI Studio Portrait';
        photoModeToggle.classList.remove('real-mode');
        showToast('Switched to AI Studio Portrait');
      } else {
        heroAvatarImg.src = 'assets/images/profile-real.jpg?v=' + Date.now();
        if (photoModeText) photoModeText.textContent = 'Original Photo';
        photoModeToggle.classList.add('real-mode');
        showToast('Switched to Original Photo');
      }
    });
  }

  // Close modals on outside overlay click
  window.addEventListener('click', (e) => {
    if (e.target === resumeModal) resumeModal.classList.remove('active');
    if (e.target === projectModal) projectModal.classList.remove('active');
    if (e.target === certModal) certModal.classList.remove('active');
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      resumeModal.classList.remove('active');
      projectModal.classList.remove('active');
      certModal.classList.remove('active');
    }
  });

  // ==================== COPY TO CLIPBOARD ====================
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied: ${textToCopy}`);
          playUiSound('pop');
          btn.innerHTML = '<i class="fa-solid fa-check"></i>';
          setTimeout(() => {
            btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
          }, 2000);
        });
      }
    });
  });

  // Toast Functionality
  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimeout;

  function showToast(msg) {
    if (!toast) return;
    toastMessage.textContent = msg;
    toast.classList.add('active');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('active');
    }, 3200);
  }

  // ==================== CONTACT FORM SUBMISSION ====================
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const directGmailBtn = document.getElementById('directGmailBtn');
  const userNameInput = document.getElementById('userName');
  const userEmailInput = document.getElementById('userEmail');
  const userSubjectInput = document.getElementById('userSubject');
  const userMessageInput = document.getElementById('userMessage');

  // Synchronize Direct Mailto button with current form inputs
  function updateDirectMailLink() {
    if (!directGmailBtn) return;
    const name = userNameInput ? userNameInput.value.trim() : '';
    const email = userEmailInput ? userEmailInput.value.trim() : '';
    const subject = userSubjectInput && userSubjectInput.value.trim() ? userSubjectInput.value.trim() : 'Portfolio Inquiry';
    const message = userMessageInput ? userMessageInput.value.trim() : '';

    const bodyContent = `Hi Nishant,\n\n${message || '[Your message here]'}\n\n---\nFrom: ${name || 'A Portfolio Visitor'}\nEmail: ${email || 'Not specified'}`;
    const mailto = `mailto:nishantsingh8195@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyContent)}`;
    directGmailBtn.href = mailto;
  }

  [userNameInput, userEmailInput, userSubjectInput, userMessageInput].forEach(input => {
    if (input) {
      input.addEventListener('input', updateDirectMailLink);
    }
  });
  updateDirectMailLink();

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = userNameInput.value.trim();
      const email = userEmailInput.value.trim();
      const subject = userSubjectInput.value.trim() || 'Portfolio Inquiry';
      const message = userMessageInput.value.trim();

      if (!name || !email || !message) {
        formStatus.textContent = 'Please fill out all required fields.';
        formStatus.className = 'form-status error';
        return;
      }

      sendMessageBtn.disabled = true;
      sendMessageBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
      formStatus.textContent = '';
      formStatus.className = 'form-status';

      const bodyContent = `Hi Nishant,\n\n${message}\n\n---\nFrom: ${name}\nEmail: ${email}`;
      const mailtoUrl = `mailto:nishantsingh8195@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyContent)}`;

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('_subject', `New Portfolio Message from ${name}: ${subject}`);
      formData.append('message', message);
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');

      let deliverySuccessful = false;

      // 3.5s timeout for third-party dispatch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      try {
        const response = await fetch('https://formsubmit.co/ajax/nishantsingh8195@gmail.com', {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formData,
          signal: controller.signal
        });

        const data = await response.json().catch(() => null);

        if (response.ok && data && data.success !== 'false') {
          deliverySuccessful = true;
        }
      } catch (err) {
        console.warn('Direct send status:', err);
      } finally {
        clearTimeout(timeoutId);
      }

      if (deliverySuccessful) {
        formStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Message sent successfully!';
        formStatus.className = 'form-status success';
        showToast('Message sent successfully!');
        playUiSound('chime');
        contactForm.reset();
        updateDirectMailLink();
      } else {
        // If third-party backend is slow or pending activation, guarantee delivery via native mail dispatch
        formStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Launching email client to send directly to <strong>nishantsingh8195@gmail.com</strong>... <br><a href="${mailtoUrl}" style="color:var(--accent-cyan); text-decoration:underline; font-weight:600; margin-top:6px; display:inline-block;">Click here if your email client didn't open automatically</a>`;
        formStatus.className = 'form-status success';
        showToast('Opening email dispatch...');
        playUiSound('chime');
        
        // Open user's email client directly with prefilled message
        window.location.href = mailtoUrl;

        setTimeout(() => {
          contactForm.reset();
          updateDirectMailLink();
        }, 1500);
      }

      sendMessageBtn.disabled = false;
      sendMessageBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';

      setTimeout(() => {
        if (formStatus.classList.contains('success')) {
          formStatus.textContent = '';
          formStatus.className = 'form-status';
        }
      }, 9000);
    });
  }

});
