// app/api/student/track-focus/route.ts
import { NextResponse } from "next/server";
import { trackFocusLoss } from "@/app/student/actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId } = body;
    if (!attemptId) return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });
    const res = await trackFocusLoss(attemptId);
    if (res?.error) return NextResponse.json(res, { status: 400 });
    return NextResponse.json(res);
  } catch (err) {
    console.error("API track-focus error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
