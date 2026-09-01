import { ImageResponse } from "next/og";
import { IconMark } from "@/lib/pwa/icon-mark";

export async function GET() {
  return new ImageResponse(<IconMark size={192} rounded glyphScale={0.42} />, {
    width: 192,
    height: 192,
  });
}
