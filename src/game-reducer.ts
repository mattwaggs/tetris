import { Block, Piece, GameState, DefaultGameState, PieceDefinitions } from 'models';
import { Action, ActionCreator } from 'typedActions';
import * as Actions from 'actions';

const reducer: {[key: string]: <A extends Action>(state: GameState, action: A) => GameState} = {
	[Actions.SET_ACTIVE_PIECE]: (state: GameState, action: Actions.SetActivePiece) => {
		return {
			...state,
			activePiece: {
				blocks: action.piece.blocks
			}
		} as GameState;
	},
	[Actions.MOVE_ACTIVE_PIECE_DOWN]: (state: GameState, action: Actions.MoveActivePieceDown) => {
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
	}
}

export default <A extends Action>(state: GameState, action: A) => {
	
	if(reducer.hasOwnProperty(action.type)) {
		return reducer[action.type](state, action);
	}

	return state || DefaultGameState;
}