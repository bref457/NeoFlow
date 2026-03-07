import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(`${process.env.ARIA_API_URL}/dashboard/notes`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
