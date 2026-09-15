import { GameBase, GameOption, drawRoundedRect } from "./games.js";
import { registerWidget } from "../widgets/widgets.js";
import { getThemeVar } from "../main-features/appearance/themes.js";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 12;
const CELL_SIZE = 25;
type Matrix = number[][];
type Kick = [dx: number, dy: number];
type KickTable = Record<string, Kick[]>;

const BASE_PIECES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  T: [
    [0, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  Z: [
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  L: [
    [0, 0, 1, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
} satisfies Record<string, Matrix>;

type PieceType = keyof typeof BASE_PIECES;
// 0 = empty cell, otherwise the type of the piece that was placed there
type Cell = PieceType | 0;

function themeColor(varName: string): string {
  return getThemeVar(varName) ?? "#000";
}

function rotate(matrix: Matrix): Matrix {
  const size = matrix.length;
  // Clockwise rotation: result[x][size - 1 - y] = matrix[y][x]
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => matrix[size - 1 - col]?.[row] ?? 0)
  );
}

function generateRotations(base: Matrix): Matrix[] {
  const rotations: Matrix[] = [base];
  let prev = base;
  for (let i = 1; i < 4; i++) {
    const next = rotate(prev);
    prev = next;
    if (!rotations.some((r) => JSON.stringify(r) === JSON.stringify(next))) {
      rotations.push(next);
    }
  }
  while (rotations.length < 4) rotations.push(base);
  return rotations;
}

const PIECE_TYPES = Object.keys(BASE_PIECES) as PieceType[];

const PIECES = Object.fromEntries(
  PIECE_TYPES.map((name) => [name, generateRotations(BASE_PIECES[name])])
) as Record<PieceType, Matrix[]>;

const PIECE_COLORS: Record<PieceType, string> = {
  I: "#00FFFF",
  O: "#FFFF00",
  T: "#800080",
  S: "#00FF00",
  Z: "#FF0000",
  J: "#0000FF",
  L: "#FFA500",
};

const KICKS: { JLTSZ: KickTable; I: KickTable; O: KickTable } = {
  JLTSZ: {
    "0>1": [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ],
    "1>0": [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
    "1>2": [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
    "2>1": [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ],
    "2>3": [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
    "3>2": [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
    "3>0": [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
    "0>3": [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
  },
  I: {
    "0>1": [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
    "1>0": [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
    "1>2": [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 2],
      [2, -1],
    ],
    "2>1": [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, -2],
      [-2, 1],
    ],
    "2>3": [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
    "3>2": [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
    "3>0": [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, -2],
      [-2, 1],
    ],
    "0>3": [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 2],
      [2, -1],
    ],
  },
  O: {
    "0>1": [[0, 0]],
    "1>2": [[0, 0]],
    "2>3": [[0, 0]],
    "3>0": [[0, 0]],
    "1>0": [[0, 0]],
    "2>1": [[0, 0]],
    "3>2": [[0, 0]],
    "0>3": [[0, 0]],
  },
};

class TetrisWidget extends GameBase {
  #board: Cell[][] = [];
  #currentPiece: PieceType = "I";
  #currentRotation = 0;
  #pieceX = 0;
  #pieceY = 0;
  #nextPiece: PieceType | null = null;
  #dropTime = 0;
  #dropInterval = 0;
  #leftHeld = false;
  #rightHeld = false;
  #downHeld = false;
  #leftTimer: ReturnType<typeof setInterval> | undefined;
  #rightTimer: ReturnType<typeof setInterval> | undefined;
  #downTimer: ReturnType<typeof setInterval> | undefined;

  override get title(): string {
    return "Tetris++";
  }
  override get options(): GameOption[] {
    return [GameOption.slider("speed", "Speed:", 10, 100, 30)];
  }

  #randomPiece(): PieceType {
    return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)] ?? "I";
  }
  #getPieceShape(type: PieceType, rotation: number): Matrix {
    return PIECES[type][rotation % 4] ?? BASE_PIECES[type];
  }

  #collision(
    pieceType: PieceType,
    rotation: number,
    x: number,
    y: number
  ): boolean {
    const shape = this.#getPieceShape(pieceType, rotation);
    for (let py = 0; py < 4; py++) {
      for (let px = 0; px < 4; px++) {
        if (shape[py]?.[px]) {
          const bx = x + px;
          const by = y + py;
          if (
            bx < 0 ||
            bx >= BOARD_WIDTH ||
            by >= BOARD_HEIGHT ||
            (by >= 0 && this.#board[by]?.[bx])
          )
            return true;
        }
      }
    }
    return false;
  }

  #placePiece() {
    const shape = this.#getPieceShape(
      this.#currentPiece,
      this.#currentRotation
    );
    for (let py = 0; py < 4; py++) {
      for (let px = 0; px < 4; px++) {
        if (shape[py]?.[px]) {
          const bx = this.#pieceX + px;
          const row = this.#board[this.#pieceY + py];
          if (row) row[bx] = this.#currentPiece;
        }
      }
    }
  }

  #clearLines() {
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.#board[y]?.every((c) => c !== 0)) {
        this.#board.splice(y, 1);
        this.#board.unshift(new Array<Cell>(BOARD_WIDTH).fill(0));
        linesCleared++;
        y++;
      }
    }
    this.score += linesCleared;
  }

  #spawnPiece() {
    this.#currentPiece = this.#nextPiece || this.#randomPiece();
    this.#nextPiece = this.#randomPiece();
    this.#currentRotation = 0;
    this.#pieceX = Math.floor(BOARD_WIDTH / 2) - 2;
    this.#pieceY = -1;
    if (
      this.#collision(
        this.#currentPiece,
        this.#currentRotation,
        this.#pieceX,
        this.#pieceY
      )
    )
      this.stopGame();
  }

  override async onGameStart() {
    this.#board = Array.from({ length: BOARD_HEIGHT }, () =>
      new Array<Cell>(BOARD_WIDTH).fill(0)
    );
    this.#dropTime = 0;
    this.#dropInterval = 1000 / (this.getOpt("speed") / 10);
    this.#stopMoveLeft();
    this.#stopMoveRight();
    this.#stopMoveDown();
    this.#spawnPiece();
  }

  override onGameDraw(ctx: CanvasRenderingContext2D, dt: number) {
    this.#dropTime += dt;
    if (this.#dropTime >= this.#dropInterval) {
      this.#move(0, 1);
      this.#dropTime = 0;
    }

    ctx.fillStyle = themeColor("--color-base01");
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const offsetX = (this.canvas.width - BOARD_WIDTH * CELL_SIZE) / 2;
    ctx.strokeStyle = themeColor("--color-base03");
    ctx.lineWidth = 1;

    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + x * CELL_SIZE, 0);
      ctx.lineTo(offsetX + x * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(offsetX, y * CELL_SIZE);
      ctx.lineTo(offsetX + BOARD_WIDTH * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }

    const radius = 5;

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = this.#board[y]?.[x];
        if (cell) {
          ctx.fillStyle = PIECE_COLORS[cell];
          drawRoundedRect(
            ctx,
            offsetX + x * CELL_SIZE,
            y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE,
            radius
          );
          ctx.fill();
          ctx.strokeStyle = themeColor("--color-base03");
          ctx.stroke();
        }
      }
    }

    const shape = this.#getPieceShape(
      this.#currentPiece,
      this.#currentRotation
    );
    ctx.fillStyle = PIECE_COLORS[this.#currentPiece];
    for (let py = 0; py < 4; py++) {
      for (let px = 0; px < 4; px++) {
        if (shape[py]?.[px]) {
          const x = offsetX + (this.#pieceX + px) * CELL_SIZE;
          const y = (this.#pieceY + py) * CELL_SIZE;
          drawRoundedRect(ctx, x, y, CELL_SIZE, CELL_SIZE, radius);
          ctx.fill();
          ctx.strokeStyle = themeColor("--color-base03");
          ctx.stroke();
        }
      }
    }
  }

  #move(dx: number, dy: number) {
    this.#pieceX += dx;
    this.#pieceY += dy;
    if (
      this.#collision(
        this.#currentPiece,
        this.#currentRotation,
        this.#pieceX,
        this.#pieceY
      )
    ) {
      this.#pieceX -= dx;
      this.#pieceY -= dy;
      if (dy > 0) {
        this.#placePiece();
        this.#clearLines();
        this.#spawnPiece();
      }
    }
  }

  #rotate() {
    const piece = this.#currentPiece;
    const from = this.#currentRotation;
    const to = (this.#currentRotation + 1) % 4;
    const kickSet =
      piece === "I" ? KICKS.I : piece === "O" ? KICKS.O : KICKS.JLTSZ;
    const key = `${from}>${to}`;
    for (const [dx, dy] of kickSet[key] ?? []) {
      if (!this.#collision(piece, to, this.#pieceX + dx, this.#pieceY + dy)) {
        this.#currentRotation = to;
        this.#pieceX += dx;
        this.#pieceY += dy;
        return;
      }
    }
  }

  #hardDrop() {
    while (
      !this.#collision(
        this.#currentPiece,
        this.#currentRotation,
        this.#pieceX,
        this.#pieceY + 1
      )
    ) {
      this.#pieceY++;
    }
    this.#move(0, 1);
    this.#dropTime = 0;
  }

      
    
  #startMoveLeft() {
    if (!this.#leftHeld) {
      this.#move(-1, 0);
      this.#leftHeld = true;
      this.#leftTimer = setInterval(() => this.#move(-1, 0), 100);
    }
  }
  #stopMoveLeft() {
    if (this.#leftHeld) {
      this.#leftHeld = false;
      clearInterval(this.#leftTimer);
    }
  }
  #startMoveRight() {
    if (!this.#rightHeld) {
      this.#move(1, 0);
      this.#rightHeld = true;
      this.#rightTimer = setInterval(() => this.#move(1, 0), 100);
    }
  }
  #stopMoveRight() {
    if (this.#rightHeld) {
      this.#rightHeld = false;
      clearInterval(this.#rightTimer);
    }
  }
  #startMoveDown() {
    if (!this.#downHeld) {
      this.#move(0, 1);
      this.#downHeld = true;
      this.#downTimer = setInterval(() => this.#move(0, 1), 50);
    }
  }
  #stopMoveDown() {
    if (this.#downHeld) {
      this.#downHeld = false;
      clearInterval(this.#downTimer);
    }
  }

  override async onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowLeft":
        this.#startMoveLeft();
        break;
      case "ArrowRight":
        this.#startMoveRight();
        break;
      case "ArrowDown":
        this.#startMoveDown();
        break;
      case "ArrowUp":
      e.preventDefault();
        this.#rotate();
        break;
      case " ":
        e.preventDefault();
        if (!e.repeat) this.#hardDrop();
        break;
    }
  }
  override async onKeyUp(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowLeft":
        this.#stopMoveLeft();
        break;
      case "ArrowRight":
        this.#stopMoveRight();
        break;
      case "ArrowDown":
        this.#stopMoveDown();
        break;
    }
  }
}

registerWidget(new TetrisWidget());
