/**
 * Nishant Singh - 3D Interactive Three.js Hero Scene
 * Features:
 * - Cyberpunk Torus Knot / Interactive Particle Sphere
 * - Interactive Mouse-reactive parallax & dampening
 * - Floating Starfield / Tech Dust particles
 * - Dynamic Neon Cyan & Violet Glow Lighting
 */

(function () {
  const container = document.getElementById('threeCanvasContainer');
  if (!container || typeof THREE === 'undefined') return;

  // Scene Setup
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 32;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    console.warn('WebGL not supported for 3D hero:', e);
    return;
  }

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Group for rotating elements
  const mainGroup = new THREE.Group();
  scene.add(mainGroup);

  // 1. Cyber Wireframe Torus Knot
  const torusGeometry = new THREE.TorusKnotGeometry(9, 2.4, 140, 24, 2, 3);
  const torusMaterial = new THREE.MeshStandardMaterial({
    color: 0x00f5d4,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0x005544,
    emissiveIntensity: 0.3
  });
  const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
  mainGroup.add(torusMesh);

  // 2. Inner Glowing Particle Core
  const innerSphereGeo = new THREE.IcosahedronGeometry(5.5, 2);
  const innerSphereMat = new THREE.MeshBasicMaterial({
    color: 0x9d4edd,
    wireframe: true,
    transparent: true,
    opacity: 0.45
  });
  const innerCore = new THREE.Mesh(innerSphereGeo, innerSphereMat);
  mainGroup.add(innerCore);

  // 3. Floating Cyber Particle Field (Stars / Tech Dust)
  const particleCount = 750;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);

  const color1 = new THREE.Color(0x00f5d4); // Cyan
  const color2 = new THREE.Color(0x9d4edd); // Purple
  const color3 = new THREE.Color(0x3b82f6); // Blue

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 110;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 80;
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 60;

    const mixedColor = color1.clone();
    const ratio = Math.random();
    if (ratio < 0.33) {
      mixedColor.lerp(color2, Math.random());
    } else if (ratio < 0.66) {
      mixedColor.lerp(color3, Math.random());
    }
    particleColors[i3] = mixedColor.r;
    particleColors[i3 + 1] = mixedColor.g;
    particleColors[i3 + 2] = mixedColor.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.45,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // 4. Dramatic Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const pointLightCyan = new THREE.PointLight(0x00f5d4, 3, 60);
  pointLightCyan.position.set(18, 12, 16);
  scene.add(pointLightCyan);

  const pointLightPurple = new THREE.PointLight(0x9d4edd, 3.5, 60);
  pointLightPurple.position.set(-18, -12, 16);
  scene.add(pointLightPurple);

  // Offset main group slightly to the right to frame hero text nicely
  mainGroup.position.set(9, 0, -2);

  // Mouse Interaction Variables
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;

  function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    targetRotationY = mouseX * 0.45;
    targetRotationX = -mouseY * 0.35;
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Scroll Reactivity
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  // Window Resize
  function onWindowResize() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Responsive positioning: on smaller screens center the geometry
    if (window.innerWidth < 1024) {
      mainGroup.position.set(0, 4, -8);
      camera.position.z = 38;
    } else {
      mainGroup.position.set(9, 0, -2);
      camera.position.z = 32;
    }
  }

  window.addEventListener('resize', onWindowResize);
  onWindowResize();

  // Animation Loop with Clock
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Constant idle rotation
    torusMesh.rotation.x = elapsedTime * 0.12;
    torusMesh.rotation.y = elapsedTime * 0.16;

    innerCore.rotation.x = -elapsedTime * 0.22;
    innerCore.rotation.y = -elapsedTime * 0.18;

    particleSystem.rotation.y = elapsedTime * 0.03;
    particleSystem.rotation.x = elapsedTime * 0.015;

    // Smooth lerping to mouse position
    mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05;
    mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;

    // Subtle scroll influence
    mainGroup.position.y = (window.innerWidth < 1024 ? 4 : 0) - scrollY * 0.012;

    renderer.render(scene, camera);
  }

  animate();
})();
