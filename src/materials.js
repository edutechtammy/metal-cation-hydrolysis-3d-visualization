/* =========================================================
 *  materials.js
 *  Centralised material definitions for the hydrolysis scene.
 *  Colour palette inspired by CPK conventions with
 *  pedagogically-motivated adjustments.
 * ========================================================= */

import * as THREE from 'three';

// ── Colour Palette ──────────────────────────────────────────
export const PALETTE = {
    aluminum: 0xc0c0c0,   // Silver – metallic center
    oxygen: 0xe23c3c,   // Red    – electronegative
    hydrogen: 0xffffff,   // White  – standard CPK
    water: 0x4a90e2,   // Blue   – coordinated water
    bond_coord: 0x88bbee,   // Pale blue – dashed coord bonds
    bond_covalent: 0x999999,   // Grey   – solid O-H bonds
    highlight: 0xffcc00,   // Gold   – Raycaster selection
    background: 0x0a0e17,   // Deep navy – scene background
    glow: 0xff6633,   // Orange-red – electron density
};

// ── Atom Materials ──────────────────────────────────────────

/** Al³⁺ centre – shiny metallic sphere */
export const aluminumMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.aluminum,
    metalness: 0.7,
    roughness: 0.25,
    emissive: PALETTE.aluminum,
    emissiveIntensity: 0.05,
});

/** Oxygen atoms – slightly glossy red */
export const oxygenMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.oxygen,
    metalness: 0.1,
    roughness: 0.4,
});

/** Hydrogen atoms – small matte white */
export const hydrogenMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.hydrogen,
    metalness: 0.0,
    roughness: 0.6,
});

// ── Bond Materials ──────────────────────────────────────────

/** Coordination bonds: Al ← O  (dashed) */
export const coordinationBondMaterial = new THREE.LineDashedMaterial({
    color: PALETTE.bond_coord,
    dashSize: 0.12,
    gapSize: 0.08,
    linewidth: 1,          // note: > 1 only works with WebGL2 + LineSegments2
});

/** Covalent bonds: O–H  (solid) */
export const covalentBondMaterial = new THREE.LineBasicMaterial({
    color: PALETTE.bond_covalent,
    linewidth: 1,
});

// ── Highlight (Raycaster selection) ─────────────────────────
export const highlightMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.highlight,
    metalness: 0.3,
    roughness: 0.3,
    emissive: PALETTE.highlight,
    emissiveIntensity: 0.35,
});

// ── Utility ─────────────────────────────────────────────────
/**
 * Clone a material and tint its emissive to simulate
 * electron-density "heat map" intensity.
 * @param {THREE.MeshStandardMaterial} baseMat
 * @param {number} intensity  0 → 1
 */
export function createElectronDensityVariant(baseMat, intensity = 0.0) {
    const mat = baseMat.clone();
    mat.emissive = new THREE.Color(PALETTE.glow);
    mat.emissiveIntensity = intensity;
    return mat;
}
