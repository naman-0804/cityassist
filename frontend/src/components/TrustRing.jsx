export function TrustRing({ score, label = "Trust Score" }) {
  // Determine color based on score
  let color;
  if (score >= 80) {
    color = '#22c55e'; // green
  } else if (score >= 60) {
    color = '#f59e0b'; // amber
  } else {
    color = '#ef4444'; // red
  }

  // SVG circle parameters
  const size = 80;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(score, 100) / 100) * circumference;

  return (
    <div className="trust-ring-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Score text */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dy="0.3em"
          fontSize="14"
          fontWeight="bold"
          fill={color}
        >
          {score}{label === "Match Score" ? "%" : ""}
        </text>
      </svg>
      <span className="trust-ring-label">{label}</span>
    </div>
  );
}
