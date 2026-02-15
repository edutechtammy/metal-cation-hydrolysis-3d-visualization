/* =========================================================
 *  labels.js
 *  CSS2DRenderer-based atom labels.
 *  Shows element symbols and partial charges in the 3D view.
 * ========================================================= */

import {
    CSS2DRenderer,
    CSS2DObject,
} from 'three/addons/renderers/CSS2DRenderer.js';

// ── Label text lookup ───────────────────────────────────────
const LABEL_TEXT = {
    Al:  'Al³⁺',
    O:   'O  δ−',
    H1:  'H  δ+',
    H2:  'H  δ+',
};

// ── Module state ────────────────────────────────────────────
let labelRenderer = null;
const allLabels = [];

/* ---------------------------------------------------------
 *  initLabels()
 *
 *  Creates the CSS2DRenderer and appends its DOM element.
 *  Returns the renderer so main.js can call render() on it.
 * --------------------------------------------------------- */
export function initLabels() {
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.id = 'label-renderer';
    labelRenderer.domElement.style.position = 'fixed';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.left = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    labelRenderer.domElement.style.zIndex = '5';        // below UI overlay (10)
    document.body.appendChild(labelRenderer.domElement);

    return labelRenderer;
}

/* ---------------------------------------------------------
 *  attachLabels(complex)
 *
 *  Walks the complex scene graph and adds a CSS2DObject
 *  label to every atom mesh (Al, O, H).
 * --------------------------------------------------------- */
export function attachLabels(complex) {
    complex.traverse((obj) => {
        if (!obj.isMesh) return;

        const text = LABEL_TEXT[obj.name];
        if (!text) return;

        const div = document.createElement('div');
        div.className = 'atom-label';
        div.textContent = text;

        // Colour-code by element
        if (obj.name === 'Al') div.classList.add('label-al');
        else if (obj.name === 'O') div.classList.add('label-o');
        else div.classList.add('label-h');

        const label = new CSS2DObject(div);
        // Offset slightly above the atom
        label.position.set(0, 0.35, 0);
        label.name = 'label';
        obj.add(label);

        allLabels.push(label);
    });
}

/* ---------------------------------------------------------
 *  createFreeLabel(mesh, text, cssClass)
 *
 *  Attach a label to any mesh (used for free water / H₃O⁺).
 * --------------------------------------------------------- */
export function createFreeLabel(mesh, text, cssClass = 'label-o') {
    const div = document.createElement('div');
    div.className = `atom-label ${cssClass}`;
    div.textContent = text;

    const label = new CSS2DObject(div);
    label.position.set(0, 0.45, 0);
    label.name = 'label';
    mesh.add(label);
    allLabels.push(label);
    return label;
}

/* ---------------------------------------------------------
 *  setLabelsVisible(visible)
 * --------------------------------------------------------- */
export function setLabelsVisible(visible) {
    for (const lbl of allLabels) {
        lbl.visible = visible;
    }
}

/* ---------------------------------------------------------
 *  getLabelRenderer()
 * --------------------------------------------------------- */
export function getLabelRenderer() {
    return labelRenderer;
}
