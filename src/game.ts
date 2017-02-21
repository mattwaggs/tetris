import { Store } from 'redux';
import { Block, PieceDefinitions, GameState, GetRandomPiece, GameStatus } from 'models';
import reducer from 'game-reducer';
import * as _ from 'lodash';

import * as Actions from 'actions';

export default class game {

	private canvas: HTMLCanvasElement
	private ctx: CanvasRenderingContext2D

	private blockSize: number = 30
	private keyPressable = true;
	private gravityInterval: any;

	constructor(private store: Store<any>) {

		(window as any).store = store;

		window.addEventListener('keydown', (e: KeyboardEvent) => {
			let left = 37;
			let right = 39;
			let up = 38;
			let down = 40;
			let space = 32;
			let p = 80;

			let state = this.store.getState() as GameState;

			if (state.game.status == GameStatus.NOT_STARTED) {
				this.store.dispatch(Actions.GamePlay({}));
				this.startGame();
				return true;
			}

			switch(e.keyCode) {
				case left:
					this.store.dispatch(Actions.MoveActivePiece({direction: 'left'}))
					break;
				case right: 
					this.store.dispatch(Actions.MoveActivePiece({direction: 'right'}))
					break;
				case down: 
					this.store.dispatch(Actions.MoveActivePieceDown({}));
					break;
				case up:
					if(!this.keyPressable) return false;
					this.store.dispatch(Actions.RotatePiece({}));
					setTimeout(() => {this.keyPressable = true}, 20);
					break;
				case space: 
					this.store.dispatch(Actions.SwapPiece({}));
					break;
				case p:
					if (state.game.status == GameStatus.PAUSED) {
						this.store.dispatch(Actions.GamePlay({}));
						this.startGame();
					} else {
						this.store.dispatch(Actions.GamePaused({}));
						this.stopGame();
					}
					break;
				default: 
					break;
			}
		});
	}

	public render(canvas: HTMLCanvasElement) {
		this.setupCanvas(canvas);
		this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

		this.drawBackground()
		this.drawGameBoard()
		this.drawHoldingArea()
		this.drawNextPieces()
		
		let state = this.store.getState() as GameState;

		let previewBlocks = this.getPreviewOfActivePiece(state);

		// draw active piece placement preview
		previewBlocks.forEach((value, index) => {
			this.drawBlock({ ...value, color: 'rgba(225,225,225,0.4)' });
		});

		// draw all blocks
		state.blocks.forEach((value, index) => {
			this.drawBlock(value);
		});

		// draw active piece
		state.activePiece.blocks.forEach((value, index) => {
			this.drawBlock(value);
		});

		this.renderStatusText(state.game.status);
		this.drawScore();
	}

	private startGame() {
		this.gravityInterval = setInterval(() => {
			let state = this.store.getState() as GameState;

			if (state.nextPieces.length == 0) {
				this.store.dispatch(Actions.AddPieceToWaiting({ piece: GetRandomPiece() }));
				this.store.dispatch(Actions.AddPieceToWaiting({ piece: GetRandomPiece() }));
				this.store.dispatch(Actions.AddPieceToWaiting({ piece: GetRandomPiece() }));
			}

			/*
			 * checks to see if block reached end of gameboard.
			 * also undefined < any number evaluates to false, hence
			 * no active piece causes a new piece to dispatch.
			 */
			if (_.max(state.activePiece.blocks.map(b => b.y)) < 19) {
				this.store.dispatch(Actions.MoveActivePieceDown({}));
			} else {
				this.store.dispatch(Actions.PieceHitGround({}));
				this.store.dispatch(Actions.IncrementTurn({}));
				if (_.min(state.blocks.map(b => b.y)) <= 0) {
					this.store.dispatch(Actions.GameOver({}));
					clearInterval(this.gravityInterval);
				} else {
					this.store.dispatch(Actions.SetActivePiece({piece: state.nextPieces[0]}));
					this.store.dispatch(Actions.RemovePieceFromWaiting({}));
					this.store.dispatch(Actions.AddPieceToWaiting({ piece: GetRandomPiece() }));
				}
			}
		}, 500);
	}

	private stopGame() {
		clearInterval(this.gravityInterval);
	}

