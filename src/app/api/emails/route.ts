import { NextResponse } from "next/server";
import { fetchEmails } from "@/lib/email";

export async function GET() {
  const data = await fetchEmails();
  return NextResponse.json(data);
}
