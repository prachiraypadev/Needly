"use client";

import { useEffect, useRef, useState } from "react";
import { KeyRound, LogOut, ShieldAlert, ShieldCheck } from "lucide-react";

/**
 * TrustBoundary — an interactive picture of how Jod communities work.
 *
 * Green dots are verified members: they drift inside the boundary, link up
 * with nearby neighbours and pass little parcels along those links.
 * Grey dots are strangers: they can wander right up to the edge but bounce
 * off it. Your cursor is a stranger too — until you use an invite code.
 */

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface Parcel {
  a: number;
  b: number;
  t: number;
  color: string;
}

interface Flash {
  angle: number;
  life: number;
}

const INVITE = "NEED-XY3Z";
const PARCEL_COLORS = ["#227ad3", "#8b5cf6", "#f59e0b", "#18af82"];

export function TrustBoundary() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const verifiedRef = useRef(false);
  const [verified, setVerified] = useState(false);
  const [typed, setTyped] = useState("");
  const [blocked, setBlocked] = useState(0);
  const typingRef = useRef<number | null>(null);

  useEffect(() => {
    verifiedRef.current = verified;
  }, [verified]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let cx = 0;
    let cy = 0;
    let R = 0;
    const members: Dot[] = [];
    const strangers: Dot[] = [];
    const parcels: Parcel[] = [];
    const flashes: Flash[] = [];
    const you = { x: -999, y: -999, tx: -999, ty: -999, active: false, inside: false };
    let blockedCount = 0;

    const spawn = () => {
      members.length = 0;
      strangers.length = 0;
      for (let i = 0; i < 34; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.sqrt(Math.random()) * (R - 14);
        members.push({
          x: cx + Math.cos(a) * d,
          y: cy + Math.sin(a) * d,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 3 + Math.random() * 2,
        });
      }
      for (let i = 0; i < 16; i++) {
        let x = 0;
        let y = 0;
        do {
          x = Math.random() * W;
          y = Math.random() * H;
        } while (Math.hypot(x - cx, y - cy) < R + 16);
        strangers.push({ x, y, vx: (Math.random() - 0.5) * 0.7, vy: (Math.random() - 0.5) * 0.7, r: 3 });
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      cy = H / 2;
      R = Math.min(W, H) * 0.36;
      spawn();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      you.tx = e.clientX - rect.left;
      you.ty = e.clientY - rect.top;
      if (!you.active) {
        you.x = you.tx;
        you.y = you.ty;
      }
      you.active = true;
    };
    const onLeave = () => {
      you.active = false;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(wrap);

    const bounceOffEdge = (d: Dot, insideRing: boolean) => {
      const dx = d.x - cx;
      const dy = d.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;
      const limitIn = R - 10;
      const limitOut = R + 12;
      if (insideRing && dist > limitIn) {
        d.x = cx + nx * limitIn;
        d.y = cy + ny * limitIn;
        const dot = d.vx * nx + d.vy * ny;
        d.vx -= 2 * dot * nx;
        d.vy -= 2 * dot * ny;
      } else if (!insideRing && dist < limitOut) {
        d.x = cx + nx * limitOut;
        d.y = cy + ny * limitOut;
        const dot = d.vx * nx + d.vy * ny;
        d.vx -= 2 * dot * nx;
        d.vy -= 2 * dot * ny;
        flashes.push({ angle: Math.atan2(dy, dx), life: 1 });
      }
    };

    let last = performance.now();
    let parcelTimer = 0;
    let raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(2.5, (now - last) / 16.67);
      last = now;
      const speed = reduced ? 0.25 : 1;

      // ── simulate ──
      for (const m of members) {
        m.vx += (Math.random() - 0.5) * 0.02;
        m.vy += (Math.random() - 0.5) * 0.02;
        const sp = Math.hypot(m.vx, m.vy);
        if (sp > 0.45) {
          m.vx *= 0.45 / sp;
          m.vy *= 0.45 / sp;
        }
        m.x += m.vx * dt * speed;
        m.y += m.vy * dt * speed;
        bounceOffEdge(m, true);
      }
      for (const s of strangers) {
        // Strangers are curious — they drift toward the community
        s.vx += ((cx - s.x) / W) * 0.01 + (Math.random() - 0.5) * 0.03;
        s.vy += ((cy - s.y) / H) * 0.01 + (Math.random() - 0.5) * 0.03;
        const sp = Math.hypot(s.vx, s.vy);
        if (sp > 0.8) {
          s.vx *= 0.8 / sp;
          s.vy *= 0.8 / sp;
        }
        s.x += s.vx * dt * speed;
        s.y += s.vy * dt * speed;
        if (s.x < 0 || s.x > W) s.vx *= -1;
        if (s.y < 0 || s.y > H) s.vy *= -1;
        bounceOffEdge(s, false);
      }

      // You
      if (you.active) {
        you.x += (you.tx - you.x) * 0.25;
        you.y += (you.ty - you.y) * 0.25;
        const dist = Math.hypot(you.x - cx, you.y - cy);
        if (!verifiedRef.current && dist < R + 12) {
          const a = Math.atan2(you.y - cy, you.x - cx);
          you.x = cx + Math.cos(a) * (R + 12);
          you.y = cy + Math.sin(a) * (R + 12);
          if (!flashes.some((f) => f.life > 0.7 && Math.abs(f.angle - a) < 0.2)) {
            flashes.push({ angle: a, life: 1 });
            blockedCount++;
            if (blockedCount % 4 === 1) setBlocked(blockedCount);
          }
        }
        you.inside = Math.hypot(you.x - cx, you.y - cy) < R;
      }

      // Parcels: members lending things to linked neighbours
      parcelTimer += dt;
      if (parcelTimer > 38 && !reduced) {
        parcelTimer = 0;
        const a = Math.floor(Math.random() * members.length);
        let best = -1;
        let bestD = 1e9;
        for (let j = 0; j < members.length; j++) {
          if (j === a) continue;
          const d = Math.hypot(members[j].x - members[a].x, members[j].y - members[a].y);
          if (d < 90 && d < bestD) {
            bestD = d;
            best = j;
          }
        }
        if (best >= 0)
          parcels.push({ a, b: best, t: 0, color: PARCEL_COLORS[Math.floor(Math.random() * PARCEL_COLORS.length)] });
      }

      // ── draw ──
      ctx.clearRect(0, 0, W, H);

      // Boundary fill + ring
      const grad = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
      grad.addColorStop(0, "rgba(24,175,130,0.10)");
      grad.addColorStop(1, "rgba(24,175,130,0.02)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.setLineDash([6, 8]);
      ctx.lineDashOffset = -now * 0.02;
      ctx.strokeStyle = "rgba(24,175,130,0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Blocked flashes on the ring
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life -= 0.03 * dt;
        if (f.life <= 0) {
          flashes.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(239,68,68,${f.life * 0.9})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, R, f.angle - 0.14, f.angle + 0.14);
        ctx.stroke();
      }

      // Member links
      ctx.lineWidth = 1;
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const a = members[i];
          const b = members[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 90) {
            ctx.strokeStyle = `rgba(24,175,130,${(1 - d / 90) * 0.45})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // You ↔ members (only once verified)
      if (you.active && verifiedRef.current && you.inside) {
        for (const m of members) {
          const d = Math.hypot(m.x - you.x, m.y - you.y);
          if (d < 120) {
            ctx.strokeStyle = `rgba(245,158,11,${(1 - d / 120) * 0.8})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(you.x, you.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }

      // Parcels in flight
      for (let i = parcels.length - 1; i >= 0; i--) {
        const pc = parcels[i];
        pc.t += 0.012 * dt;
        if (pc.t >= 1) {
          parcels.splice(i, 1);
          continue;
        }
        const a = members[pc.a];
        const b = members[pc.b];
        if (!a || !b) continue;
        const x = a.x + (b.x - a.x) * pc.t;
        const y = a.y + (b.y - a.y) * pc.t - Math.sin(Math.PI * pc.t) * 10;
        ctx.fillStyle = pc.color;
        ctx.fillRect(x - 3.5, y - 3.5, 7, 7);
      }

      // Dots
      for (const m of members) {
        ctx.fillStyle = "#18af82";
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const s of strangers) {
        ctx.fillStyle = "rgba(120,113,108,0.55)";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (you.active) {
        const ok = verifiedRef.current;
        ctx.fillStyle = ok ? "rgba(245,158,11,0.18)" : "rgba(120,113,108,0.15)";
        ctx.beginPath();
        ctx.arc(you.x, you.y, 16 + Math.sin(now * 0.006) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = ok ? "#f59e0b" : "#78716c";
        ctx.beginPath();
        ctx.arc(you.x, you.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = ok ? "#b45309" : "#57534e";
        ctx.fillText(ok ? "you · member" : "you · stranger", you.x, you.y - 22);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  useEffect(() => () => {
    if (typingRef.current) window.clearInterval(typingRef.current);
  }, []);

  const applyInvite = () => {
    if (typingRef.current) return;
    let i = 0;
    setTyped("");
    typingRef.current = window.setInterval(() => {
      i++;
      setTyped(INVITE.slice(0, i));
      if (i >= INVITE.length) {
        window.clearInterval(typingRef.current!);
        typingRef.current = null;
        window.setTimeout(() => setVerified(true), 250);
      }
    }, 70);
  };

  const leave = () => {
    setVerified(false);
    setTyped("");
  };

  return (
    <div className="trust-card">
      <div ref={wrapRef} className="trust-canvas">
        <canvas ref={canvasRef} className="block h-full w-full touch-none" aria-label="Interactive diagram: verified members inside a community boundary, strangers outside" />
        <div className="trust-legend">
          <span>
            <i className="bg-[#18af82]" /> Verified member
          </span>
          <span>
            <i className="bg-[#a8a29e]" /> Stranger
          </span>
          <span>
            <i className="bg-[#f59e0b]" /> You
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--color-neutral-200)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 text-xs">
          {verified ? (
            <>
              <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--color-primary-500)]" />
              <span className="text-[var(--color-neutral-700)]">
                <strong className="text-[var(--color-neutral-900)]">You&apos;re in.</strong> Move inside — you&apos;re now
                linked to neighbours near you.
              </span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-5 w-5 shrink-0 text-[var(--color-neutral-400)]" />
              <span className="text-[var(--color-neutral-600)]">
                {blocked > 0 ? (
                  <>
                    <strong className="text-red-600">Blocked at the boundary.</strong> Strangers can&apos;t see or
                    reach members.
                  </>
                ) : (
                  <>Hover the circle — try to get in.</>
                )}
              </span>
            </>
          )}
        </div>

        {verified ? (
          <button type="button" onClick={leave} className="trust-btn trust-btn--ghost">
            <LogOut className="h-3.5 w-3.5" /> Leave community
          </button>
        ) : (
          <button type="button" onClick={applyInvite} className="trust-btn">
            <KeyRound className="h-3.5 w-3.5" />
            <span className="font-mono tracking-wider">{typed || "Use invite code"}</span>
            {typed && typed.length < INVITE.length && <span className="story-caret" />}
          </button>
        )}
      </div>
    </div>
  );
}
