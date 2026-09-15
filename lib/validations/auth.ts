import { z } from "zod";

// ---------------------------------------------------------------------------
// AUTH FORM STATE
// Shared type for useActionState() in login and signup forms.
// ---------------------------------------------------------------------------

export type AuthFormState =
  | {
      errors?: {
        display_name?: string[];
        email?: string[];
        password?: string[];
        confirm_password?: string[];
      };
      message?: string;
      requiresEmailConfirmation?: boolean;
      email?: string;
    }
  | undefined;

export type ProfileFormState =
  | {
      errors?: {
        display_name?: string[];
        bio?: string[];
        phone?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

// ---------------------------------------------------------------------------
// SIGN UP SCHEMA
// ---------------------------------------------------------------------------

export const SignUpSchema = z
  .object({
    display_name: z
      .string()
      .min(2, { message: "Full name must be at least 2 characters." })
      .max(80, { message: "Full name cannot exceed 80 characters." })
      .trim(),
    email: z.email({ message: "Please enter a valid email address." }).trim(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter." })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Password must contain at least one special character.",
      })
      .trim(),
    confirm_password: z.string().trim(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export type SignUpInput = z.infer<typeof SignUpSchema>;

// ---------------------------------------------------------------------------
// SIGN IN SCHEMA
// ---------------------------------------------------------------------------

export const SignInSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }).trim(),
  password: z
    .string()
    .min(1, { message: "Password is required." })
    .trim(),
});

export type SignInInput = z.infer<typeof SignInSchema>;

// ---------------------------------------------------------------------------
// UPDATE PROFILE SCHEMA
// ---------------------------------------------------------------------------

export const UpdateProfileSchema = z.object({
  display_name: z
    .string()
    .min(2, { message: "Display name must be at least 2 characters." })
    .max(80, { message: "Display name cannot exceed 80 characters." })
    .trim()
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(500, { message: "Bio cannot exceed 500 characters." })
    .trim()
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(20, { message: "Phone number is too long." })
    .trim()
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
