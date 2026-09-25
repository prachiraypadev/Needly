import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/marketing/reveal";

/**
 * The four ways a need gets fulfilled. Each card plays a tiny looping
 * handover that encodes what's actually different about that modality:
 *
 *   Borrow  — the item goes over and comes back. Nothing else moves.
 *   Rent    — the item goes over, money comes back, then the item returns.
 *   Buy     — item and money swap once. The item stays.
 *   Service — nothing is handed over; the provider walks over, fixes, leaves.
 */

type Modality = "borrow" | "rent" | "buy" | "service";

const MODALITIES: {
  key: Modality;
  badge: string;
  meta: string;
  title: string;
  body: string;
  flow: string[];
  examplesLabel: string;
  examples: string;
}[] = [
  {
    key: "borrow",
    badge: "Borrow",
    meta: "Zero cost",
    title: "Neighbour Lending",
    body: "Borrow tools, projectors, luggage or board games from neighbours who already have them idling.",
    flow: ["Item goes", "You use it", "Item returns"],
    examplesLabel: "Common items",
    examples: "Drill machines, ladders, folding tables, camping gear, moving boxes.",
  },
  {
    key: "rent",
    badge: "Rent",
    meta: "Per-day / per-hour",
    title: "Resource Rentals",
    body: "Rent high-value equipment or event supplies with structured pickup, deposit and return tracking.",
    flow: ["Item goes", "₹ comes back", "Item returns"],
    examplesLabel: "Common items",
    examples: "Event speakers, DSLR cameras, VR headsets, bicycles, pressure washers.",
  },
  {
    key: "buy",
    badge: "Buy",
    meta: "Direct purchase",
    title: "Pre-Loved Goods",
    body: "Buy furniture, appliances, books or cycles directly from neighbours — no courier fees, no scams.",
    flow: ["Item goes", "₹ comes back", "It's yours"],
    examplesLabel: "Common items",
    examples: "Study tables, kids' cycles, microwave ovens, textbooks, plants.",
  },
  {
    key: "service",
    badge: "Service",
    meta: "Verified help",
    title: "Trusted Services",
    body: "Connect with electricians, carpenters, plumbers, tutors or cleaners recommended by members.",
    flow: ["Helper comes", "Job done", "Helper leaves"],
    examplesLabel: "Common services",
    examples: "Fan installation, AC repair, plumbing, pet sitting, maths tuition.",
  },
];

function PersonShape({ className }: { className?: string }) {
  return (
    <g className={className}>
      <circle cx="0" cy="-54" r="10" className="mod-skin" />
      <rect x="-12" y="-42" width="24" height="32" rx="11" className="mod-shirt" />
      <line x1="-5" y1="-12" x2="-6" y2="0" className="mod-leg" />
      <line x1="5" y1="-12" x2="6" y2="0" className="mod-leg" />
    </g>
  );
}

function House({ x, lit }: { x: number; lit?: boolean }) {
  return (
    <g transform={`translate(${x} 100)`} className="mod-house">
      <path d="M-26 0 V-36 L0 -56 L26 -36 V0 Z" />
      <rect x="-8" y="-30" width="16" height="14" rx="2" className={lit ? "mod-window mod-window--fix" : "mod-window"} />
    </g>
  );
}

function ItemShape({ kind }: { kind: Modality }) {
  switch (kind) {
    case "borrow": // drill
      return (
        <g>
          <rect x="-12" y="-8" width="22" height="10" rx="3" className="mod-item-fill" />
          <rect x="-6" y="0" width="8" height="12" rx="2" className="mod-item-dark" />
          <rect x="10" y="-5" width="8" height="3" rx="1" className="mod-item-dark" />
        </g>
      );
    case "rent": // camera
      return (
        <g>
          <rect x="-13" y="-8" width="26" height="18" rx="4" className="mod-item-fill" />
          <circle cx="0" cy="1" r="5.5" className="mod-item-dark" />
          <rect x="-8" y="-12" width="8" height="5" rx="1.5" className="mod-item-fill" />
        </g>
      );
    case "buy": // chair
      return (
        <g>
          <rect x="-10" y="-16" width="4" height="26" rx="1.5" className="mod-item-fill" />
          <rect x="-10" y="-1" width="20" height="4" rx="1.5" className="mod-item-fill" />
          <rect x="7" y="2" width="3" height="9" rx="1" className="mod-item-fill" />
        </g>
      );
    default:
      return null;
  }
}

