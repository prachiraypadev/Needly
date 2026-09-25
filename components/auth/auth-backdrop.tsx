/**
 * AuthBackdrop — soft drifting colour and a few of the everyday things
 * neighbours lend each other, floating behind the login / signup card.
 */
const ITEMS: { e: string; x: string; y: string; d: string }[] = [
  { e: "🔨", x: "8%", y: "18%", d: "0s" },
  { e: "🪜", x: "86%", y: "14%", d: "-3s" },
  { e: "📽️", x: "12%", y: "72%", d: "-6s" },
  { e: "🚲", x: "82%", y: "68%", d: "-2s" },
  { e: "📚", x: "48%", y: "8%", d: "-8s" },
  { e: "🧳", x: "90%", y: "42%", d: "-5s" },
  { e: "🔌", x: "4%", y: "45%", d: "-10s" },
  { e: "⛺", x: "54%", y: "90%", d: "-4s" },
];

export function AuthBackdrop() {
  return (
    <div className="auth-backdrop" aria-hidden="true">
      <div className="auth-backdrop__blob" />
      <div className="auth-backdrop__blob" />
      <div className="auth-backdrop__blob" />
      {ITEMS.map((it) => (
        <span key={it.e} className="auth-backdrop__item" style={{ left: it.x, top: it.y, animationDelay: it.d }}>
          {it.e}
        </span>
      ))}
    </div>
  );
}
