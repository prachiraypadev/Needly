"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Clock,
  Hand,
  MousePointer2,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { SCENE_READY_EVENT } from "@/components/marketing/preloader";
import { scrollToY } from "@/components/marketing/smooth-scroll";

const HandoverScene = dynamic(
  () => import("@/components/marketing/handover-scene").then((m) => m.HandoverScene),
  { ssr: false }
);

/** Chapter boundaries on the 0 → 1 story timeline (must match handover-scene). */
const CHAPTERS = [
  { id: "hero", from: 0, label: "Start" },
  { id: "need", from: 0.055, label: "Ask" },
  { id: "notify", from: 0.165, label: "Notify" },
  { id: "offer", from: 0.335, label: "Offer" },
  { id: "handover", from: 0.49, label: "Handover" },
  { id: "trust", from: 0.83, label: "Trust" },
] as const;

type ChapterId = (typeof CHAPTERS)[number]["id"];

function chapterAt(p: number): ChapterId {
  let id: ChapterId = "hero";
  for (const c of CHAPTERS) if (p >= c.from) id = c.id;
  return id;
}

export function StoryHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [chapter, setChapter] = useState<ChapterId>("hero");
  const [sceneFailed, setSceneFailed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      progress.current = p;
      railRef.current?.style.setProperty("--story-p", p.toFixed(4));
      setChapter((prev) => {
        const next = chapterAt(p);
        return prev === next ? prev : next;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const jumpTo = useCallback((from: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const total = section.offsetHeight - window.innerHeight;
    // Land a little inside the chapter so the beat has started playing.
    scrollToY(section.offsetTop + total * Math.min(1, from + (from > 0 ? 0.03 : 0)));
  }, []);

  const handleReady = useCallback(() => window.dispatchEvent(new Event(SCENE_READY_EVENT)), []);
  const handleError = useCallback(() => {
    setSceneFailed(true);
    window.dispatchEvent(new Event(SCENE_READY_EVENT));
  }, []);

  const is = (id: ChapterId) => chapter === id;

  return (
    <section ref={sectionRef} className="story relative h-[680vh]" aria-label="How a Jod handover works">
      {/* Anchor used by the header's "How it works" link — lands on chapter 01 */}
      <div id="how-it-works" className="pointer-events-none absolute left-0 top-[45vh] h-px w-px" />

      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {sceneFailed ? (
          <div className="story-fallback absolute inset-0" />
        ) : (
          <HandoverScene progress={progress} onReady={handleReady} onError={handleError} />
        )}

        {/* Readability wash behind the hero copy */}
        <div
          className="story-wash pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{ opacity: is("hero") ? 1 : 0 }}
        />

        {/* ── Chapter 0: Hero ── */}
        <div className="story-panel story-panel--hero" data-active={is("hero")}>
          <div className="story-kicker">
            <ShieldCheck className="h-4 w-4" />
            <span>Private &amp; verified community boundary</span>
          </div>
          <h1 className="story-title">
            Your community,
            <br />
            <span className="story-title__accent">
              made <em>useful.</em>
            </span>
          </h1>
          <p className="story-lede">
            Ask your neighbours for what you need. Borrow a ladder, rent a projector, buy pre-loved, or find trusted
            local help — from people you already live with.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={isLoggedIn ? "/needs" : "/signup"} className="jod-btn jod-btn--primary">
              <Sparkles className="h-5 w-5" />
              {isLoggedIn ? "Open Community Feed" : "Join Jod Community"}
              <span className="jod-btn__shine" aria-hidden="true" />
            </Link>
            <button type="button" onClick={() => jumpTo(CHAPTERS[1].from)} className="jod-btn jod-btn--ghost">
              Watch a handover
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <ul className="story-checks">
            {["No WhatsApp spam", "Verified neighbours", "Structured fulfilment"].map((t) => (
              <li key={t}>
                <CheckCircle2 className="h-4 w-4" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="story-scrollhint" data-active={is("hero")} aria-hidden="true">
          <span className="story-scrollhint__mouse">
            <span />
          </span>
          Scroll to follow Rahul&apos;s drill
        </div>

        {/* ── Chapter 1: Ask ── */}
        <div className="story-panel" data-active={is("need")}>
          <ChapterHead n="01" eyebrow="Say what you need" title="One post. Thirty seconds." />
          <p className="story-body">
            Rahul from B-402 wants to hang picture frames tomorrow. He doesn&apos;t need to <em>own</em> a drill —
            he needs one for four hours.
          </p>
          <div className="story-ui">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar name="Rahul Sharma" size="sm" />
                <span className="text-xs font-bold text-[var(--color-neutral-900)]">Rahul S. · B-402</span>
              </div>
              <Badge variant="borrow">Borrow</Badge>
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--color-neutral-900)]">
              Cordless drill for picture frames<span className="story-caret" />
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-neutral-500)]">
              <Clock className="h-3.5 w-3.5" /> Tomorrow, 9 AM – 1 PM
            </p>
          </div>
        </div>

        {/* ── Chapter 2: Notify ── */}
        <div className="story-panel" data-active={is("notify")}>
          <ChapterHead n="02" eyebrow="Your community hears it" title="Only the people inside the circle." />
          <p className="story-body">
            The request ripples through Palm Meadows — every lit window is a verified neighbour. Nobody outside the
            boundary sees it. No 500-member group chat. No noise.
          </p>
          <div className="story-ui flex items-center gap-3">
            <span className="story-ping">
              <BellRing className="h-4 w-4" />
            </span>
            <div className="text-xs">
              <p className="font-bold text-[var(--color-neutral-900)]">New need in Palm Meadows</p>
              <p className="text-[var(--color-neutral-500)]">Sent to members of this community only</p>
            </div>
          </div>
        </div>

        {/* ── Chapter 3: Offer ── */}
        <div className="story-panel" data-active={is("offer")}>
          <ChapterHead n="03" eyebrow="A neighbour offers" title="Idle things find their purpose." />
          <p className="story-body">
            Priya in C-101 has a Bosch drill she used once last Diwali. She taps <strong>Offer</strong> — and the two
            homes are joined. That line is the <em>jod</em>.
          </p>
          <div className="story-ui">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Avatar name="Priya Patel" size="sm" />
                <div>
                  <p className="text-xs font-bold text-[var(--color-neutral-900)]">Priya P. · C-101</p>
                  <p className="text-[11px] text-[var(--color-neutral-500)]">Bosch 18V hammer drill</p>
                </div>
              </div>
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                Free to lend
              </span>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <span className="story-accept">
                <Hand className="h-3.5 w-3.5" /> Accept offer
              </span>
            </div>
          </div>
        </div>

        {/* ── Chapter 4: Handover ── */}
        <div className="story-panel" data-active={is("handover")}>
          <ChapterHead n="04" eyebrow="Meet & hand over" title="Down the lift, across the courtyard." />
          <p className="story-body">
            They meet halfway. The drill changes hands, the return time is locked in, and Jod tracks the rest — so
            nobody has to send an awkward &ldquo;hey, about my drill…&rdquo; text.
          </p>
          <ol className="story-ui story-timeline">
            <li>
              <span /> Offer accepted
            </li>
            <li>
              <span /> Picked up · 9:04 AM
            </li>
            <li>
              <span /> Return due · 1:00 PM
            </li>
          </ol>
        </div>

        {/* ── Chapter 5: Trust ── */}
        <div className="story-panel" data-active={is("trust")}>
          <ChapterHead n="05" eyebrow="Trust compounds" title="Now multiply it by a whole society." />
          <p className="story-body">
            Every returned drill is a little more trust. As evening falls, the same loop runs between every block —
            ladders, chairs, projectors, a plumber&apos;s number. That&apos;s a community, made useful.
          </p>
          <div className="story-ui flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-neutral-900)]">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> Rahul +1 · Priya +1
            </div>
            <Link href={isLoggedIn ? "/needs" : "/signup"} className="story-accept">
              Start yours <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Progress rail ── */}
        <div ref={railRef} className="story-rail" aria-label="Story chapters">
          <div className="story-rail__track">
            <div className="story-rail__fill" />
          </div>
          {CHAPTERS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => jumpTo(c.from)}
              className="story-rail__dot"
              data-active={is(c.id)}
              style={{ top: `${c.from * 100}%` }}
            >
              <span className="story-rail__label">{c.label}</span>
            </button>
          ))}
        </div>

        <div className="story-hint-drag" data-active={is("hero")} aria-hidden="true">
          <MousePointer2 className="h-3.5 w-3.5" /> Move your cursor — the courtyard follows
        </div>
      </div>
    </section>
  );
}

function ChapterHead({ n, eyebrow, title }: { n: string; eyebrow: string; title: string }) {
  return (
    <>
      <div className="story-chapter-n" aria-hidden="true">
        {n}
      </div>
      <span className="story-eyebrow">{eyebrow}</span>
      <h2 className="story-h2">{title}</h2>
    </>
  );
}
