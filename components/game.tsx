"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  acceptedWords,
  checkLocalRules,
  createGame,
  GameMode,
  GameState,
  isStoredGame,
  recordTurn,
  replayGame,
  requiredLetter,
} from "@/lib/game";

type FieldErrors = Partial<Record<0 | 1, string>>;

export function Game() {
  const [hydrated, setHydrated] = useState(false);
  const [game, setGame] = useState<GameState | null>(null);
  const [mode, setMode] = useState<GameMode>("machine");
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [setupError, setSetupError] = useState("");
  const [values, setValues] = useState<[string, string]>(["", ""]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [checking, setChecking] = useState(false);
  const [machineError, setMachineError] = useState("");
  const [successFlash, setSuccessFlash] = useState<0 | 1 | null>(null);
  const [confirmAction, setConfirmAction] = useState<"replay" | "reset" | null>(
    null,
  );
  const inputRefs = useRef<[HTMLInputElement | null, HTMLInputElement | null]>([
    null,
    null,
  ]);
  const confirmCancelRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY) ??
        localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isStoredGame(parsed)) setGame(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (game) localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
    else localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, [game, hydrated]);

  useEffect(() => {
    if (!game || checking || machineError) return;
    inputRefs.current[game.currentPlayerIndex]?.focus();
  }, [checking, game, machineError]);

  useEffect(() => {
    if (!confirmAction) return;
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    confirmCancelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setConfirmAction(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      lastFocusRef.current?.focus?.();
    };
  }, [confirmAction]);

  useEffect(() => {
    if (successFlash === null) return;
    const timer = window.setTimeout(() => setSuccessFlash(null), 900);
    return () => window.clearTimeout(timer);
  }, [successFlash]);

  function startGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanFirstName = firstName.trim();
    const cleanSecondName = secondName.trim();

    if (cleanFirstName.length < 2) {
      setSetupError("Player 1, please enter at least 2 letters for your name.");
      return;
    }
    if (mode === "friend" && cleanSecondName.length < 2) {
      setSetupError("Player 2, please enter at least 2 letters for your name.");
      return;
    }
    if (mode === "friend" && cleanFirstName.toLowerCase() === cleanSecondName.toLowerCase()) {
      setSetupError("Please use a different name for each player.");
      return;
    }

    setGame(createGame(mode, cleanFirstName, cleanSecondName));
    setSetupError("");
    setErrors({});
    setValues(["", ""]);
  }

  async function askWordBot(gameAfterPlayer: GameState) {
    const letter = requiredLetter(gameAfterPlayer.turns);
    if (!letter) return;

    setChecking(true);
    setMachineError("");
    try {
      const response = await fetch("/api/machine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letter,
          usedWords: acceptedWords(gameAfterPlayer.turns),
        }),
      });
      const result = (await response.json()) as { word?: string | null; error?: string };
      if (!response.ok) throw new Error(result.error || "WordBot needs a moment.");

      setGame(recordTurn(gameAfterPlayer, 1, result.word ?? null));
    } catch (error) {
      setMachineError(
        error instanceof Error ? error.message : "WordBot needs a moment. Please retry.",
      );
    } finally {
      setChecking(false);
    }
  }

  async function submitWord(event: FormEvent<HTMLFormElement>, playerIndex: 0 | 1) {
    event.preventDefault();
    if (!game || checking || game.currentPlayerIndex !== playerIndex) return;

    const localResult = checkLocalRules(values[playerIndex], game.turns);
    if (!localResult.valid) {
      setErrors((current) => ({ ...current, [playerIndex]: localResult.message }));
      return;
    }

    setChecking(true);
    setErrors((current) => ({ ...current, [playerIndex]: "" }));
    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: localResult.word }),
      });
      const result = (await response.json()) as { valid?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not check that word.");

      if (!result.valid) {
        setErrors((current) => ({
          ...current,
          [playerIndex]: `“${localResult.word}” is not in our English dictionary. Check the spelling or pass.`,
        }));
        return;
      }

      const nextGame = recordTurn(game, playerIndex, localResult.word);
      setGame(nextGame);
      setSuccessFlash(playerIndex);
      setValues((current) => {
        const next: [string, string] = [...current];
        next[playerIndex] = "";
        return next;
      });
      if (game.mode === "machine" && playerIndex === 0) {
        setChecking(false);
        await askWordBot(nextGame);
      }
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [playerIndex]:
          error instanceof Error
            ? `${error.message} Your turn is safe—please retry.`
            : "Could not check that word. Please retry.",
      }));
    } finally {
      setChecking(false);
    }
  }

  async function passTurn(playerIndex: 0 | 1) {
    if (!game || checking || game.currentPlayerIndex !== playerIndex) return;
    const nextGame = recordTurn(game, playerIndex, null);
    setGame(nextGame);
    setErrors((current) => ({ ...current, [playerIndex]: "" }));
    setValues((current) => {
      const next: [string, string] = [...current];
      next[playerIndex] = "";
      return next;
    });
    if (game.mode === "machine" && playerIndex === 0) await askWordBot(nextGame);
  }

  function playAgain() {
    if (!game) return;
    setGame(replayGame(game));
    setValues(["", ""]);
    setErrors({});
    setMachineError("");
    setSuccessFlash(null);
    setConfirmAction(null);
  }

  function resetGame() {
    setGame(null);
    setFirstName("");
    setSecondName("");
    setValues(["", ""]);
    setErrors({});
    setMachineError("");
    setSuccessFlash(null);
    setConfirmAction(null);
  }

  if (!hydrated) {
    return (
      <section className="hydrate-section" aria-busy="true" aria-live="polite">
        <div className="hydrate-card">
          <span className="hydrate-loader" aria-hidden="true" />
          <p>Loading your game…</p>
        </div>
      </section>
    );
  }

  if (!game) {
    return (
      <section className="setup-section">
        <div className="hero-copy">
          <span className="eyebrow">Think fast. Link words. Have fun.</span>
          <h1>
            Every ending starts a <em>new word.</em>
          </h1>
          <p>
            A friendly word-chain challenge for curious minds. Pick a mode, add
            your name, and keep the chain alive!
          </p>
          <div className="rule-pills" aria-label="Quick rules">
            <span>
              <b>+1</b> correct word
            </span>
            <span>
              <b>−1</b> pass
            </span>
            <span>
              <b>0</b> spelling error
            </span>
          </div>
        </div>

        <form className="setup-card" onSubmit={startGame} noValidate>
          <div className="step-label">
            <span>1</span> Choose how to play
          </div>
          <div className="mode-grid" role="radiogroup" aria-label="Game mode">
            <label className={`mode-card ${mode === "machine" ? "selected" : ""}`}>
              <input
                type="radio"
                name="mode"
                value="machine"
                checked={mode === "machine"}
                onChange={() => setMode("machine")}
              />
              <span className="mode-icon" aria-hidden="true">
                ✦
              </span>
              <strong>Play with WordBot</strong>
              <small>Solo challenge</small>
            </label>
            <label className={`mode-card ${mode === "friend" ? "selected" : ""}`}>
              <input
                type="radio"
                name="mode"
                value="friend"
                checked={mode === "friend"}
                onChange={() => setMode("friend")}
              />
              <span className="mode-icon coral" aria-hidden="true">
                ●●
              </span>
              <strong>Play with a friend</strong>
              <small>Take turns together</small>
            </label>
          </div>

          <div className="step-label">
            <span>2</span> Who&apos;s playing?
          </div>
          <div className="name-fields">
            <label>
              <span>{mode === "friend" ? "Player 1 name" : "Your name"}</span>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value.slice(0, 24))}
                placeholder="e.g. Aanya"
                autoComplete="name"
                autoFocus
              />
            </label>
            {mode === "friend" && (
              <label>
                <span>Player 2 name</span>
                <input
                  value={secondName}
                  onChange={(event) => setSecondName(event.target.value.slice(0, 24))}
                  placeholder="e.g. Kabir"
                  autoComplete="off"
                />
              </label>
            )}
          </div>
          {setupError && (
            <p className="form-error" role="alert">
              {setupError}
            </p>
          )}
          <button className="primary-button start-button" type="submit">
            Start the challenge <span aria-hidden="true">→</span>
          </button>
          <p className="storage-note">Your game stays only on this device.</p>
        </form>
      </section>
    );
  }

  const letter = requiredLetter(game.turns);
  const hasOpeningWord = acceptedWords(game.turns).length > 0;

  return (
    <section className="game-section">
      <div className="game-topbar">
        <div>
          <span className="eyebrow">
            {game.mode === "machine" ? "Solo challenge" : "Friend challenge"}
          </span>
          <h1>Keep the chain going!</h1>
        </div>
        <div className="game-actions">
          <button type="button" className="ghost-button" onClick={() => setConfirmAction("replay")}>
            Play again
          </button>
          <button
            type="button"
            className="ghost-button danger"
            onClick={() => setConfirmAction("reset")}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="scoreboard" aria-label="Scores">
        {game.players.map((player, index) => (
          <article
            className={`score-card player-${index + 1} ${game.currentPlayerIndex === index ? "active" : ""} ${successFlash === index ? "score-bump" : ""}`}
            key={player.id}
          >
            <div className="avatar" aria-hidden="true">
              {player.isMachine ? "✦" : player.name[0].toUpperCase()}
            </div>
            <div>
              <small>{game.currentPlayerIndex === index ? "Playing now" : "Waiting"}</small>
              <strong>{player.name}</strong>
            </div>
            <span className="score">
              <b>{player.score}</b> pts
              {successFlash === index && (
                <span className="plus-one" aria-hidden="true">
                  +1
                </span>
              )}
            </span>
          </article>
        ))}
      </div>

      <div className="game-layout">
        <div className="play-panel">
          <div className="letter-prompt" aria-live="polite">
            {letter ? (
              <>
                <span>Next word starts with</span>
                <strong>{letter.toUpperCase()}</strong>
              </>
            ) : (
              <>
                <span>Start with</span>
                <strong>ANY</strong>
                <span>letter</span>
              </>
            )}
          </div>

          <div className="turn-fields">
            {game.players.map((player, index) => {
              const playerIndex = index as 0 | 1;
              const isActive = game.currentPlayerIndex === playerIndex;
              const isMachine = player.isMachine;
              const hasError = Boolean(errors[playerIndex]);

              if (isMachine) {
                return (
                  <div
                    className={`turn-card bot-turn-card ${isActive ? "active" : ""}`}
                    key={player.id}
                    aria-live="polite"
                  >
                    <div className="bot-orb" aria-hidden="true">
                      ✦
                    </div>
                    <div>
                      <strong>WordBot</strong>
                      <p>
                        {isActive
                          ? checking
                            ? `Finding a fresh “${letter?.toUpperCase() ?? ""}” word…`
                            : machineError
                              ? "Waiting to retry its turn."
                              : "Ready to think!"
                          : "Waiting for your word."}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <form
                  className={`turn-card ${isActive ? "active" : ""} ${hasError ? "has-error" : ""} ${successFlash === playerIndex ? "just-scored" : ""}`}
                  key={player.id}
                  onSubmit={(event) => submitWord(event, playerIndex)}
                  aria-busy={checking && isActive}
                >
                  <label htmlFor={`word-${player.id}`}>
                    <span>{player.name}&apos;s word</span>
                    {isActive && !isMachine && <small>Your turn</small>}
                  </label>
                  <div className="word-input-row">
                    <input
                      ref={(element) => {
                        inputRefs.current[playerIndex] = element;
                      }}
                      id={`word-${player.id}`}
                      value={values[playerIndex]}
                      onChange={(event) => {
                        const value = event.target.value.slice(0, 32);
                        setValues((current) => {
                          const next: [string, string] = [...current];
                          next[playerIndex] = value;
                          return next;
                        });
                        setErrors((current) => ({ ...current, [playerIndex]: "" }));
                      }}
                      placeholder={
                        isMachine
                          ? checking
                            ? "WordBot is thinking…"
                            : "WordBot"
                          : letter
                            ? `${letter.toUpperCase()}…`
                            : "Type any word…"
                      }
                      disabled={!isActive || isMachine || checking}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      aria-invalid={hasError}
                      aria-errormessage={hasError ? `feedback-${player.id}` : undefined}
                      aria-describedby={`feedback-${player.id}`}
                    />
                    <button
                      className="submit-word"
                      type="submit"
                      disabled={!isActive || checking}
                      aria-label={`Submit ${player.name}'s word`}
                    >
                      {checking && isActive ? <span className="mini-loader" /> : "→"}
                    </button>
                  </div>
                  <div
                    id={`feedback-${player.id}`}
                    className="field-feedback"
                    role={hasError ? "alert" : undefined}
                    aria-live="polite"
                  >
                    {errors[playerIndex] ? (
                      <span className="error-text">{errors[playerIndex]}</span>
                    ) : checking && isActive ? (
                      <span>Checking word…</span>
                    ) : (
                      <span>
                        {isActive
                          ? "Enter a valid English word."
                          : "This field unlocks on the next turn."}
                      </span>
                    )}
                  </div>
                  <button
                    className="pass-button"
                    type="button"
                    disabled={!isActive || checking || (game.mode === "machine" && !hasOpeningWord)}
                    onClick={() => passTurn(playerIndex)}
                    title={
                      game.mode === "machine" && !hasOpeningWord
                        ? "Play the opening word first"
                        : "Pass and lose one point"
                    }
                  >
                    Pass <span>−1 point</span>
                  </button>
                  {isActive && (
                    <p className="pass-tip">Wrong spelling = 0 · Pass = −1</p>
                  )}
                </form>
              );
            })}
          </div>

          {machineError && (
            <div className="machine-alert" role="alert">
              <p>{machineError} Your game is safe.</p>
              <button type="button" onClick={() => askWordBot(game)}>
                Retry WordBot
              </button>
            </div>
          )}
        </div>

        <aside className="history-panel">
          <div className="history-heading">
            <div>
              <span className="eyebrow">Word trail</span>
              <h2>Words used</h2>
            </div>
            <span className="word-count">{acceptedWords(game.turns).length}</span>
          </div>
          {game.turns.length ? (
            <ol className="word-history">
              {[...game.turns].reverse().map((turn) => (
                <li key={turn.id} className={turn.word ? "" : "passed"}>
                  <span className={`history-dot ${turn.playerId}`} aria-hidden="true" />
                  <div>
                    <strong>{turn.word ?? "Passed"}</strong>
                    <small>{turn.playerName}</small>
                  </div>
                  <b>{turn.points > 0 ? "+1" : "−1"}</b>
                </li>
              ))}
            </ol>
          ) : (
            <div className="empty-history">
              <span aria-hidden="true">abc</span>
              <p>Your word trail will appear here.</p>
            </div>
          )}
        </aside>
      </div>

      <div className="rules-strip">
        <strong>How to play</strong>
        <span>
          <i>1</i> Use the last letter
        </span>
        <span>
          <i>2</i> No repeated words
        </span>
        <span>
          <i>3</i> Correct word earns +1
        </span>
      </div>

      {confirmAction && (
        <div
          className="dialog-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setConfirmAction(null);
          }}
        >
          <div
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-description"
          >
            <span className="dialog-icon" aria-hidden="true">
              ↻
            </span>
            <h2 id="confirm-title">
              {confirmAction === "replay" ? "Start a fresh round?" : "Reset everything?"}
            </h2>
            <p id="confirm-description">
              {confirmAction === "replay"
                ? "Scores and word history will be cleared. Player names will stay."
                : "Player names, scores, and word history will be removed from this device."}
            </p>
            <div className="dialog-actions">
              <button
                ref={confirmCancelRef}
                type="button"
                className="ghost-button"
                onClick={() => setConfirmAction(null)}
              >
                Keep playing
              </button>
              <button
                type="button"
                className={`primary-button ${confirmAction === "reset" ? "reset-confirm" : ""}`}
                onClick={confirmAction === "replay" ? playAgain : resetGame}
              >
                {confirmAction === "replay" ? "Play again" : "Yes, reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
