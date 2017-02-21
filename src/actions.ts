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
export const PieceHitGround = ActionCreator<PieceHitGround>(PIECE_HIT_GROUND);

export const GAME_PLAY = "GAME_PLAY";
export interface GamePlay extends Action {}
export const GamePlay = ActionCreator<GamePlay>(GAME_PLAY);

export const GAME_PAUSED = "GAME_PAUSED";
export interface GamePaused extends Action {}
export const GamePaused = ActionCreator<GamePaused>(GAME_PAUSED);

export const GAME_OVER = "GAME_OVER";
export interface GameOver extends Action {}
export const GameOver = ActionCreator<GameOver>(GAME_OVER);

export const GAME_RESET = "GAME_RESET"
export interface GameReset extends Action {}
export const GameReset = ActionCreator<GameReset>(GAME_RESET);

export const SWAP_PIECE = "SWAP_PIECE"
export interface SwapPiece extends Action {}
export const SwapPiece = ActionCreator<SwapPiece>(SWAP_PIECE);

export const INCREMENT_TURN = "INCREMENT_TURN"
export interface IncrementTurn extends Action {}
export const IncrementTurn = ActionCreator<IncrementTurn>(INCREMENT_TURN);

export const ADD_PIECE_TO_WAITING = "ADD_PIECE_TO_WAITING"
export interface AddPieceToWaiting extends Action { piece: Piece }
export const AddPieceToWaiting = ActionCreator<AddPieceToWaiting>(ADD_PIECE_TO_WAITING);

export const REMOVE_PIECE_FROM_WAITING = "REMOVE_PIECE_FROM_WAITING"
export interface RemovePieceFromWaiting extends Action {}
export const RemovePieceFromWaiting = ActionCreator<RemovePieceFromWaiting>(REMOVE_PIECE_FROM_WAITING);
