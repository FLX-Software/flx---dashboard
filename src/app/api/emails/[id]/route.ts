import { NextResponse } from "next/server";
import { deleteEmail, markEmailAsRead } from "@/lib/email";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get("demo") === "true";

  try {
    const body = await request.json();
    const read = Boolean(body.read);
    await markEmailAsRead(id, read, demo);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get("demo") === "true";

  try {
    await deleteEmail(id, demo);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
