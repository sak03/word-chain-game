import { NextResponse } from "next/server";

interface DatamuseWord {
  word?: string;
  defs?: string[];
  score?: number;
}

const SAFE_WORD = /^[a-z]{2,20}$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const candidate = body as { letter?: unknown; usedWords?: unknown };
  const letter = String(candidate.letter ?? "").trim().toLowerCase();
  const usedWords = Array.isArray(candidate.usedWords)
    ? candidate.usedWords
        .slice(-500)
        .map((word) => String(word).trim().toLowerCase())
    : [];

  if (!/^[a-z]$/.test(letter)) {
    return NextResponse.json({ error: "Invalid starting letter." }, { status: 400 });
  }

  try {
    const url = new URL("https://api.datamuse.com/words");
    url.searchParams.set("sp", `${letter}*`);
    url.searchParams.set("md", "df");
    url.searchParams.set("max", "200");

    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error("Datamuse request failed");
    const data = (await response.json()) as DatamuseWord[];
    const used = new Set(usedWords);
    const options = data
      .map((item) => item.word?.toLowerCase() ?? "")
      .filter(
        (word, index, words) =>
          SAFE_WORD.test(word) &&
          word.startsWith(letter) &&
          !used.has(word) &&
          words.indexOf(word) === index,
      )
      .slice(0, 50);

    if (!options.length) {
      return NextResponse.json({ word: null });
    }

    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % options.length;
    return NextResponse.json({ word: options[randomIndex] });
  } catch {
    return NextResponse.json(
      { error: "WordBot cannot reach its word list right now." },
      { status: 503 },
    );
  }
}
