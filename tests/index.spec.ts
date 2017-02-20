import { expect } from 'chai';
import reducer from 'game-reducer';
import * as Actions from 'actions';
import { PieceDefinitions } from 'models';

import { colors } from './colors';

import * as _ from 'lodash';

describe("Action::SET_ACTIVE_PIECE", () => {
    it("should should set the active piece in state", () => {
        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))
        expect(state.activePiece.blocks[0].color).to.equal(piece.blocks[0].color)
    });

    it("should default piece to the middle", () => {
        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))
        expect(state.activePiece.blocks[0].x).to.equal(3) // there are 10 squares respectively
        expect(state.activePiece.blocks[1].x).to.equal(4)
        expect(state.activePiece.blocks[2].x).to.equal(5)
        expect(state.activePiece.blocks[3].x).to.equal(5)
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

    it("don't allow the piece to fall below the game board", () => {
        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))
        for (var i = 0; i < 20; i++) {
            state = reducer(state, Actions.MoveActivePieceDown({}))
        }

        expect(state.activePiece.blocks[0].y).to.equal(18)
        expect(state.activePiece.blocks[1].y).to.equal(18)
        expect(state.activePiece.blocks[2].y).to.equal(18)
        expect(state.activePiece.blocks[3].y).to.equal(19)
    });

});

describe("Action::MOVE_ACTIVE_PIECE", () => {
    
    it("should not change anything when not left or right", () => {
        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))

        let defaultPosition = { ...state.activePiece };
        state = reducer(state, Actions.MoveActivePiece({}))

        expect(JSON.stringify(state.activePiece.blocks)).to.equal(JSON.stringify(defaultPosition.blocks))
    });

    it("should increase all x values when direction is left", () => {
        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))

        let defaultPosition = { ...state.activePiece };
        state = reducer(state, Actions.MoveActivePiece({direction: 'left'}))

        expect(state.activePiece.blocks[0].x).to.equal(defaultPosition.blocks[0].x - 1)
        expect(state.activePiece.blocks[1].x).to.equal(defaultPosition.blocks[1].x - 1)
        expect(state.activePiece.blocks[2].x).to.equal(defaultPosition.blocks[2].x - 1)
    });

    it("should increase all x values when direction is right", () => {
        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))

        let defaultPosition = { ...state.activePiece };
        state = reducer(state, Actions.MoveActivePiece({direction: 'right'}))

        expect(state.activePiece.blocks[0].x).to.equal(defaultPosition.blocks[0].x + 1)
        expect(state.activePiece.blocks[1].x).to.equal(defaultPosition.blocks[1].x + 1)
        expect(state.activePiece.blocks[2].x).to.equal(defaultPosition.blocks[2].x + 1)
    });

    it("should not move left if the against left edge", () => {
        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))
        // the piece will start in the middle so make sure it moves to the left before the test
        state = reducer(state, Actions.MoveActivePiece({direction: 'left'}))
        state = reducer(state, Actions.MoveActivePiece({direction: 'left'}))
        state = reducer(state, Actions.MoveActivePiece({direction: 'left'}))
        state = reducer(state, Actions.MoveActivePiece({direction: 'left'}))

        let defaultPosition = { ...state.activePiece };
        state = reducer(state, Actions.MoveActivePiece({direction: 'left'}))

        expect(state.activePiece.blocks[0].x).to.equal(defaultPosition.blocks[0].x)
        expect(state.activePiece.blocks[1].x).to.equal(defaultPosition.blocks[1].x)
        expect(state.activePiece.blocks[2].x).to.equal(defaultPosition.blocks[2].x)
    });

    it("should not move right if the against right edge", () => {
        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))
        // the piece will start in the middle so make sure it moves to the right before the test
        state = reducer(state, Actions.MoveActivePiece({direction: 'right'}))
        state = reducer(state, Actions.MoveActivePiece({direction: 'right'}))
        state = reducer(state, Actions.MoveActivePiece({direction: 'right'}))
        state = reducer(state, Actions.MoveActivePiece({direction: 'right'}))

        let defaultPosition = { ...state.activePiece };
        state = reducer(state, Actions.MoveActivePiece({direction: 'right'}))

        expect(state.activePiece.blocks[0].x).to.equal(defaultPosition.blocks[0].x)
        expect(state.activePiece.blocks[1].x).to.equal(defaultPosition.blocks[1].x)
        expect(state.activePiece.blocks[2].x).to.equal(defaultPosition.blocks[2].x)
    });
});

