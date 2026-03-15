import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.ARIA_API_URL}/dashboard/claude-usage`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ sessions: 0, total_tokens: 0, error: "API nicht erreichbar" }, { status: 503 });
  }
}
