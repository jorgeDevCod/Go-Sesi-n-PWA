/**
 * Shared brand mark used to generate every PWA icon via next/og's
 * ImageResponse (Satori). Kept as plain flex/text styling-no SVG paths —
 * since text rendering is Satori's most reliable primitive.
 */
export function IconMark({
  size,
  rounded = false,
  glyphScale = 0.42,
}: {
  size: number;
  rounded?: boolean;
  glyphScale?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
        borderRadius: rounded ? size * 0.27 : 0,
      }}
    >
      <span
        style={{
          fontSize: size * glyphScale,
          fontWeight: 700,
          color: "#FFFFFF",
          fontFamily: "sans-serif",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        Go
      </span>
    </div>
  );
}
