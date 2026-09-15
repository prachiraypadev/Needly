import { z } from "zod";

// ---------------------------------------------------------------------------
// COMMUNITY CONSTANTS & TYPES
// ---------------------------------------------------------------------------

export const COMMUNITY_TYPES = [
  "apartment",
  "gated",
  "hostel",
  "college",
  "university",
  "office",
  "family",
  "other",
] as const;

export type CommunityType = (typeof COMMUNITY_TYPES)[number];

export const COMMUNITY_TYPE_LABELS: Record<CommunityType, string> = {
  apartment: "Apartment / Society",
  gated: "Gated Community",
  hostel: "Hostel / PG",
  college: "College Campus",
  university: "University",
  office: "Office / Workplace",
  family: "Family & Friends",
  other: "Other Community",
};

// ---------------------------------------------------------------------------
// FORM STATE TYPES
// ---------------------------------------------------------------------------

export type CreateCommunityFormState =
  | {
      errors?: {
        name?: string[];
        type?: string[];
        description?: string[];
        is_private?: string[];
      };
      message?: string;
    }
  | undefined;

export type JoinCommunityFormState =
  | {
      errors?: {
        invite_code?: string[];
      };
      message?: string;
    }
  | undefined;

export type CreateInviteFormState =
  | {
      errors?: {
        email?: string[];
        phone?: string[];
      };
      message?: string;
      inviteToken?: string;
      success?: boolean;
    }
  | undefined;

// ---------------------------------------------------------------------------
// SCHEMAS
// ---------------------------------------------------------------------------

export const CreateCommunitySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Community name must be at least 2 characters." })
    .max(100, { message: "Community name cannot exceed 100 characters." })
    .trim(),
  type: z.enum(COMMUNITY_TYPES, {
    error: "Please select a valid community type.",
  }),
  description: z
    .string()
    .max(1000, { message: "Description cannot exceed 1000 characters." })
    .trim()
    .optional()
    .or(z.literal("")),
  is_private: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .transform((val) => val === true || val === "true")
    .default(true),
});

export type CreateCommunityInput = z.infer<typeof CreateCommunitySchema>;

export const JoinCommunitySchema = z.object({
  invite_code: z
    .string()
    .min(3, { message: "Invite code must be at least 3 characters." })
    .max(64, { message: "Invite code cannot exceed 64 characters." })
    .trim(),
});

export type JoinCommunityInput = z.infer<typeof JoinCommunitySchema>;

export const CreateInviteSchema = z
  .object({
    community_id: z.string().uuid({ message: "Invalid community ID." }),
    email: z
      .email({ message: "Please enter a valid email address." })
      .trim()
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .max(20, { message: "Phone number is too long." })
      .trim()
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => !!data.email || !!data.phone, {
    message: "Provide either an email or phone number for the targeted invite.",
    path: ["email"],
  });

export type CreateInviteInput = z.infer<typeof CreateInviteSchema>;
