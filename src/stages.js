/* =========================================================
 *  stages.js
 *  GSAP-driven stage animations for progressive disclosure.
 *
 *  State machine
 *  ─────────────
 *  Stage 0 — Complex     Show the [Al(H₂O)₆]³⁺ complex
 *  Stage 1 — Dissolution Explode lattice ions outward
 *  Stage 2 — Hydration   Waters converge onto Al³⁺
 *  Stage 3 — Hydrolysis  Polarisation glow → H⁺ detaches → H₃O⁺
 * ========================================================= */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { PALETTE, createElectronDensityVariant, oxygenMaterial } from './materials.js';
import { createFreeLabel } from './labels.js';

// ── Saved initial state ─────────────────────────────────────
const savedPositions = new Map();    // mesh → { x, y, z }
const savedMaterials = new Map();    // mesh → material

// ── References (set once by init) ───────────────────────────
let _scene, _camera, _controls, _complex, _al, _waters, _bondsGroup;
let _freeWater = null;     // the extra H₂O that becomes H₃O⁺
let _activeTimeline = null;

// ── Stage description element ───────────────────────────────
const stageDesc = document.getElementById('stage-desc');

const STAGE_DESCRIPTIONS = [
    'The octahedral aqua complex [Al(H₂O)₆]³⁺ — six water molecules coordinate to the Al³⁺ center via lone pairs on oxygen.',
    'The ionic lattice breaks apart. Ions separate and enter solution as individual species.',
    'Water molecules orient with their oxygen (δ−) toward the highly charged Al³⁺ cation, forming coordination bonds.',
    'The intense electric field of Al³⁺ polarises an O–H bond. The weakened proton transfers to a nearby water molecule, forming H₃O⁺.',
];

/* ---------------------------------------------------------
 *  initStages(scene, camera, controls, complex, al, waters, bondsGroup)
 *
 *  Must be called once after the scene is built.
 *  Snapshots initial positions for reset.
 * --------------------------------------------------------- */
export function initStages(scene, camera, controls, complex, al, waters, bondsGroup) {
    _scene = scene;
    _camera = camera;
    _controls = controls;
    _complex = complex;
    _al = al;
    _waters = waters;
    _bondsGroup = bondsGroup;

    // Snapshot every mesh position
    _complex.traverse((obj) => {
        if (obj.isMesh || obj.isGroup) {
            savedPositions.set(obj, obj.position.clone());
        }
        if (obj.isMesh) {
            savedMaterials.set(obj, obj.material);
        }
    });

    // Build the free water molecule (hidden, positioned off-screen)
    _freeWater = buildFreeWater();
    _freeWater.visible = false;
    _scene.add(_freeWater);

    // Show stage 0 description
    updateDescription(0);
}

/* ---------------------------------------------------------
 *  goToStage(stage)
 *
 *  Main entry point called by the button handler.
 * --------------------------------------------------------- */
export function goToStage(stage) {
    // Kill any running timeline
    if (_activeTimeline) {
        _activeTimeline.kill();
        _activeTimeline = null;
    }

    updateDescription(stage);

    switch (stage) {
        case 0: stageComplex(); break;
        case 1: stageDissolution(); break;
        case 2: stageHydration(); break;
        case 3: stageHydrolysis(); break;
    }
}

/* ─────────────────────────────────────────────────────────
 *  STAGE 0 — COMPLEX  (reset to original positions)
 * ───────────────────────────────────────────────────────── */
function stageComplex() {
    const tl = gsap.timeline();
    _activeTimeline = tl;

    // Restore visibility
    _complex.visible = true;
    _bondsGroup.visible = true;
    _freeWater.visible = false;

    // Animate all meshes back to saved positions
    _complex.traverse((obj) => {
        if ((obj.isMesh || obj.isGroup) && savedPositions.has(obj)) {
            const saved = savedPositions.get(obj);
            tl.to(obj.position, {
                x: saved.x,
                y: saved.y,
                z: saved.z,
                duration: 1.0,
                ease: 'power2.inOut',
            }, 0);
        }
        // Restore materials
        if (obj.isMesh && savedMaterials.has(obj)) {
            obj.material = savedMaterials.get(obj);
        }
    });

    // Reset complex scale
    tl.to(_complex.scale, { x: 1, y: 1, z: 1, duration: 0.8, ease: 'power2.inOut' }, 0);

    // Camera back to default
    tl.to(_camera.position, { x: 4, y: 3, z: 5, duration: 1.2, ease: 'power2.inOut' }, 0);
    tl.to(_controls.target, {
        x: 0, y: 0, z: 0, duration: 1.2, ease: 'power2.inOut',
        onUpdate: () => _controls.update(),
    }, 0);
}

