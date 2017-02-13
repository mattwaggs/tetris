import { expect } from 'chai';
import reducer from 'game-reducer';
import * as Actions from 'actions';
import { PieceDefinitions } from 'models';

describe("Action::SET_ACTIVE_PIECE", () => {
    it("should should set the active piece in state", () => {
        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))
        expect(state.activePiece.blocks).to.equal(piece.blocks)
    });
});

describe("Action::MOVE_ACTIVE_PIECE_DOWN", () => {
    it("should should set the active piece in state", () => {
        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))
        state = reducer(state, Actions.MoveActivePieceDown({}))
        expect(state.activePiece.blocks[0].y).to.equal(piece.blocks[0].y + 1)
        expect(state.activePiece.blocks[1].y).to.equal(piece.blocks[1].y + 1)
        expect(state.activePiece.blocks[2].y).to.equal(piece.blocks[2].y + 1)
    });
});