"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  EDGES,
  POINTS,
  TOTAL_GOATS,
  createInitialGame,
  getLegalMoves,
  playMove,
  type GameState,
  type Piece,
} from "@/lib/bagh-bondi";

function getTurnLabel(game: GameState) {
  if (game.winner === "tiger") return "The tigers win";
  if (game.winner === "goat") return "The goats win";
  if (game.turn === "goat" && game.goatsPlaced < TOTAL_GOATS) {
    return "Place a goat";
  }
  return game.turn === "tiger" ? "Tigers’ turn" : "Goats’ turn";
}

function getTurnDescription(game: GameState) {
  if (game.winner === "tiger") {
    return `Five goats captured. The tigers have won in ${game.moveCount} moves.`;
  }
  if (game.winner === "goat") {
    return "Every tiger is blocked. The goats have won!";
  }
  if (game.turn === "goat" && game.goatsPlaced < TOTAL_GOATS) {
    return "Choose an empty point to place a goat.";
  }
  if (game.turn === "tiger") {
    return "Select a tiger, then choose a highlighted point to move.";
  }
  return "Select a goat, then choose a highlighted point to move.";
}

function Token({ piece }: { piece: Piece }) {
  return (
    <span className={`piece-token ${piece}`} aria-hidden="true">
      <span>{piece === "tiger" ? "T" : "G"}</span>
    </span>
  );
}

