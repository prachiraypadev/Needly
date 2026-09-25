import { z } from "zod";

export const CreateOfferSchema = z.object({
  need_id: z.string().uuid("Invalid need ID"),
  message: z
    .string()
    .min(3, "Please write a short note (e.g. 'I have this, you can take it from Room 204')")
    .max(1000, "Message cannot exceed 1000 characters"),
  price_amount: z
    .coerce
    .number()
    .min(0, "Price must be 0 or positive")
    .optional(),
  available_from: z.string().optional(),
  available_until: z.string().optional(),
});

export type CreateOfferInput = z.infer<typeof CreateOfferSchema>;

export type OfferFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};
