import { NextResponse } from "next/server";

const WORD_PATTERN = /^[a-z]{2,32}$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const word =
    typeof body === "object" && body && "word" in body
      ? String(body.word).trim().toLowerCase()
      : "";

  if (!WORD_PATTERN.test(word)) {
    return NextResponse.json({ valid: false });
  }

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(7000),
        headers: { Accept: "application/json" },
      },
    );

    if (response.ok) {
      return NextResponse.json({ valid: true });
    }

    if (response.status === 404) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json(
      { error: "The dictionary is temporarily unavailable." },
      { status: 503 },
    );
  } catch {
    return NextResponse.json(
      { error: "The dictionary is temporarily unavailable." },
      { status: 503 },
    );
  }
}
