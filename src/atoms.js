/* =========================================================
 *  atoms.js
 *  Builds the [Al(H₂O)₆]³⁺ octahedral complex.
 *
 *  Geometry reference
 *  ──────────────────
 *  • Al³⁺ at the origin.
 *  • 6 water molecules along ±x, ±y, ±z at distance R_AL_O.
 *  • Each water: O faces Al (lone pair donation),
 *    two H atoms at the tetrahedral H-O-H angle (≈104.5°).
 *
 *  All distances in Ångströms (1 Å  ≈  1 scene unit).
 * ========================================================= */

import * as THREE from 'three';
import {
    aluminumMaterial,
    oxygenMaterial,
    hydrogenMaterial,
} from './materials.js';

// ── Physical Constants (Å) ──────────────────────────────────
const R_AL_O = 1.90;       // Al–O coordination bond length
const R_O_H = 0.96;       // O–H covalent bond length
const H_O_H_ANGLE = THREE.MathUtils.degToRad(104.5);

// ── Sphere Detail ───────────────────────────────────────────
const SPHERE_SEGMENTS = 32;

// ── Radii (van der Waals ÷ 3 for clarity) ───────────────────
export const RADII = {
    Al: 0.45,
    O: 0.30,
    H: 0.18,
};

// ── Octahedral Directions ───────────────────────────────────
const OCTA_DIRS = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, -1),
];

/* ---------------------------------------------------------
 *  createAlCenter()
 *  Returns the Al³⁺ mesh at the origin.
 * --------------------------------------------------------- */
export function createAlCenter() {
    const geo = new THREE.SphereGeometry(RADII.Al, SPHERE_SEGMENTS, SPHERE_SEGMENTS);
    const mesh = new THREE.Mesh(geo, aluminumMaterial);
    mesh.name = 'Al';
    mesh.userData = {
        element: 'Al',
        role: 'Metal center (Lewis acid)',
        charge: '+3',
    };
    return mesh;
}

/* ---------------------------------------------------------
 *  createWaterMolecule(direction)
 *
 *  Returns a THREE.Group containing O + 2 × H positioned
 *  so that O faces the Al center along `direction`.
 *
 *  @param {THREE.Vector3} direction — unit vector from origin
 * --------------------------------------------------------- */
export function createWaterMolecule(direction) {
    const group = new THREE.Group();
    group.name = 'Water';

    // ── Oxygen ──
    const oGeo = new THREE.SphereGeometry(RADII.O, SPHERE_SEGMENTS, SPHERE_SEGMENTS);
    const oMesh = new THREE.Mesh(oGeo, oxygenMaterial.clone());
    oMesh.name = 'O';
    oMesh.userData = {
        element: 'O',
        role: 'Electron-pair donor (Lewis base)',
        charge: 'δ−',
    };

    // Place oxygen at R_AL_O along direction
    const oPos = direction.clone().multiplyScalar(R_AL_O);
    oMesh.position.copy(oPos);
    group.add(oMesh);

    // ── Hydrogens ──
    // Two H atoms arranged symmetrically about the Al–O axis,
    // opening AWAY from Al (O lone pairs face Al).
    const halfAngle = H_O_H_ANGLE / 2;

    // Build a local coordinate frame where Z = direction (Al→O)
    const zAxis = direction.clone().normalize();
    // Pick an arbitrary perpendicular
    let arbitrary = new THREE.Vector3(0, 1, 0);
    if (Math.abs(zAxis.dot(arbitrary)) > 0.99) arbitrary = new THREE.Vector3(1, 0, 0);
    const xAxis = new THREE.Vector3().crossVectors(zAxis, arbitrary).normalize();
    const yAxis = new THREE.Vector3().crossVectors(xAxis, zAxis).normalize();

    for (let i = 0; i < 2; i++) {
        const hGeo = new THREE.SphereGeometry(RADII.H, SPHERE_SEGMENTS, SPHERE_SEGMENTS);
        const hMesh = new THREE.Mesh(hGeo, hydrogenMaterial.clone());
        hMesh.name = `H${i + 1}`;
        hMesh.userData = {
            element: 'H',
            role: 'Proton (may dissociate in hydrolysis)',
            charge: 'δ+',
        };

        // Angle from the O→Al axis (pointing away from Al)
        const phi = (i === 0) ? halfAngle : -halfAngle;
        const hDir = new THREE.Vector3()
            .addScaledVector(zAxis, Math.cos(Math.PI - halfAngle))   // component away from Al
            .addScaledVector(i === 0 ? xAxis : xAxis.clone().negate(), Math.sin(Math.PI - halfAngle))
            .normalize();

        hMesh.position.copy(oPos).addScaledVector(hDir, R_O_H);
        group.add(hMesh);
    }

    return group;
}

/* ---------------------------------------------------------
 *  buildComplex()
 *
 *  Assembles the full [Al(H₂O)₆]³⁺ complex and returns
 *  a THREE.Group ready to be added to the scene.
 *
 *  Also returns references for bonds & interaction modules.
 * --------------------------------------------------------- */
export function buildComplex() {
    const complex = new THREE.Group();
    complex.name = 'AlComplex';

    // Central Al³⁺
    const al = createAlCenter();
    complex.add(al);

    // 6 coordinated water molecules
    const waters = [];
    for (const dir of OCTA_DIRS) {
        const water = createWaterMolecule(dir);
        waters.push(water);
        complex.add(water);
    }

    return { complex, al, waters };
}