export default function Home() {
  const [game, setGame] = useState(createInitialGame);
  const [selected, setSelected] = useState<number | null>(null);
  const [history, setHistory] = useState<GameState[]>([]);
  const [showRules, setShowRules] = useState(false);

  const legalMoves = useMemo(
    () => (selected === null ? [] : getLegalMoves(game, selected)),
    [game, selected],
  );

  const emptyPoints = game.board.filter((piece) => piece === null).length;
  const isGoatPlacement =
    game.turn === "goat" && game.goatsPlaced < TOTAL_GOATS && !game.winner;
  const turnLabel = getTurnLabel(game);
  const isGameOver = game.winner !== null;

  function makeMove(from: number | null, to: number) {
    const nextGame = playMove(game, from, to);
    if (!nextGame) return false;
    setHistory((previous) => [...previous, game]);
    setGame(nextGame);
    setSelected(null);
    return true;
  }

  function handlePointClick(index: number) {
    if (game.winner) return;

    if (isGoatPlacement) {
      makeMove(null, index);
      return;
    }

    if (selected !== null && legalMoves.includes(index)) {
      makeMove(selected, index);
      return;
    }

    if (selected === index) {
      setSelected(null);
      return;
    }

    if (game.board[index] === game.turn) {
      setSelected(index);
      return;
    }

    setSelected(null);
  }

  function resetGame() {
    setGame(createInitialGame());
    setSelected(null);
    setHistory([]);
  }

  function undoMove() {
    const previous = history.at(-1);
    if (!previous) return;
    setGame(previous);
    setHistory((moves) => moves.slice(0, -1));
    setSelected(null);
  }

  return (
    <main className="game-shell min-h-screen">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Bagh Bondi home">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span className="brand-name">bagh<span>bondi</span></span>
        </Link>
        <div className="header-right">
          <span className="header-caption">A game of patience &amp; position</span>
          <button
            className="text-button rules-trigger"
            type="button"
            onClick={() => setShowRules(true)}
          >
            How to play <span aria-hidden="true">↗</span>
          </button>
        </div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow"><span /> THE CLASSIC BANGLADESHI STRATEGY GAME</p>
          <h1>Outthink the <em>other side.</em></h1>
          <p className="intro-copy">
            Four tigers. Twenty goats. One board. Play together and see who
            can outmaneuver whom.
          </p>
        </div>
        <div className="game-counter" aria-label={`${game.moveCount} moves played`}>
          <span className="counter-label">MOVE</span>
          <span className="counter-value">{String(game.moveCount).padStart(2, "0")}</span>
        </div>
      </section>

      <section className="play-layout" aria-label="Bagh Bondi game">
        <div className="board-card">
          <div className="board-card-head">
            <div>
              <span className="section-kicker">THE PLAYING FIELD</span>
              <h2>Make your move</h2>
            </div>
            <span className="board-tag"><span /> TWO PLAYERS</span>
          </div>

          <div className="board-wrap">
            <div className="board-stage">
              <svg
                className="board-lines"
                viewBox="0 0 500 500"
                role="img"
                aria-label="Five by five Bagh Bondi board with connected movement paths"
              >
                {EDGES.map(([from, to]) => {
                  const start = POINTS[from];
                  const end = POINTS[to];
                  return (
                    <line
                      key={`${from}-${to}`}
                      x1={50 + start.column * 100}
                      y1={50 + start.row * 100}
                      x2={50 + end.column * 100}
                      y2={50 + end.row * 100}
                    />
                  );
                })}
              </svg>
              {POINTS.map(({ row, column }, index) => {
                const piece = game.board[index];
                const isSelected = selected === index;
                const isLegalMove = legalMoves.includes(index);
                const isLastMove = game.lastMove?.includes(index) ?? false;
                const isPlaceable = isGoatPlacement && piece === null;

                return (
                  <button
                    className={[
                      "board-point",
                      piece ? `occupied ${piece}-point` : "empty-point",
                      isSelected ? "selected" : "",
                      isLegalMove || isPlaceable ? "legal" : "",
                      isLastMove ? "last-move" : "",
                    ].filter(Boolean).join(" ")}
                    key={index}
                    type="button"
                    style={{
                      left: `${((50 + column * 100) / 500) * 100}%`,
                      top: `${((50 + row * 100) / 500) * 100}%`,
                    }}
                    onClick={() => handlePointClick(index)}
                    aria-label={`Row ${row + 1}, column ${column + 1}: ${
                      piece ? `${piece} piece` : "empty"
                    }${isLegalMove || isPlaceable ? ", available" : ""}`}
                    aria-pressed={isSelected}
                    disabled={isGameOver}
                  >
                    {piece ? <Token piece={piece} /> : <span className="point-dot" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="board-footer">
            <span className="board-hint">
              {isGameOver
                ? "Start a new game to play again."
                : isGoatPlacement
                  ? "Tap any empty point to place a goat"
                  : "Select a piece, then tap a highlighted point"}
            </span>
            <div className="legend" aria-label="Piece legend">
              <span><i className="legend-dot tiger-legend" /> Tigers</span>
              <span><i className="legend-dot goat-legend" /> Goats</span>
            </div>
          </div>
        </div>

        <aside className="game-sidebar">
          <div className={`turn-card ${game.winner ? "finished" : game.turn}`}>
            <div className="turn-card-top">
              <span className="turn-indicator" />
              <span className="turn-eyebrow">
                {game.winner ? "GAME COMPLETE" : "NOW PLAYING"}
              </span>
              {!isGameOver && (
                <span className="turn-phase">
                  {isGoatPlacement ? "PLACEMENT" : "MOVEMENT"}
                </span>
              )}
            </div>
            <h2 aria-live="polite">{turnLabel}</h2>
            <p>{getTurnDescription(game)}</p>
            {game.winner && (
              <button className="winner-action" type="button" onClick={resetGame}>
                Play again <span aria-hidden="true">↗</span>
              </button>
            )}
          </div>

          <div className="score-card">
            <div className="score-card-head">
              <div>
                <span className="section-kicker">THE SCORE</span>
                <h3>Pieces in play</h3>
              </div>
              <span className="score-round">01</span>
            </div>
            <div className="score-row">
              <div className="score-player">
                <span className="score-icon tiger-icon">T</span>
                <span><strong>The tigers</strong><small>Hunters</small></span>
              </div>
              <strong className="score-number">04</strong>
            </div>
            <div className="score-divider" />
            <div className="score-row">
              <div className="score-player">
                <span className="score-icon goat-icon">G</span>
                <span>
                  <strong>The goats</strong>
                  <small>
                    {game.goatsPlaced < TOTAL_GOATS
                      ? `${TOTAL_GOATS - game.goatsPlaced} to place`
                      : "Defenders"}
                  </small>
                </span>
              </div>
              <strong className="score-number">
                {String(game.goatsPlaced - game.goatsCaptured).padStart(2, "0")}
              </strong>
            </div>
            <div className="capture-meter">
              <div className="capture-meter-label">
                <span>GOATS CAPTURED</span>
                <strong>{game.goatsCaptured} <i>/ 5</i></strong>
              </div>
              <div
                className="meter-track"
                role="progressbar"
                aria-label="Goats captured"
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={game.goatsCaptured}
              >
                <span style={{ width: `${(game.goatsCaptured / 5) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="round-card">
            <div className="round-card-top">
              <span className="section-kicker">GAME CONTROLS</span>
              <span className="moves-played">{emptyPoints} open</span>
            </div>
            <div className="control-actions">
              <button
                className="control-button undo-button"
                type="button"
                onClick={undoMove}
                disabled={history.length === 0}
              >
                <span aria-hidden="true">↶</span> Undo
              </button>
              <button
                className="control-button reset-button"
                type="button"
                onClick={resetGame}
              >
                <span aria-hidden="true">⟳</span> New game
              </button>
            </div>
          </div>

          <div className="tip-card">
            <span className="tip-star" aria-hidden="true">✳</span>
            <p><strong>A little strategy</strong>Goats win by surrounding the tigers. Work together and close every path.</p>
          </div>
        </aside>
      </section>

      <footer className="site-footer">
        <span>Rooted in tradition. Ready for your next move.</span>
        <span>BAGH BONDI <i>·</i> TIGERS &amp; GOATS</span>
      </footer>

      {showRules && (
        <div className="modal-backdrop" onClick={() => setShowRules(false)}>
          <section
            className="rules-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rules-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close rules"
              onClick={() => setShowRules(false)}
            >
              ×
            </button>
            <span className="section-kicker">A QUICK GUIDE</span>
            <h2 id="rules-title">How to play</h2>
            <p className="rules-intro">
              Bagh Bondi is a two-player game of hunters and defenders. Take
              turns, one move at a time.
            </p>
            <div className="rules-list">
              <div><span>01</span><p><strong>Goats place first.</strong> Place all 20 goats, one at a time, on any open point. Tigers can move and capture while goats are being placed.</p></div>
              <div><span>02</span><p><strong>Then move along a line.</strong> Once all goats are on the board, each side moves one piece to a connected, neighboring empty point.</p></div>
              <div><span>03</span><p><strong>Tigers jump to capture.</strong> A tiger jumps over a neighboring goat onto the empty point just beyond it. Five captures win the game.</p></div>
              <div><span>04</span><p><strong>Goats win by blocking.</strong> If the goats leave the tigers with no legal moves, the goats win. Coordinate to close every route.</p></div>
            </div>
            <div className="rules-note">
              <span aria-hidden="true">↗</span>
              Click or tap a piece to select it; valid destinations are highlighted.
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
