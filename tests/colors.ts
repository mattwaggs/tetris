export const colors = {
	createStringWithColors: (text: string, color: string) => {
		return colorCodes[color] + text + colorCodes['reset'];
	}
}

const colorCodes: {[key: string]: string} = {
	"reset": "\x1b[0m",
	"cyan": "\x1b[36m",
	"red": "\x1b[31m",
	"lime": "\x1b[32m",
	"blue": "\x1b[34m",
	"orange": "\x1b[37m",
	"yellow": "\x1b[33m",
	"purple": "\x1b[35m",
}
