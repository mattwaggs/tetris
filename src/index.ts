import Game from './game';

import { createStore } from 'redux';
import reducer from 'game-reducer';

import './style/index.sass';

const GAME_SPEED = 1000 / 60;

let game = new Game(createStore(reducer));
let tickInterval = null;

let canvas = document.getElementById("game") as HTMLCanvasElement;

// game tick
tickInterval = setInterval(() => {
	game.render(canvas);
}, GAME_SPEED);