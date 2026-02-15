/* =========================================================
 *  interaction.js
 *  Raycaster-based click-to-highlight + info panel display.
 * ========================================================= */

import * as THREE from 'three';
import { highlightMaterial } from './materials.js';

// ── State ───────────────────────────────────────────────────
let previousSelection = null;
let previousMaterial = null;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// ── DOM refs ────────────────────────────────────────────────
const infoPanel = document.getElementById('info-panel');
const infoTitle = document.getElementById('info-title');
const infoElement = document.getElementById('info-element');
const infoRole = document.getElementById('info-role');
const infoCharge = document.getElementById('info-charge');
const infoClose = document.getElementById('info-close');

/* ---------------------------------------------------------
 *  initInteraction(camera, scene, canvas)
 *
 *  Sets up pointer events for atom selection / highlighting.
 * --------------------------------------------------------- */
export function initInteraction(camera, scene, canvas) {

    canvas.addEventListener('pointerdown', (event) => {
        // Normalised device coordinates (-1 … +1)
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);

        // Only test meshes (atoms), not lines (bonds)
        const meshes = [];
        scene.traverse((obj) => {
            if (obj.isMesh) meshes.push(obj);
        });

        const hits = raycaster.intersectObjects(meshes, false);

        if (hits.length > 0) {
            selectAtom(hits[0].object);
        } else {
            deselectAtom();
        }
    });

    // Close button
    infoClose?.addEventListener('click', deselectAtom);
}

/* ---------------------------------------------------------
 *  selectAtom(mesh)
 * --------------------------------------------------------- */
function selectAtom(mesh) {
    // Restore previous selection
    if (previousSelection && previousMaterial) {
        previousSelection.material = previousMaterial;
    }

    // Store & swap material
    previousSelection = mesh;
    previousMaterial = mesh.material;
    mesh.material = highlightMaterial;

    // Populate info panel
    const data = mesh.userData;
    if (infoPanel) {
        infoTitle.textContent = mesh.name || '—';
        infoElement.textContent = data.element || '—';
        infoRole.textContent = data.role || '—';
        infoCharge.textContent = data.charge || '—';
        infoPanel.classList.remove('hidden');
    }
}

/* ---------------------------------------------------------
 *  deselectAtom()
 * --------------------------------------------------------- */
function deselectAtom() {
    if (previousSelection && previousMaterial) {
        previousSelection.material = previousMaterial;
        previousSelection = null;
        previousMaterial = null;
    }
    if (infoPanel) infoPanel.classList.add('hidden');
}
