import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Building2, GraduationCap, Briefcase, ArrowRight, MousePointerClick } from "lucide-react";
import { HeroInteractiveDemo } from "@/components/marketing/hero-interactive-demo";
import { StoryHero } from "@/components/marketing/story-hero";
import { Preloader } from "@/components/marketing/preloader";
import { SmoothScroll } from "@/components/marketing/smooth-scroll";
import { ModalityCards } from "@/components/marketing/modality-cards";
import { TrustBoundary } from "@/components/marketing/trust-boundary";
import { NeedsMarquee } from "@/components/marketing/needs-marquee";
import { Reveal } from "@/components/marketing/reveal";
import { getSessionUser } from "@/lib/auth/dal";

function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: React.ReactNode; body: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
      <p className="mt-4 text-base leading-relaxed text-[var(--color-neutral-600)]">{body}</p>
    </Reveal>
  );
}

export default async function LandingPage() {
  const user = await getSessionUser();

  return (
    <div className="landing flex flex-col">
      <Preloader />
      <SmoothScroll />

      {/* 1. The story: a need, told as a scroll-driven 3D handover */}
      <StoryHero isLoggedIn={Boolean(user)} />

      {/* 2. Four modalities, each with its own handover logic */}
      <section id="modalities" className="relative border-y border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] py-20 sm:py-28">
        <div className="grain" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Four ways to jod"
            title={
              <>
                Same courtyard. <span className="text-gradient">Four different handovers.</span>
              </>
            }
            body="Borrowing a drill isn't buying a chair. Jod runs the right workflow for each — watch what moves, and what comes back."
          />
          <ModalityCards />
        </div>
      </section>

      {/* 3. The trust boundary */}
      <section id="community-trust" className="relative overflow-hidden bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <Reveal variant="left" className="lg:col-span-5">
              <span className="section-eyebrow">The trust boundary</span>
              <h2 className="section-title text-left">
                Real community is the <span className="text-gradient">strongest trust model.</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--color-neutral-600)]">
                Open marketplaces struggle with fraud, stolen deposits and unreliable strangers. Jod works strictly
                inside <strong>private, verified boundaries</strong> — where reputation is real because you&apos;ll see
                each other at the lift tomorrow.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { icon: Building2, t: "Apartment & gated societies", d: "Residents of your actual towers, wings or layout." },
                  { icon: GraduationCap, t: "Colleges, hostels & universities", d: "Share textbooks, calculators, lab coats, hostel appliances." },
                  { icon: Briefcase, t: "Offices & co-working spaces", d: "Chargers, monitors, adapters and commute pools among colleagues." },
                ].map(({ icon: Icon, t, d }) => (
                  <div key={t} className="trust-type">
                    <div className="trust-type__icon">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-neutral-900)]">{t}</h4>
                      <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">{d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <ul className="mt-8 space-y-2 text-sm text-[var(--color-neutral-700)]">
                {[
                  "Every member is verified by invite token",
                  "PostgreSQL Row Level Security enforces the boundary in the database itself",
                  "Community admins have oversight and dispute tools",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary-500)]" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal variant="scale" delay={120} className="lg:col-span-7">
              <TrustBoundary />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. Live-feeling examples */}
      <section id="examples" className="relative overflow-hidden border-y border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro
            eyebrow="Live in communities"
            title={
              <>
                Small needs. <span className="text-gradient">Solved next door.</span>
              </>
            }
            body="This is what a society feed looks like when every request has a type, a time and a status — instead of getting lost under good-morning messages."
          />
        </div>
        <NeedsMarquee />
      </section>

      {/* 5. Try it yourself (interactive offer-matching demo) */}
      <section className="relative overflow-hidden bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <Reveal variant="left" className="lg:col-span-5">
            <span className="section-eyebrow">Your turn</span>
            <h2 className="section-title text-left">
              Be Rahul for <span className="text-gradient">ten seconds.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--color-neutral-600)]">
              Two neighbours have offered a drill. Pick one and accept — that&apos;s the whole flow. No haggling in DMs,
              no &ldquo;is this still available?&rdquo;
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-700)]">
              <MousePointerClick className="h-3.5 w-3.5" /> Interactive — go ahead, click
            </p>
          </Reveal>
          <Reveal variant="scale" delay={120} className="relative lg:col-span-7">
            <div className="demo-glow" aria-hidden="true" />
            <HeroInteractiveDemo />
          </Reveal>
        </div>
      </section>

      {/* 6. Final CTA — two ropes tie into a knot */}
      <section className="final-cta relative overflow-hidden py-24 text-white sm:py-32">
        <Reveal variant="none" className="final-cta__rope" as="div">
          <svg viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">
            <path className="rope rope--a" d="M-20 150 C 250 150, 380 40, 560 110 S 640 190, 600 110 S 520 60, 600 80" />
            <path className="rope rope--b" d="M1220 70 C 950 70, 820 180, 640 110 S 560 30, 600 110 S 680 160, 600 140" />
            <circle className="rope-knot" cx="600" cy="110" r="10" />
          </svg>
        </Reveal>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Kuch chahiye?
              <br />
              <span className="final-cta__accent">Bas jod lo.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              Create a private marketplace for your apartment, hostel or neighbourhood in under two minutes. Zero
              clutter, verified trust, and the drill you need — two floors away.
            </p>
          </Reveal>
          <Reveal delay={150} className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            {user ? (
              <>
                <Link href="/needs" className="jod-btn jod-btn--light">
                  <Sparkles className="h-5 w-5" /> Go to Needs Feed
                  <span className="jod-btn__shine" aria-hidden="true" />
                </Link>
                <Link href="/profile" className="jod-btn jod-btn--outline-light">
                  View My Profile
                </Link>
              </>
            ) : (
              <>
                <Link href="/join-community" className="jod-btn jod-btn--light">
                  <Sparkles className="h-5 w-5" /> Create or Join a Community
                  <span className="jod-btn__shine" aria-hidden="true" />
                </Link>
                <Link href="/login" className="jod-btn jod-btn--outline-light">
                  Sign in <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
