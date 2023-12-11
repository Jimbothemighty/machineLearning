// Set obstacles, win state, and lose state
export const gridSize = 8
export const numActions = 4 // 0: Up, 1: Right, 2: Down, 3: Left

export const obstacles = [
	{ row: 0, col: 0 },
	{ row: 1, col: 0 },
	{ row: 2, col: 0 },
	{ row: 3, col: 0 },
	{ row: 4, col: 0 },
	{ row: 5, col: 0 },
	{ row: 6, col: 0 },
	{ row: 1, col: 2 },
	{ row: 2, col: 2 },
	{ row: 3, col: 2 },
	{ row: 4, col: 2 },
	{ row: 5, col: 2 },
	{ row: 5, col: 3 },
	{ row: 5, col: 4 },
	{ row: 5, col: 5 },
	{ row: 5, col: 6 },
	{ row: 5, col: 7 },
	{ row: 0, col: 4 },
	{ row: 0, col: 6 },
	{ row: 1, col: 6 },
]
export const winState = { row: 0, col: gridSize - 1 } // { row: 3, col: 4 }
export const loseState = { row: gridSize - 1, col: gridSize - 1 }
export const aiStartPosition = { row: gridSize - 1, col: 0 } // AI starts at the bottom-left corner

// Learning parameters
export const alpha = 0.1 // learning rate
export const discountFactor = 0.9 // discount factor
export const numEpisodes = 1000 // number of training episodes // default was 1000!

// Other Constraints
export const maxLoopIterations = 10000000
