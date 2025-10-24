export function Spinner({ size = 20, color = "rgba(255, 255, 255, 0.8)" }) {
  const bars = Array(12).fill(0);

  return (
    <div
      style={{
        height: `${size}px`,
        width: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          position: 'relative',
          height: `${size}px`,
          width: `${size}px`,
        }}
      >
        {bars.map((_, i) => (
          <div
            key={`spinner-bar-${i}`}
            style={{
              animation: 'spin 1.2s linear infinite',
              animationDelay: `${-1.2 + i * 0.1}s`,
              background: color,
              borderRadius: '6px',
              height: '8%',
              left: '-10%',
              position: 'absolute',
              top: '-3.9%',
              width: '24%',
              transform: `rotate(${i * 30}deg) translate(146%)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}