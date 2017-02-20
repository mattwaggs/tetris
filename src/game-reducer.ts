import { Block, Piece, GameState, DefaultGameState, PieceDefinitions } from 'models';
import { Action, ActionCreator } from 'typedActions';
import * as Actions from 'actions';

import * as _ from 'lodash';

const reducer: { [key: string]: <A extends Action>(state: GameState, action: A) => GameState } = {};

reducer[Actions.SET_ACTIVE_PIECE] = (state: GameState, action: Actions.SetActivePiece) => {
	let minX = _.min(action.piece.blocks.map(b => b.x));
	let maxX = _.max(action.piece.blocks.map(b => b.x));

	let gameboardSize = 10;

	let middleX = Math.floor(((maxX - minX) || 1) / 2);
	let start = (gameboardSize / 2) - 1;

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
};

reducer[Actions.MOVE_ACTIVE_PIECE_DOWN] = (state: GameState, action: Actions.MoveActivePieceDown) => {
	let maxYValue = _.max(state.activePiece.blocks.map(b => b.y));
	if (maxYValue + 1 > 19)
		return state;

	let currentPieceBlocks = state.activePiece.blocks.map((item: Block) => {
		return {
			...item,
			y: item.y + 1
		}
	});

	// check for collisions
	let existingBlocks = (state.blocks || []).map(b => { return `${b.x}-${b.y}` });
	let nextActivePiece = currentPieceBlocks.map(b => { return `${b.x}-${b.y}` });

	if (_.intersection(existingBlocks, nextActivePiece).length > 0) {
		return reducer[Actions.PIECE_HIT_GROUND](state, action);
	}

	return {
		...state,
		activePiece: {
			blocks: currentPieceBlocks
		}
	} as GameState;
};

reducer[Actions.MOVE_ACTIVE_PIECE] = (state: GameState, action: Actions.MoveActivePiece) => {
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

	// check for collisions
	let existingBlocks = (state.blocks || []).map(b => { return `${b.x}-${b.y}` });
	let nextActivePiece = currentPieceBlocks.map(b => { return `${b.x}-${b.y}` });

	if (_.intersection(existingBlocks, nextActivePiece).length > 0) {
		return state;
	}

	return {
		...state,
		activePiece: {
			blocks: currentPieceBlocks
		}
	} as GameState;
},

reducer[Actions.ROTATE_PIECE] = (state: GameState, action: Actions.RotatePiece) => {
	if (state.activePiece.blocks[0].color == "yellow") return state; // skip rotation on squares

	let current_minX = _.min(state.activePiece.blocks.map(b => b.x));
	let current_maxX = _.max(state.activePiece.blocks.map(b => b.x));
	let current_minY = _.min(state.activePiece.blocks.map(b => b.y));
	let current_maxY = _.max(state.activePiece.blocks.map(b => b.y));

	let xDiff = current_maxX - current_minX;
	let yDiff = current_maxY - current_minY;

	let middleX = ((xDiff % 2 == 1) ? Math.floor(xDiff / 2) : Math.ceil(xDiff / 2)) + current_minX;
	let middleY = Math.ceil(yDiff / 2) + current_minY;

	let oneRadianInDeg = 180 / Math.PI;
	let radianAmountFor90Deg = 90 / oneRadianInDeg;

	let blocks = state.activePiece.blocks.map(b => {
		let translatedX = b.x - middleX;
		let translatedY = b.y - middleY;

		return {
			color: b.color,
			x: Math.floor(((translatedX * Math.cos(radianAmountFor90Deg)) - (translatedY * Math.sin(radianAmountFor90Deg))) + middleX + .1),
			y: Math.floor(((translatedX * Math.sin(radianAmountFor90Deg)) + (translatedY * Math.cos(radianAmountFor90Deg))) + middleY + .1),
		}
	});

	// don't let the blocks go out of bounds
	let newMinX = _.min(blocks.map(b => b.x));
	let newMaxX = _.max(blocks.map(b => b.x));

	let newMinY = _.min(blocks.map(b => b.y));
	let newMaxY = _.max(blocks.map(b => b.y));

	let adjustedBlocks = blocks.map(b => {
		if (newMinX < 0) {
			b.x += Math.abs(newMinX - 0);
		} else if (newMaxX > 9) {
			b.x -= Math.abs(newMaxX - 9);
		}

		if (newMinY < 0) {
			b.y += Math.abs(newMinY - 0);
		} else if (newMaxY > 19) {
			b.y -= Math.abs(newMaxY - 19);
		}

		return b;
	});

	// check for collisions
	let existingBlocks = (state.blocks || []).map(b => { return `${b.x}-${b.y}` });
	let nextActivePiece = adjustedBlocks.map(b => { return `${b.x}-${b.y}` });

	if (_.intersection(existingBlocks, nextActivePiece).length > 0) {
		return state;
	}

	return {
		...state,
		activePiece: {
			...state.activePiece,
			blocks: adjustedBlocks
		}
	}
};

reducer[Actions.PIECE_HIT_GROUND] = (state: GameState, action: Actions.PieceHitGround) => {
	let blocks = [ ...(state.blocks || []), ...state.activePiece.blocks ];

	let uniqueYValues = _.uniq(blocks.map(b=>b.y));
	let fullRows = [] as number[];

	uniqueYValues.forEach(yVal => {
		let xValues = blocks.filter(b => b.y == yVal).map(b => b.x).sort();
		if (_.isEqual(xValues, [0,1,2,3,4,5,6,7,8,9])) {
			fullRows.push(yVal);
		}
	});

	if (fullRows.length > 0) {
		fullRows.sort((a,b) => a - b)
		.forEach(yVal => {
			blocks = blocks.filter(b => b.y != yVal)
						   .map(b => {
							   if (b.y < yVal) b.y += 1;
							   return b;
						   });
		});
	}

	return {
		...state,
		blocks: blocks.filter(b => b != null),
		activePiece: { blocks: [] as Block[] }
	}
};

export default <A extends Action>(state: GameState, action: A) => {
	
	if(reducer.hasOwnProperty(action.type)) {
		return reducer[action.type](state, action);
	}

	return state || DefaultGameState;
}
