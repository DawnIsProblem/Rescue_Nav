interface DispatchMapOverlayProps {
  mode: 'desktop' | 'tablet' | 'mobile'
}

export default function DispatchMapOverlay({ mode }: DispatchMapOverlayProps) {
  if (mode === 'mobile') {
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 390 844" fill="none" aria-hidden>
        <path d="M95 140 C130 110 180 150 210 130" stroke="#FF3346" strokeWidth="6" opacity="0.85" />
        <path d="M142 84 L148 844" stroke="#FF3346" strokeWidth="4" opacity="0.85" />
        <path d="M191 84 L199 844" stroke="#FF3346" strokeWidth="4" opacity="0.85" />
      </svg>
    )
  }

  if (mode === 'tablet') {
    return (
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1400 900" fill="none" aria-hidden>
        <defs>
          <radialGradient id="tabletMapGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(900 260) rotate(120) scale(1100 820)">
            <stop stopColor="#CED7BA" />
            <stop offset="1" stopColor="#6E9A95" />
          </radialGradient>
        </defs>
        <rect width="1400" height="900" fill="url(#tabletMapGlow)" />
        <path
          d="M290 730 L560 545 L640 355 L840 275 L980 150"
          stroke="#BE1E2D"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="290" cy="730" r="12" fill="#BE1E2D" />
      </svg>
    )
  }

  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1400 900" fill="none" aria-hidden>
      <defs>
        <pattern id="roadsPattern" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M0 0 H28 M0 14 H28 M14 0 V28" stroke="#E8E9E4" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="1400" height="900" fill="#ECEDE8" />
      <rect width="1400" height="900" fill="url(#roadsPattern)" opacity="0.9" />
      <path d="M0 0 V900" stroke="#A6CFE2" strokeWidth="140" opacity="0.4" />
      <path d="M1250 0 V900" stroke="#A6CFE2" strokeWidth="120" opacity="0.3" />

      <path
        d="M250 760 C 450 730, 560 650, 630 510 C 700 350, 780 340, 850 380"
        stroke="#B81928"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray="14 10"
      />

      <polygon
        points="840,380 980,400 955,520 805,500"
        fill="rgba(220,38,38,0.12)"
        stroke="#C71F2D"
        strokeWidth="3"
      />
      <circle cx="250" cy="760" r="18" fill="#C71F2D" />
      <circle cx="850" cy="380" r="20" fill="#C71F2D" />
      <circle cx="850" cy="380" r="8" fill="white" />
    </svg>
  )
}
