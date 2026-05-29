export function Starfield() {
  const stars = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 7) % 100}%`,
    top: `${(i * 23 + 11) % 100}%`,
    size: i % 6 === 0 ? 1.5 : 1,
    opacity: 0.06 + (i % 5) * 0.02,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0 opacity-100"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% -20%, rgba(80, 60, 120, 0.12) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 100% 80%, rgba(50, 40, 80, 0.06) 0%, transparent 50%)',
        }}
      />
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white/80"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}
