import Piece from 'piece';

interface Block {
	color: string,
	x: number,
	y: number
}

export default class game {

	private pieces: Piece[]
	private canvas: HTMLCanvasElement
	private ctx: CanvasRenderingContext2D

	private blockSize: number = 30

	private keyPressable = true;
	private tempY = 0;
	private tempMaxY = 19;
	private tempX = 0;
	private tempMaxX = 9;

	constructor() {
		setInterval(() => {
			if (this.tempY+1 < this.tempMaxY)
				this.tempY++;
			else
				this.tempY = 0;
		}, 500);


		window.addEventListener('keydown', (e: KeyboardEvent) => {
			let left = 37;
			let right = 39;
			let down = 40;

			if(!this.keyPressable) return false;

			switch(e.keyCode) {
				case left:
					if(this.tempX > 0) this.tempX--;
					this.keyPressable = false;
					this.timeoutKeypress();
					break;
				case right: 
					if(this.tempX+2 < this.tempMaxX) this.tempX++;
					this.keyPressable = false;
					this.timeoutKeypress();
					break;
				case down: 
					if(this.tempY+1 < this.tempMaxY) this.tempY++;
					this.keyPressable = false;
					this.timeoutKeypress();
					break;
				default: 
					break;
			}
		});
	}

	private timeoutKeypress() {
		setTimeout(() => {this.keyPressable = true}, 50);
	}

	public render(canvas: HTMLCanvasElement) {
		this.setupCanvas(canvas);
		this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

		this.drawBackground()
		this.drawGameBoard()
		
		let previewColor = 'rgba(221, 221, 221, 0.6)';
		this.drawBlock({ color: previewColor, x: this.tempX, y: this.tempMaxY-1 })
		this.drawBlock({ color: previewColor, x: this.tempX+1, y: this.tempMaxY-1 })
		this.drawBlock({ color: previewColor, x: this.tempX+2, y: this.tempMaxY-1 })
		this.drawBlock({ color: previewColor, x: this.tempX+1, y: this.tempMaxY })

		this.drawBlock({ color: 'red', x: this.tempX, y: this.tempY })
		this.drawBlock({ color: 'red', x: this.tempX+1, y: this.tempY })
		this.drawBlock({ color: 'red', x: this.tempX+2, y: this.tempY })
		this.drawBlock({ color: 'red', x: this.tempX+1, y: this.tempY + 1 })

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
		this.ctx.strokeRect(x + lineWidth/2, y + lineWidth/2, w - lineWidth/2, h - lineWidth/2);
	}
}