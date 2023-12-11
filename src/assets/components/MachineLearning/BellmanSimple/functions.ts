import { aiStartPosition, alpha, discountFactor, gridSize, loseState, maxLoopIterations, numActions, numEpisodes, obstacles, winState } from "~/assets/components/MachineLearning/BellmanSimple/fixtures"

// Bellman equation function
export function bellmanEquation(currentState, action : number, nextState, reward : number, qValues) {
	let currentQValue : number = qValues[currentState.row][currentState.col][action]

	let maxNextQValue
	if (nextState.row > gridSize - 1 || nextState.row < 0 || nextState.col > gridSize - 1 || nextState.col < 0) {
		// its an invalid square
		maxNextQValue = -0.99
	} else {
		maxNextQValue = Math.max(...qValues[nextState.row][nextState.col])
	}

	let updatedQValue : number = currentQValue + alpha * (reward + discountFactor * maxNextQValue - currentQValue)

	qValues[currentState.row][currentState.col][action] = updatedQValue
}

export function qLearningBatch(qValues) {
	for (let episode = 0; episode < numEpisodes; episode++) {
		qLearning(qValues)
		console.log(`qLearning completed`)
		console.log(qValues)
	}
}

// Q-learning function
export function qLearning(qValues) {
	let currentState = aiStartPosition // AI starts at the bottom-left corner
	let isTerminal = false
	let numRandomActionsTaken = 0
	let numMaximisedActionTaken = 0
	let iterations = 0

	while (!isTerminal && iterations < maxLoopIterations) {
		// console.log(`learning while loop iteration ${iterations}`)
		let action

		if (Math.random() < 0.1) {
			action = Math.floor(Math.random() * numActions)
			numRandomActionsTaken++
		} else {
			action = qValues[currentState.row][currentState.col].indexOf(Math.max(...qValues[currentState.row][currentState.col]))
			numMaximisedActionTaken++
		}

		let nextState = { row: currentState.row, col: currentState.col }
		switch (action) {
		case 0: nextState.row--; break // Up
		case 1: nextState.col++; break // Right
		case 2: nextState.row++; break // Down
		case 3: nextState.col--; break // Left
		default: throw new Error(`Unexpected default`)
		}

		if (nextState.row >= 0 && nextState.row < gridSize && nextState.col >= 0 && nextState.col < gridSize) {
			if (obstacles.some(obstacle => obstacle.row === nextState.row && obstacle.col === nextState.col)) {
				// console.log(`found an obstacle`)
				// let reward = -0.5
				// bellmanEquation(currentState, action, nextState, reward, discountFactor, qValues)

				// currentState = nextState

				// state is unchanged!
			} else if (nextState.row > gridSize - 1 || nextState.row < 0 || nextState.col > gridSize - 1 || nextState.col < 0) {
				// console.log(`found an edge INNER`)
				// let reward = -0.4
				// bellmanEquation(currentState, action, nextState, reward, discountFactor, qValues)

				// state is unchanged!
			} else {
				let reward = 0

				if (nextState.row === winState.row && nextState.col === winState.col) {
					reward = 1
					isTerminal = true
				} else if (nextState.row === loseState.row && nextState.col === loseState.col) {
					reward = -1
					isTerminal = true
				}

				bellmanEquation(currentState, action, nextState, reward, qValues)

				currentState = nextState

				// ok to proceed state
			}
		} else {
			// console.log(`found an edge`)
			// let reward = -0.2
			// bellmanEquation(currentState, action, nextState, reward, discountFactor, qValues)
		}

		iterations++
	}

	// console.log(`numRandomActionsTaken ${numRandomActionsTaken.toString()}`)
	// console.log(`numMaximisedActionTaken ${numMaximisedActionTaken.toString()}`)
}

type coordsType = {
	col: number,
	row: number
}

type pathType = {
	path: Array<coordsType>
	complete: boolean
}

// Get preferred path function
export function getPreferredPath(qValues) : pathType {
	let path = [aiStartPosition]
	const maxSteps = gridSize * gridSize
	let iterations = 0

	while (!(path[path.length - 1].row === winState.row && path[path.length - 1].col === winState.col) && iterations <= maxSteps) {
		let currentState = path[path.length - 1]

		if (currentState.row > gridSize - 1 || currentState.row < 0 || currentState.col > gridSize - 1 || currentState.col < 0) {
			return {
				path,
				complete: false,
			}
		}

		if (iterations === maxSteps) {
			return {
				path,
				complete: false,
			}
		}

		let action = qValues[currentState.row][currentState.col].indexOf(Math.max(...qValues[currentState.row][currentState.col]))

		let nextState = { row: currentState.row, col: currentState.col }
		switch (action) {
		case 0: nextState.row--; break // Up
		case 1: nextState.col++; break // Right
		case 2: nextState.row++; break // Down
		case 3: nextState.col--; break // Left
		default: throw new Error(`Unexpected default`)
		}

		path.push(nextState)

		iterations++
	}

	return {
		path,
		complete: true,
	}
}

export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
