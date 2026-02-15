/* =========================================================
 *  main.js
 *  Entry point — Three.js scene, camera, lights, controls,
 *  and render loop for the [Al(H₂O)₆]³⁺ hydrolysis viz.
 * ========================================================= */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildComplex } from './atoms.js';
import { buildBonds } from './bonds.js';
import { initInteraction } from './interaction.js';
import { PALETTE } from './materials.js';

// ═══════════════════════════════════════════════════════════
//  1.  RENDERER
// ═══════════════════════════════════════════════════════════
const canvas = document.getElementById('webgl-canvas');
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ═══════════════════════════════════════════════════════════
//  2.  SCENE
// ═══════════════════════════════════════════════════════════
const scene = new THREE.Scene();
scene.background = new THREE.Color(PALETTE.background);

// Subtle fog for depth cue
scene.fog = new THREE.FogExp2(PALETTE.background, 0.06);

// ═══════════════════════════════════════════════════════════
//  3.  CAMERA
// ═══════════════════════════════════════════════════════════
const camera = new THREE.PerspectiveCamera(
    50,                                       // fov
    window.innerWidth / window.innerHeight,   // aspect
    0.1,                                      // near
    100,                                      // far
);
camera.position.set(4, 3, 5);
camera.lookAt(0, 0, 0);

// ═══════════════════════════════════════════════════════════
//  4.  ORBIT CONTROLS  (360° rotation + zoom)
// ═══════════════════════════════════════════════════════════
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2;
controls.maxDistance = 15;
controls.autoRotate = true;        // gentle idle rotation
controls.autoRotateSpeed = 0.8;
controls.target.set(0, 0, 0);
controls.update();

// ═══════════════════════════════════════════════════════════
//  5.  LIGHTING
// ═══════════════════════════════════════════════════════════

// Soft ambient fill
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Key light — slightly warm
const keyLight = new THREE.DirectionalLight(0xfff4e6, 1.0);
keyLight.position.set(5, 8, 4);
scene.add(keyLight);

// Fill light — cool blue, opposite side
const fillLight = new THREE.DirectionalLight(0xc4d9f5, 0.5);
fillLight.position.set(-4, 2, -3);
scene.add(fillLight);

// Rim / back light
const rimLight = new THREE.PointLight(0xffffff, 0.6, 20);
rimLight.position.set(0, -4, -5);
scene.add(rimLight);

// ═══════════════════════════════════════════════════════════
//  6.  BUILD THE MOLECULAR COMPLEX
// ═══════════════════════════════════════════════════════════
const { complex, al, waters } = buildComplex();
scene.add(complex);

// Build visual bonds and add to scene
const bondsGroup = buildBonds(al, waters);
scene.add(bondsGroup);

// ═══════════════════════════════════════════════════════════
//  7.  RAYCASTER INTERACTION
// ═══════════════════════════════════════════════════════════
initInteraction(camera, scene, canvas);

// ═══════════════════════════════════════════════════════════
//  8.  STAGE BUTTONS (wired for future GSAP animations)
// ═══════════════════════════════════════════════════════════
let currentStage = 0;

document.querySelectorAll('.stage-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const stage = parseInt(btn.dataset.stage, 10);
        if (stage === currentStage) return;

        currentStage = stage;

        // Update active class
        document.querySelectorAll('.stage-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // TODO: Stage transition animations (GSAP)
        // ──────────────────────────────────────────
        // switch (stage) {
        //   case 0: showComplex();    break;
        //   case 1: dissolution();    break;
        //   case 2: hydration();      break;
        //   case 3: hydrolysis();     break;
        // }

        console.log(`→ Stage ${stage}: ${btn.querySelector('.stage-label').textContent}`);
    });
});

// ═══════════════════════════════════════════════════════════
//  9.  HELPERS (optional visual aids)
// ═══════════════════════════════════════════════════════════

// Axes helper — useful during development, disable for production
// const axes = new THREE.AxesHelper(3);
// scene.add(axes);

// ═══════════════════════════════════════════════════════════
//  10. RENDER LOOP
// ═══════════════════════════════════════════════════════════
function animate() {
    controls.update();             // required when damping is enabled
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// ═══════════════════════════════════════════════════════════
//  11. RESIZE HANDLER
// ═══════════════════════════════════════════════════════════
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
