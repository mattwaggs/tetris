import './style/index.sass';
import Game from './game';

const GAME_SPEED = 1000 / 60;

let game = new Game();
let tickInterval = null;

let canvas = document.getElementById("game") as HTMLCanvasElement;

// game tick
tickInterval = setInterval(() => {
	game.render(canvas);
}, GAME_SPEED);