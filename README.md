# [Al(H₂O)₆]³⁺ Hydrolysis — 3D Visualization

> **Interactive Three.js visualization of metal cation hydrolysis**, designed to bridge the "reality gap" in chemistry education by showing *why* dissolved Al³⁺ makes a solution acidic.

$$[Al(H_2O)_6]^{3+} + H_2O \rightleftharpoons [Al(H_2O)_5OH]^{2+} + H_3O^+$$

![License](https://img.shields.io/badge/license-MIT-blue)
![Three.js](https://img.shields.io/badge/Three.js-r170-049EF4)
![Vite](https://img.shields.io/badge/Vite-6-646CFF)

---

## 🎯 Pedagogical Goal

Most students learn that "Al³⁺ dissolves in water" but never see **why the solution becomes acidic**. This tool uses progressive disclosure across four animated stages to reveal the mechanism:

| Stage | Concept | Key Visual |
|-------|---------|------------|
| **0 — Complex** | The octahedral aqua complex exists | Al³⁺ surrounded by 6 coordinated water molecules |
| **1 — Dissolution** | Ionic lattice breaks apart | Lattice spheres explode outward |
| **2 — Hydration** | Water molecules coordinate to Al³⁺ | 6 H₂O converge with O (δ−) facing the cation |
| **3 — Hydrolysis** | Polarisation weakens an O–H bond | Electron density "heat map" stretches toward Al; H⁺ detaches → H₃O⁺ |

The **"aha!" moment** is Stage 3: the high charge density of Al³⁺ ($\text{charge}/\text{radius}$ ratio) polarises the O–H bond enough for the proton to leave — visually explained by an intensifying glow.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Rendering** | [Three.js](https://threejs.org/) r170 | WebGL scene, materials, controls |
| **Animation** | [GSAP](https://greensock.com/gsap/) 3.12 | Smooth stage transitions & tweening |
| **Build Tool** | [Vite](https://vitejs.dev/) 6 | HMR dev server, ES module bundling |
| **Interaction** | OrbitControls + Raycaster | 360° rotation, zoom, click-to-inspect |

---

## 📁 Project Structure

```
metal-cation-hydrolysis-3d-visualization/
├── index.html              # HTML shell — canvas + UI overlay
├── package.json
├── vite.config.js
└── src/
    ├── main.js             # Scene, camera, lights, OrbitControls, render loop
    ├── atoms.js            # Al³⁺ center + 6 octahedral H₂O molecules
    ├── bonds.js            # Dashed coordination bonds + solid covalent bonds
    ├── materials.js        # Centralised MeshStandardMaterial palette
    ├── interaction.js      # Raycaster click-to-highlight + info panel
    └── styles.css          # Glassmorphism overlay UI
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Install & Run

```bash
# Clone the repository
git clone <repo-url>
cd metal-cation-hydrolysis-3d-visualization

# Install dependencies
npm install

# Start the dev server (opens http://localhost:3000)
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview    # preview the production build locally
```

---

## ✅ Current Progress

### Implemented

- [x] **Al³⁺ metal center** — Silver metallic sphere at the origin (`MeshStandardMaterial`, metalness `0.7`)
- [x] **6 octahedral water molecules** — Positioned along ±x, ±y, ±z at 1.90 Å (Al–O bond length); oxygen lone-pair faces Al; H atoms at 104.5° bond angle
- [x] **Coordination bonds (Al ← O)** — `LineDashedMaterial` visually distinguishes coordination from covalent bonds
- [x] **Covalent bonds (O–H)** — `LineBasicMaterial` solid lines
- [x] **360° orbit controls** — `OrbitControls` with inertial damping, gentle auto-rotate, min/max zoom
- [x] **Click-to-highlight** — `Raycaster` selects any atom → gold highlight + info panel showing element, role, and charge
- [x] **Stage navigation UI** — 4 buttons wired (Complex → Dissolution → Hydration → Hydrolysis)
- [x] **3-point lighting** — Warm key light, cool fill light, rim backlight + ACES filmic tone mapping
- [x] **Electron density utility** — `createElectronDensityVariant()` ready for the heat-map glow effect
- [x] **Responsive layout** — Full-viewport canvas with resize handler

### Colour Palette

| Element / Feature | Colour | Hex |
|-------------------|--------|-----|
| Al³⁺ center | Silver | `#C0C0C0` |
| Oxygen | Red | `#E23C3C` |
| Hydrogen | White | `#FFFFFF` |
| Coordination bonds | Pale blue | `#88BBEE` |
| Covalent bonds | Grey | `#999999` |
| Highlight (click) | Gold | `#FFCC00` |
| Electron density glow | Orange-red | `#FF6633` |
| Scene background | Deep navy | `#0A0E17` |

### Physical Constants Used

| Parameter | Value | Source |
|-----------|-------|--------|
| Al–O bond length | 1.90 Å | Experimental crystal data |
| O–H bond length | 0.96 Å | Gas-phase water geometry |
| H–O–H angle | 104.5° | VSEPR / experimental |
| Sphere radii | vdW ÷ 3 | Scaled for visual clarity |

---

## 🔮 Next Steps

### Stage Animations (GSAP)

The stage button handler in `main.js` has a `TODO` block ready for GSAP timeline implementations:

```
Stage 0 — Complex      →  Reset to default octahedral view
Stage 1 — Dissolution  →  Explode a lattice of ions outward
Stage 2 — Hydration    →  Animate 6 H₂O converging with correct dipole orientation
Stage 3 — Hydrolysis   →  Intensify electron-density glow; detach H⁺ → form H₃O⁺
```

### Planned Features

- [ ] **GSAP stage transitions** — Smooth tweened animations between all 4 states
- [ ] **Electron density `ShaderMaterial`** — Vertex/fragment shader for a real-time "heat map" glow around O atoms that intensifies as polarisation increases
- [ ] **Lattice model (Stage 1)** — Al₂O₃ or AlCl₃ crystal lattice that dissolves
- [ ] **Free water molecule (Stage 3)** — Floating H₂O that accepts the departing proton to become H₃O⁺
- [ ] **Camera path animations** — GSAP-driven camera flythrough for each stage transition
- [ ] **Atom labels** — CSS2DRenderer or sprite-based labels (element symbols, partial charges)
- [ ] **Touch support** — Mobile-friendly pinch-to-zoom and swipe gestures
- [ ] **Accessibility** — Keyboard navigation between atoms, ARIA labels on UI controls
- [ ] **PDB/OBJ import** — Load molecular geometry from Avogadro/ChemSketch exports via `PDBLoader`
- [ ] **Export/Share** — Screenshot to PNG, shareable URL with stage state encoded

---

## 🧪 Chemistry Reference

### Why Does Al³⁺ Make Water Acidic?

1. **High charge density** — Al³⁺ has a small ionic radius (0.535 Å) with a +3 charge, giving it one of the highest charge/radius ratios of any common cation.
2. **Polarisation** — This intense electric field pulls electron density from the coordinated water molecules toward the metal center.
3. **O–H bond weakening** — As electron density shifts toward Al, the O–H bonds in the coordinated water become weaker.
4. **Proton release** — One H⁺ can dissociate from a coordinated water and transfer to a free water molecule, forming H₃O⁺.

This is the fundamental mechanism that Stage 3 of the visualization aims to make *visible*.

### Key Misconception Addressed

> "Al³⁺ is a metal ion, so its solution should be neutral."

In reality, highly charged metal cations act as **Lewis acids** — they accept electron density from water's lone pairs so strongly that they facilitate proton release. The visualization shows this polarisation effect directly.

---

## 📜 License

[MIT](LICENSE)
