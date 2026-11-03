export type Piece = "tiger" | "goat";
export type Player = Piece;
export type Winner = Piece | null;

export interface GameState {
  board: (Piece | null)[];
  turn: Player;
  goatsPlaced: number;
  goatsCaptured: number;
  moveCount: number;
  lastMove: number[] | null;
  winner: Winner;
}

export interface Point {
  row: number;
  column: number;
}

export const BOARD_SIZE = 5;
export const TOTAL_GOATS = 20;
export const TIGER_WIN_CAPTURE_COUNT = 5;

export const POINTS: Point[] = Array.from(
  { length: BOARD_SIZE * BOARD_SIZE },
  (_, index) => ({
    row: Math.floor(index / BOARD_SIZE),
    column: index % BOARD_SIZE,
  }),
);

const pointIndex = (row: number, column: number) =>
  row * BOARD_SIZE + column;

const isInsideBoard = (row: number, column: number) =>
  row >= 0 && row < BOARD_SIZE && column >= 0 && column < BOARD_SIZE;

function areConnected(from: Point, to: Point) {
  const rowDistance = Math.abs(from.row - to.row);
  const columnDistance = Math.abs(from.column - to.column);

  if (rowDistance + columnDistance === 1) return true;

  return (
    rowDistance === 1 &&
    columnDistance === 1 &&
    ((from.row === from.column && to.row === to.column) ||
      (from.row + from.column === BOARD_SIZE - 1 &&
        to.row + to.column === BOARD_SIZE - 1))
  );
}

export const EDGES: [number, number][] = POINTS.flatMap((point, index) =>
  POINTS.flatMap((neighbor, neighborIndex) =>
    neighborIndex > index && areConnected(point, neighbor)
      ? [[index, neighborIndex] as [number, number]]
      : [],
  ),
);

export function createInitialGame(): GameState {
  const board: (Piece | null)[] = Array(BOARD_SIZE * BOARD_SIZE).fill(null);

  [0, BOARD_SIZE - 1, BOARD_SIZE * (BOARD_SIZE - 1), BOARD_SIZE * BOARD_SIZE - 1]
    .forEach((index) => {
      board[index] = "tiger";
    });

  return {
    board,
    turn: "goat",
    goatsPlaced: 0,
    goatsCaptured: 0,
    moveCount: 0,
    lastMove: null,
    winner: null,
  };
}

export function getLegalMoves(state: GameState, from: number): number[] {
  const piece = state.board[from];
  if (!piece || piece !== state.turn || state.winner) return [];

  const { row, column } = POINTS[from];
  const moves = new Set<number>();

  for (const rowStep of [-1, 0, 1]) {
    for (const columnStep of [-1, 0, 1]) {
      if (rowStep === 0 && columnStep === 0) continue;

      const nextRow = row + rowStep;
      const nextColumn = column + columnStep;
      if (!isInsideBoard(nextRow, nextColumn)) continue;

      const nextIndex = pointIndex(nextRow, nextColumn);
      if (!areConnected(POINTS[from], POINTS[nextIndex])) continue;

      if (state.board[nextIndex] === null) {
        moves.add(nextIndex);
        continue;
      }

      if (piece !== "tiger" || state.board[nextIndex] !== "goat") continue;

      const landingRow = nextRow + rowStep;
      const landingColumn = nextColumn + columnStep;
      if (!isInsideBoard(landingRow, landingColumn)) continue;

      const landingIndex = pointIndex(landingRow, landingColumn);
      if (
        state.board[landingIndex] === null &&
        areConnected(POINTS[nextIndex], POINTS[landingIndex])
      ) {
        moves.add(landingIndex);
      }
    }
  }

  return [...moves];
}

function hasTigerMove(state: GameState) {
  return state.board.some(
    (piece, index) =>
      piece === "tiger" &&
      getLegalMoves({ ...state, turn: "tiger" }, index).length > 0,
  );
}

export function playMove(
  state: GameState,
  from: number | null,
  to: number,
): GameState | null {
  if (state.winner || to < 0 || to >= state.board.length) return null;

  if (from === null) {
    if (
      state.turn !== "goat" ||
      state.goatsPlaced >= TOTAL_GOATS ||
      state.board[to] !== null
    ) {
      return null;
    }

    const board = [...state.board];
    board[to] = "goat";
    const nextState: GameState = {
      ...state,
      board,
      turn: "tiger",
      goatsPlaced: state.goatsPlaced + 1,
      moveCount: state.moveCount + 1,
      lastMove: [to],
    };

    return hasTigerMove(nextState)
      ? nextState
      : { ...nextState, winner: "goat" };
  }

  if (
    from < 0 ||
    from >= state.board.length ||
    state.board[from] !== state.turn ||
    state.board[to] !== null ||
    !getLegalMoves(state, from).includes(to)
  ) {
    return null;
  }

  const piece = state.board[from];
  if (!piece) return null;

  const board = [...state.board];
  let goatsCaptured = state.goatsCaptured;

  if (piece === "tiger") {
    const fromPoint = POINTS[from];
    const toPoint = POINTS[to];
    const rowDistance = toPoint.row - fromPoint.row;
    const columnDistance = toPoint.column - fromPoint.column;

    if (Math.abs(rowDistance) === 2 || Math.abs(columnDistance) === 2) {
      const jumpedIndex = pointIndex(
        fromPoint.row + rowDistance / 2,
        fromPoint.column + columnDistance / 2,
      );
      if (board[jumpedIndex] === "goat") {
        board[jumpedIndex] = null;
        goatsCaptured += 1;
      }
    }
  }

  board[to] = piece;
  board[from] = null;

  const nextTurn = piece === "tiger" ? "goat" : "tiger";
  const nextState: GameState = {
    ...state,
    board,
    turn: nextTurn,
    goatsCaptured,
    moveCount: state.moveCount + 1,
    lastMove: [from, to],
  };

  if (goatsCaptured >= TIGER_WIN_CAPTURE_COUNT) {
    return { ...nextState, winner: "tiger" };
  }

  return nextTurn === "tiger" && !hasTigerMove(nextState)
    ? { ...nextState, winner: "goat" }
    : nextState;
}
