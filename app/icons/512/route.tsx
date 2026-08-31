import { ImageResponse } from "next/og";
import { IconMark } from "@/lib/pwa/icon-mark";

export async function GET() {
  return new ImageResponse(<IconMark size={512} glyphScale={0.56} />, {
    width: 512,
    height: 512,
  });
}
