"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * HandoverScene — the scroll-driven 3D story on the landing page.
 *
 * Two neighbours live in Palm Meadows. Rahul (Block B) needs a drill,
 * Priya (Block C) has one lying idle. As the visitor scrolls, the exact
 * Jod loop plays out:
 *
 *   01 need posted → 02 community notified → 03 offer made
 *   → 04 courtyard handover → 05 trust grows across the whole society
 *
 * Every visual is a pure function of the scroll progress `p` (0 → 1), so
 * scrolling back up rewinds the story frame by frame. Only small idle
 * motions (breathing, trees swaying, waving) use wall-clock time.
 */

interface HandoverSceneProps {
  /** Scroll progress of the story section, 0 → 1. Read every frame. */
  progress: React.RefObject<number>;
  onReady?: () => void;
  onError?: () => void;
}

// ── Timeline helpers ─────────────────────────────────────────────────────────
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const hump = (p: number, a: number, b: number) => Math.sin(Math.PI * seg(p, a, b));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic PRNG so the neighbourhood looks the same on every visit. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Palette (mirrors globals.css tokens) ─────────────────────────────────────
const COLORS = {
  primary: 0x18af82,
  primarySoft: 0x35d4a4,
  borrow: 0x227ad3,
  amber: 0xf59e0b,
  dayBg: new THREE.Color(0xf4efe6),
  duskBg: new THREE.Color(0x1b2338),
  windowOff: new THREE.Color(0x5b6b7c),
  windowPing: new THREE.Color(0x5eead4),
  windowWarm: new THREE.Color(0xffd27a),
};

// Where things live in the courtyard
const RAHUL_HOME = -5.2;
const PRIYA_HOME = 5.2;
const RAHUL_MEET = -0.72;
const PRIYA_MEET = 0.72;
const PATH_Z = 0.4;

// Camera choreography — one keyframe per chapter; the camera eases
// between them, so it "settles" on each beat of the story.
const CAMERA_KEYS: { p: number; pos: [number, number, number]; look: [number, number, number] }[] = [
  { p: 0.0, pos: [7, 10, 29], look: [0, 1.6, -1] },
  { p: 0.1, pos: [-1.6, 3.4, 10.5], look: [-5.4, 2.2, 0] },
  { p: 0.24, pos: [0, 17, 21], look: [0, 0, -2] },
  { p: 0.36, pos: [5.6, 3.6, 11.5], look: [5.2, 2.4, 0] },
  { p: 0.47, pos: [-0.6, 5.4, 19.5], look: [-1, 3, 0] },
  { p: 0.62, pos: [4.2, 2.8, 9], look: [0, 1.6, 0] },
  { p: 0.74, pos: [2.6, 2.7, 7.4], look: [0, 1.7, 0] },
  { p: 0.84, pos: [-2.4, 3.2, 8.5], look: [-1.2, 1.8, 0] },
  { p: 1.0, pos: [0, 31, 30], look: [0, 0, -3] },
];

// ── Geometry / material builders ─────────────────────────────────────────────
function makeToonGradient() {
  const data = new Uint8Array([90, 170, 255]);
  const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

type Person = ReturnType<typeof makePerson>;

function makePerson(
  toon: (c: number) => THREE.Material,
  look: { shirt: number; pants: number; skin: number; hair: number; ponytail?: boolean }
) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    parent.add(m);
    return m;
  };

  const shirt = toon(look.shirt);
  const pants = toon(look.pants);
  const skin = toon(look.skin);
  const hair = toon(look.hair);
  const dark = toon(0x1f2937);

  const torso = add(new THREE.CapsuleGeometry(0.34, 0.55, 6, 16), shirt, body);
  torso.position.y = 1.2;

  const head = new THREE.Group();
  head.position.y = 1.95;
  body.add(head);
  add(new THREE.SphereGeometry(0.3, 24, 16), skin, head);
  const hairCap = add(
    new THREE.SphereGeometry(0.318, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hair,
    head
  );
  hairCap.rotation.x = -0.35;
  if (look.ponytail) {
    const tail = add(new THREE.SphereGeometry(0.14, 12, 10), hair, head);
    tail.position.set(0, 0.02, -0.34);
    tail.scale.set(1, 1.5, 1);
  }
  for (const side of [-1, 1]) {
    const eye = add(new THREE.SphereGeometry(0.036, 8, 8), dark, head);
    eye.position.set(side * 0.1, 0.02, 0.27);
  }

  const makeLimb = (x: number, y: number, len: number, r: number, mat: THREE.Material, parent: THREE.Object3D) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    parent.add(pivot);
    const limb = add(new THREE.CapsuleGeometry(r, len, 4, 10), mat, pivot);
    limb.position.y = -(len / 2 + r) + 0.05;
    return pivot;
  };

  // The person faces local +z, so their right side is local -x.
  const armR = makeLimb(-0.44, 1.5, 0.45, 0.09, shirt, body);
  const armL = makeLimb(0.44, 1.5, 0.45, 0.09, shirt, body);
  const handR = new THREE.Group();
  const handL = new THREE.Group();
  for (const [arm, hand] of [
    [armR, handR],
    [armL, handL],
  ] as const) {
    const h = add(new THREE.SphereGeometry(0.1, 10, 10), skin, arm);
    h.position.y = -0.64;
    hand.position.y = -0.7;
    arm.add(hand);
  }

  const legR = makeLimb(-0.16, 0.78, 0.42, 0.11, pants, body);
  const legL = makeLimb(0.16, 0.78, 0.42, 0.11, pants, body);
  for (const leg of [legR, legL]) {
    const shoe = add(new THREE.BoxGeometry(0.2, 0.1, 0.3), dark, leg);
    shoe.position.set(0, -0.72, 0.05);
  }

  return { root, body, head, armR, armL, handR, handL, legR, legL };
}

