import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatusDot } from "@/components/shared/status-dot";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. HERO SECTION
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[var(--color-neutral-200)] bg-gradient-to-b from-[var(--color-neutral-50)] to-white py-16 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Value Proposition */}
            <div className="flex flex-col items-start lg:col-span-7">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-3.5 py-1 text-xs font-semibold text-[var(--color-primary-700)] shadow-xs">
                <ShieldCheck className="h-4 w-4 text-[var(--color-primary-500)]" />
                <span>Private & Verified Community Boundary</span>
              </div>

              {/* Main Headline */}
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[var(--color-neutral-900)] sm:text-5xl lg:text-6xl">
                Your community, <br className="hidden sm:inline" />
                <span className="text-[var(--color-primary-500)]">made useful.</span>
              </h1>

              {/* Supporting Text */}
              <p className="mt-6 text-lg text-[var(--color-neutral-600)] sm:text-xl leading-relaxed max-w-2xl">
                Ask your community for what you need. Borrow a ladder, rent a projector, buy pre-loved items, or find trusted local help from people you already live with.
              </p>

                            {/* Primary Call to Actions */}
              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                {/* 🌟 BUTTON 1: Instant Signup Door */}
                <Link href="/signup">
                  <Button size="lg" variant="primary" className="w-full gap-2 sm:w-auto text-base shadow-sm shadow-[var(--color-primary-500)]/25">
                    <Sparkles className="h-5 w-5" />
                    Join Jod Community
                  </Button>
                </Link>

                                {/* 🌟 100% Working Smooth Scroll (Bina kisi error ke) */}
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="w-full gap-2 sm:w-auto text-base">
                    See how it works
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>

              </div>


              {/* Social Proof Checklist */}
              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-[var(--color-neutral-200)] pt-6 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-neutral-700)]">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-primary-500)] shrink-0" />
                  <span>No WhatsApp spam</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-neutral-700)]">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-primary-500)] shrink-0" />
                  <span>Verified neighbors</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-neutral-700)]">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-primary-500)] shrink-0" />
                  <span>Structured fulfillment</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Product Simulation */}
            <div className="relative lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-2xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-lg">
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-[var(--color-neutral-100)] pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-3 w-3 rounded-full bg-[var(--color-primary-500)]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-neutral-700)]">
                      Palm Meadows Residency
                    </span>
                  </div>
                  <span className="rounded-md bg-[var(--color-neutral-100)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-neutral-600)]">
                    Active Community
                  </span>
                </div>

                {/* Example Active Need Card */}
                <div className="mt-4 rounded-xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name="Rahul Sharma" size="sm" />
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-neutral-900)]">Rahul S. (Block B-402)</p>
                        <p className="text-[11px] text-[var(--color-neutral-500)]">Requested 12 mins ago</p>
                      </div>
                    </div>
                    <Badge variant="borrow">Borrow</Badge>
                  </div>
                  <p className="mt-2.5 text-sm font-medium text-[var(--color-neutral-900)]">
                    Need a cordless power drill for hanging picture frames tomorrow morning.
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-primary-800)] font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Needed: Tomorrow, 9 AM – 1 PM
                    </span>
                    <span className="font-semibold text-[var(--color-primary-600)]">
                      2 offers received
                    </span>
                  </div>
                </div>

                {/* Matching Offer Simulation */}
                <div className="mt-3.5 space-y-2.5">
                  <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar name="Priya Patel" size="sm" />
                        <div>
                          <p className="text-xs font-medium text-[var(--color-neutral-900)]">Priya P. (Block C-101)</p>
                          <p className="text-[11px] text-[var(--color-neutral-500)]">Bosch 18V Hammer Drill available</p>
                        </div>
                      </div>
                      <span className="rounded-md bg-[var(--color-success-light)] px-2 py-0.5 text-xs font-bold text-[var(--color-success)]">
                        Free to lend
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar name="Amit Verma" size="sm" />
                        <div>
                          <p className="text-xs font-medium text-[var(--color-neutral-900)]">Amit V. (Block A-204)</p>
                          <p className="text-[11px] text-[var(--color-neutral-500)]">Cordless drill + 20 drill bits set</p>
                        </div>
                      </div>
                      <span className="rounded-md bg-[var(--color-success-light)] px-2 py-0.5 text-xs font-bold text-[var(--color-success)]">
                        Free to lend
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Simulation CTA */}
                <div className="mt-4 pt-3 border-t border-[var(--color-neutral-100)] flex items-center justify-between">
                  <span className="text-xs text-[var(--color-neutral-500)]">1-Click Acceptance</span>
                  <div className="flex gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-primary-500)] px-2.5 py-1 text-xs font-semibold text-white">
                      Accept Offer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. HOW IT WORKS SECTION (The Core Loop)
          ────────────────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-[var(--color-neutral-200)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-600)]">
              The Jod Workflow
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-[var(--color-neutral-900)] sm:text-4xl">
              From unstructured request to fulfilled need
            </h2>
            <p className="mt-3.5 text-base text-[var(--color-neutral-600)]">
              Instead of messages buried in 500-member group chats, Needly organizes your community’s intent into a structured, trackable loop.
            </p>
          </div>

          {/* 4-Step Process Grid */}
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <Card className="relative border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]/50">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-500)] text-white font-bold text-sm">
                  1
                </div>
                <CardTitle className="mt-3 text-base">Say What You Need</CardTitle>
                <CardDescription>
                  State your requirement in simple words: need a ladder, 10 chairs, an electrician, or packing boxes.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Step 2 */}
            <Card className="relative border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]/50">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-100)] text-[var(--color-primary-800)] font-bold text-sm">
                  2
                </div>
                <CardTitle className="mt-3 text-base">Community Discovery</CardTitle>
                <CardDescription>
                  Your request is immediately surfaced to relevant neighbors or verified local service providers.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Step 3 */}
            <Card className="relative border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]/50">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-100)] text-[var(--color-primary-800)] font-bold text-sm">
                  3
                </div>
                <CardTitle className="mt-3 text-base">Receive & Choose Offers</CardTitle>
                <CardDescription>
                  Neighbors respond with availability, conditions, or pricing. Select the offer that fits you best.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Step 4 */}
            <Card className="relative border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]/50">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-500)] text-white font-bold text-sm">
                  4
                </div>
                <CardTitle className="mt-3 text-base">Smooth Fulfillment</CardTitle>
                <CardDescription>
                  Hand over, track return schedule, confirm completion, and build mutual neighborhood trust.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. FOUR MODALITIES (Borrow, Rent, Buy, Services)
          ────────────────────────────────────────────────────────────────────────── */}
      <section id="modalities" className="py-16 sm:py-24 bg-[var(--color-neutral-50)] border-b border-[var(--color-neutral-200)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-600)]">
              Four Core Modalities
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-[var(--color-neutral-900)] sm:text-4xl">
              One platform for every community requirement
            </h2>
            <p className="mt-3.5 text-base text-[var(--color-neutral-600)]">
              Whether you need to borrow an item for two hours or book a carpenter for the afternoon, Needly handles the specific workflow.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Borrow */}
            <Card className="border-[var(--color-neutral-200)] bg-white shadow-xs hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="borrow">Borrow</Badge>
                  <span className="text-xs font-medium text-[var(--color-neutral-500)]">Zero Cost</span>
                </div>
                <CardTitle className="mt-3 text-lg">Neighbor Lending</CardTitle>
                <CardDescription>
                  Borrow tools, projectors, luggage, or board games from neighbors who already have them idling.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 text-xs text-[var(--color-neutral-600)] border-t border-[var(--color-neutral-100)]">
                <p className="font-semibold text-[var(--color-neutral-800)] mb-1">Common items:</p>
                <p>Drill machines, ladders, folding tables, camping gear, moving boxes.</p>
              </CardContent>
            </Card>

            {/* 2. Rent */}
            <Card className="border-[var(--color-neutral-200)] bg-white shadow-xs hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="rent">Rent</Badge>
                  <span className="text-xs font-medium text-[var(--color-neutral-500)]">Per-day / Per-hour</span>
                </div>
                <CardTitle className="mt-3 text-lg">Resource Rentals</CardTitle>
                <CardDescription>
                  Rent high-value equipment or event supplies with structured pickup, deposit, and return tracking.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 text-xs text-[var(--color-neutral-600)] border-t border-[var(--color-neutral-100)]">
                <p className="font-semibold text-[var(--color-neutral-800)] mb-1">Common items:</p>
                <p>Event speakers, DSLR cameras, VR headsets, bicycles, pressure washers.</p>
              </CardContent>
            </Card>

            {/* 3. Buy */}
            <Card className="border-[var(--color-neutral-200)] bg-white shadow-xs hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="buy">Buy</Badge>
                  <span className="text-xs font-medium text-[var(--color-neutral-500)]">Direct Purchase</span>
                </div>
                <CardTitle className="mt-3 text-lg">Pre-Loved Goods</CardTitle>
                <CardDescription>
                  Buy furniture, appliances, books, or cycles directly from neighbors without courier fees or scams.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 text-xs text-[var(--color-neutral-600)] border-t border-[var(--color-neutral-100)]">
                <p className="font-semibold text-[var(--color-neutral-800)] mb-1">Common items:</p>
                <p>Study tables, kid’s cycles, microwave ovens, textbooks, plants.</p>
              </CardContent>
            </Card>

            {/* 4. Services */}
            <Card className="border-[var(--color-neutral-200)] bg-white shadow-xs hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="service">Service</Badge>
                  <span className="text-xs font-medium text-[var(--color-neutral-500)]">Verified Help</span>
                </div>
                <CardTitle className="mt-3 text-lg">Trusted Services</CardTitle>
                <CardDescription>
                  Connect with vetted electricians, carpenters, plumbers, tutors, or cleaners recommended by members.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 text-xs text-[var(--color-neutral-600)] border-t border-[var(--color-neutral-100)]">
                <p className="font-semibold text-[var(--color-neutral-800)] mb-1">Common services:</p>
                <p>Fan installation, AC repair, plumbing, pet sitting, maths tuition.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. WHY TRUSTED COMMUNITIES MATTER
          ────────────────────────────────────────────────────────────────────────── */}
      <section id="community-trust" className="py-16 sm:py-24 bg-white border-b border-[var(--color-neutral-200)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-600)]">
                The Trust Boundary
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-[var(--color-neutral-900)] sm:text-4xl">
                Real community is the strongest trust model
              </h2>
              <p className="mt-4 text-base text-[var(--color-neutral-600)] leading-relaxed">
                Anonymous open marketplaces struggle with fraud, stolen deposits, and unreliable strangers. Needly is designed strictly within **private, verified boundaries** where reputation is real.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-700)]">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-neutral-900)]">Apartment & Gated Societies</h4>
                    <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                      Interact with residents in your actual towers, wings, or gated layout.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-700)]">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-neutral-900)]">Colleges, Hostels & Universities</h4>
                    <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                      Share textbooks, calculators, lab coats, and hostel appliances safely.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-700)]">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-neutral-900)]">Offices & Co-working Spaces</h4>
                    <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">
                      Share chargers, monitors, adapters, and commuter pools among colleagues.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Callout */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-[var(--color-primary-500)]" />
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-neutral-900)]">
                      Private by Default
                    </h3>
                    <p className="text-xs text-[var(--color-neutral-500)]">
                      Your listings and needs are only visible to approved community members.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-sm text-[var(--color-neutral-700)]">
                  <div className="flex items-center gap-2.5 rounded-lg bg-white p-3 border border-[var(--color-neutral-200)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary-500)]" />
                    <span>Every community member is verified by apartment / invite token</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg bg-white p-3 border border-[var(--color-neutral-200)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary-500)]" />
                    <span>PostgreSQL Row Level Security ensures strict data boundaries</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg bg-white p-3 border border-[var(--color-neutral-200)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary-500)]" />
                    <span>Community admins have full oversight and dispute resolution tools</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. REAL EXAMPLE COMMUNITY NEEDS
          ────────────────────────────────────────────────────────────────────────── */}
      <section id="examples" className="py-16 sm:py-24 bg-[var(--color-neutral-50)] border-b border-[var(--color-neutral-200)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-600)]">
              Live in Communities
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-[var(--color-neutral-900)] sm:text-4xl">
              Real needs fulfilled every single day
            </h2>
            <p className="mt-3.5 text-base text-[var(--color-neutral-600)]">
              Here is how real community members structure their needs on Needly.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Example Card 1 */}
            <Card className="border-[var(--color-neutral-200)] bg-white shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="borrow">Borrow</Badge>
                  <StatusDot status="open" label="Open" />
                </div>
                <CardTitle className="mt-2 text-base">10 Folding Chairs for Birthday Party</CardTitle>
                <CardDescription>
                  Hosting a small kid’s birthday party this Sunday. Need about 8–10 folding chairs from 4 PM to 8 PM.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 text-xs text-[var(--color-neutral-500)] border-t border-[var(--color-neutral-100)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name="Meera Sen" size="sm" />
                  <span>Meera S. (Wing C-302)</span>
                </div>
                <span className="font-semibold text-[var(--color-primary-600)]">3 Offers</span>
              </CardContent>
            </Card>

            {/* Example Card 2 */}
            <Card className="border-[var(--color-neutral-200)] bg-white shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="service">Service</Badge>
                  <StatusDot status="open" label="Open" />
                </div>
                <CardTitle className="mt-2 text-base">Electrician for 2 Ceiling Fans</CardTitle>
                <CardDescription>
                  Need a reliable electrician to assemble and install 2 ceiling fans today between 6 PM – 8 PM. Budget ₹400–₹600.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 text-xs text-[var(--color-neutral-500)] border-t border-[var(--color-neutral-100)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name="Karan Grover" size="sm" />
                  <span>Karan G. (Tower 4)</span>
                </div>
                <span className="font-semibold text-[var(--color-primary-600)]">2 Providers</span>
              </CardContent>
            </Card>

            {/* Example Card 3 */}
            <Card className="border-[var(--color-neutral-200)] bg-white shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="rent">Rent</Badge>
                  <StatusDot status="fulfilled" label="Fulfilled" />
                </div>
                <CardTitle className="mt-2 text-base">Tripod & Ring Light for Shoot</CardTitle>
                <CardDescription>
                  Needed a sturdy phone tripod with ring light for an online product presentation.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 text-xs text-[var(--color-neutral-500)] border-t border-[var(--color-neutral-100)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name="Sneha Rao" size="sm" />
                  <span>Sneha R. (Flat 801)</span>
                </div>
                <span className="text-[var(--color-neutral-500)]">₹150/day (Fulfilled)</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          6. FINAL CTA SECTION
          ────────────────────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[var(--color-primary-500)] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Ready to bring Needly to your community?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[var(--color-primary-100)] leading-relaxed">
              Create a private marketplace for your apartment society, hostel, or neighborhood in under two minutes. Zero clutter, verified trust, and instant fulfillment.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link href="/join-community">
                <Button size="lg" className="w-full sm:w-auto bg-white text-[var(--color-primary-700)] hover:bg-[var(--color-neutral-100)] shadow-md font-semibold">
                  <Sparkles className="h-5 w-5 text-[var(--color-primary-600)]" />
                  Create or Join a Community
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/40 text-white bg-transparent hover:bg-white/10">
                  Sign In to Existing Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
