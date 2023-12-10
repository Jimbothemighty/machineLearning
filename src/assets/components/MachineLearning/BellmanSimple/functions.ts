import { aiStartPosition, alpha, discountFactor, episodesBatchSize, gridSize, loseState, numActions, numEpisodes, obstacles, winState } from "~/assets/components/MachineLearning/BellmanSimple/fixtures"

// Bellman equation function
export function bellmanEquation(currentState, action : number, nextState, reward : number, discountFactor : number, qValues, gridSize : number, alpha : number) {
	let currentQValue = qValues[currentState.row][currentState.col][action]

	let maxNextQValue
	if (nextState.row > gridSize - 1 || nextState.row < 0 || nextState.col > gridSize - 1 || nextState.col < 0) {
		// its an invalid square
		maxNextQValue = -0.99
	} else {
		maxNextQValue = Math.max(...qValues[nextState.row][nextState.col])
	}

	let updatedQValue = currentQValue + alpha * (reward + discountFactor * maxNextQValue - currentQValue)
	// let updatedQValue = currentQValue + (maxNextQValue - currentQValue)
	qValues[currentState.row][currentState.col][action] = updatedQValue

	return qValues
}

export function qLearningBatch(currentEpisode, qValues) : number {
	let modifierForThisLoop = currentEpisode
	for (let episode = currentEpisode; episode < numEpisodes && episode < modifierForThisLoop + episodesBatchSize; episode++) {
		qLearning(qValues)
		currentEpisode = currentEpisode + 1
	}

	return currentEpisode
}

// Q-learning function
export function qLearning(qValues) {
	let currentState = aiStartPosition // AI starts at the bottom-left corner
	let isTerminal = false
	let numRandomActionsTaken = 0
	let numMaximisedActionTaken = 0

	while (!isTerminal) {
		// console.log(`learning while loop iteration ${iterations}`)
		let action

		if (Math.random() < 0.15) {
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
				console.log(`found an edge INNER`)
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

				qValues = bellmanEquation(currentState, action, nextState, reward, discountFactor, qValues, gridSize, alpha)

				currentState = nextState

				// ok to proceed state
			}
		} else {
			// console.log(`found an edge`)
			// let reward = -0.2
			// bellmanEquation(currentState, action, nextState, reward, discountFactor, qValues)
		}
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

	while (!(path[path.length - 1].row === winState.row && path[path.length - 1].col === winState.col)) {
		let currentState = path[path.length - 1]

		if (currentState.row > gridSize - 1 || currentState.row < 0 || currentState.col > gridSize - 1 || currentState.col < 0) {
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
	}

	return {
		path,
		complete: true,
	}
}

export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
