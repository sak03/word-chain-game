export type GameMode = "machine" | "friend";
export type GamePhase = "setup" | "playing";
export type TurnOutcome = "accepted" | "pass" | "timeout" | "invalid";

export interface Player {
  id: "player-one" | "player-two";
  name: string;
  score: number;
  isMachine: boolean;
}

export interface WordTurn {
  id: string;
  playerId: Player["id"];
  playerName: string;
  word: string | null;
  points: 1 | 0 | -1;
  outcome: TurnOutcome;
  createdAt: string;
}

export type TurnInput =
  | { word: string; outcome: "accepted" }
  | { word?: null; outcome: "pass" | "timeout" | "invalid" };

export interface GameState {
  version: 1;
  phase: GamePhase;
  mode: GameMode;
  players: [Player, Player];
  currentPlayerIndex: 0 | 1;
  turns: WordTurn[];
}

export const STORAGE_KEY = "word-chain-challenge:v1";
export const LEGACY_STORAGE_KEY = "word-chai-challenge:v1";
export const TURN_SECONDS = 30;
export const WRONG_WORD_MESSAGE = "You entered a wrong word.";

const OUTCOME_POINTS: Record<TurnOutcome, 1 | 0 | -1> = {
  accepted: 1,
  pass: 0,
  timeout: 0,
  invalid: -1,
};

export function normalizeWord(value: string): string {
  return value.trim().toLowerCase();
}

export function lastLetter(word: string): string {
  return word.slice(-1);
}

export function acceptedWords(turns: WordTurn[]): string[] {
  return turns.flatMap((turn) => (turn.word ? [turn.word] : []));
}

export function requiredLetter(turns: WordTurn[]): string | null {
  const words = acceptedWords(turns);
  return words.length ? lastLetter(words.at(-1)!) : null;
}

export function checkLocalRules(
  rawWord: string,
  turns: WordTurn[],
): { valid: true; word: string } | { valid: false; message: string } {
  const word = normalizeWord(rawWord);

  if (!word) {
    return { valid: false, message: "Type a word first." };
  }

  if (!/^[a-z]+$/.test(word)) {
    return {
      valid: false,
      message: "Use one English word with letters A–Z only.",
    };
  }

  if (word.length < 2) {
    return { valid: false, message: "Use a word with at least 2 letters." };
  }

  const expected = requiredLetter(turns);
  if (expected && word[0] !== expected) {
    return {
      valid: false,
      message: `Your word must start with “${expected.toUpperCase()}”.`,
    };
  }

  if (acceptedWords(turns).includes(word)) {
    return { valid: false, message: `“${word}” has already been used.` };
  }

  return { valid: true, word };
}

export function createGame(
  mode: GameMode,
  firstName: string,
  secondName?: string,
): GameState {
  return {
    version: 1,
    phase: "playing",
    mode,
    players: [
      {
        id: "player-one",
        name: firstName.trim(),
        score: 0,
        isMachine: false,
      },
      {
        id: "player-two",
        name: mode === "machine" ? "WordBot" : secondName!.trim(),
        score: 0,
        isMachine: mode === "machine",
      },
    ],
    currentPlayerIndex: 0,
    turns: [],
  };
}

export function recordTurn(
  game: GameState,
  playerIndex: 0 | 1,
  input: TurnInput,
): GameState {
  const points = OUTCOME_POINTS[input.outcome];
  const word = input.outcome === "accepted" ? input.word : null;
  const player = game.players[playerIndex];
  const players = game.players.map((item, index) =>
    index === playerIndex ? { ...item, score: item.score + points } : item,
  ) as [Player, Player];

  return {
    ...game,
    players,
    currentPlayerIndex: playerIndex === 0 ? 1 : 0,
    turns: [
      ...game.turns,
      {
        id: `${Date.now()}-${player.id}-${game.turns.length}`,
        playerId: player.id,
        playerName: player.name,
        word,
        points,
        outcome: input.outcome,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

export function turnHistoryLabel(turn: WordTurn): string {
  if (turn.word) return turn.word;
  if (turn.outcome === "timeout") return "Timed out";
  if (turn.outcome === "invalid") return "Wrong word";
  return "Passed";
}

export function formatTurnPoints(points: WordTurn["points"]): string {
  if (points > 0) return "+1";
  if (points < 0) return "−1";
  return "0";
}

export function replayGame(game: GameState): GameState {
  return {
    ...game,
    players: game.players.map((player) => ({ ...player, score: 0 })) as [
      Player,
      Player,
    ],
    currentPlayerIndex: 0,
    turns: [],
  };
}

export function isStoredGame(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GameState>;
  return (
    candidate.version === 1 &&
    candidate.phase === "playing" &&
    (candidate.mode === "machine" || candidate.mode === "friend") &&
    Array.isArray(candidate.players) &&
    candidate.players.length === 2 &&
    Array.isArray(candidate.turns) &&
    (candidate.currentPlayerIndex === 0 || candidate.currentPlayerIndex === 1)
  );
}