interface Pose {
  phase: number;
  walk: number;
  holdR?: number;
  raiseR?: number;
  reachR?: number;
  armL?: { x: number; z: number; mix: number };
  nod?: number;
  time: number;
}

function posePerson(person: Person, pose: Pose) {
  const swing = Math.sin(pose.phase);
  const w = pose.walk;
  person.legL.rotation.x = swing * 0.62 * w;
  person.legR.rotation.x = -swing * 0.62 * w;

  let r = swing * 0.5 * w;
  r = lerp(r, -0.75, pose.holdR ?? 0);
  r = lerp(r, -2.6, pose.raiseR ?? 0);
  r = lerp(r, -1.45, pose.reachR ?? 0);
  person.armR.rotation.x = r;

  const lSwing = -swing * 0.5 * w;
  const armL = pose.armL;
  person.armL.rotation.x = armL ? lerp(lSwing, armL.x, armL.mix) : lSwing;
  person.armL.rotation.z = armL ? armL.z * armL.mix : 0;

  person.body.position.y = Math.abs(Math.cos(pose.phase)) * 0.07 * w + Math.sin(pose.time * 2.2) * 0.012;
  person.head.rotation.x = (pose.nod ?? 0) * 0.22;
}

/** Speech-bubble sprite drawn on a canvas. Anchored at its tail. */
function makeBubble(title: string, subtitle: string, accent: string) {
  const W = 720;
  const H = 220;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const bx = 12;
  const by = 12;
  const bw = W - 24;
  const bh = 160;
  const r = 44;
  ctx.beginPath();
  ctx.moveTo(bx + r, by);
  ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
  ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
  ctx.lineTo(W / 2 + 26, by + bh);
  ctx.lineTo(W / 2, H - 10);
  ctx.lineTo(W / 2 - 26, by + bh);
  ctx.arcTo(bx, by + bh, bx, by, r);
  ctx.arcTo(bx, by, bx + bw, by, r);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(15, 23, 42, 0.18)";
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 7;
  ctx.strokeStyle = accent;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fit = (text: string, weight: number, size: number) => {
    let s = size;
    do {
      ctx.font = `${weight} ${s}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
      s -= 2;
    } while (ctx.measureText(text).width > bw - 70 && s > 18);
  };
  fit(title, 700, 54);
  ctx.fillStyle = "#1a1714";
  ctx.fillText(title, W / 2, by + 60);
  fit(subtitle, 500, 34);
  ctx.fillStyle = accent;
  ctx.fillText(subtitle, W / 2, by + 118);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.center.set(0.5, 0);
  sprite.renderOrder = 20;
  sprite.userData.baseScale = new THREE.Vector2(3.1, 3.1 * (H / W));
  return sprite;
}

function setBubble(sprite: THREE.Sprite, amount: number) {
  const base = sprite.userData.baseScale as THREE.Vector2;
  const s = Math.max(0.0001, amount);
  sprite.scale.set(base.x * s, base.y * s, 1);
  (sprite.material as THREE.SpriteMaterial).opacity = clamp01(amount);
  sprite.visible = amount > 0.01;
}

/** In, hold, out envelope with a springy pop on the way in. */
function bubbleEnvelope(p: number, inA: number, inB: number, outA: number, outB: number) {
  const tin = seg(p, inA, inB);
  const tout = seg(p, outA, outB);
  return tin <= 0 ? 0 : outBack(tin) * (1 - smooth(tout));
}

function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSignTexture(line1: string, line2: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 160;
  const g = c.getContext("2d")!;
  g.fillStyle = "#1f2937";
  g.beginPath();
  g.roundRect(0, 0, 512, 160, 28);
  g.fill();
  g.textAlign = "center";
  g.fillStyle = "#ffffff";
  g.font = "800 64px ui-sans-serif, system-ui, sans-serif";
  g.fillText(line1, 256, 78);
  g.fillStyle = "#5eead4";
  g.font = "600 34px ui-sans-serif, system-ui, sans-serif";
  g.fillText(line2, 256, 130);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeArcTube(from: THREE.Vector3, to: THREE.Vector3, lift: number, radius: number, color: number) {
  const mid = from.clone().lerp(to, 0.5);
  mid.y += lift;
  const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
  const segments = 96;
  const radial = 8;
  const geo = new THREE.TubeGeometry(curve, segments, radius, radial, false);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, toneMapped: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 5;
  const setDrawn = (t: number) => {
    geo.setDrawRange(0, Math.floor(segments * clamp01(t)) * radial * 6);
    mesh.visible = t > 0.001;
  };
  setDrawn(0);
  return { mesh, curve, mat, setDrawn };
}

// ── Component ────────────────────────────────────────────────────────────────
export function HandoverScene({ progress, onReady, onError }: HandoverSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onReady, onError });
  useEffect(() => {
    callbacks.current = { onReady, onError };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      callbacks.current.onError?.();
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 768;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    scene.background = COLORS.dayBg.clone();
    scene.fog = new THREE.Fog(COLORS.dayBg.clone(), 38, 85);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0xd8cfc0, 1.7);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2.3);
    sun.position.set(-10, 18, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(isSmall ? 1024 : 2048, isSmall ? 1024 : 2048);
    const sc = sun.shadow.camera;
    sc.left = -24;
    sc.right = 24;
    sc.top = 24;
    sc.bottom = -24;
    sc.near = 1;
    sc.far = 60;
    sun.shadow.bias = -0.0005;
    sun.shadow.radius = 4;
    scene.add(sun);

    const gradientMap = makeToonGradient();
    const matCache = new Map<number, THREE.Material>();
    // Icosahedron crowns are non-indexed, so they shade faceted without flatShading.
    const toon = (color: number) => {
      let m = matCache.get(color);
      if (!m) {
        m = new THREE.MeshToonMaterial({ color, gradientMap });
        matCache.set(color, m);
      }
      return m;
    };
    const rand = mulberry32(42);
    const glowTex = makeGlowTexture();

    // ── Ground, courtyard & the community boundary ──
    const ground = new THREE.Mesh(new THREE.CircleGeometry(26, 96), toon(0xe9ecdf));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const path = new THREE.Mesh(new THREE.PlaneGeometry(13, 2.4), toon(0xe0d8c8));
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.01, PATH_Z);
    path.receiveShadow = true;
    scene.add(path);

    const plaza = new THREE.Mesh(new THREE.CircleGeometry(2.4, 48), toon(0xd3e9dd));
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0.015, PATH_Z);
    plaza.receiveShadow = true;
    scene.add(plaza);

    const BOUNDARY_R = 21;
    const boundaryRing = new THREE.Mesh(
      new THREE.TorusGeometry(BOUNDARY_R, 0.07, 8, 240),
      new THREE.MeshBasicMaterial({ color: COLORS.primary, transparent: true, toneMapped: false })
    );
    boundaryRing.rotation.x = -Math.PI / 2;
    boundaryRing.position.y = 0.05;
    scene.add(boundaryRing);

    const boundaryWallMat = new THREE.MeshBasicMaterial({
      color: COLORS.primarySoft,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const boundaryWall = new THREE.Mesh(
      new THREE.CylinderGeometry(BOUNDARY_R, BOUNDARY_R, 1.6, 160, 1, true),
      boundaryWallMat
    );
    boundaryWall.position.y = 0.8;
    scene.add(boundaryWall);

    // ── Buildings with instanced windows ──
    interface WindowInfo {
      dist: number;
      warm: boolean;
      jitter: number;
    }
    const windowMatrices: THREE.Matrix4[] = [];
    const windowInfo: WindowInfo[] = [];
    const rahulHomeV = new THREE.Vector3(RAHUL_HOME, 0, PATH_Z);
    const buildingDoors: THREE.Vector3[] = [];

    const addBuilding = (
      x: number,
      z: number,
      w: number,
      h: number,
      d: number,
      color: number,
      opts: { sign?: [string, string]; faceCenter?: boolean } = {}
    ) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      if (opts.faceCenter) g.rotation.y = Math.atan2(-x, -z + 4);
      scene.add(g);

      const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(color));
      block.position.y = h / 2;
      block.castShadow = true;
      block.receiveShadow = true;
      g.add(block);

      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.3, d + 0.3), toon(0x4b5563));
      roof.position.y = h + 0.15;
      roof.castShadow = true;
      g.add(roof);

      if (rand() > 0.4) {
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.8, 14), toon(0x9ca3af));
        tank.position.set((rand() - 0.5) * (w - 1.2), h + 0.7, (rand() - 0.5) * (d - 1.2));
        tank.castShadow = true;
        g.add(tank);
      }

      const door = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.5), toon(0x374151));
      door.position.set(0, 0.75, d / 2 + 0.01);
      g.add(door);

      if (opts.sign) {
        const sign = new THREE.Mesh(
          new THREE.PlaneGeometry(1.9, 0.6),
          new THREE.MeshBasicMaterial({ map: makeSignTexture(...opts.sign), transparent: true })
        );
        sign.position.set(0, 1.95, d / 2 + 0.02);
        g.add(sign);
      }

      g.updateMatrixWorld(true);
      buildingDoors.push(new THREE.Vector3(0, 0.1, d / 2 + 0.6).applyMatrix4(g.matrixWorld));

      const cols = Math.max(2, Math.floor((w - 0.6) / 0.85));
      const rows = Math.max(2, Math.floor((h - 2.4) / 1.1));
      const cellW = (w - 0.6) / cols;
      const cellH = (h - 2.7) / rows;
      const local = new THREE.Matrix4();
      const worldPos = new THREE.Vector3();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          local.makeTranslation(-w / 2 + 0.3 + (c + 0.5) * cellW, 2.6 + (r + 0.5) * cellH, d / 2 + 0.02);
          const m = new THREE.Matrix4().multiplyMatrices(g.matrixWorld, local);
          windowMatrices.push(m);
          worldPos.setFromMatrixPosition(m);
          windowInfo.push({ dist: worldPos.distanceTo(rahulHomeV), warm: rand() > 0.28, jitter: rand() });
        }
      }
      return g;
    };

    // Rahul's and Priya's blocks, facing the courtyard
    addBuilding(-8.6, -3.8, 4.6, 8.5, 4, 0xc9d6e8, { sign: ["BLOCK B", "Rahul · B-402"] });
    addBuilding(8.6, -3.8, 4.6, 7.4, 4, 0xecdcc8, { sign: ["BLOCK C", "Priya · C-101"] });
    // The rest of the society, arranged around the courtyard
    const palette = [0xd9e4dd, 0xe8d5d5, 0xdcd6ea, 0xf0e3c4, 0xcfe0ea, 0xe2e8d0];
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (0.14 + (i / 8) * 0.72);
      const radius = 15.5 + rand() * 2;
      addBuilding(
        Math.cos(a) * radius,
        -Math.sin(a) * radius * 0.78 - 3,
        3 + rand() * 1.8,
        5 + rand() * 7,
        3 + rand(),
        palette[i % palette.length],
        { faceCenter: true }
      );
    }
    // A few low blocks in the foreground corners so the society wraps around
    addBuilding(-15.5, 7.5, 3.4, 4.2, 3, 0xe8d5d5, { faceCenter: true });
    addBuilding(15.5, 7.5, 3.4, 4.8, 3, 0xd9e4dd, { faceCenter: true });

    const maxWindowDist = Math.max(...windowInfo.map((w) => w.dist));
    const windowMesh = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.42, 0.56),
      new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
      windowMatrices.length
    );
    windowMatrices.forEach((m, i) => {
      windowMesh.setMatrixAt(i, m);
      windowMesh.setColorAt(i, COLORS.windowOff);
    });
    scene.add(windowMesh);

    // ── Trees & lamps ──
    const trees: THREE.Object3D[] = [];
    const treeSpots: [number, number][] = [
      [-12.5, 3.5], [-3.4, -5.2], [3.2, -6], [12.5, 4], [-14.5, -0.5], [14.2, -0.8],
      [-10.5, 7.5], [10.5, 8], [0.4, -9.5], [-6.4, -8.2], [6.6, -9], [-13, 9.5], [13, 10.5],
    ];
    for (const [x, z] of treeSpots) {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);
      const s = 0.8 + rand() * 0.6;
      tree.scale.setScalar(s);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, 1.1, 8), toon(0x8b5e3c));
      trunk.position.y = 0.55;
      trunk.castShadow = true;
      tree.add(trunk);
      const crown = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.95, 0),
        toon([0x6fbf73, 0x57a773, 0x86c77a][Math.floor(rand() * 3)])
      );
      crown.position.y = 1.75;
      crown.castShadow = true;
      tree.add(crown);
      scene.add(tree);
      trees.push(crown);
    }

    const lampBulbs: THREE.Mesh[] = [];
    const lampGlows: THREE.Sprite[] = [];
    for (const [x, z] of [[-3, 1.9], [3, 1.9], [0, -2.1]] as const) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.6, 8), toon(0x374151));
      pole.position.set(x, 1.3, z);
      pole.castShadow = true;
      scene.add(pole);
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xe5e7eb, toneMapped: false })
      );
      bulb.position.set(x, 2.68, z);
      scene.add(bulb);
      lampBulbs.push(bulb);
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: glowTex, color: 0xffc766, transparent: true, depthWrite: false, opacity: 0 })
      );
      glow.position.copy(bulb.position);
      glow.scale.setScalar(2.4);
      scene.add(glow);
      lampGlows.push(glow);
    }

    // ── The two neighbours ──
    const rahul = makePerson(toon, { shirt: COLORS.borrow, pants: 0x2b3445, skin: 0xf1c7a1, hair: 0x2a1f1a });
    rahul.root.position.set(RAHUL_HOME, 0, PATH_Z);
    scene.add(rahul.root);

    const priya = makePerson(toon, {
      shirt: COLORS.primary,
      pants: 0x3f3a52,
      skin: 0xdca47e,
      hair: 0x1a1210,
      ponytail: true,
    });
    priya.root.position.set(PRIYA_HOME, 0, PATH_Z);
    scene.add(priya.root);

    // Rahul's phone (he posts the need from it)
    const phone = new THREE.Group();
    const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.26, 0.03), toon(0x111827));
    phone.add(phoneBody);
    const phoneScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.13, 0.22),
      new THREE.MeshBasicMaterial({ color: COLORS.primarySoft, toneMapped: false })
    );
    phoneScreen.position.z = 0.017;
    phone.add(phoneScreen);
    phone.rotation.x = Math.PI / 2;
    phone.position.set(0, -0.05, 0.06);
    rahul.handL.add(phone);

    // The need "packet" that leaves the phone and reaches the community
    const packet = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex, color: COLORS.primarySoft, transparent: true, depthWrite: false })
    );
    packet.scale.setScalar(0.9);
    scene.add(packet);

    // The drill — the item being lent
    const drill = new THREE.Group();
    {
      const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.46), toon(COLORS.amber));
      bodyMesh.position.set(0, 0.16, 0.1);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.3, 0.14), toon(0x374151));
      grip.position.set(0, -0.02, 0);
      const battery = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.22), toon(0x1f2937));
      battery.position.set(0, -0.2, 0.02);
      const chuck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 12), toon(0x4b5563));
      chuck.rotation.x = Math.PI / 2;
      chuck.position.set(0, 0.16, 0.39);
      const bit = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.24, 8), toon(0xd1d5db));
      bit.rotation.x = Math.PI / 2;
      bit.position.set(0, 0.16, 0.56);
      for (const m of [bodyMesh, grip, battery, chuck, bit]) {
        m.castShadow = true;
        drill.add(m);
      }
    }
    drill.scale.setScalar(1.15);
    scene.add(drill);
    const drillGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex, color: 0xffd27a, transparent: true, depthWrite: false, opacity: 0 })
    );
    drillGlow.scale.setScalar(1.6);
    scene.add(drillGlow);

    // ── Speech bubbles ──
    const needBubble = makeBubble("Need a cordless drill", "Borrow · Tomorrow 9 AM – 1 PM", "#227ad3");
    const offerBubble = makeBubble("I have one! 🙋‍♀️", "Free to lend · C-101", "#18af82");
    const trustBubble = makeBubble("Handover done ✓", "+1 trust for both neighbours", "#18af82");
    const returnBubble = makeBubble("Return by 1 PM", "Jod reminds Rahul automatically", "#f59e0b");
    for (const b of [needBubble, offerBubble, trustBubble, returnBubble]) scene.add(b);

    // ── Ripples: the need reaching every verified neighbour ──
    const ripples: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.92, 1, 96),
        new THREE.MeshBasicMaterial({
          color: COLORS.primary,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          toneMapped: false,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(RAHUL_HOME, 0.04, PATH_Z);
      scene.add(ring);
      ripples.push(ring);
    }

    // ── The "jod" arc between the two homes ──
    const jodArc = makeArcTube(
      new THREE.Vector3(RAHUL_HOME, 2.4, PATH_Z),
      new THREE.Vector3(PRIYA_HOME, 2.4, PATH_Z),
      4.2,
      0.06,
      COLORS.primary
    );
    scene.add(jodArc.mesh);
    const arcHead = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex, color: COLORS.primarySoft, transparent: true, depthWrite: false })
    );
    arcHead.scale.setScalar(1.1);
    scene.add(arcHead);

    // ── Finale: the same loop happening all over the society ──
    const networkRand = mulberry32(7);
    const network: { arc: ReturnType<typeof makeArcTube>; dot: THREE.Sprite; start: number; speed: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const a = buildingDoors[Math.floor(networkRand() * buildingDoors.length)];
      let b = buildingDoors[Math.floor(networkRand() * buildingDoors.length)];
      if (a === b) b = buildingDoors[(buildingDoors.indexOf(a) + 3) % buildingDoors.length];
      const arc = makeArcTube(
        a,
        b,
        2.5 + a.distanceTo(b) * 0.28,
        0.07,
        [COLORS.primary, COLORS.borrow, COLORS.amber, 0x8b5cf6][i % 4]
      );
      scene.add(arc.mesh);
      const dot = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, opacity: 0 })
      );
      dot.scale.setScalar(1.2);
      scene.add(dot);
      network.push({ arc, dot, start: 0.855 + i * 0.0075, speed: 0.18 + networkRand() * 0.2 });
    }

    // ── Celebration burst at the handover ──
    const BURST = 110;
    const burstGeo = new THREE.BufferGeometry();
    const burstPos = new Float32Array(BURST * 3);
    const burstCol = new Float32Array(BURST * 3);
    const burstDir: THREE.Vector3[] = [];
    const burstPalette = [COLORS.primary, COLORS.primarySoft, COLORS.amber, 0xf472b6, COLORS.borrow].map(
      (c) => new THREE.Color(c)
    );
    const burstRand = mulberry32(99);
    for (let i = 0; i < BURST; i++) {
      const theta = burstRand() * Math.PI * 2;
      const up = 0.35 + burstRand() * 0.9;
      burstDir.push(
        new THREE.Vector3(Math.cos(theta), up, Math.sin(theta)).normalize().multiplyScalar(1.6 + burstRand() * 2.6)
      );
      const c = burstPalette[i % burstPalette.length];
      burstCol.set([c.r, c.g, c.b], i * 3);
    }
    burstGeo.setAttribute("position", new THREE.BufferAttribute(burstPos, 3));
    burstGeo.setAttribute("color", new THREE.BufferAttribute(burstCol, 3));
    const burstMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
    });
    const burst = new THREE.Points(burstGeo, burstMat);
    burst.frustumCulled = false;
    scene.add(burst);

    // ── Dusk sky ──
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(500 * 3);
    const starRand = mulberry32(3);
    for (let i = 0; i < 500; i++) {
      const th = starRand() * Math.PI * 2;
      const ph = starRand() * Math.PI * 0.42;
      const r = 70;
      starPos.set([Math.cos(th) * Math.sin(ph) * r, Math.cos(ph) * r * 0.6 + 8, Math.sin(th) * Math.sin(ph) * r], i * 3);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.35, color: 0xffffff, transparent: true, opacity: 0, fog: false });
    scene.add(new THREE.Points(starGeo, starMat));

    // ── Sizing ──
    let width = 1;
    let height = 1;
    const resize = () => {
      width = container.clientWidth || 1;
      height = container.clientHeight || 1;
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = width / height;
      camera.fov = camera.aspect < 1 ? 58 : 42;
      // On wide screens the story copy sits on the left, so shift the
      // frustum to push the action into the right-hand side.
      if (width >= 1024) camera.setViewOffset(width, height, -width * 0.14, 0, width, height);
      else camera.setViewOffset(width, height, 0, height * 0.14, width, height);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // ── Pointer parallax ──
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Only render while the story is on screen
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    io.observe(container);

    // ── Per-frame update ──
    const camPos = new THREE.Vector3();
    const camLook = new THREE.Vector3();
    const tmpA = new THREE.Vector3();
    const tmpB = new THREE.Vector3();
    const tmpColor = new THREE.Color();
    const meetPoint = new THREE.Vector3(0, 1.9, PATH_Z);

    const cameraAt = (p: number) => {
      let i = 0;
      while (i < CAMERA_KEYS.length - 2 && p > CAMERA_KEYS[i + 1].p) i++;
      const a = CAMERA_KEYS[i];
      const b = CAMERA_KEYS[i + 1];
      const t = inOut(seg(p, a.p, b.p));
      camPos.set(lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t));
      camLook.set(lerp(a.look[0], b.look[0], t), lerp(a.look[1], b.look[1], t), lerp(a.look[2], b.look[2], t));
    };

    const update = (p: number, time: number) => {
      const idle = reducedMotion ? 0 : time;

      // Camera
      cameraAt(p);
      if (camera.aspect < 1) {
        // Portrait: pull back so both neighbours stay in frame
        tmpA.subVectors(camPos, camLook).multiplyScalar(1.35);
        camPos.copy(camLook).add(tmpA);
      }
      pointer.sx += (pointer.x - pointer.sx) * 0.05;
      pointer.sy += (pointer.y - pointer.sy) * 0.05;
      camera.position.set(camPos.x + pointer.sx * 0.9, camPos.y - pointer.sy * 0.45, camPos.z);
      camera.lookAt(camLook);

      // Day → dusk as the loop completes and the whole society lights up
      const dusk = smooth(seg(p, 0.84, 0.97));
      (scene.background as THREE.Color).lerpColors(COLORS.dayBg, COLORS.duskBg, dusk);
      scene.fog!.color.copy(scene.background as THREE.Color);
      hemi.intensity = lerp(1.7, 0.55, dusk);
      sun.intensity = lerp(2.3, 0.7, dusk);
      sun.color.setHex(0xffffff).lerp(tmpColor.setHex(0xff9a5c), dusk);
      starMat.opacity = dusk * 0.9;
      lampGlows.forEach((g, i) => {
        (g.material as THREE.SpriteMaterial).opacity = dusk * (0.85 + Math.sin(idle * 3 + i) * 0.1);
      });
      lampBulbs.forEach((b) => (b.material as THREE.MeshBasicMaterial).color.setHex(0xe5e7eb).lerp(tmpColor.setHex(0xffd27a), dusk));

      // Boundary pulses while the need is broadcast (only members inside hear it)
      const broadcast = hump(p, 0.13, 0.34);
      (boundaryRing.material as THREE.MeshBasicMaterial).opacity = 0.45 + broadcast * 0.55 + dusk * 0.4;
      boundaryWallMat.opacity = 0.05 + broadcast * 0.16 + dusk * 0.08;

      // ── Rahul ──
      const rahulGo = inOut(seg(p, 0.5, 0.66));
      const rahulBack = inOut(seg(p, 0.845, 0.95));
      const rahulX = lerp(lerp(RAHUL_HOME, RAHUL_MEET, rahulGo), RAHUL_HOME, rahulBack);
      const walkEnv = (s: number) => (s > 0 && s < 1 ? Math.min(1, Math.sin(Math.PI * s) * 2.2) : 0);
      const rahulSegGo = seg(p, 0.5, 0.66);
      const rahulSegBack = seg(p, 0.845, 0.95);
      rahul.root.position.x = rahulX;
      let rahulRot = lerp(0.3, Math.PI / 2, smooth(seg(p, 0.28, 0.34)));
      rahulRot = lerp(rahulRot, -Math.PI / 2, smooth(seg(p, 0.815, 0.85)));
      rahulRot = lerp(rahulRot, 0.15, smooth(seg(p, 0.95, 0.99)));
      rahul.root.rotation.y = rahulRot;
      const phoneUp = smooth(seg(p, 0.015, 0.05)) * (1 - smooth(seg(p, 0.14, 0.18)));
      phone.visible = p < 0.2;
      (phoneScreen.material as THREE.MeshBasicMaterial).color
        .setHex(0x94a3b8)
        .lerp(tmpColor.setHex(COLORS.primarySoft), smooth(seg(p, 0.06, 0.09)));
      const handoverReach = smooth(seg(p, 0.66, 0.71)) * (1 - smooth(seg(p, 0.77, 0.81)));
      const rahulHold = smooth(seg(p, 0.74, 0.78));
      posePerson(rahul, {
        phase: (rahulGo + rahulBack) * 4.5 * 3.1,
        walk: Math.max(walkEnv(rahulSegGo), walkEnv(rahulSegBack)),
        holdR: rahulHold,
        reachR: handoverReach,
        raiseR: smooth(seg(p, 0.955, 1)) * 0.5,
        armL: { x: -1.35, z: -0.4, mix: phoneUp },
        nod: hump(p, 0.7, 0.8),
        time: idle,
      });

      // ── Priya ──
      const priyaGo = inOut(seg(p, 0.49, 0.66));
      priya.root.position.x = lerp(PRIYA_HOME, PRIYA_MEET, priyaGo);
      let priyaRot = lerp(-0.3, -Math.PI / 2, smooth(seg(p, 0.3, 0.36)));
      priyaRot = lerp(priyaRot, -0.2, smooth(seg(p, 0.84, 0.9)));
      priya.root.rotation.y = priyaRot;
      const offerRaise = smooth(seg(p, 0.36, 0.42)) * (1 - smooth(seg(p, 0.46, 0.5)));
      const wave = smooth(seg(p, 0.86, 0.9));
      posePerson(priya, {
        phase: priyaGo * 4.5 * 3.1,
        walk: walkEnv(seg(p, 0.49, 0.66)),
        holdR: 1 - smooth(seg(p, 0.74, 0.78)),
        raiseR: offerRaise,
        reachR: handoverReach,
        armL: { x: -2.75, z: 0.25 + Math.sin(idle * 9) * 0.28, mix: wave },
        nod: hump(p, 0.7, 0.8),
        time: idle + 1.3,
      });

      scene.updateMatrixWorld();

      // ── The drill changes hands ──
      const transfer = inOut(seg(p, 0.715, 0.755));
      priya.handR.getWorldPosition(tmpA);
      rahul.handR.getWorldPosition(tmpB);
      drill.position.lerpVectors(tmpA, tmpB, transfer);
      drill.position.y += Math.sin(Math.PI * transfer) * 0.35;
      drill.rotation.y = lerp(priyaRot, rahulRot, transfer);
      drillGlow.position.copy(drill.position);
      (drillGlow.material as THREE.SpriteMaterial).opacity = hump(p, 0.36, 0.5) * 0.9 + hump(p, 0.7, 0.8) * 0.9;

      // ── Need packet: phone → sky ──
      const packetT = seg(p, 0.075, 0.135);
      rahul.handL.getWorldPosition(tmpA);
      packet.position.set(tmpA.x, lerp(tmpA.y, 9, smooth(packetT)), tmpA.z);
      packet.visible = packetT > 0 && packetT < 1;
      (packet.material as THREE.SpriteMaterial).opacity = 1 - packetT * 0.6;

      // ── Ripples + windows ping as each home is notified ──
      ripples.forEach((ring, i) => {
        const t = seg(p, 0.13 + i * 0.035, 0.29 + i * 0.035);
        ring.scale.setScalar(0.3 + t * (BOUNDARY_R - 0.3));
        ring.visible = t > 0 && t < 1;
        (ring.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.85;
      });
      for (let i = 0; i < windowInfo.length; i++) {
        const w = windowInfo[i];
        const reachAt = 0.14 + (w.dist / maxWindowDist) * 0.19;
        const ping = smooth(seg(p, reachAt, reachAt + 0.015)) * (1 - smooth(seg(p, 0.4, 0.5)) * 0.85);
        tmpColor.copy(COLORS.windowOff).lerp(COLORS.windowPing, ping);
        if (w.warm) tmpColor.lerp(COLORS.windowWarm, smooth(seg(p, 0.85 + w.jitter * 0.08, 0.87 + w.jitter * 0.08)));
        windowMesh.setColorAt(i, tmpColor);
      }
      windowMesh.instanceColor!.needsUpdate = true;

      // ── The jod arc ──
      const arcDraw = inOut(seg(p, 0.38, 0.47));
      jodArc.setDrawn(arcDraw);
      jodArc.mat.opacity = 1 - smooth(seg(p, 0.55, 0.64)) * 0.85;
      const arcHeadVisible = arcDraw > 0 && arcDraw < 1;
      arcHead.visible = arcHeadVisible;
      if (arcHeadVisible) arcHead.position.copy(jodArc.curve.getPoint(arcDraw));

      // ── Bubbles follow their neighbour's head ──
      rahul.head.getWorldPosition(tmpA);
      needBubble.position.set(tmpA.x, tmpA.y + 0.55, tmpA.z);
      setBubble(needBubble, bubbleEnvelope(p, 0.1, 0.13, 0.47, 0.52));
      returnBubble.position.set(tmpA.x, tmpA.y + 0.55, tmpA.z);
      setBubble(returnBubble, bubbleEnvelope(p, 0.9, 0.93, 1.1, 1.2));
      priya.head.getWorldPosition(tmpA);
      offerBubble.position.set(tmpA.x, tmpA.y + 0.55, tmpA.z);
      setBubble(offerBubble, bubbleEnvelope(p, 0.36, 0.39, 0.6, 0.65));
      const trustT = seg(p, 0.76, 0.86);
      trustBubble.position.set(0, 3 + smooth(trustT) * 0.8, PATH_Z);
      setBubble(trustBubble, bubbleEnvelope(p, 0.76, 0.79, 0.83, 0.87) * 0.85);

      // ── Celebration burst ──
      const bt = seg(p, 0.752, 0.85);
      burst.visible = bt > 0 && bt < 1;
      if (burst.visible) {
        for (let i = 0; i < BURST; i++) {
          const d = burstDir[i];
          burstPos[i * 3] = meetPoint.x + d.x * bt * 1.2;
          burstPos[i * 3 + 1] = meetPoint.y + d.y * bt * 1.6 - 3.2 * bt * bt;
          burstPos[i * 3 + 2] = meetPoint.z + d.z * bt * 1.2;
        }
        burstGeo.attributes.position.needsUpdate = true;
        burstMat.opacity = 1 - bt;
      }

      // ── Finale network ──
      for (const n of network) {
        const drawn = inOut(seg(p, n.start, n.start + 0.05));
        n.arc.setDrawn(drawn);
        n.arc.mat.opacity = 0.9;
        const dm = n.dot.material as THREE.SpriteMaterial;
        dm.opacity = drawn >= 1 ? 1 : 0;
        if (drawn >= 1) n.dot.position.copy(n.arc.curve.getPoint((idle * n.speed + n.start * 40) % 1));
      }

      // ── Idle life ──
      trees.forEach((crown, i) => {
        crown.rotation.z = Math.sin(idle * 1.2 + i) * 0.04;
      });
    };

    let shown = progress.current ?? 0;
    let raf = 0;
    let readyFired = false;
    const clock = new THREE.Clock();

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!onScreen && readyFired) return;
      const target = progress.current ?? 0;
      shown += (target - shown) * (reducedMotion ? 1 : 0.1);
      if (Math.abs(target - shown) < 0.00005) shown = target;
      update(shown, clock.getElapsedTime());
      renderer.render(scene, camera);
      if (!readyFired) {
        readyFired = true;
        callbacks.current.onReady?.();
      }
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (mesh as { material?: THREE.Material | THREE.Material[] }).material;
        for (const m of Array.isArray(mat) ? mat : mat ? [mat] : []) {
          const map = (m as THREE.MeshBasicMaterial).map;
          if (map) map.dispose();
          m.dispose();
        }
      });
      gradientMap.dispose();
      glowTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress]);

  return <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />;
}
