import { ImageResponse } from "next/og";
import { IconMark } from "@/lib/pwa/icon-mark";

export async function GET() {
  return new ImageResponse(<IconMark size={512} rounded glyphScale={0.42} />, {
    width: 512,
    height: 512,
  });
}
