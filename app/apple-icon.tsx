import { ImageResponse } from "next/og";
import { IconMark } from "@/lib/pwa/icon-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// No borderRadius: iOS applies its own corner mask to apple-touch-icon,
// pre-rounding here would produce visible double-rounding.
export default function AppleIcon() {
  return new ImageResponse(<IconMark size={180} glyphScale={0.56} />, size);
}
