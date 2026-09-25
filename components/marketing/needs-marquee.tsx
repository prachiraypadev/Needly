import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatusDot } from "@/components/shared/status-dot";
import { Reveal } from "@/components/marketing/reveal";

type Kind = "borrow" | "rent" | "buy" | "service";

interface ExampleNeed {
  kind: Kind;
  title: string;
  who: string;
  unit: string;
  meta: string;
  fulfilled?: boolean;
}

// Example needs, the kind that show up in any housing society feed.
const ROW_A: ExampleNeed[] = [
  { kind: "borrow", title: "10 folding chairs for a birthday", who: "Meera Sen", unit: "C-302", meta: "3 offers", fulfilled: true },
  { kind: "service", title: "Electrician for 2 ceiling fans", who: "Karan Grover", unit: "Tower 4", meta: "₹400–₹600" },
  { kind: "rent", title: "Tripod & ring light for a shoot", who: "Sneha Rao", unit: "Flat 801", meta: "₹150/day", fulfilled: true },
  { kind: "buy", title: "Second-hand study table", who: "Arjun Mehta", unit: "A-110", meta: "Under ₹2,000" },
  { kind: "borrow", title: "Step ladder, 6 ft, this evening", who: "Farah Khan", unit: "B-704", meta: "2 offers" },
  { kind: "rent", title: "Projector for Saturday movie night", who: "Dev Iyer", unit: "D-201", meta: "₹300/day", fulfilled: true },
];

const ROW_B: ExampleNeed[] = [
  { kind: "service", title: "Maths tutor for Class 8", who: "Anita Joshi", unit: "E-503", meta: "Weekends" },
  { kind: "borrow", title: "Car jump-start cables", who: "Rohan Das", unit: "Parking B2", meta: "Urgent", fulfilled: true },
  { kind: "buy", title: "Kid's cycle, 16 inch", who: "Neha Kapoor", unit: "C-905", meta: "Under ₹2,500" },
  { kind: "rent", title: "75L trekking rucksack", who: "Vikram Nair", unit: "A-402", meta: "₹80/day" },
  { kind: "service", title: "Plumber for leaking kitchen tap", who: "Pooja Reddy", unit: "B-1102", meta: "Today", fulfilled: true },
  { kind: "borrow", title: "Extra mattress for guests", who: "Sameer Ali", unit: "D-608", meta: "2 nights" },
];

const LABEL: Record<Kind, string> = { borrow: "Borrow", rent: "Rent", buy: "Buy", service: "Service" };

function NeedTile({ need, index }: { need: ExampleNeed; index: number }) {
  return (
    <article className="marquee-tile" aria-hidden={index >= 6 ? true : undefined}>
      <div className="flex items-center justify-between">
        <Badge variant={need.kind}>{LABEL[need.kind]}</Badge>
        <StatusDot status={need.fulfilled ? "fulfilled" : "open"} label={need.fulfilled ? "Fulfilled" : "Open"} />
      </div>
      <h3 className="mt-2.5 text-sm font-bold leading-snug text-[var(--color-neutral-900)]">{need.title}</h3>
      <div className="mt-3 flex items-center justify-between border-t border-[var(--color-neutral-100)] pt-2.5 text-xs text-[var(--color-neutral-500)]">
        <span className="flex items-center gap-2">
          <Avatar name={need.who} size="sm" />
          {need.who.split(" ")[0]} {need.who.split(" ")[1]?.[0]}. · {need.unit}
        </span>
        <span className="font-semibold text-[var(--color-primary-600)]">{need.meta}</span>
      </div>
      {need.fulfilled && (
        <span className="marquee-stamp" style={{ animationDelay: `${0.4 + (index % 6) * 0.25}s` }}>
          Jod ✓
        </span>
      )}
    </article>
  );
}

function Row({ items, reverse }: { items: ExampleNeed[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee" data-reverse={reverse}>
      <div className="marquee__track">
        {doubled.map((n, i) => (
          <NeedTile key={`${n.title}-${i}`} need={n} index={i} />
        ))}
      </div>
    </div>
  );
}

export function NeedsMarquee() {
  return (
    <Reveal variant="none" className="marquee-wrap mt-14">
      <Row items={ROW_A} />
      <Row items={ROW_B} reverse />
    </Reveal>
  );
}
