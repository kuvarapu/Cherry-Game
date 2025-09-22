import React, { useMemo } from 'react';

// Animated falling cherries background
function CherryRain({ count = 25 }) {
  const cherries = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // vw
      delay: Math.random() * 5, // s
      duration: 6 + Math.random() * 6, // s
      size: 16 + Math.random() * 18 // px
    }));
  }, [count]);

  return (
    <div className="cherry-rain" aria-hidden>
      {cherries.map((c) => (
        <div
          key={c.id}
          className="cherry"
          style={{
            left: `${c.left}vw`,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            fontSize: `${c.size}px`
          }}
        >
          {/* cherry emoji */}
          <span role="img" aria-label="cherry">🍒</span>
        </div>
      ))}
    </div>
  );
}

export default CherryRain;
