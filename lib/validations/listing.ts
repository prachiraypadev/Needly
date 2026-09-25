import { z } from "zod";

// ---------------------------------------------------------------------------
// LISTING CONSTANTS & TYPES
// ---------------------------------------------------------------------------

export const LISTING_TYPES = ["item", "service"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

export const TRANSACTION_TYPES = ["lend", "rent", "sell", "service"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const ITEM_TRANSACTION_TYPES = ["lend", "rent", "sell"] as const;
export type ItemTransactionType = (typeof ITEM_TRANSACTION_TYPES)[number];

export const PRICE_UNITS = [
  "fixed",
  "per_day",
  "per_hour",
  "negotiable",
] as const;
export type PriceUnit = (typeof PRICE_UNITS)[number];

export const ITEM_CONDITIONS = [
  "new",
  "like_new",
  "good",
  "fair",
  "poor",
] as const;
export type ItemCondition = (typeof ITEM_CONDITIONS)[number];

export const ITEM_CONDITION_LABELS: Record<ItemCondition, { label: string; description: string }> = {
  new: { label: "Brand New", description: "Unopened or never used, in original condition" },
  like_new: { label: "Like New", description: "Minimal signs of wear, fully functional" },
  good: { label: "Good", description: "Gently used with minor cosmetic wear, works perfectly" },
  fair: { label: "Fair", description: "Noticeable wear and tear, but fully operational" },
  poor: { label: "Poor", description: "Heavy wear, for parts or restoration" },
};

export const LISTING_STATUSES = [
  "draft",
  "active",
  "paused",
  "unavailable",
  "archived",
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
] as const;

export const TRANSACTION_TYPE_CONFIG: Record<
  TransactionType,
  {
    label: string;
    shortLabel: string;
    description: string;
    badgeVariant: "borrow" | "rent" | "buy" | "service";
    allowedPriceUnits: PriceUnit[];
    defaultPriceUnit: PriceUnit | null;
  }
> = {
  lend: {
    label: "Lend (Free sharing)",
    shortLabel: "Lend",
    description: "Share for free with neighbors. They will return it when finished.",
    badgeVariant: "borrow",
    allowedPriceUnits: [],
    defaultPriceUnit: null,
  },
  rent: {
    label: "Rent (Paid sharing)",
    shortLabel: "Rent",
    description: "Rent out your item for a daily or hourly fee.",
    badgeVariant: "rent",
    allowedPriceUnits: ["per_day", "per_hour"],
    defaultPriceUnit: "per_day",
  },
  sell: {
    label: "Sell (One-time purchase)",
    shortLabel: "Sell",
    description: "Sell your pre-owned or new item directly to a neighbor.",
    badgeVariant: "buy",
    allowedPriceUnits: ["fixed", "negotiable"],
    defaultPriceUnit: "fixed",
  },
  service: {
    label: "Service (Help / Task)",
    shortLabel: "Service",
    description: "Offer your skills, repairs, tutoring, or professional services.",
    badgeVariant: "service",
    allowedPriceUnits: ["fixed", "per_hour", "negotiable"],
    defaultPriceUnit: "per_hour",
  },
};

// ---------------------------------------------------------------------------
// FORM STATE TYPES
// ---------------------------------------------------------------------------

export type CreateListingFormState =
  | {
      errors?: {
        title?: string[];
        description?: string[];
        listing_type?: string[];
        transaction_type?: string[];
        community_id?: string[];
        category_id?: string[];
        price_amount?: string[];
        price_unit?: string[];
        quantity?: string[];
        condition?: string[];
        media_urls?: string[];
        availability?: string[];
      };
      message?: string;
    }
  | undefined;

export type UpdateListingFormState =
  | {
      errors?: {
        title?: string[];
        description?: string[];
        category_id?: string[];
        price_amount?: string[];
        price_unit?: string[];
        quantity?: string[];
        condition?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

// ---------------------------------------------------------------------------
// SCHEMAS
// ---------------------------------------------------------------------------

const AvailabilitySlotSchema = z
  .object({
    day_of_week: z.coerce.number().int().min(0).max(6),
    time_from: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Invalid start time"),
    time_to: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Invalid end time"),
  })
  .refine((data) => data.time_from < data.time_to, {
    message: "Start time must be earlier than end time",
    path: ["time_to"],
  });

export const CreateListingSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: "Title must be at least 3 characters." })
      .max(120, { message: "Title cannot exceed 120 characters." })
      .trim(),
    description: z
      .string()
      .max(2000, { message: "Description cannot exceed 2000 characters." })
      .trim()
      .optional()
      .or(z.literal("")),
    listing_type: z.enum(LISTING_TYPES, {
      error: "Please select Item or Service.",
    }),
    transaction_type: z.enum(TRANSACTION_TYPES, {
      error: "Please select a valid transaction mode.",
    }),
    community_id: z.string().uuid({ message: "Please select a valid community." }),
    category_id: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
    price_amount: z.coerce
      .number()
      .min(0, { message: "Price cannot be negative." })
      .optional()
      .nullable(),
    price_unit: z
      .enum(PRICE_UNITS, {
        error: "Please select a valid pricing unit.",
      })
      .optional()
      .nullable()
      .or(z.literal("")),
    quantity: z.coerce
      .number()
      .int({ message: "Quantity must be an integer." })
      .min(0, { message: "Quantity cannot be negative." })
      .default(1),
    condition: z
      .enum(ITEM_CONDITIONS, {
        error: "Please select a valid item condition.",
      })
      .optional()
      .nullable()
      .or(z.literal("")),
    media_urls: z.array(z.string().url()).optional().default([]),
    availability_slots: z.array(AvailabilitySlotSchema).optional().default([]),
  })
  .refine(
    (data) => {
      // Condition rule: Service listings cannot have a condition
      if (data.listing_type === "service" && data.condition) {
        return false;
      }
      return true;
    },
    {
      message: "Item condition is not applicable for services.",
      path: ["condition"],
    }
  )
  .refine(
    (data) => {
      // Transaction type mapping rule
      if (data.listing_type === "service") {
        return data.transaction_type === "service";
      }
      return ["lend", "rent", "sell"].includes(data.transaction_type);
    },
    {
      message: "Transaction type must match Item vs Service selection.",
      path: ["transaction_type"],
    }
  )
  .refine(
    (data) => {
      // Pricing unit rule: If price_amount is provided and > 0, price_unit must be provided
      if (data.price_amount != null && data.price_amount > 0 && !data.price_unit) {
        return false;
      }
      return true;
    },
    {
      message: "Pricing unit is required when a price amount is specified.",
      path: ["price_unit"],
    }
  );

export type CreateListingInput = z.infer<typeof CreateListingSchema>;

export const UpdateListingSchema = z
  .object({
    listing_id: z.string().uuid({ message: "Invalid listing ID." }),
    title: z
      .string()
      .min(3, { message: "Title must be at least 3 characters." })
      .max(120, { message: "Title cannot exceed 120 characters." })
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, { message: "Description cannot exceed 2000 characters." })
      .trim()
      .optional()
      .or(z.literal("")),
    category_id: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
    price_amount: z.coerce.number().min(0).optional().nullable(),
    price_unit: z.enum(PRICE_UNITS).optional().nullable().or(z.literal("")),
    quantity: z.coerce.number().int().min(0).optional(),
    condition: z.enum(ITEM_CONDITIONS).optional().nullable().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.price_amount != null && data.price_amount > 0 && !data.price_unit) {
        return false;
      }
      return true;
    },
    {
      message: "Pricing unit is required when a price amount is specified.",
      path: ["price_unit"],
    }
  );

export type UpdateListingInput = z.infer<typeof UpdateListingSchema>;
