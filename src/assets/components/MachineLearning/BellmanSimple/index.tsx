import { useEffect, useState } from "react"
import styles from "./BellmanSimple.module.css"
import Button from "~/assets/components/Controls/Button"

const gridSize = 6
const numActions = 4 // 0: Up, 1: Right, 2: Down, 3: Left

// Initialize the Q-values to zeros
let qValues = Array.from({ length: gridSize }, () => Array(gridSize).fill(Array(numActions).fill(0)))

// Set obstacles, win state, and lose state
const obstacles = [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 3, col: 3 }]
const winState = { row: 3, col: 4 }
const loseState = { row: gridSize - 1, col: gridSize - 1 }
const aiStartPosition = { row: gridSize - 1, col: 0 } // AI starts at the bottom-left corner

// Learning parameters
const alpha = 0.1 // learning rate
const discountFactor = 0.9 // discount factor
const numEpisodes = 1000 // number of training episodes // default was 1000!
const episodesBatchSize = 100
const maxIterations = 1000

// Bellman equation function
function bellmanEquation(currentState, action, nextState, reward, discountFactor, qValues) {
	let currentQValue = qValues[currentState.row][currentState.col][action]
	let maxNextQValue = Math.max(...qValues[nextState.row][nextState.col])

	let updatedQValue = currentQValue + alpha * (reward + discountFactor * maxNextQValue - currentQValue)

	qValues[currentState.row][currentState.col][action] = updatedQValue
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
function getPreferredPath() : pathType {
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

// Q-learning function
function qLearning() {
	let currentState = aiStartPosition // AI starts at the bottom-left corner
	let isTerminal = false
	let iterations = 0

	while (!isTerminal && iterations < maxIterations) {
		let action
		if (Math.random() < 0.1) {
			action = Math.floor(Math.random() * numActions)
		} else {
			action = qValues[currentState.row][currentState.col].indexOf(Math.max(...qValues[currentState.row][currentState.col]))
		}

		let nextState = { row: currentState.row, col: currentState.col }
		switch (action) {
		case 0: nextState.row = Math.max(0, nextState.row - 1); break // Up
		case 1: nextState.col = Math.min(gridSize - 1, nextState.col + 1); break // Right
		case 2: nextState.row = Math.min(gridSize - 1, nextState.row + 1); break // Down
		case 3: nextState.col = Math.max(0, nextState.col - 1); break // Left
		default: throw new Error(`Unexpected default`)
		}

		if (nextState.row >= 0 && nextState.row < gridSize && nextState.col >= 0 && nextState.col < gridSize) {
			if (!obstacles.some(obstacle => obstacle.row === nextState.row && obstacle.col === nextState.col)) {
				let reward = 0

				if (nextState.row === winState.row && nextState.col === winState.col) {
					reward = 1
					isTerminal = true
				} else if (nextState.row === loseState.row && nextState.col === loseState.col) {
					reward = -1
					isTerminal = true
				}

				bellmanEquation(currentState, action, nextState, reward, discountFactor, qValues)

				currentState = nextState
			} else {
				// console.log(`found an obstacle`)
				// let reward = -1
				// bellmanEquation(currentState, action, nextState, reward, discountFactor, qValues)

				// state is unchanged! currentState = currentState
			}
		}

		iterations++
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

function qLearningBatch(currentEpisode, batchSize : number = episodesBatchSize) : number {
	let modifierForThisLoop = currentEpisode
	for (let episode = currentEpisode; episode < numEpisodes && episode < modifierForThisLoop + batchSize; episode++) {
		qLearning()
		currentEpisode = currentEpisode + 1
	}

	return currentEpisode
}

export function BellmanSimple() {
	const [isLearning, setIsLearning] = useState(false)
	const [isStarted, setIsStarted] = useState(false)
	const [preferredPath, setPreferredPath] = useState(null)
	const [isCompletePath, setIsCompletePath] = useState(false)
	const [episode, setEpisode] = useState(0)

	useEffect(() => {
		if (!isLearning) {
			return
		}

		const currentEpisode = qLearningBatch(episode)
		setEpisode(currentEpisode)

		const { path, complete } = getPreferredPath()
		console.log(`Preferred Path:`, path)
		setPreferredPath(path)
		setIsLearning(false)
		setIsCompletePath(complete)
	}, [isLearning])

	// console.log(`isStarted ${isStarted.toString()}`)
	// console.log(`isLearning ${isLearning.toString()}`)

	return <div>
		<div>{preferredPath && JSON.stringify(preferredPath)}</div>
		<br/>
		<div className={styles.flexGap}>
			<DrawGrid isStarted={isStarted} preferredPath={preferredPath} />
			<div>
				<div className={styles.flexGap}>
					<Button label={isLearning ? `Training...` : `Start Learning`} onClick={() => setIsLearning(true)} disabled={isLearning}/>
					<Button label={`Step learned path`} onClick={() => setIsStarted(true)} disabled={isLearning || isStarted || !preferredPath}/>
				</div>
				<div className={styles.flexGap}>
					<div>
						<h3>Legend</h3>
						<p>Yellow: AI location</p>
						<p>Green: Win location</p>
						<p>Red: Lose location</p>
						<p>Grey: Obstacle location</p>
					</div>
					<div>
						<h3>Training Info</h3>
						<p>Episodes Complete: {episode}</p>
						<p>Did find path: {!isCompletePath ? `No` : `Yes`}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
}

function DrawGrid({ isStarted, preferredPath }) {
	const [aiLocation, setAiLocation] = useState(aiStartPosition)
	const grid = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, (e, i) => i))

	useEffect(() => {
		async function renderPath() {
			if (!isStarted) {
				return
			}

			for (const thisCell of preferredPath) {
				console.log(thisCell)
				setAiLocation(thisCell)
				await sleep(100)
			}
		}

		renderPath()
	}, [isStarted, preferredPath])

	return <div>
		{grid.map((cols, rowIndex) => {
			return <div key={rowIndex} className={styles.bellmanGridRow}>{
				cols.map((col, colIndex) => {
					const isObstacle = () => obstacles.filter((a) => a.row === rowIndex && a.col === colIndex).length > 0 ? `${styles.obstacle}` : ``
					const isWin = () => winState.row === rowIndex && winState.col === colIndex ? `${styles.win}` : ``
					const isLose = () => loseState.row === rowIndex && loseState.col === colIndex ? `${styles.lose}` : ``
					const isAiLocation = () => aiLocation.row === rowIndex && aiLocation.col === colIndex ? `${styles.aiLocation}` : ``
					return <div className={`${styles.bellmanGridCol} ${isObstacle()} ${isWin()} ${isLose()} ${isAiLocation()}`} key={colIndex} row-idx={rowIndex} col-idx={colIndex}>{rowIndex}, {colIndex}</div>
				})
			}
			</div>
		})}
	</div>
}
