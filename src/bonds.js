/* =========================================================
 *  bonds.js
 *  Creates visual bonds for the [Al(H₂O)₆]³⁺ complex.
 *
 *  • Coordination bonds (Al ← O):  dashed lines
 *  • Covalent bonds     (O – H):   solid lines
 * ========================================================= */

import * as THREE from 'three';
import {
    coordinationBondMaterial,
    covalentBondMaterial,
} from './materials.js';

/* ---------------------------------------------------------
 *  createDashedBond(from, to)
 *  Returns a THREE.Line with dashed material.
 * --------------------------------------------------------- */
function createDashedBond(from, to) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const line = new THREE.Line(geo, coordinationBondMaterial.clone());
    line.computeLineDistances();   // required for dashes to render
    line.name = 'CoordBond';
    return line;
}

/* ---------------------------------------------------------
 *  createSolidBond(from, to)
 *  Returns a THREE.Line with solid material.
 * --------------------------------------------------------- */
function createSolidBond(from, to) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const line = new THREE.Line(geo, covalentBondMaterial.clone());
    line.name = 'CovalentBond';
    return line;
}

/* ---------------------------------------------------------
 *  buildBonds(al, waters)
 *
 *  @param {THREE.Mesh}    al      – Al center mesh
 *  @param {THREE.Group[]} waters  – array of 6 water groups
 *  @returns {THREE.Group} containing all bond lines
 * --------------------------------------------------------- */
export function buildBonds(al, waters) {
    const bondsGroup = new THREE.Group();
    bondsGroup.name = 'Bonds';

    const alPos = new THREE.Vector3();
    al.getWorldPosition(alPos);

    for (const water of waters) {
        // Find oxygen in this water group
        const oxygen = water.children.find((c) => c.name === 'O');
        if (!oxygen) continue;

        const oPos = new THREE.Vector3();
        oxygen.getWorldPosition(oPos);

        // ── Coordination bond:  Al ← O  (dashed) ──
        bondsGroup.add(createDashedBond(alPos, oPos));

        // ── Covalent bonds:  O – H  (solid) ──
        const hydrogens = water.children.filter((c) => c.name.startsWith('H'));
        for (const h of hydrogens) {
            const hPos = new THREE.Vector3();
            h.getWorldPosition(hPos);
            bondsGroup.add(createSolidBond(oPos, hPos));
        }
    }

    return bondsGroup;
}
