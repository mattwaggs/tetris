import { Store } from 'redux';
import { Block, PieceDefinitions, GameState, GetRandomPiece } from 'models';
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
		store.dispatch(Actions.SetActivePiece({piece: GetRandomPiece()}))

		this.gravityInterval = setInterval(() => {
			let state = store.getState() as GameState;
			
			/*
			 * checks to see if block reached end of gameboard.
			 * also undefined < any number evaluates to false, hence
			 * no active piece causes a new piece to dispatch.
			 */
			if (_.max(state.activePiece.blocks.map(b => b.y)) < 19) {
				store.dispatch(Actions.MoveActivePieceDown({}));
			} else {
				store.dispatch(Actions.PieceHitGround({}));
				store.dispatch(Actions.SetActivePiece({piece: GetRandomPiece()}));
			}
		}, 500);


		window.addEventListener('keydown', (e: KeyboardEvent) => {
			let left = 37;
			let right = 39;
			let up = 38;
			let down = 40;
			let space = 32;

			switch(e.keyCode) {
				case left:
					this.store.dispatch(Actions.MoveActivePiece({direction: 'left'}))
					break;
				case right: 
					this.store.dispatch(Actions.MoveActivePiece({direction: 'right'}))
					break;
				case down: 
					store.dispatch(Actions.MoveActivePieceDown({}));
					break;
				case up:
					if(!this.keyPressable) return false;
					store.dispatch(Actions.RotatePiece({}));
					setTimeout(() => {this.keyPressable = true}, 20);
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
}