/* ─────────────────────────────────────────────────────────
 *  STAGE 1 — DISSOLUTION  (explode outward)
 * ───────────────────────────────────────────────────────── */
function stageDissolution() {
    const tl = gsap.timeline();
    _activeTimeline = tl;

    _freeWater.visible = false;

    // Restore materials first
    _complex.traverse((obj) => {
        if (obj.isMesh && savedMaterials.has(obj)) {
            obj.material = savedMaterials.get(obj);
        }
    });

    // Phase 1 — slight shake to suggest instability
    tl.to(_complex.position, {
        x: '+=0.05', duration: 0.08, repeat: 5, yoyo: true, ease: 'none',
    }, 0);

    // Phase 2 — each water group explodes outward along its axis
    _waters.forEach((water, i) => {
        // Get the direction this water sits in (normalised O position)
        const oxygen = water.children.find(c => c.name === 'O');
        if (!oxygen) return;

        const dir = oxygen.position.clone().normalize();
        const explodeDist = 3.5 + Math.random() * 1.5;

        tl.to(water.position, {
            x: dir.x * explodeDist,
            y: dir.y * explodeDist,
            z: dir.z * explodeDist,
            duration: 1.4,
            ease: 'power3.out',
        }, 0.5 + i * 0.08);

        // Slight tumble rotation
        tl.to(water.rotation, {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
            duration: 1.4,
            ease: 'power2.out',
        }, 0.5 + i * 0.08);
    });

    // Fade bonds
    tl.to(_bondsGroup, { visible: true, duration: 0 }, 0);
    tl.call(() => { _bondsGroup.visible = false; }, null, 1.0);

    // Camera pull back
    tl.to(_camera.position, { x: 6, y: 5, z: 8, duration: 1.6, ease: 'power2.inOut' }, 0.3);
}

/* ─────────────────────────────────────────────────────────
 *  STAGE 2 — HYDRATION  (waters converge onto Al³⁺)
 * ───────────────────────────────────────────────────────── */
function stageHydration() {
    const tl = gsap.timeline();
    _activeTimeline = tl;

    _freeWater.visible = false;
    _complex.visible = true;

    // Restore materials
    _complex.traverse((obj) => {
        if (obj.isMesh && savedMaterials.has(obj)) {
            obj.material = savedMaterials.get(obj);
        }
    });

    // First scatter waters outward (as if they start far away)
    _waters.forEach((water) => {
        const oxygen = water.children.find(c => c.name === 'O');
        if (!oxygen) return;
        const dir = oxygen.position.clone().normalize();
        water.position.copy(dir.multiplyScalar(5));
        water.rotation.set(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3,
        );
    });
    _bondsGroup.visible = false;

    // Camera reset
    tl.to(_camera.position, { x: 4, y: 3, z: 5, duration: 1.0, ease: 'power2.inOut' }, 0);

    // Animate each water converging to its octahedral position
    _waters.forEach((water, i) => {
        const saved = savedPositions.get(water) || new THREE.Vector3();

        // Move toward saved position
        tl.to(water.position, {
            x: saved.x,
            y: saved.y,
            z: saved.z,
            duration: 1.6,
            ease: 'power2.inOut',
        }, 0.3 + i * 0.15);

        // Correct rotation (O faces Al)
        tl.to(water.rotation, {
            x: 0, y: 0, z: 0,
            duration: 1.2,
            ease: 'power2.inOut',
        }, 0.5 + i * 0.15);
    });

    // Show bonds after waters arrive
    tl.call(() => { _bondsGroup.visible = true; }, null, 2.2);
}

/* ─────────────────────────────────────────────────────────
 *  STAGE 3 — HYDROLYSIS  (the "Aha!" moment)
 *
 *  1. Electron density glow intensifies on target O
 *  2. One H detaches from the complex
 *  3. H moves to the free water → becomes H₃O⁺
 * ───────────────────────────────────────────────────────── */
