import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  Circle,
  Rect,
  Line,
  G,
} from 'react-native-svg';

interface RailQuickLogoSvgProps {
  width: number;
  height: number;
  /**
   * Optional X translation for the orange arrow (for forward movement animation)
   */
  arrowTranslateX?: number;
  /**
   * Optional scale for the orange arrow (for pulse animation)
   */
  arrowScale?: number;
}

/**
 * Pure SVG recreation of the RailQuick brand identity logo:
 * - "Rail" in bold black rounded typography
 * - Dynamic horizontal speed lines
 * - Magnifying glass 'Q' with handle
 * - Orange forward chevron arrow inside the magnifying glass lens
 * - "uick" in signature vibrant green (#25AD70)
 */
export const RailQuickLogoSvg: React.FC<RailQuickLogoSvgProps> = ({
  width,
  height,
  arrowTranslateX = 0,
  arrowScale = 1,
}) => {
  return (
    <Svg viewBox="0 0 324 89" width={width} height={height}>
      {/* ================= "Rail" (Black, Rounded Bold Lettering) ================= */}
      <G fill="#0A0A0A">
        {/* Letter 'R' */}
        <Path d="M 6,24 C 6,19 10,15 17,15 L 34,15 C 43,15 48,19 48,27 C 48,33 44,37 38,39 C 45,42 47,49 48,59 L 48,64 C 48,68 47,70 45,71 C 43,72 38,72 36,68 L 35,57 C 34,48 31,46 24,46 L 19,46 L 19,69 C 19,72 17,74 13,74 C 9,74 6,72 6,68 Z M 19,26 L 19,37 L 31,37 C 35,37 37,35 37,31 C 37,28 35,26 31,26 Z" />

        {/* Letter 'a' */}
        <Path d="M 52,47 C 52,38 58,32 68,32 C 78,32 84,37 84,46 L 84,68 C 84,72 82,74 78,74 C 74,74 72,72 72,68 L 72,64 C 69,70 63,74 56,74 C 48,74 43,69 43,61 C 43,53 49,47 62,47 L 72,47 L 72,45 C 72,40 68,38 63,38 C 58,38 55,40 54,44 C 53,46 51,47 48,47 Z M 72,54 L 62,54 C 56,54 53,57 53,61 C 53,65 56,67 61,67 C 67,67 72,63 72,57 Z" />

        {/* Letter 'i' */}
        <Circle cx="94" cy="20" r="5.5" fill="#0A0A0A" />
        <Path d="M 88,36 C 88,33 91,32 94,32 C 97,32 100,33 100,36 L 100,68 C 100,72 97,74 94,74 C 91,74 88,72 88,68 Z" />

        {/* Letter 'l' with stylized top arch */}
        <Path d="M 106,12 C 106,9 109,7 113,7 C 117,7 120,9 120,12 L 120,68 C 120,72 117,74 113,74 C 109,74 106,72 106,68 Z" />
      </G>

      {/* ================= Speed Lines (Connecting 'Rail' and Magnifying Glass) ================= */}
      <G stroke="#0A0A0A" strokeWidth="2.2" strokeLinecap="round">
        <Line x1="125" y1="28" x2="142" y2="28" />
        <Line x1="122" y1="36" x2="139" y2="36" />
        <Line x1="120" y1="44" x2="137" y2="44" />
        <Line x1="122" y1="52" x2="140" y2="52" />
        <Line x1="126" y1="60" x2="143" y2="60" />
      </G>

      {/* ================= Magnifying Glass 'Q' (Outer Rim & Handle) ================= */}
      <G fill="#0A0A0A">
        {/* Outer Circular Ring */}
        <Path
          d="M 160.5,18 C 174,18 185,29 185,42.5 C 185,56 174,67 160.5,67 C 147,67 136,56 136,42.5 C 136,29 147,18 160.5,18 Z M 160.5,25 C 150.8,25 143,32.8 143,42.5 C 143,52.2 150.8,60 160.5,60 C 170.2,60 178,52.2 178,42.5 C 178,32.8 170.2,25 160.5,25 Z"
          fillRule="evenodd"
        />

        {/* Handle pointing down-right at ~45-50 degrees */}
        <Path
          d="M 174,56 L 186,74 C 188,77 186,80 183,82 C 180,83 177,81 174,78 L 164,61 Z"
          strokeLinejoin="round"
        />
      </G>

      {/* ================= Orange Forward Arrow inside Magnifying Glass ================= */}
      <G
        transform={`translate(${160.5 + arrowTranslateX}, 42.5) scale(${arrowScale}) translate(-160.5, -42.5)`}
      >
        <Path
          d="M 155,32 L 166,42.5 L 155,53 L 157.5,53 L 169,42.5 L 157.5,32 Z"
          fill="#F38B47"
        />
      </G>

      {/* ================= "uick" (Playful Signature Green #25AD70) ================= */}
      <G fill="#25AD70">
        {/* Letter 'u' */}
        <Path d="M 191,35 C 191,32 194,30 198,30 C 202,30 205,32 205,35 L 205,53 C 205,58 209,61 214,61 C 219,61 223,58 223,53 L 223,35 C 223,32 226,30 230,30 C 234,30 237,32 237,35 L 237,55 C 237,67 227,74 214,74 C 201,74 191,67 191,55 Z" />

        {/* Letter 'i' */}
        <Circle cx="249" cy="20" r="5.5" />
        <Path d="M 243,35 C 243,32 246,30 249,30 C 252,30 255,32 255,35 L 255,68 C 255,72 252,74 249,74 C 246,74 243,72 243,68 Z" />

        {/* Letter 'c' */}
        <Path d="M 288,41 C 286,36 280,31 272,31 C 261,31 254,39 254,52 C 254,65 261,73 272,73 C 280,73 286,68 288,63 C 289,60 288,57 285,56 C 282,55 279,56 278,59 C 276,62 273,64 269,64 C 263,64 259,59 259,52 C 259,45 263,40 269,40 C 273,40 276,42 278,45 C 279,48 282,49 285,48 C 288,47 289,44 288,41 Z" />

        {/* Letter 'k' */}
        <Path d="M 292,12 C 292,9 295,7 299,7 C 303,7 306,9 306,12 L 306,47 L 316,36 C 318,34 321,33 324,35 C 327,37 327,41 324,44 L 314,53 L 326,67 C 328,70 327,73 324,75 C 322,76 319,75 317,72 L 306,59 L 306,68 C 306,72 303,74 299,74 C 295,74 292,72 292,68 Z" />
      </G>
    </Svg>
  );
};

export default RailQuickLogoSvg;

