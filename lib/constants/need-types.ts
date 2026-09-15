export const NEED_TYPES = {
  BORROW: "borrow",
  RENT: "rent",
  BUY: "buy",
  SERVICE: "service",
} as const;

export type NeedType = (typeof NEED_TYPES)[keyof typeof NEED_TYPES];

export const NEED_TYPE_CONFIG: Record<
  NeedType,
  {
    label: string;
    description: string;
    badgeVariant: "borrow" | "rent" | "buy" | "service";
    actionLabel: string;
    placeholder: string;
  }
> = {
  borrow: {
    label: "Borrow",
    description: "Temporarily borrow an item from a neighbor with zero rental cost",
    badgeVariant: "borrow",
    actionLabel: "Offer to Lend",
    placeholder: "e.g., A ladder for 2 hours this Saturday",
  },
  rent: {
    label: "Rent",
    description: "Rent equipment or tools for a specified duration and price",
    badgeVariant: "rent",
    actionLabel: "Offer to Rent",
    placeholder: "e.g., A high-definition projector for movie night",
  },
  buy: {
    label: "Buy",
    description: "Purchase pre-loved items directly from trusted community members",
    badgeVariant: "buy",
    actionLabel: "Offer to Sell",
    placeholder: "e.g., Study table or ergonomic desk chair in good condition",
  },
  service: {
    label: "Service",
    description: "Request verified local help such as electricians, plumbers, tutors, or cleaners",
    badgeVariant: "service",
    actionLabel: "Offer Service",
    placeholder: "e.g., Electrician to install 2 ceiling fans this evening",
  },
};

export const NEED_STATUSES = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  FULFILLED: "fulfilled",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export type NeedStatus = (typeof NEED_STATUSES)[keyof typeof NEED_STATUSES];
