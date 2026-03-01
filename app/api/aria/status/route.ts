import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(`${process.env.ARIA_API_URL}/status`, {
    headers: { "X-API-Key": process.env.ARIA_API_KEY! },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