	private setupCanvas(canvas: HTMLCanvasElement) {
		if (this.canvas !== canvas) {
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
			this.canvas = canvas;
			this.ctx = canvas.getContext('2d');
		}
	}

	private drawBackground() {
		var gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
		gradient.addColorStop(0, "#103f8a");
		gradient.addColorStop(0.3, "#1f4d96");
		gradient.addColorStop(0.5, "#295192");
		gradient.addColorStop(0.7, "#1f4d96");
		gradient.addColorStop(1, "#103f8a");

		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	private drawGameBoard() {
		var gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
		gradient.addColorStop(0, "#5a8fe2");
		gradient.addColorStop(0.15, "#2d63b9");
		gradient.addColorStop(0.5, "#285caf");
		gradient.addColorStop(0.85, "#2d63b9");
		gradient.addColorStop(1, "#5a8fe2");

		this.ctx.fillStyle = gradient;
		
		let x = 3 * this.blockSize;
		let y = 3 * this.blockSize;
		let w = 10 * this.blockSize;
		let h = 20 * this.blockSize;
		this.ctx.fillRect(x, y, w, h);
	}

	private drawHoldingArea() {
		let x = 0.5 * this.blockSize;
		let y = 5 * this.blockSize;
		let w = 2 * this.blockSize;
		let h = 2 * this.blockSize;

		var gradient = this.ctx.createLinearGradient(x, 0, w+x, 0);
		gradient.addColorStop(0.15, "#2d63b9");
		gradient.addColorStop(0.5, "#285caf");
		gradient.addColorStop(0.85, "#2d63b9");
		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(x, y, w, h);

		this.ctx.fillStyle = "#eee"
		this.ctx.font = "14px Lato"
		this.ctx.textAlign = "center"
		this.ctx.fillText("Holding", x + (w/2), y - 8 )

		let smallerBlockSize = 12;
		let lineWidth = 1;

		let state = this.store.getState() as GameState;

		let numberOfX = _.uniq(state.holding.blocks.map(b => b.x)).length;
		let numberOfY = _.uniq(state.holding.blocks.map(b => b.y)).length;

		let offsetXVal = numberOfX == 2 ? 1.5 : (numberOfX == 3 ? 1 : 0.5);
		let offsetYVal = numberOfY == 2 ? 1.5 : 2;

		state.holding.blocks.forEach(block => {

			this.ctx.fillStyle = block.color;
			this.ctx.strokeStyle = "#fff";
			this.ctx.lineWidth = lineWidth;

			let blockX = x + ((offsetXVal + block.x) * smallerBlockSize);
			let blockY = y + ((offsetYVal + block.y) * smallerBlockSize);
			let blockW = smallerBlockSize;
			let blockH = smallerBlockSize;

			this.ctx.fillRect(blockX, blockY, blockW, blockH);
			this.ctx.strokeRect(blockX + lineWidth / 2, blockY + lineWidth / 2, blockW - lineWidth / 2, blockH - lineWidth / 2);
		})
	}

	private drawNextPieces() {
		let x = (3.5 + 10) * this.blockSize;
		let y = 5 * this.blockSize;
		let w = 2 * this.blockSize;
		let h = 2 * this.blockSize;

		this.ctx.fillStyle = "#eee"
		this.ctx.font = "14px Lato"
		this.ctx.textAlign = "center"
		this.ctx.fillText("Next", x + (w/2), y - 8 )

		let smallerBlockSize = 12;
		let lineWidth = 1;

		let state = this.store.getState() as GameState;

		let numberOfX = _.uniq(state.holding.blocks.map(b => b.x)).length;
		let numberOfY = _.uniq(state.holding.blocks.map(b => b.y)).length;

		let offsetXVal = numberOfX == 2 ? 1.5 : (numberOfX == 3 ? 1 : 0.5);
		let offsetYVal = numberOfY == 2 ? 1.5 : 2;

		state.nextPieces.forEach((piece, index) => {
			piece.blocks.forEach(block => {

				this.ctx.fillStyle = block.color;
				this.ctx.strokeStyle = "#fff";
				this.ctx.lineWidth = lineWidth;

				let blockX = x + ((offsetXVal + block.x) * smallerBlockSize);
				let blockY = y + (index * (2 * this.blockSize)) + ((offsetYVal + block.y) * smallerBlockSize);
				let blockW = smallerBlockSize;
				let blockH = smallerBlockSize;

				this.ctx.fillRect(blockX, blockY, blockW, blockH);
				this.ctx.strokeRect(blockX + lineWidth / 2, blockY + lineWidth / 2, blockW - lineWidth / 2, blockH - lineWidth / 2);
			})
		})
	}

	private drawScore() {
		let state = this.store.getState() as GameState;

		this.ctx.fillStyle = "#eee"
		this.ctx.font = "24px Lato"
		this.ctx.textAlign = "center"
		this.ctx.shadowColor = "rgba(16, 63, 138, 0.61)"
		this.ctx.shadowBlur = 6
		this.ctx.fillText(state.score.toString(), this.canvas.width/2, this.blockSize * 1.5)
		this.ctx.shadowBlur = 0
	}

	private drawBlock(block: Block) {
		let lineWidth = 1;
		this.ctx.fillStyle = block.color;
		this.ctx.strokeStyle = "#fff";
		this.ctx.lineWidth = lineWidth;

		let x = (3+block.x) * this.blockSize;
		let y = (3+block.y) * this.blockSize;
		let w = this.blockSize;
		let h = this.blockSize;

		this.ctx.fillRect(x, y, w, h);
		// the stroke extends from the middle of the line (not inner or outer rect) and 
		// there is no way to change it. so X +/- lineWidth/2 should force the stroke
		// to be inner.
		this.ctx.strokeRect(x + lineWidth/2, y + lineWidth/2, w - lineWidth/2, h - lineWidth/2);
	}

	private getPreviewOfActivePiece(state: GameState) : Block[] {
		let previewState = { ...state }

		while(previewState.activePiece.blocks.length > 0 && _.max(previewState.activePiece.blocks.map(b => b.y)) +1 <= 19) {
			let tempPreviewState = {
				...previewState,
				activePiece: {
					blocks: previewState.activePiece.blocks.map((item: Block) => {
						return { ...item, y: item.y + 1 }
					})
				}
			}

			// check for collisions
			let existingBlocks = (tempPreviewState.blocks || []).map(b => { return `${b.x}-${b.y}` });
			let nextActivePiece = tempPreviewState.activePiece.blocks.map(b => { return `${b.x}-${b.y}` });

			if (_.intersection(existingBlocks, nextActivePiece).length > 0) {
				break;
			} else {
				previewState = tempPreviewState
			}
		}

		return previewState.activePiece.blocks;
	}

	private renderStatusText(status: GameStatus) {
		if (status == GameStatus.PLAYING) return;

		// draws a fancy slanted box before text
		this.ctx.rotate(0.1);

		var gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
		gradient.addColorStop(0.3, "white");
		gradient.addColorStop(0.33, "#64b6ff");
		gradient.addColorStop(0.42, "#2c62b8");
		gradient.addColorStop(0.5, "#194d9e");
		gradient.addColorStop(0.58, "#2c62b8");
		gradient.addColorStop(0.67, "#64b6ff");
		gradient.addColorStop(0.7, "white");

		this.ctx.fillStyle = gradient
		this.ctx.fillRect(-100, (this.canvas.height/2)-110, this.canvas.width+200, 220);
		this.ctx.strokeStyle = "white"
		this.ctx.lineWidth = 3
		this.ctx.strokeRect(-100, (this.canvas.height/2)-110, this.canvas.width+200, 220);

		this.ctx.textAlign = "center"
		this.ctx.fillStyle = "#fff"
		this.ctx.font = "bold 42px Lato"
		this.ctx.shadowColor = "rgba(16, 63, 138, 0.61)"
		this.ctx.shadowBlur = 6

		let text = "";
		if (status == GameStatus.GAME_OVER) {
			text = "GAME OVER"
		}
		if (status == GameStatus.PAUSED) {
			text = "PAUSED"
		}
		if (status == GameStatus.NOT_STARTED) {
			text = "Press any key to start"
		}
		this.ctx.fillText(text, (this.canvas.width/2) + 30, (this.canvas.height/2) + 10)
		this.ctx.rotate(-0.1);

		this.ctx.shadowBlur = 0
	}
}