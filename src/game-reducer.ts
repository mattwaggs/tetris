import { Block, Piece, GameState, DefaultGameState, PieceDefinitions, GameStatus } from 'models';
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
	if (state.game.status !== GameStatus.PLAYING) return state;

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
	if (state.game.status !== GameStatus.PLAYING) return state;

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
	if (state.game.status !== GameStatus.PLAYING) return state;

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

	let nextScore = (state.blocks.length == 0 || state.activePiece.blocks.length == 0) ? 0 :
		(( state.game.gravitySpeed * 10 ) + ( state.game.gravitySpeed * 100 * fullRows.length))

	return {
		...state,
		blocks: blocks.filter(b => b != null),
		activePiece: { blocks: [] as Block[] },
		score: state.score + nextScore
	}
};


reducer[Actions.GAME_PLAY] = (state: GameState, action: Actions.GamePlay) => {

	if (state.game.status == GameStatus.GAME_OVER) return state;

	return {
		...state,
		game: {
			...state.game,
			status: GameStatus.PLAYING
		}
	}
};

reducer[Actions.GAME_PAUSED] = (state: GameState, action: Actions.GamePaused) => {

	if (state.game.status == GameStatus.GAME_OVER) return state;

	return {
		...state,
		game: {
			...state.game,
			status: GameStatus.PAUSED
		}
	}
};

reducer[Actions.GAME_OVER] = (state: GameState, action: Actions.GameOver) => {
	return {
		...state,
		game: {
			...state.game,
			status: GameStatus.GAME_OVER
		}
	}
};

reducer[Actions.GAME_RESET] = (state: GameState, action: Actions.GameReset) => {
	return { ...DefaultGameState }
};

reducer[Actions.INCREMENT_TURN] = (state: GameState, action: Actions.IncrementTurn) => {
	return {
		...state,
		game: {
			...state.game,
			turn: state.game.turn +1
		}
	}
};

reducer[Actions.SWAP_PIECE] = (state: GameState, action: Actions.SwapPiece) => {
	if (state.game.turn === state.holding.turn) return state; // swapping is only allowed once per turn

	let pieceDefinitionMap = {
		[PieceDefinitions.I.blocks[0].color]: PieceDefinitions.I,
		[PieceDefinitions.L.blocks[0].color]: PieceDefinitions.L,
		[PieceDefinitions.J.blocks[0].color]: PieceDefinitions.J,
		[PieceDefinitions.O.blocks[0].color]: PieceDefinitions.O,
		[PieceDefinitions.S.blocks[0].color]: PieceDefinitions.S,
		[PieceDefinitions.T.blocks[0].color]: PieceDefinitions.T,
		[PieceDefinitions.Z.blocks[0].color]: PieceDefinitions.Z
	};

	let blockToHold = pieceDefinitionMap[state.activePiece.blocks[0].color];
	let actionToSetActivePiece = { type: Actions.SWAP_PIECE, piece: { blocks: [ ...state.holding.blocks ] } };
	let activePiece = reducer[Actions.SET_ACTIVE_PIECE](state, actionToSetActivePiece).activePiece;

	return {
		...state,
		activePiece: { ...activePiece },
		holding: {
			...state.holding,
			blocks: [ ...blockToHold.blocks ],
			turn: state.game.turn
		}
	}
};

reducer[Actions.ADD_PIECE_TO_WAITING] = (state: GameState, action: Actions.AddPieceToWaiting) => {

	let pieceToAdd = { ...action.piece };
	let nextPieces = [ ...state.nextPieces ];
	nextPieces.push(pieceToAdd);

	return {
		...state,
		nextPieces: nextPieces.slice(0, 3)
	}
};

reducer[Actions.REMOVE_PIECE_FROM_WAITING] = (state: GameState, action: Actions.RemovePieceFromWaiting) => {

	return {
		...state,
		nextPieces: state.nextPieces.slice(1, 3)
	}
};

export default <A extends Action>(state: GameState, action: A) => {
	
	if(reducer.hasOwnProperty(action.type)) {
		return reducer[action.type](state, action);
	}

	return state || DefaultGameState;
}
