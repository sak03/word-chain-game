import { describe, expect, it, vi } from "vitest";
import {
  acceptedWords,
  checkLocalRules,
  createGame,
  formatTurnPoints,
  recordTurn,
  replayGame,
  requiredLetter,
  turnHistoryLabel,
} from "./game";

describe("word-chain game engine", () => {
  it("creates the correct players for machine mode", () => {
    const game = createGame("machine", "Aisha");
    expect(game.players.map((player) => player.name)).toEqual([
      "Aisha",
      "WordBot",
    ]);
    expect(game.players[1].isMachine).toBe(true);
  });

  it("normalizes accepted words and enforces the last letter", () => {
    vi.spyOn(Date, "now").mockReturnValue(1);
    const game = recordTurn(createGame("friend", "A", "B"), 0, {
      word: "hello",
      outcome: "accepted",
    });
    expect(requiredLetter(game.turns)).toBe("o");
    expect(checkLocalRules(" Owl ", game.turns)).toEqual({
      valid: true,
      word: "owl",
    });
    expect(checkLocalRules("table", game.turns)).toEqual({
      valid: false,
      message: "Your word must start with “O”.",
    });
  });

  it("blocks repeats regardless of typed casing", () => {
    const game = recordTurn(createGame("friend", "A", "B"), 0, {
      word: "level",
      outcome: "accepted",
    });
    expect(checkLocalRules("LEVEL", game.turns)).toEqual({
      valid: false,
      message: "“level” has already been used.",
    });
  });

  it("awards one point for a word and zero for a pass", () => {
    const wordGame = recordTurn(createGame("friend", "A", "B"), 0, {
      word: "hello",
      outcome: "accepted",
    });
    const passGame = recordTurn(wordGame, 1, { outcome: "pass" });
    expect(passGame.players.map((player) => player.score)).toEqual([1, 0]);
    expect(acceptedWords(passGame.turns)).toEqual(["hello"]);
    expect(passGame.turns[1]).toMatchObject({
      word: null,
      points: 0,
      outcome: "pass",
    });
  });

  it("subtracts one point for an invalid word and advances the turn", () => {
    const game = recordTurn(createGame("friend", "A", "B"), 0, {
      outcome: "invalid",
    });
    expect(game.players.map((player) => player.score)).toEqual([-1, 0]);
    expect(game.currentPlayerIndex).toBe(1);
    expect(acceptedWords(game.turns)).toEqual([]);
    expect(turnHistoryLabel(game.turns[0])).toBe("Wrong word");
    expect(formatTurnPoints(game.turns[0].points)).toBe("−1");
  });

  it("records a timeout with zero points and advances the turn", () => {
    const game = recordTurn(createGame("friend", "A", "B"), 0, {
      outcome: "timeout",
    });
    expect(game.players.map((player) => player.score)).toEqual([0, 0]);
    expect(game.currentPlayerIndex).toBe(1);
    expect(turnHistoryLabel(game.turns[0])).toBe("Timed out");
    expect(formatTurnPoints(game.turns[0].points)).toBe("0");
  });

  it("replays with the same players but a clean board", () => {
    const game = recordTurn(createGame("machine", "A"), 0, {
      word: "hello",
      outcome: "accepted",
    });
    const replayed = replayGame(game);
    expect(replayed.players[0].name).toBe("A");
    expect(replayed.players.map((player) => player.score)).toEqual([0, 0]);
    expect(replayed.turns).toEqual([]);
  });
});
