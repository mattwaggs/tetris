import { Piece, GameState } from 'models';
import { Action, ActionCreator} from 'typedActions';

export const SET_ACTIVE_PIECE = "SET_ACTIVE_PIECE";
export interface SetActivePiece extends Action { piece: Piece }
export const SetActivePiece = ActionCreator<SetActivePiece>(SET_ACTIVE_PIECE);

export const MOVE_ACTIVE_PIECE_DOWN = "MOVE_ACTIVE_PIECE_DOWN";
export interface MoveActivePieceDown extends Action { }
export const MoveActivePieceDown = ActionCreator<MoveActivePieceDown>(MOVE_ACTIVE_PIECE_DOWN);

export const MOVE_ACTIVE_PIECE = "MOVE_ACTIVE_PIECE";
export interface MoveActivePiece extends Action { direction: 'left' | 'right' }
export const MoveActivePiece = ActionCreator<MoveActivePiece>(MOVE_ACTIVE_PIECE);

export const ROTATE_PIECE = "ROTATE_PIECE";
export interface RotatePiece extends Action { }
export const RotatePiece = ActionCreator<RotatePiece>(ROTATE_PIECE);

export const PIECE_HIT_GROUND = "PIECE_HIT_GROUND";
export interface PieceHitGround extends Action {}
export const PieceHitGround = ActionCreator<RotatePiece>(PIECE_HIT_GROUND);