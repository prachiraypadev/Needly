import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Account — Needly",
  description: "Join Needly and connect with your community to borrow, rent, buy, and find trusted local help.",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-[var(--color-neutral-900)]">
              Needly
            </span>
            <span className="text-xs text-[var(--color-neutral-500)]">
              Your community, made useful.
            </span>
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-[var(--color-neutral-900)]">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            Join your community on Needly
          </p>
        </div>

        {/* Form */}
        <SignupForm />

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-[var(--color-neutral-500)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
