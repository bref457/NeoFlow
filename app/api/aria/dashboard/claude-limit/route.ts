import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.ARIA_API_URL}/dashboard/claude-limit`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ hourly_percent: null, weekly_percent: null, updated_at: null }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${process.env.ARIA_API_URL}/dashboard/claude-limit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "API nicht erreichbar" }, { status: 503 });
  }
}
