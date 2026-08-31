import { ImageResponse } from "next/og";
import { IconMark } from "@/lib/pwa/icon-mark";

export async function GET() {
  return new ImageResponse(<IconMark size={192} glyphScale={0.56} />, {
    width: 192,
    height: 192,
  });
}