describe("Action::ROTATE_PIECE", () => {
    
    it("should rotate the active piece by 90 degrees", () => {
        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))

        // move the piece down 2 blocks to ensure clearance. not testing boundaries yet.
        state = reducer(state, Actions.MoveActivePieceDown({}));
        state = reducer(state, Actions.MoveActivePieceDown({}));

        state = reducer(state, Actions.RotatePiece({}));
        /*
         * Default position should be:
         * [0][1][2]  // [3,2][4,4][5,2]
         * ......[3]  //           [5,3]
         * 
         * 
         * Expect rotated position to be:
         * ...[0]...  //      [5,2]
         * ...[1]...  //      [5,3]
         * [3][2]...  // [4,4][5,4]
         */
        expect(state.activePiece.blocks[0].x).to.equal(5)
        expect(state.activePiece.blocks[0].y).to.equal(2)
        expect(state.activePiece.blocks[1].x).to.equal(5)
        expect(state.activePiece.blocks[1].y).to.equal(3)
        expect(state.activePiece.blocks[2].x).to.equal(5)
        expect(state.activePiece.blocks[2].y).to.equal(4)
        expect(state.activePiece.blocks[3].x).to.equal(4)
        expect(state.activePiece.blocks[3].y).to.equal(4)
    });

    it("should not be rotated up and out of bounds", () => {
        let piece = PieceDefinitions.I
        var state = reducer(null, Actions.SetActivePiece({piece}))

        state = reducer(state, Actions.RotatePiece({}));
        state.activePiece.blocks.forEach(b => {
            expect(b.y).to.be.gte(0);
        });
    });

    it("should not be rotated down and out of bounds", () => {
        let piece = PieceDefinitions.I
        var state = reducer(null, Actions.SetActivePiece({piece}))

        for (var i = 0; i < 20; i++) { // move the piece all the way down
            state = reducer(state, Actions.MoveActivePieceDown({}))
        }

        state = reducer(state, Actions.RotatePiece({}));
        state.activePiece.blocks.forEach(b => {
            expect(b.y).to.be.lte(19);
        });
    });

    it("should not be rotated left out of bounds", () => {
        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))

        for (var i = 0; i < 5; i++) { // move the piece all the way to the side
            state = reducer(state, Actions.MoveActivePiece({direction: 'left'}))
        }

        state = reducer(state, Actions.RotatePiece({}));
        state.activePiece.blocks.forEach(b => {
            expect(b.x).to.be.gte(0);
        });
    });

    it("should not be rotated right out of bounds", () => {
        let piece = PieceDefinitions.I
        var state = reducer(null, Actions.SetActivePiece({piece}))

        for (var i = 0; i < 5; i++) { // move the piece all the way to the side
            state = reducer(state, Actions.MoveActivePiece({direction: 'right'}))
        }

        state = reducer(state, Actions.RotatePiece({}));
        state.activePiece.blocks.forEach(b => {
            expect(b.x).to.be.lte(9);
        });
    });

    it("should not rotate O shape", () => {
        let piece = PieceDefinitions.O
        var state = reducer(null, Actions.SetActivePiece({piece}))

        let defaultBlockPosition = { ...state.activePiece }

        state = reducer(state, Actions.RotatePiece({}));

        expect(defaultBlockPosition.blocks).to.equal(state.activePiece.blocks);
    });

    it("should not mutate shape dimensions when preventing out-of-bounds", () => {
        // turns out this issue was caused by Math.floor(0.999999999...) = 0
        // added +.1 before the floor to fix this...

        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))

        for (var i = 0; i < 4; i++) { // move the piece all the way to the side
            state = reducer(state, Actions.MoveActivePieceDown({}));
            state = reducer(state, Actions.MoveActivePiece({direction: 'left'}))
        }

        // get the piece against the wall in a way that "should have" caused it to go out of bounds on rotation
        state = reducer(state, Actions.RotatePiece({}));
        state = reducer(state, Actions.MoveActivePiece({direction: 'left'}))
        state = reducer(state, Actions.RotatePiece({}));

        /*
         * Default position should be:
         * ...[0]...  //      [1,4]
         * ...[1]...  //      [1,5]
         * [3][2]...  // [0,6][1,6]
         * 
         * Rotated position should be:
         * .........  //      
         * [3]......  // [0,5]
         * [2][1][0]  // [0,6][1,6][2,6]
         */
        expect(state.activePiece.blocks[0].x).to.equal(2)
        expect(state.activePiece.blocks[0].y).to.equal(6)
        expect(state.activePiece.blocks[1].x).to.equal(1)
        expect(state.activePiece.blocks[1].y).to.equal(6)
        expect(state.activePiece.blocks[2].x).to.equal(0)
        expect(state.activePiece.blocks[2].y).to.equal(6)
        expect(state.activePiece.blocks[3].x).to.equal(0)
        expect(state.activePiece.blocks[3].y).to.equal(5)
    });

    it("should not drift left or right when rotating full 360", () => {
        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))
        
        let originalXValues = [...state.activePiece.blocks.map(b => b.x)];

        for (var i = 0; i < 4; i++) { // move the piece all the way to the side
            state = reducer(state, Actions.MoveActivePieceDown({}));
            state = reducer(state, Actions.RotatePiece({}));
        }

        for (var i = 0; i < state.activePiece.blocks.length; i++) {
            expect(state.activePiece.blocks[i].x).to.equal(originalXValues[i]);
        }
    });

});