function stageHydrolysis() {
    const tl = gsap.timeline();
    _activeTimeline = tl;

    // ── Reset to complex state first ──
    _complex.traverse((obj) => {
        if ((obj.isMesh || obj.isGroup) && savedPositions.has(obj)) {
            const saved = savedPositions.get(obj);
            obj.position.copy(saved);
        }
        if (obj.isGroup && obj.name === 'Water') {
            obj.rotation.set(0, 0, 0);
        }
        if (obj.isMesh && savedMaterials.has(obj)) {
            obj.material = savedMaterials.get(obj);
        }
    });
    _complex.position.set(0, 0, 0);
    _bondsGroup.visible = true;

    // Pick the target water (index 0 = +x direction) and its H1
    const targetWater = _waters[0];
    const targetO = targetWater.children.find(c => c.name === 'O');
    const targetH = targetWater.children.find(c => c.name === 'H1');
    if (!targetO || !targetH) return;

    // Show and position free water molecule
    _freeWater.visible = true;
    _freeWater.position.set(4.5, 0.3, 0.5);

    // Camera: zoom in on the +x water
    tl.to(_camera.position, {
        x: 3.5, y: 1.5, z: 3,
        duration: 1.5,
        ease: 'power2.inOut',
    }, 0);
    tl.to(_controls.target, {
        x: 1.5, y: 0, z: 0,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => _controls.update(),
    }, 0);

    // ── Phase 1: Electron density glow builds on target O ──
    const glowMat = createElectronDensityVariant(oxygenMaterial, 0);
    tl.call(() => { targetO.material = glowMat; }, null, 1.0);

    // Animate emissive intensity from 0 → 0.8
    tl.to(glowMat, {
        emissiveIntensity: 0.8,
        duration: 2.0,
        ease: 'power1.in',
    }, 1.2);

    // Also pulse the Al emissive to show it's "pulling"
    const alMat = _al.material;
    tl.to(alMat, {
        emissiveIntensity: 0.3,
        duration: 1.5,
        ease: 'power1.in',
    }, 1.5);

    // ── Phase 2: H detaches from the complex ──
    // Record H's world position before detaching
    const hWorldPos = new THREE.Vector3();
    tl.call(() => {
        targetH.getWorldPosition(hWorldPos);
        // Reparent H to scene so it can move independently
        _scene.attach(targetH);
    }, null, 3.2);

    // Move H toward the free water
    const freeWaterOxygen = _freeWater.children.find(c => c.name === 'O_free');
    const freeOPos = new THREE.Vector3();

    tl.call(() => {
        if (freeWaterOxygen) {
            freeWaterOxygen.getWorldPosition(freeOPos);
        } else {
            freeOPos.copy(_freeWater.position);
        }
    }, null, 3.3);

    tl.to(targetH.position, {
        x: () => freeOPos.x + 0.5,
        y: () => freeOPos.y + 0.4,
        z: () => freeOPos.z,
        duration: 1.2,
        ease: 'power2.in',
    }, 3.4);

    // ── Phase 3: Label the products ──
    tl.call(() => {
        // Label the free water as H₃O⁺
        const freeO = _freeWater.children.find(c => c.name === 'O_free');
        if (freeO) {
            // Remove existing label if any
            const oldLabel = freeO.children.find(c => c.name === 'label');
            if (oldLabel) freeO.remove(oldLabel);
            createFreeLabel(freeO, 'H₃O⁺', 'label-hydronium');
        }
    }, null, 4.8);
}

/* ─────────────────────────────────────────────────────────
 *  buildFreeWater()
 *
 *  Creates a standalone water molecule (not coordinated to Al).
 *  Used as the proton acceptor in Stage 3.
 * ───────────────────────────────────────────────────────── */
function buildFreeWater() {
    const group = new THREE.Group();
    group.name = 'FreeWater';

    const SPHERE_SEGMENTS = 32;

    // Oxygen
    const oGeo = new THREE.SphereGeometry(0.30, SPHERE_SEGMENTS, SPHERE_SEGMENTS);
    const oMat = new THREE.MeshStandardMaterial({
        color: PALETTE.oxygen,
        metalness: 0.1,
        roughness: 0.4,
    });
    const oMesh = new THREE.Mesh(oGeo, oMat);
    oMesh.name = 'O_free';
    oMesh.userData = { element: 'O', role: 'Free water molecule', charge: 'δ−' };
    group.add(oMesh);

    // Two hydrogens
    const hPositions = [
        new THREE.Vector3(0.76, 0.58, 0),
        new THREE.Vector3(-0.76, 0.58, 0),
    ];
    hPositions.forEach((pos, i) => {
        const hGeo = new THREE.SphereGeometry(0.18, SPHERE_SEGMENTS, SPHERE_SEGMENTS);
        const hMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.0,
            roughness: 0.6,
        });
        const hMesh = new THREE.Mesh(hGeo, hMat);
        hMesh.position.copy(pos);
        hMesh.name = `H_free_${i + 1}`;
        hMesh.userData = { element: 'H', role: 'Free water hydrogen', charge: 'δ+' };
        group.add(hMesh);
    });

    // Label it as H₂O initially
    createFreeLabel(oMesh, 'H₂O', 'label-o');

    return group;
}

/* ─────────────────────────────────────────────────────────
 *  updateDescription(stage)
 * ───────────────────────────────────────────────────────── */
function updateDescription(stage) {
    if (stageDesc) {
        stageDesc.textContent = STAGE_DESCRIPTIONS[stage] || '';
        stageDesc.classList.remove('hidden');
    }
}
