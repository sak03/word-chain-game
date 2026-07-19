import { describe, expect, it, vi } from "vitest";
import {
  acceptedWords,
  checkLocalRules,
  createGame,
  recordTurn,
  replayGame,
  requiredLetter,
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
    const game = recordTurn(createGame("friend", "A", "B"), 0, "hello");
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
    const game = recordTurn(createGame("friend", "A", "B"), 0, "level");
    expect(checkLocalRules("LEVEL", game.turns)).toEqual({
      valid: false,
      message: "“level” has already been used.",
    });
  });

  it("awards one point for a word and subtracts one for a pass", () => {
    const wordGame = recordTurn(createGame("friend", "A", "B"), 0, "hello");
    const passGame = recordTurn(wordGame, 1, null);
    expect(passGame.players.map((player) => player.score)).toEqual([1, -1]);
    expect(acceptedWords(passGame.turns)).toEqual(["hello"]);
  });

  it("replays with the same players but a clean board", () => {
    const game = recordTurn(createGame("machine", "A"), 0, "hello");
    const replayed = replayGame(game);
    expect(replayed.players[0].name).toBe("A");
    expect(replayed.players.map((player) => player.score)).toEqual([0, 0]);
    expect(replayed.turns).toEqual([]);
  });
});
