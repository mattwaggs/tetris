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
		if (state.activePiece.blocks[0].color == "yellow") return state; // skip rotation on squares

		let current_minX = _.min(state.activePiece.blocks.map(b=>b.x));
		let current_maxX = _.max(state.activePiece.blocks.map(b=>b.x));
		let current_minY = _.min(state.activePiece.blocks.map(b=>b.y));
		let current_maxY = _.max(state.activePiece.blocks.map(b=>b.y));

		let xDiff = current_maxX - current_minX;
		let yDiff = current_maxY - current_minY;

		let valuesForMedianCalc = [...state.activePiece.blocks.map(b => b.x)].sort((a,b) => a - b);
		let lowMiddleForMedianCalc = Math.floor((valuesForMedianCalc.length - 1) / 2)
		let highMiddleForMedianCalc = Math.ceil((valuesForMedianCalc.length - 1) / 2)

		let median = valuesForMedianCalc[lowMiddleForMedianCalc] + valuesForMedianCalc[highMiddleForMedianCalc] / 2;
		let leftHeavy = state.activePiece.blocks.filter(b => b.x < median).length;
		let rightHeavy = state.activePiece.blocks.filter(b => b.x > median).length;
		
		// there were issues regarding the piece being 2 blocks wide and then 3 blocks wide and then back to 2.
		// the problem is that when using a math based solution to rotate the pieces this causes eventual drift.
		// the drift ends up being left or right depending on the use of math.floor or math.ceil. MY solution was
		// to find the median x value and use that to determine whether the peice should move left or right based
		// on the number of pieces to the left or right of the median... i.e. left heavy vs right heavy
		//let middleX = ((leftHeavy >= rightHeavy) ? Math.floor(xDiff / 2) : Math.ceil(xDiff / 2)) + current_minX;
		let middleX = ((xDiff %2 == 1 ) ? Math.floor(xDiff / 2) : Math.ceil(xDiff / 2)) + current_minX;
		let middleY = Math.ceil(yDiff/2) + current_minY;

		let oneRadianInDeg = 180 / Math.PI;
		let radianAmountFor90Deg = 90 / oneRadianInDeg;

		let blocks = state.activePiece.blocks.map(b => {
			let translatedX = b.x - middleX;
			let translatedY = b.y - middleY;

			return {
				color: b.color,
				x: Math.floor(((translatedX * Math.cos(radianAmountFor90Deg)) - (translatedY * Math.sin(radianAmountFor90Deg))) + middleX +.1),
				y: Math.floor(((translatedX * Math.sin(radianAmountFor90Deg)) + (translatedY * Math.cos(radianAmountFor90Deg))) + middleY +.1),
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
