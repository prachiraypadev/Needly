import { z } from "zod";

// ---------------------------------------------------------------------------
// NEED CONSTANTS & TYPES
// ---------------------------------------------------------------------------

export const NEED_TYPES = ["borrow", "rent", "buy", "service"] as const;
export type NeedType = (typeof NEED_TYPES)[number];

export const NEED_STATUSES = [
  "open",
  "in_progress",
  "fulfilled",
  "cancelled",
  "expired",
] as const;
export type NeedStatus = (typeof NEED_STATUSES)[number];

export const NEED_TYPE_CONFIG: Record<
  NeedType,
  {
    label: string;
    shortLabel: string;
    description: string;
    badgeVariant: "borrow" | "rent" | "buy" | "service";
    hasBudget: boolean;
    hasDates: boolean;
    budgetLabel: string;
  }
> = {
  borrow: {
    label: "Borrow (Free)",
    shortLabel: "Borrow",
    description: "Borrow an item from a neighbor for a short time and return it.",
    badgeVariant: "borrow",
    hasBudget: false,
    hasDates: true,
    budgetLabel: "Deposit / Token (Optional)",
  },
  rent: {
    label: "Rent (Paid)",
    shortLabel: "Rent",
    description: "Rent equipment, tools, or appliances for a daily or weekly fee.",
    badgeVariant: "rent",
    hasBudget: true,
    hasDates: true,
    budgetLabel: "Rental Budget (₹)",
  },
  buy: {
    label: "Buy (Purchase)",
    shortLabel: "Buy",
    description: "Purchase a used or new item directly from a neighbor.",
    badgeVariant: "buy",
    hasBudget: true,
    hasDates: false,
    budgetLabel: "Buying Budget (₹)",
  },
  service: {
    label: "Service (Task / Help)",
    shortLabel: "Service",
    description: "Find trusted local help for repairs, chores, tutoring, or tasks.",
    badgeVariant: "service",
    hasBudget: true,
    hasDates: true,
    budgetLabel: "Service Budget (₹)",
  },
};

// ---------------------------------------------------------------------------
// FORM STATE TYPES
// ---------------------------------------------------------------------------

export type CreateNeedFormState =
  | {
      errors?: {
        title?: string[];
        description?: string[];
        need_type?: string[];
        community_id?: string[];
        category_id?: string[];
        budget_min?: string[];
        budget_max?: string[];
        quantity?: string[];
        needed_from?: string[];
        needed_until?: string[];
      };
      message?: string;
    }
  | undefined;

export type UpdateNeedFormState =
  | {
      errors?: {
        title?: string[];
        description?: string[];
        budget_min?: string[];
        budget_max?: string[];
        quantity?: string[];
        needed_from?: string[];
        needed_until?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

// ---------------------------------------------------------------------------
// SCHEMAS
// ---------------------------------------------------------------------------

export const CreateNeedSchema = z
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
    need_type: z.enum(NEED_TYPES, {
      error: "Please select a valid need type.",
    }),
    community_id: z.string().uuid({ message: "Please select a valid community." }),
    category_id: z
      .string()
      .trim()
      .optional()
      .or(z.literal("")),
    quantity: z.coerce
      .number()
      .int({ message: "Quantity must be an integer." })
      .min(1, { message: "Quantity must be at least 1." })
      .default(1),
    budget_min: z.coerce
      .number()
      .min(0, { message: "Minimum budget cannot be negative." })
      .optional()
      .nullable(),
    budget_max: z.coerce
      .number()
      .min(0, { message: "Maximum budget cannot be negative." })
      .optional()
      .nullable(),
    needed_from: z.string().optional().or(z.literal("")),
    needed_until: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (
        data.budget_min != null &&
        data.budget_max != null &&
        !isNaN(data.budget_min) &&
        !isNaN(data.budget_max) &&
        data.budget_min > 0 &&
        data.budget_max > 0
      ) {
        return data.budget_max >= data.budget_min;
      }
      return true;
    },
    {
      message: "Maximum budget cannot be less than minimum budget.",
      path: ["budget_max"],
    }
  )
  .refine(
    (data) => {
      if (data.needed_from && data.needed_until) {
        const from = new Date(data.needed_from).getTime();
        const until = new Date(data.needed_until).getTime();
        if (!isNaN(from) && !isNaN(until)) {
          return until >= from;
        }
      }
      return true;
    },
    {
      message: "End date cannot be earlier than start date.",
      path: ["needed_until"],
    }
  );

export type CreateNeedInput = z.infer<typeof CreateNeedSchema>;

export const UpdateNeedSchema = z
  .object({
    need_id: z.string().uuid({ message: "Invalid need ID." }),
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
    quantity: z.coerce
      .number()
      .int()
      .min(1, { message: "Quantity must be at least 1." })
      .optional(),
    budget_min: z.coerce.number().min(0).optional().nullable(),
    budget_max: z.coerce.number().min(0).optional().nullable(),
    needed_from: z.string().optional().or(z.literal("")),
    needed_until: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (
        data.budget_min != null &&
        data.budget_max != null &&
        !isNaN(data.budget_min) &&
        !isNaN(data.budget_max) &&
        data.budget_min > 0 &&
        data.budget_max > 0
      ) {
        return data.budget_max >= data.budget_min;
      }
      return true;
    },
    {
      message: "Maximum budget cannot be less than minimum budget.",
      path: ["budget_max"],
    }
  );

export type UpdateNeedInput = z.infer<typeof UpdateNeedSchema>;
