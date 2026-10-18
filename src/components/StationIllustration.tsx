import React from 'react';

export const StationIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full overflow-hidden select-none flex flex-col items-center ${className}`}>
      {/* Station Graphic SVG Canvas */}
      <svg
        viewBox="0 0 420 540"
        className="w-full h-auto max-h-[460px] object-cover"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="60%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <linearGradient id="trainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="15%" stopColor="#2563eb" />
            <stop offset="70%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>

          <linearGradient id="platformFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c68652" />
            <stop offset="100%" stopColor="#a36336" />
          </linearGradient>

          <linearGradient id="shirtGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d1d5db" />
            <stop offset="50%" stopColor="#9ca3af" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>

          <linearGradient id="bagGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4a373" />
            <stop offset="50%" stopColor="#bc8a5f" />
            <stop offset="100%" stopColor="#a47148" />
          </linearGradient>

          {/* Shadow filter */}
          <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* 1. Sky & Distant Atmosphere */}
        <rect width="420" height="540" fill="url(#skyGrad)" />

        {/* Distant Station Shed Truss & Columns */}
        <g opacity="0.45">
          {/* Steel girders overhead */}
          <path d="M0 60 L420 120" stroke="#64748b" strokeWidth="4" />
          <path d="M0 80 L420 140" stroke="#64748b" strokeWidth="3" />
          <path d="M60 70 L60 180 M160 85 L160 190 M260 100 L260 200 M360 115 L360 210" stroke="#475569" strokeWidth="3.5" />
          {/* Cross braces */}
          <path d="M60 80 L160 120 M160 80 L60 120 M160 95 L260 135 M260 95 L160 135 M260 110 L360 150 M360 110 L260 150" stroke="#94a3b8" strokeWidth="1.5" />
        </g>

        {/* 2. Indian Railway Train Coaches on Track (Left Side) */}
        <g id="train-background">
          {/* Train body */}
          <rect x="-30" y="240" width="160" height="150" rx="8" fill="url(#trainGrad)" />
          {/* Silver/Blue roof curve */}
          <rect x="-35" y="235" width="170" height="12" rx="4" fill="#93c5fd" />
          {/* Yellow livery stripe (Indian Railways Rajdhani/Express signature) */}
          <rect x="-30" y="290" width="160" height="10" fill="#facc15" />
          <rect x="-30" y="360" width="160" height="8" fill="#facc15" />
          {/* Train Windows with passengers */}
          <rect x="-15" y="258" width="35" height="24" rx="4" fill="#0f172a" />
          <rect x="30" y="258" width="35" height="24" rx="4" fill="#0f172a" />
          <rect x="75" y="258" width="35" height="24" rx="4" fill="#0f172a" />
          {/* Warm light inside windows */}
          <rect x="-13" y="260" width="31" height="20" rx="2" fill="#fef08a" opacity="0.75" />
          <rect x="32" y="260" width="31" height="20" rx="2" fill="#fef08a" opacity="0.75" />
          <rect x="77" y="260" width="31" height="20" rx="2" fill="#fef08a" opacity="0.75" />
          {/* Window passenger silhouettes */}
          <circle cx="48" cy="272" r="6" fill="#1e293b" />
          <circle cx="92" cy="272" r="6" fill="#1e293b" />
        </g>

        {/* 3. Platform Surface */}
        <polygon points="0,380 420,320 420,540 0,540" fill="url(#platformFloor)" />

        {/* Indian Railway Yellow Tactile Line for Blind/Safety */}
        <polygon points="0,455 420,385 420,402 0,472" fill="#eab308" />
        {/* Tactile line dots/texture */}
        <line x1="0" y1="463" x2="420" y2="393" stroke="#ca8a04" strokeWidth="2" strokeDasharray="6,4" />

        {/* 4. Background Passengers Walking on Platform */}
        <g id="passengers" opacity="0.65">
          {/* Passenger 1 with backpack (walking left) */}
          <circle cx="85" cy="325" r="7" fill="#334155" />
          <path d="M78 335 L92 335 L88 380 L76 380 Z" fill="#1e293b" />
          {/* Backpack */}
          <rect x="68" y="335" width="10" height="18" rx="3" fill="#0284c7" />
          {/* Trolley bag */}
          <rect x="100" y="355" width="12" height="22" rx="2" fill="#dc2626" />
          <line x1="95" y1="345" x2="100" y2="355" stroke="#475569" strokeWidth="2" />

          {/* Passenger 2 (sitting on platform bench right side) */}
          <rect x="340" y="340" width="55" height="6" fill="#475569" />
          <rect x="350" y="346" width="4" height="15" fill="#334155" />
          <rect x="380" y="346" width="4" height="15" fill="#334155" />
          {/* Person seated with phone */}
          <circle cx="365" cy="325" r="7" fill="#334155" />
          <path d="M358 334 C358 334 374 332 374 348 L358 360 Z" fill="#0369a1" />
          <circle cx="380" cy="336" r="3" fill="#38bdf8" /> {/* phone glow */}

          {/* Distant walking group */}
          <circle cx="280" cy="318" r="5" fill="#64748b" />
          <path d="M275 325 L285 325 L282 355 L276 355 Z" fill="#475569" />
          <circle cx="295" cy="320" r="5" fill="#64748b" />
          <path d="M291 327 L300 327 L298 355 L292 355 Z" fill="#64748b" />
        </g>

        {/* 5. Indian Railways Platform A2 Board (Left Pole) */}
        <g id="platform-sign-a2">
          {/* Steel post */}
          <rect x="52" y="150" width="6" height="235" fill="#334155" />
          <rect x="48" y="380" width="14" height="6" fill="#1e293b" />
          {/* Signboard background */}
          <rect x="18" y="165" width="76" height="48" rx="5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Devanagari "भारतीय रेल" header */}
          <text x="56" y="179" fill="#f8fafc" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            भारतीय रेल
          </text>
          {/* Platform "A2" Large Text */}
          <text x="56" y="204" fill="#ffffff" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
            A2
          </text>
        </g>

        {/* 6. Station Directional Signboard (Right Overhead) */}
        <g id="station-directions">
          <rect x="315" y="195" width="85" height="54" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
          {/* Sign items matching screenshot */}
          <text x="323" y="208" fill="#eab308" fontSize="7" fontWeight="bold" fontFamily="monospace">PLATFORM</text>
          <text x="388" y="208" fill="#eab308" fontSize="7" fontWeight="bold" fontFamily="monospace">→</text>
          <line x1="322" y1="210" x2="392" y2="210" stroke="#27272a" strokeWidth="0.8" />

          <text x="323" y="220" fill="#eab308" fontSize="7" fontWeight="bold" fontFamily="monospace">COACHES</text>
          <text x="388" y="220" fill="#eab308" fontSize="7" fontWeight="bold" fontFamily="monospace">→</text>
          <line x1="322" y1="222" x2="392" y2="222" stroke="#27272a" strokeWidth="0.8" />

          <text x="323" y="232" fill="#eab308" fontSize="7" fontWeight="bold" fontFamily="monospace">TIMINGS</text>
          <text x="388" y="232" fill="#eab308" fontSize="7" fontWeight="bold" fontFamily="monospace">→</text>
          <line x1="322" y1="234" x2="392" y2="234" stroke="#27272a" strokeWidth="0.8" />

          <text x="323" y="244" fill="#eab308" fontSize="7" fontWeight="bold" fontFamily="monospace">FACILITIES</text>
          <text x="388" y="244" fill="#eab308" fontSize="7" fontWeight="bold" fontFamily="monospace">→</text>
        </g>

        {/* 7. Central RailQuick Delivery Hero */}
        <g id="railquick-delivery-hero" filter="url(#softShadow)">
          {/* Shadow on floor */}
          <ellipse cx="215" cy="520" rx="42" ry="7" fill="#0f172a" opacity="0.25" />

          {/* Left Leg (in motion forward) */}
          <path d="M198 380 L188 440 L176 495" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
          {/* Right Leg (back leg pushing) */}
          <path d="M228 380 L238 435 L252 485" stroke="#0f172a" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />

          {/* Right Sneaker (back) */}
          <ellipse cx="258" cy="492" rx="16" ry="8" fill="#ffffff" />
          <path d="M246 492 L268 492" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="250" y="488" width="14" height="4" rx="1" fill="#e2e8f0" />

          {/* Left Sneaker (forward, crisp white) */}
          <ellipse cx="170" cy="506" rx="20" ry="9" fill="#ffffff" />
          <path d="M154 506 L186 506" stroke="#94a3b8" strokeWidth="2.5" />
          <path d="M160 500 L176 500" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M158 503 L174 503" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Torso / Polo Shirt (Grey RailQuick Uniform) */}
          <path
            d="M182 280 C182 270 242 270 242 280 L234 395 C234 400 190 400 190 395 Z"
            fill="url(#shirtGrad)"
          />
          {/* Polo Collar */}
          <polygon points="204,272 212,284 220,272" fill="#4b5563" />
          <polygon points="196,272 208,284 200,287" fill="#6b7280" />
          <polygon points="228,272 216,284 224,287" fill="#6b7280" />
          {/* RailQuick chest badge on uniform */}
          <text x="212" y="306" fill="#1e293b" fontSize="6.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
            RailQuick
          </text>

          {/* Left Arm & Watch */}
          <path d="M185 284 L170 340 L162 385" stroke="url(#skinGrad)" strokeWidth="13" strokeLinecap="round" />
          {/* Smartwatch on wrist */}
          <rect x="156" y="365" width="10" height="6" rx="1.5" fill="#0f172a" />
          <circle cx="161" cy="368" r="1.5" fill="#38bdf8" />

          {/* Right Arm */}
          <path d="M238 284 L252 340 L260 380" stroke="url(#skinGrad)" strokeWidth="13" strokeLinecap="round" />

          {/* Left RailQuick Shopping Bag (Held in Hand) */}
          <g id="delivery-bag-left" transform="translate(130, 375)">
            {/* Bag handles */}
            <path d="M25 0 C25 -14 38 -14 38 0" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Kraft Paper Bag Body */}
            <polygon points="10,0 52,0 56,65 6,65" fill="url(#bagGrad)" stroke="#78350f" strokeWidth="1" />
            {/* Fold creases */}
            <line x1="14" y1="0" x2="10" y2="65" stroke="#78350f" strokeWidth="1" opacity="0.4" />
            <line x1="48" y1="0" x2="52" y2="65" stroke="#78350f" strokeWidth="1" opacity="0.4" />
            {/* RailQuick Logo printed on Bag */}
            <text x="31" y="38" fill="#1c1917" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
              RailQuick
            </text>
          </g>

          {/* Head & Neck */}
          <rect x="207" y="258" width="10" height="16" rx="2" fill="url(#skinGrad)" />
          {/* Face */}
          <circle cx="212" cy="245" r="17" fill="url(#skinGrad)" />
          {/* Friendly Indian mustache & smile */}
          <path d="M204 250 Q212 254 220 250" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M206 254 Q212 258 218 254" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Eyes */}
          <circle cx="206" cy="242" r="2" fill="#1c1917" />
          <circle cx="218" cy="242" r="2" fill="#1c1917" />
          <circle cx="207" cy="241" r="0.6" fill="#ffffff" />
          <circle cx="219" cy="241" r="0.6" fill="#ffffff" />
          {/* Eyebrows */}
          <path d="M203 238 Q207 236 210 238" stroke="#1c1917" strokeWidth="1.5" fill="none" />
          <path d="M214 238 Q217 236 221 238" stroke="#1c1917" strokeWidth="1.5" fill="none" />

          {/* Green RailQuick Cap */}
          <path d="M194 238 C194 220 230 220 230 238 Z" fill="#065f46" />
          {/* Cap Visor / Peak pointing left-forward */}
          <path d="M185 240 Q196 235 224 238 L185 244 Z" fill="#047857" />
          {/* Cap button */}
          <circle cx="212" cy="222" r="2" fill="#064e3b" />
        </g>
      </svg>
    </div>
  );
};
