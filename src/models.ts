export interface Piece {
	blocks: Block[]
}

export interface Block {
	color: string,
	x: number,
	y: number
}

export namespace PieceDefinitions {
	export const I: Piece = {
		blocks: [
			{color: "cyan", x: 0, y: 0},
			{color: "cyan", x: 1, y: 0},
			{color: "cyan", x: 2, y: 0},
			{color: "cyan", x: 3, y: 0},
		]
	}
	export const J: Piece = {
		blocks: [
			{color: "blue", x: 0, y: 0},
			{color: "blue", x: 1, y: 0},
			{color: "blue", x: 2, y: 0},
			{color: "blue", x: 2, y: 1},
		]
	}
	export const L: Piece = {
		blocks: [
			{color: "orange", x: 0, y: 1},
			{color: "orange", x: 1, y: 1},
			{color: "orange", x: 2, y: 1},
			{color: "orange", x: 2, y: 0},
		]
	}
	export const O: Piece = {
		blocks: [
			{color: "yellow", x: 0, y: 0},
			{color: "yellow", x: 1, y: 0},
			{color: "yellow", x: 0, y: 1},
			{color: "yellow", x: 1, y: 1},
		]
	}
	export const S: Piece = {
		blocks: [
			{color: "lime", x: 0, y: 1},
			{color: "lime", x: 1, y: 1},
			{color: "lime", x: 1, y: 0},
			{color: "lime", x: 2, y: 0},
		]
	}
	export const T: Piece = {
		blocks: [
			{color: "purple", x: 0, y: 0},
			{color: "purple", x: 1, y: 0},
			{color: "purple", x: 1, y: 1},
			{color: "purple", x: 2, y: 0},
		]
	}
	export const Z: Piece = {
		blocks: [
			{color: "red", x: 0, y: 0},
			{color: "red", x: 1, y: 0},
			{color: "red", x: 1, y: 1},
			{color: "red", x: 2, y: 1},
		]
	}
}

export const GetRandomPiece = () => {
	var num = Math.floor(Math.random()*7);
	switch(num) {
		case 0:
			return PieceDefinitions.I;
		case 1:
			return PieceDefinitions.J;
		case 2:
			return PieceDefinitions.L;
		case 3:
			return PieceDefinitions.O;
		case 4:
			return PieceDefinitions.S;
		case 5:
			return PieceDefinitions.T;
		case 6:
			return PieceDefinitions.Z;
	}
}

export interface GameState {
	activePiece: Piece,
	blocks: Block[],
}

export const DefaultGameState : GameState = {
	activePiece: { blocks: [] },
	blocks: []
}