function Coin() {
  return (
    <g className="mod-coin">
      <circle r="8" />
      <text y="3.5" textAnchor="middle">
        ₹
      </text>
    </g>
  );
}

function ModalityStage({ kind }: { kind: Modality }) {
  return (
    <svg viewBox="0 0 260 118" className={`mod-stage mod-${kind}`} aria-hidden="true">
      <line x1="8" y1="100" x2="252" y2="100" className="mod-ground" />
      <House x={38} lit={kind === "service"} />
      <House x={222} />

      {/* Requester on the left, owner / provider on the right */}
      <g transform="translate(72 100)">
        <PersonShape className="mod-person mod-person--you" />
      </g>

      {kind === "service" ? (
        <g transform="translate(188 100)">
          <g className="mod-provider">
            <PersonShape className="mod-person mod-person--them" />
            <g transform="translate(-16 -26)">
              <g className="mod-wrench">
                <path d="M0 0 L-12 -12 M-12 -12 a4 4 0 1 1 -4 -4" />
              </g>
            </g>
          </g>
          <g transform="translate(-116 -70)">
            <g className="mod-sparkles">
              <path d="M0 -7 V7 M-7 0 H7" />
              <path d="M16 6 V14 M12 10 H20" />
              <path d="M-14 12 V18 M-17 15 H-11" />
            </g>
          </g>
        </g>
      ) : (
        <>
          <g transform="translate(188 100)">
            <PersonShape className="mod-person mod-person--them" />
          </g>
          <g transform="translate(170 66)">
            <g className="mod-item">
              <ItemShape kind={kind} />
            </g>
          </g>
        </>
      )}

      {(kind === "rent" || kind === "buy") && (
        <g transform="translate(90 60)">
          <g className="mod-coin-track">
            <Coin />
          </g>
        </g>
      )}

      {(kind === "borrow" || kind === "rent") && (
        <g transform="translate(72 22)">
          <g className="mod-clock">
            <circle r="9" />
            <path d="M0 -5 V0 L4 2" />
          </g>
        </g>
      )}

      {kind === "borrow" || kind === "rent" ? (
        <g transform="translate(188 22)">
          <g className="mod-tick mod-tick--returned">
            <circle r="9" />
            <path d="M-4 0 L-1 3 L4 -3" />
          </g>
        </g>
      ) : (
        <g transform="translate(72 22)">
          <g className="mod-tick mod-tick--yours">
            <circle r="9" />
            <path d="M-4 0 L-1 3 L4 -3" />
          </g>
        </g>
      )}
    </svg>
  );
}

export function ModalityCards() {
  return (
    <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {MODALITIES.map((m, i) => (
        <Reveal key={m.key} delay={i * 90} className="h-full">
          <article className={`mod-card mod-card--${m.key}`}>
            <div className="mod-card__stage">
              <ModalityStage kind={m.key} />
              <ol className="mod-flow">
                {m.flow.map((step, idx) => (
                  <li key={step} style={{ animationDelay: `${idx * 1.65}s` }}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <Badge variant={m.key}>{m.badge}</Badge>
                <span className="text-xs font-medium text-[var(--color-neutral-500)]">{m.meta}</span>
              </div>
              <h3 className="mt-3 text-lg font-bold tracking-tight text-[var(--color-neutral-900)]">{m.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-neutral-500)]">{m.body}</p>
              <div className="mt-4 border-t border-[var(--color-neutral-100)] pt-3 text-xs text-[var(--color-neutral-600)]">
                <p className="mb-1 font-semibold text-[var(--color-neutral-800)]">{m.examplesLabel}:</p>
                <p>{m.examples}</p>
              </div>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
