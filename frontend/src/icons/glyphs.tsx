import type { ReactNode, SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { size?: number };

const svg = (children: ReactNode) => {
  const Wrapper = ({ size = 22, strokeWidth = 1.4, ...rest }: Props) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      {...rest}
    >
      {children}
    </svg>
  );
  return Wrapper;
};

/* Engineering glyphs — drawn from scratch in blueprint style.
 * 1.4px square-cap strokes, subtle dashed sub-elements, no AI-template
 * geometry. Each icon has a single quirky detail (corner notch, tick mark,
 * hairline) that signals "designed", not "icon-pack default". */

export const PanelGlyph = svg(
  <>
    <path d="M3 17l4-12h12l3 12z" />
    <path d="M5 11h14" />
    <path d="M11 5l-2 12" />
    <path d="M15 5l2 12" />
    <path d="M3 17h19" strokeDasharray="2 2" />
  </>,
);

export const DroneGlyph = svg(
  <>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M7.8 7.8l3 3M16.2 7.8l-3 3M7.8 16.2l3-3M16.2 16.2l-3-3" />
    <rect x="10" y="10" width="4" height="4" />
    <path d="M12 13v2" strokeDasharray="1 1.5" />
  </>,
);

export const SunPathGlyph = svg(
  <>
    <path d="M2 18h20" />
    <path d="M3 18a9 9 0 0118 0" strokeDasharray="3 2" />
    <circle cx="12" cy="9" r="3" fill="currentColor" stroke="none" />
    <path d="M12 3v1.5M5 6.5l1 1M19 6.5l-1 1" />
  </>,
);

export const RoofPitchGlyph = svg(
  <>
    <path d="M3 19l9-12 9 12" />
    <path d="M3 19h18" />
    <path d="M7 19v-2M11 19v-3M15 19v-3M19 19v-2" />
    <path d="M12 7v12" strokeDasharray="2 2" />
  </>,
);

export const WaterTankGlyph = svg(
  <>
    <path d="M5 9h14v11H5z" />
    <ellipse cx="12" cy="9" rx="7" ry="2" />
    <path d="M9 13c1 1 2 1 3 0s2-1 3 0" />
    <path d="M5 5h14" strokeDasharray="2 2" />
    <path d="M9 5v4M15 5v4" strokeDasharray="2 2" />
  </>,
);

export const ParapetGlyph = svg(
  <>
    <path d="M3 18h18" />
    <path d="M3 18V9h3v9M9 18V11h3v7M15 18V9h3v9" />
    <path d="M3 9h6M9 11h6M15 9h6" />
    <path d="M3 22h18" strokeDasharray="2 2" />
  </>,
);

export const IrradianceGlyph = svg(
  <>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    <path d="M5.6 5.6l2 2M16.4 5.6l-2 2M5.6 18.4l2-2M16.4 18.4l-2-2" />
    <circle cx="12" cy="12" r="6" strokeDasharray="2 3" />
  </>,
);

export const WattmeterGlyph = svg(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 12L7 7" />
    <path d="M3 12h2M19 12h2M12 3v2M12 19v2" />
    <path d="M6 18l3-3M18 18l-3-3" strokeDasharray="2 2" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </>,
);

export const MeshImportGlyph = svg(
  <>
    <path d="M3 7l9-4 9 4-9 4-9-4z" />
    <path d="M3 7v10l9 4 9-4V7" />
    <path d="M12 11v10" />
    <path d="M7 9.2v6L12 17M17 9.2v6L12 17" strokeDasharray="2 2" />
  </>,
);

export const CompassRoseGlyph = svg(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v18M3 12h18" strokeDasharray="2 3" />
    <path d="M12 5l2 7-2 7-2-7z" fill="currentColor" stroke="none" />
    <text x="12" y="3.6" textAnchor="middle" fontSize="3" fontFamily="Mulish" fill="currentColor" stroke="none">N</text>
  </>,
);

export const RulerGlyph = svg(
  <>
    <rect x="3" y="9" width="18" height="6" />
    <path d="M6 9v3M9 9v4M12 9v3M15 9v4M18 9v3" />
  </>,
);

export const LayersGlyph = svg(
  <>
    <path d="M12 3l9 5-9 5-9-5z" />
    <path d="M3 12l9 5 9-5" strokeDasharray="2 2" />
    <path d="M3 16l9 5 9-5" strokeDasharray="2 2" />
  </>,
);

export const PowerGlyph = svg(
  <>
    <path d="M13 3l-7 11h6l-2 7 7-11h-6z" />
  </>,
);

export const RinggitGlyph = svg(
  <>
    <path d="M7 4h6a4 4 0 010 8H7" />
    <path d="M7 4v16" />
    <path d="M11 12l5 8" />
    <path d="M5 12h6" strokeDasharray="2 2" />
  </>,
);

export const ClockTicksGlyph = svg(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
    <path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21" />
  </>,
);

export const FlameGlyph = svg(
  <>
    <path d="M12 3c2 4 5 5 5 9a5 5 0 11-10 0c0-2 1-3 2-4-1 3 2 3 1-2 1 1 1 0 2-3z" />
  </>,
);
