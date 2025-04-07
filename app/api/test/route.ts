import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("✅ Test POST hit! Received body:", body);

    return NextResponse.json({
      success: true,
      message: "POST request received at /api/test",
      received: body,
    });
  } catch (error) {
    console.error("❌ Error in /api/test:", error);
    return NextResponse.json(
      { error: "Failed to handle POST request" },
      { status: 500 }
    );
  }
}
