import { Block, Piece, GameState, DefaultGameState, PieceDefinitions } from 'models';
import { Action, ActionCreator } from 'typedActions';
import * as Actions from 'actions';

import * as _ from 'lodash';

const reducer: {[key: string]: <A extends Action>(state: GameState, action: A) => GameState} = {

	[Actions.SET_ACTIVE_PIECE]: (state: GameState, action: Actions.SetActivePiece) => {
		let minX = _.min(action.piece.blocks.map(b => b.x));
		let maxX = _.max(action.piece.blocks.map(b => b.x));

		let gameboardSize = 10;
		
		let middleX = Math.floor(((maxX - minX) || 1) / 2);
		let start = (gameboardSize / 2) -1;

		let pieceMappedToBoard = action.piece.blocks.map(b => {
			let x = middleX;
			if (b.x < middleX) {
				x = start - Math.abs(b.x - middleX)
			} else if (b.x > middleX) {
				x = start + Math.abs(b.x - middleX)
			} else {
				x = start
			}

			return {
				x,
				y: b.y,
				color: b.color
			}
		});

		return {
			...state,
			activePiece: {
				blocks: pieceMappedToBoard
			}
		} as GameState;
	},
	[Actions.MOVE_ACTIVE_PIECE_DOWN]: (state: GameState, action: Actions.MoveActivePieceDown) => {
		let maxYValue = _.max(state.activePiece.blocks.map(b => b.y));
		if(maxYValue+1 > 19)
			return state; 

		let currentPieceBlocks = state.activePiece.blocks.map((item: Block) => {
			return {
				...item,
				y: item.y+1
			}
		});

		return {
			...state,
			activePiece: {
				blocks: currentPieceBlocks
			}
		} as GameState;
	},
	[Actions.MOVE_ACTIVE_PIECE]: (state: GameState, action: Actions.MoveActivePiece) => {
		let changeValue = 0;
		let pieceMinX = _.min(state.activePiece.blocks.map(b => b.x));
		let pieceMaxX = _.max(state.activePiece.blocks.map(b => b.x));

		if (action.direction == 'left' && pieceMinX > 0)
			changeValue = -1;
		if (action.direction == 'right' && pieceMaxX < 9)
			changeValue = +1;

		let currentPieceBlocks = state.activePiece.blocks.map((item: Block) => {
			return {
				...item,
				x: item.x + changeValue
			}
		});

		return {
			...state,
			activePiece: {
				blocks: currentPieceBlocks
			}
		} as GameState;
	},

	[Actions.ROTATE_PIECE]: (state: GameState, action: Actions.RotatePiece) => {

		let current_minX = _.min(state.activePiece.blocks.map(b=>b.x));
		let current_maxX = _.max(state.activePiece.blocks.map(b=>b.x));
		let current_minY = _.min(state.activePiece.blocks.map(b=>b.y));
		let current_maxY = _.max(state.activePiece.blocks.map(b=>b.y));

		let xDiff = current_maxX - current_minX;
		let yDiff = current_maxY - current_minY;
		let middleX = ((xDiff % 2 == 1) ? Math.floor(xDiff / 2) : Math.ceil(xDiff / 2)) + current_minX;
		let middleY = ((yDiff % 2 == 1) ? Math.floor(yDiff / 2) : Math.ceil(yDiff / 2)) + current_minY;

		let oneRadianInDeg = 180 / Math.PI;
		let radianAmountFor90Deg = 90 / oneRadianInDeg;

		let blocks = state.activePiece.blocks.map(b => {
			let translatedX = b.x - middleX;
			let translatedY = b.y - middleY;

			return {
				color: b.color,
				x: Math.floor(((translatedX * Math.cos(radianAmountFor90Deg)) - (translatedY * Math.sin(radianAmountFor90Deg))) + middleX),
				y: Math.floor(((translatedX * Math.sin(radianAmountFor90Deg)) + (translatedY * Math.cos(radianAmountFor90Deg))) + middleY),
			}
		});

		// rotations seem to move the blocks a bit :( dont let them go out of bounds
		let newMinX = _.min(blocks.map(b => b.x));
		let newMaxX = _.max(blocks.map(b => b.x));

		let newMinY = _.min(blocks.map(b => b.y));
		let newMaxY = _.max(blocks.map(b => b.y));

		let adjustedBlocks = blocks.map(b => {
			if(newMinX < 0) {
				b.x += Math.abs(newMinX - 0);
			} else if (newMaxX > 9) {
				b.x -= Math.abs(newMaxX - 9);
			}

			if(newMinY < 0) {
				b.y += Math.abs(newMinY - 0);
			} else if (newMaxY > 19) {
				b.y -= Math.abs(newMaxY - 19);
			}

			return b;
		});

		return {
			...state,
			activePiece: {
				...state.activePiece,
				blocks: adjustedBlocks
			}
		}
	},

	[Actions.PIECE_HIT_GROUND]: (state: GameState, action: Actions.PieceHitGround) => {
		let blocks = [ ...(state.blocks || [] ), ...state.activePiece.blocks ];

		return {
			...state,
			blocks,
			activePiece: { blocks: [] as Block[] }
		}
	}
}

export default <A extends Action>(state: GameState, action: A) => {
	
	if(reducer.hasOwnProperty(action.type)) {
		return reducer[action.type](state, action);
	}

	return state || DefaultGameState;
}