describe("Action:PIECE_HIT_GROUND", () => {

    it("should copy blocks from activePiece to blocks", () => {
        let piece = PieceDefinitions.J
        var state = reducer(null, Actions.SetActivePiece({piece}))

        for (var i = 0; i < 20; i++) { // move the piece all the way down
            state = reducer(state, Actions.MoveActivePieceDown({}))
        }
        let currentBlocksPosition = { ...state.activePiece }
        state = reducer(state, Actions.PieceHitGround({}))

        expect(JSON.stringify(state.blocks)).to.equal(JSON.stringify(currentBlocksPosition.blocks));
        expect(state.activePiece.blocks).to.be.empty;
    });

});

describe("collision checking", () => {

    describe("Action:ROTATE_PIECE", () => {

        it("rotating a piece should not happen if it would cause a collision", () => {
            // set up the piece we will collide with
            let otherPiece = PieceDefinitions.I
            let state = reducer(null, {type: 'INIT'})
            state = reducer(null, Actions.SetActivePiece({ piece: otherPiece }))
            state = reducer(state, Actions.RotatePiece({}))
            state = reducer(state, Actions.MoveActivePiece({direction: 'right'}))
            state = reducer(state, Actions.PieceHitGround({}))
            
            // test piece
            let piece = PieceDefinitions.I
            state = reducer(state, Actions.SetActivePiece({ piece }))
            state = reducer(state, Actions.RotatePiece({}));

            // this is the important action. the state should remain unchanged.
            let beforeCollisionState = { ...state }
            state = reducer(state, Actions.RotatePiece({}));

            expect(JSON.stringify(state)).to.equal(JSON.stringify(beforeCollisionState));

        });
    });

    describe("Action:MOVE_ACTIVE_PIECE_DOWN", () => {

        it("should remove activePiece blocks and add to blocks state.", () => {
            // set up the piece we will collide with
            let otherPiece = PieceDefinitions.I
            let state = reducer(null, {type: 'INIT'})
            state = reducer(null, Actions.SetActivePiece({ piece: otherPiece }))
            state = reducer(state, Actions.RotatePiece({}))

            for (var i = 0; i < 16; i++) { // move the piece all the way down
                state = reducer(state, Actions.MoveActivePieceDown({}))
            }
            state = reducer(state, Actions.PieceHitGround({}))


            // test piece
            let piece = PieceDefinitions.I
            state = reducer(state, Actions.SetActivePiece({ piece }))
            for (var i = 0; i < 16; i++) { // move the piece all the way down
                state = reducer(state, Actions.MoveActivePieceDown({}))
            }

            expect(state.activePiece.blocks).to.be.empty;
            
            // map to a string[] because this seems easier to test
            let results = state.blocks.slice(4).map(b => `${b.x}-${b.y}`); 
            expect(results[0]).to.equal('3-15');
            expect(results[1]).to.equal('4-15');
            expect(results[2]).to.equal('5-15');
            expect(results[3]).to.equal('6-15');

        });
    });

    describe("Action:MOVE_ACTIVE_PIECE", () => {

        it("moving a piece should not happen if it would cause a collision", () => {
            // set up the piece we will collide with
            let otherPiece = PieceDefinitions.I
            let state = reducer(null, {type: 'INIT'})
            state = reducer(null, Actions.SetActivePiece({ piece: otherPiece }))
            state = reducer(state, Actions.RotatePiece({}))
            state = reducer(state, Actions.MoveActivePieceDown({}))
            state = reducer(state, Actions.MoveActivePiece({direction: 'right'}))
            state = reducer(state, Actions.PieceHitGround({}))
            
            // test piece
            let piece = PieceDefinitions.I
            state = reducer(state, Actions.SetActivePiece({ piece }))
            state = reducer(state, Actions.RotatePiece({}));
            state = reducer(state, Actions.MoveActivePieceDown({}))

            let expectedState = { ...state }
            state = reducer(state, Actions.MoveActivePiece({direction: 'right'}))

            expect(JSON.stringify(state)).to.equal(JSON.stringify(expectedState));
        });
    });
});

