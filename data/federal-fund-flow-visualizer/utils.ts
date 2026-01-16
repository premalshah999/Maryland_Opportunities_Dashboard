// Arc Generation Algorithm
export function createArcPoints(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number,
  numPoints = 50
): [number[], number[]] {
  const lons: number[] = [];
  const lats: number[] = [];
  const dx = lon2 - lon1;
  const dy = lat2 - lat1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const arcHeight = distance * 0.15; // 15% of distance

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);

    // Base linear interpolation
    let currentLon = lon1 + dx * t;
    let currentLat = lat1 + dy * t;

    // Add perpendicular offset for curve
    const offset = 4 * arcHeight * t * (1 - t);

    // Perpendicular vector (-dy, dx)
    const perpLon = -dy;
    const perpLat = dx;
    const length = Math.sqrt(perpLon * perpLon + perpLat * perpLat);

    if (length > 0) {
      currentLon += (perpLon / length) * offset;
      currentLat += (perpLat / length) * offset;
    }

    lons.push(currentLon);
    lats.push(currentLat);
  }

  return [lons, lats];
}

// Subtle, elegant flow color gradient (Maryland-inspired coral/rose spectrum)
export function getFlowColor(normAmount: number): string {
  // Gradient: soft coral -> warm rose -> deep crimson
  const low = [254, 205, 200];   // Soft coral (subtle, low amounts)
  const mid = [239, 128, 128];   // Rose/salmon
  const high = [185, 28, 28];    // Deep red/crimson (high amounts - Maryland red)

  let r, g, b;
  if (normAmount < 0.5) {
    const t = normAmount * 2;
    r = Math.round(low[0] + (mid[0] - low[0]) * t);
    g = Math.round(low[1] + (mid[1] - low[1]) * t);
    b = Math.round(low[2] + (mid[2] - low[2]) * t);
  } else {
    const t = (normAmount - 0.5) * 2;
    r = Math.round(mid[0] + (high[0] - mid[0]) * t);
    g = Math.round(mid[1] + (high[1] - mid[1]) * t);
    b = Math.round(mid[2] + (high[2] - mid[2]) * t);
  }

  return `rgb(${r},${g},${b})`;
}

export const formatCurrency = (val: number) => {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
};

export const formatNumber = (val: number) => {
  return new Intl.NumberFormat('en-US').format(val);
};

// Political lean by state (0 = Strong Red, 1 = Strong Blue)
export const POLITICAL_LEAN: Record<string, number> = {
  'Alabama': 0.15, 'Alaska': 0.35, 'Arizona': 0.48, 'Arkansas': 0.15, 'California': 0.85,
  'Colorado': 0.65, 'Connecticut': 0.80, 'Delaware': 0.75, 'Florida': 0.45, 'Georgia': 0.48,
  'Hawaii': 0.90, 'Idaho': 0.15, 'Illinois': 0.75, 'Indiana': 0.30, 'Iowa': 0.40,
  'Kansas': 0.25, 'Kentucky': 0.20, 'Louisiana': 0.20, 'Maine': 0.60, 'Maryland': 0.80,
  'Massachusetts': 0.85, 'Michigan': 0.52, 'Minnesota': 0.55, 'Mississippi': 0.20, 'Missouri': 0.30,
  'Montana': 0.30, 'Nebraska': 0.25, 'Nevada': 0.52, 'New Hampshire': 0.52, 'New Jersey': 0.70,
  'New Mexico': 0.60, 'New York': 0.80, 'North Carolina': 0.48, 'North Dakota': 0.15, 'Ohio': 0.40,
  'Oklahoma': 0.10, 'Oregon': 0.70, 'Pennsylvania': 0.50, 'Rhode Island': 0.80, 'South Carolina': 0.30,
  'South Dakota': 0.15, 'Tennessee': 0.20, 'Texas': 0.40, 'Utah': 0.25, 'Vermont': 0.85,
  'Virginia': 0.58, 'Washington': 0.75, 'West Virginia': 0.15, 'Wisconsin': 0.50, 'Wyoming': 0.10,
  'District of Columbia': 0.95, 'Puerto Rico': 0.60
};
