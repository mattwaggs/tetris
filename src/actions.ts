import { Piece, GameState } from 'models';
import { Action, ActionCreator} from 'typedActions';

export const SET_ACTIVE_PIECE = "SET_ACTIVE_PIECE";
export interface SetActivePiece extends Action { piece: Piece }
export const SetActivePiece = ActionCreator<SetActivePiece>(SET_ACTIVE_PIECE);

export const MOVE_ACTIVE_PIECE_DOWN = "MOVE_ACTIVE_PIECE_DOWN";
export interface MoveActivePieceDown extends Action { }
export const MoveActivePieceDown = ActionCreator<MoveActivePieceDown>(MOVE_ACTIVE_PIECE_DOWN);