describe("clearing rows", () => {
    describe("Action:PIECE_HIT_GROUND", () => {
        let state = reducer(null, { type: 'INIT' })

        function repeat(cb: () => void, times: number) {
            for (var i = 0; i < times; i++) {
                cb()
            }
        }

        before(() => {
            repeat(() => {
                let piece = PieceDefinitions.I
                state = reducer(state, Actions.SetActivePiece({ piece }))
                state = reducer(state, Actions.RotatePiece({}));

                repeat(() => {
                    state = reducer(state, Actions.MoveActivePiece({direction: 'right'}))
                }, 10);

                repeat(() => {
                    state = reducer(state, Actions.MoveActivePieceDown({}))
                }, 20);

                repeat(() => {
                    state = reducer(state, Actions.MoveActivePiece({direction: 'left'}))
                }, 10);

                state = reducer(state, Actions.PieceHitGround({}))

            }, 8);

            let piece = PieceDefinitions.S
            state = reducer(state, Actions.SetActivePiece({ piece }))
            state = reducer(state, Actions.RotatePiece({}));

            repeat(() => {
                state = reducer(state, Actions.MoveActivePiece({direction: 'right'}))
            }, 6);

            repeat(() => {
                state = reducer(state, Actions.MoveActivePieceDown({}))
            }, 20);

            state = reducer(state, Actions.PieceHitGround({}))
        });

        it("should delete a full row", () => {

            let expectedColoredCells: {[key:string]: {color: string, x:number}[]} = {
                "16": [ ] as {color: string, x:number}[], // row should be empty due to collapsed rows below.
                "17": [ ...[0,1,2,3,4,5,6,7].map(x => { return {color: 'cyan', x}} ) ],
                "18": [ ...[0,1,2,3,4,5,6,7].map(x => { return {color: 'cyan', x}} ), {color: 'lime', x: 8} ],
                "19": [ ...[0,1,2,3,4,5,6,7].map(x => { return {color: 'cyan', x}} ), {color: 'lime', x: 9} ]
            }

            let actual = {} as {[key:string]: {color: string, x:number}[]}
            [16,17,18,19].forEach(y => {
                actual[y.toString()] = state.blocks.filter(b => b.y == y).map(b => { return { color: b.color, x: b.x } })
            });

            // console.log('actual: ');
            // printSectionOfGame(actual);
            // console.log('expected: ');
            // printSectionOfGame(expectedColoredCells);

            expect(JSON.stringify(actual)).to.equal(JSON.stringify(expectedColoredCells));
        });

        it("should delete multiple full rows at the same time", () => {
            let piece = PieceDefinitions.T
            state = reducer(state, Actions.SetActivePiece({ piece }))
            state = reducer(state, Actions.RotatePiece({}));

            repeat(() => {
                state = reducer(state, Actions.MoveActivePiece({direction: 'right'}))
            }, 6);

            repeat(() => {
                state = reducer(state, Actions.MoveActivePieceDown({}))
            }, 20);

            let expectedColoredCells: {[key:string]: {color: string, x:number}[]} = {
                "16": [ ],
                "17": [ ],
                "18": [ { color: 'purple', x: 9 } ],
                "19": [ ...[0,1,2,3,4,5,6,7].map(x => { return {color: 'cyan', x}} ), {color: 'lime', x: 9} ]
            }

            let actual = {} as {[key:string]: {color: string, x:number}[]}

            [16,17,18,19].forEach(y => {
                actual[y.toString()] = state.blocks.filter(b => b.y == y).map(b => { return { color: b.color, x: b.x } })
            });

            expect(JSON.stringify(actual)).to.equal(JSON.stringify(expectedColoredCells));
        });
    });
});

function printSectionOfGame(coloredCells: {[key:string]: {color: string, x:number}[]}) {
    for (var rowIndex in coloredCells) {
        var row = coloredCells[rowIndex];

        var rowToPrint = '';
        let columns = row.map(r => r.x);
        for (var i = 0; i < 10; i++) {
            if (columns.indexOf(i) > -1) {
                rowToPrint += colors.createStringWithColors('[x]', row[columns.indexOf(i)].color);
            }
            else {
                rowToPrint += '[ ]';
            }
        }

        console.log(rowToPrint);
    }
}