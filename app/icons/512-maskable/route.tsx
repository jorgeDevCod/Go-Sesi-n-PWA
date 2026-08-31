import { ImageResponse } from "next/og";
import { IconMark } from "@/lib/pwa/icon-mark";

// Smaller glyph so the mark stays inside Android's ~80% safe zone once the
// OS crops this full-bleed square into a circle/squircle/rounded-square.
export async function GET() {
  return new ImageResponse(<IconMark size={512} glyphScale={0.4} />, {
    width: 512,
    height: 512,
  });
}
