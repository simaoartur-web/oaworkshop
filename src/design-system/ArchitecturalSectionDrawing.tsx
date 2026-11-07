import type { AppLanguage } from '../data/types';

interface ArchitecturalSectionDrawingProps {
  ariaLabel: string;
  language?: AppLanguage;
}

/**
 * Precision 1:100 architectural longitudinal section drawing (CAD hairline SVG)
 * corresponding to the courtyard spatial study on /login.
 */
export function ArchitecturalSectionDrawing({
  ariaLabel,
  language = 'pt',
}: ArchitecturalSectionDrawingProps) {
  const labels =
    language === 'en'
      ? {
          rakingLight: 'RAKING LIGHT · 32°',
          parapet: '+7.80 PARAPET',
          gallery: '+4.20 GALLERY',
          courtyard: '±0.00 COURTYARD DATUM',
          water: '-0.45 WATER COURT',
          scale: "0 · 1 · 2 · 5M — SECTION AA' · SCALE 1:100 (DEMO STUDY)",
        }
      : {
          rakingLight: 'LUZ RASANTE · 32°',
          parapet: '+7.80 COROAMENTO',
          gallery: '+4.20 GALERIA',
          courtyard: '±0.00 COTA DO PÁTIO',
          water: '-0.45 ESPELHO DE ÁGUA',
          scale: "0 · 1 · 2 · 5M — CORTE AA' · ESCALA 1:100 (ESTUDO DEMO)",
        };

  return (
    <div className="relative h-full w-full bg-[#070707] oa-drafting-grid flex items-center justify-center p-5 sm:p-8 lg:p-10">
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox="0 0 800 580"
        className="w-full h-full max-h-[480px] select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Structural Grid Axes A - B - C - D */}
        {[
          { x: 130, label: 'A' },
          { x: 310, label: 'B' },
          { x: 490, label: 'C' },
          { x: 670, label: 'D' },
        ].map((axis) => (
          <g key={axis.label}>
            <line
              x1={axis.x}
              y1="52"
              x2={axis.x}
              y2="495"
              stroke="rgba(255,255,255,0.11)"
              strokeWidth="1"
              strokeDasharray="4 5"
            />
            <circle
              cx={axis.x}
              cy="34"
              r="11"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="1"
            />
            <text
              x={axis.x}
              y="38"
              textAnchor="middle"
              fill="#E0E0E0"
              fontSize="10"
              fontFamily="Outfit, sans-serif"
              letterSpacing="1"
            >
              {axis.label}
            </text>
          </g>
        ))}

        {/* Solar Raking Angle Ray (32 deg) */}
        <line
          x1="590"
          y1="68"
          x2="310"
          y2="424"
          stroke="#A65D4A"
          strokeWidth="1.2"
          strokeDasharray="6 4"
        />
        <line
          x1="640"
          y1="88"
          x2="365"
          y2="424"
          stroke="rgba(166,93,74,0.45)"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
        <text
          x="596"
          y="80"
          fill="#A65D4A"
          fontSize="10"
          fontFamily="Outfit, sans-serif"
          letterSpacing="2"
        >
          {labels.rakingLight}
        </text>

        {/* Elevation Datum Lines */}
        <line
          x1="70"
          y1="158"
          x2="730"
          y2="158"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <text
          x="74"
          y="150"
          fill="#9E9E9E"
          fontSize="9.5"
          fontFamily="Outfit, sans-serif"
          letterSpacing="1.6"
        >
          {labels.parapet}
        </text>

        <line
          x1="70"
          y1="280"
          x2="730"
          y2="280"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <text
          x="74"
          y="272"
          fill="#9E9E9E"
          fontSize="9.5"
          fontFamily="Outfit, sans-serif"
          letterSpacing="1.6"
        >
          {labels.gallery}
        </text>

        {/* Left Concrete Monolith Wall (Cut Section) */}
        <rect
          x="112"
          y="134"
          width="48"
          height="290"
          fill="rgba(255,255,255,0.06)"
          stroke="#E0E0E0"
          strokeWidth="1.5"
        />
        {/* Cantilevered Gallery Slab at +4.20 */}
        <rect
          x="160"
          y="272"
          width="136"
          height="18"
          fill="rgba(255,255,255,0.08)"
          stroke="#E0E0E0"
          strokeWidth="1.25"
        />

        {/* Central Slit Concrete Fin */}
        <rect
          x="334"
          y="158"
          width="34"
          height="266"
          fill="rgba(255,255,255,0.05)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        {/* Right Pigmented Rammed-Earth Plane (Terracotta Accent) */}
        <rect
          x="506"
          y="144"
          width="176"
          height="280"
          fill="rgba(166,93,74,0.18)"
          stroke="#A65D4A"
          strokeWidth="1.75"
        />
        {[184, 224, 264, 304, 344, 384].map((yPos) => (
          <line
            key={yPos}
            x1="507"
            y1={yPos}
            x2="681"
            y2={yPos}
            stroke="rgba(166,93,74,0.34)"
            strokeWidth="0.8"
          />
        ))}

        {/* Reflecting Water Basin (-0.45m) */}
        <rect
          x="160"
          y="424"
          width="346"
          height="18"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1"
        />
        <line
          x1="168"
          y1="430"
          x2="498"
          y2="430"
          stroke="#A65D4A"
          strokeWidth="1"
          strokeOpacity="0.65"
        />

        {/* Ground Plinth Cut (+0.00) */}
        <line
          x1="60"
          y1="424"
          x2="160"
          y2="424"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <line
          x1="506"
          y1="424"
          x2="740"
          y2="424"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <rect
          x="60"
          y="442"
          width="680"
          height="32"
          fill="rgba(255,255,255,0.025)"
        />
        <line
          x1="60"
          y1="442"
          x2="740"
          y2="442"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
        />

        {/* Datum Annotation +0.00 & -0.45 */}
        <text
          x="74"
          y="416"
          fill="#FFFFFF"
          fontSize="10"
          fontFamily="Outfit, sans-serif"
          letterSpacing="1.6"
        >
          {labels.courtyard}
        </text>
        <text
          x="388"
          y="460"
          fill="#BDBDBD"
          fontSize="9.5"
          fontFamily="Outfit, sans-serif"
          letterSpacing="1.6"
        >
          {labels.water}
        </text>

        {/* Graphic Scale Bar 1:100 */}
        <g transform="translate(74, 514)">
          <rect x="0" y="0" width="40" height="5" fill="#FFFFFF" />
          <rect
            x="40"
            y="0"
            width="40"
            height="5"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          <rect x="80" y="0" width="80" height="5" fill="#A65D4A" />
          <text
            x="0"
            y="20"
            fill="#BDBDBD"
            fontSize="9.5"
            fontFamily="Outfit, sans-serif"
            letterSpacing="1.8"
          >
            {labels.scale}
          </text>
        </g>
      </svg>
    </div>
  );
}
