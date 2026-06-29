import { NextResponse } from "next/server";
import { insertWebsiteTicket } from "@/lib/db";
import type { WebsiteTicketPayload } from "@/lib/types";

const ALLOWED_ORIGINS = [
  "https://www.flx-software.de",
  "https://flx-software.de",
  "http://localhost:3000",
  "http://localhost:3001",
];

function corsHeaders(origin: string | null) {
  const allowed =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  };
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.TICKET_API_SECRET;

  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json(
      { error: "Nicht autorisiert" },
      { status: 401, headers }
    );
  }

  try {
    const body = (await request.json()) as WebsiteTicketPayload;

    if (
      !body.ticketId ||
      !body.company ||
      !body.name ||
      !body.email ||
      !body.description
    ) {
      return NextResponse.json(
        { error: "Pflichtfelder fehlen" },
        { status: 400, headers }
      );
    }

    const result = await insertWebsiteTicket(body);

    return NextResponse.json(
      {
        success: true,
        ticketId: result.ticketId,
        created: result.created,
      },
      { headers }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Serverfehler";
    return NextResponse.json({ error: message }, { status: 500, headers });
  }
}
