import * as tf from '@tensorflow/tfjs'
import { useEffect, useRef, useState } from 'react'
import { coordsType, pathType, sleep } from '~/assets/components/MachineLearning/Bellman/functions'
import { GridUi } from '~/assets/components/MachineLearning/components/GridUi'

class DQNAgent {
	// main learning properties
	private model: tf.Sequential
	private readonly actions: number[]
	private readonly learningRate: number
	private readonly discountFactor: number
	private readonly stateSize: number

	// epsilon-greedy properties
	private epsilon: number = 1.0
	private epsilonMin: number = 0.01
	private epsilonDecay: number = 0.995

	// aggregate data for reviewing learning quality
	private timesTrained: number = 0
	private batchSize: number = 10
	private thisBatch: number[] = []
	private avStepsPerTrainingBatch: number[] = []

	/**
	 *
	 * @param actions quantity of available actions. in this example, up/down/left/right = [0, 1, 2, 3]
	 * @param stateSize number of states. in this example 2 (x,y)
	 * @param learningRate learningRate
	 * @param discountFactor discountFactor
	 */
	constructor(actions: number[], stateSize: number, learningRate: number = 0.01, discountFactor: number = 0.95) {
		this.actions = actions
		this.stateSize = stateSize
		this.learningRate = learningRate
		this.discountFactor = discountFactor
		this.model = this.createModel()
	}

	private createModel(): tf.Sequential {
		const model = tf.sequential()
		model.add(tf.layers.dense({ units: 24, inputShape: [this.stateSize], activation: `relu` }))
		model.add(tf.layers.dense({ units: 24, activation: `relu` }))
		model.add(tf.layers.dense({ units: this.actions.length, activation: `linear` }))
		model.compile({ optimizer: tf.train.adam(this.learningRate), loss: `meanSquaredError` })
		return model
	}

	public updateAggregateData(numSteps : number) {
		this.timesTrained++

		if ((this.timesTrained % this.batchSize) === 0) {
			const sum = this.thisBatch.reduce((a, b) => a + b, 0)
			const avg = (sum / this.thisBatch.length) || 0

			this.thisBatch = [] // reset

			this.avStepsPerTrainingBatch.push(avg)
		}

		this.thisBatch.push(numSteps)
	}

	public getAggregates() {
		return this.avStepsPerTrainingBatch
	}

	public async train(state: number[], actionIndex: number, reward: number, nextState: number[], done: boolean): Promise<void> {
		// Convert data to tensors
		const stateTensor = tf.tensor2d([state])
		const nextStateTensor = tf.tensor2d([nextState])

		// Get current Q values and next Q values
		const currentQ = this.model.predict(stateTensor) as tf.Tensor
		const nextQ = this.model.predict(nextStateTensor) as tf.Tensor

		// Update Q value for the taken action
		const updatedQ = currentQ.arraySync()
		if (done) {
			updatedQ[0][actionIndex] = reward
		} else {
			const maxQValueTensor = nextQ.max()
			const maxQValue = (maxQValueTensor.rank === 0) ? maxQValueTensor.arraySync() as number : maxQValueTensor.arraySync()[0]
			updatedQ[0][actionIndex] = reward + this.discountFactor * maxQValue
		}

		// Train the model
		await this.model.fit(stateTensor, tf.tensor2d(updatedQ), { epochs: 1 })

		// Dispose tensors
		stateTensor.dispose()
		nextStateTensor.dispose()
		currentQ.dispose()
		nextQ.dispose()
	}

	/** Uses epsilon-greedy exploration strategy */
	public chooseAction(state: number[]): number {
		if (Math.random() < this.epsilon) {
			return Math.floor(Math.random() * this.actions.length)
		} else {
			const stateTensor = tf.tensor2d([state])
			const qValues = this.model.predict(stateTensor) as tf.Tensor
			const actionIndex = qValues.argMax(-1).arraySync() as number
			stateTensor.dispose()
			qValues.dispose()
			return this.actions[actionIndex]
		}
	}

	/**
	 * Decay the epsilon value so there is less randomness the longer it learns
	 */
	public updateEpsilon(): void {
		if (this.epsilon > this.epsilonMin) {
			this.epsilon *= this.epsilonDecay
		}
	}
}

class GridEnvironment {
	private grid: number[][]
	private gridSize: number
	private agentPosition: {x: number, y: number}
	private obstacles

	constructor(size: number, obstacles) {
		this.gridSize = size
		this.obstacles = obstacles
		this.grid = Array.from({ length: size }, () => Array(size).fill(0))
		this.reset()
	}

	public reset(): number[] {
		this.agentPosition = { x: 0, y: 0 } // Start at top-left corner
		// You can add more initialization logic here if needed

		return Object.values(this.agentPosition)
	}

	public step(action: number): {state: number[], reward: number, done: boolean} {
		// Implement the logic to update the agent's position based on the action
		// and return the new state, reward, and whether the game is done
		// Example:
		switch (action) {
		case 0: // Move up
			if (this.agentPosition.y > 0) this.agentPosition.y -= 1
			break
		case 1: // Move down
			if (this.agentPosition.y < this.gridSize - 1) this.agentPosition.y += 1
			break
		case 2: // Move left
			if (this.agentPosition.x > 0) this.agentPosition.x -= 1
			break
		case 3: // Move right
			if (this.agentPosition.x < this.gridSize - 1) this.agentPosition.x += 1
			break
		default:
		}

		// Define the reward and check if the game is done
		let reward = 0
		let done = false

		// Check if the agent reached a specific goal or condition
		if (this.agentPosition.x === this.gridSize - 1 && this.agentPosition.y === this.gridSize - 1) {
			reward = 1
			done = true
		} else if (this.obstacles.some(obstacle => obstacle.row === this.agentPosition.x && obstacle.col === this.agentPosition.y)) {
			reward = -((this.gridSize - 1) * 2)
		} else {
			reward = this.getDistanceLivingCost()
		}

		return { state: this.getState(), reward, done }
	}

	private getDistanceLivingCost() {
		let maxDistance = this.gridSize - 1

		return -((maxDistance * 2) - this.agentPosition.x - this.agentPosition.y) / 100
	}

	private getState(): number[] {
		// Convert the agent's position to a state representation
		// Example: one-hot encoded vector or the coordinates
		return [this.agentPosition.x, this.agentPosition.y]
	}
}

async function trainAgent(agent : DQNAgent, gridSize : number, obstacles, episodes: number): Promise<pathType> {
	const env = new GridEnvironment(gridSize, obstacles) // 5x5 grid

	let stepsTaken : pathType = null

	for (let episode = 0; episode < episodes; episode++) {
		let state = env.reset()
		let done = false
		let totalReward = 0
		const maxIteration = 100000000
		let iteration = 0

		stepsTaken = {
			path: [],
			complete: false,
		}

		while (!done && iteration < maxIteration) {
			const action = agent.chooseAction(state)
			const originalState = state
			const { state: nextState, reward, done: isDone } = env.step(action)

			// console.log(`training ${iteration}`)
			await agent.train(originalState, action, reward, nextState, isDone)
			// console.log(`training end ${iteration}`)

			if (true) {
			// only degrade epsilon under a circumstance??
				agent.updateEpsilon()
			}

			state = nextState
			done = isDone
			totalReward += reward

			stepsTaken.path.push({
				row: nextState[0],
				col: nextState[1],
			})

			if (done) {
				stepsTaken.complete = true
				agent.updateAggregateData(stepsTaken.path.length)
			}

			iteration++
		}

		console.log(`Episode ${episode}, Total Reward: ${totalReward}`)
	}

	return stepsTaken
}

function TensorFlow({ gridSize, obstacles, numTrainings }) {
	const [isLearning, setIsLearning] = useState(false)
	const [isStarted, setIsStarted] = useState(false)
	const [preferredPath, setPreferredPath] = useState(null)
	const [isCompletePath, setIsCompletePath] = useState(false)
	const [localWinState, setLocalWinState] = useState<coordsType>({ row: gridSize - 1, col: gridSize - 1 })
	const [localStartState, setLocalStartState] = useState<coordsType>({ row: 0, col: 0 })
	const [notes, setNotes] = useState(``)
	const ai = useRef(new DQNAgent([0, 1, 2, 3], 2)) // Actions: up, down, left, right, stateSize: 2 (i.e. 2 states: flat grid. x,y coords))

	useEffect(() => {
		if (!isLearning) {
			return
		}

		async function trainAgentBulk(numTrainings) : Promise<pathType> {
			let data
			const arr = Array.from({ length: numTrainings }, (value, index) => index)

			setNotes(`Started training`)

			for (const iterator of arr) {
				data = await trainAgent(ai.current, gridSize, obstacles, 1)
				setNotes(`Completed training ${iterator + 1}/${numTrainings}`)
			}
			setNotes(`Training finished`)
			return data
		}

		// Train for n episodes
		trainAgentBulk(numTrainings).then((data) => {
			setLocalStartState(localStartState)
			setLocalWinState(localWinState)

			const { path, complete } = data

			setPreferredPath(path)
			sleep(500).then(() => setIsLearning(false))
			setIsCompletePath(complete)

			console.log(ai.current.getAggregates())
		})
	}, [isLearning])

	return <GridUi
		gridSize={gridSize}
		obstacles={obstacles}
		preferredPath={preferredPath}
		isStarted={isStarted}
		setIsStarted={setIsStarted}
		isLearning={isLearning}
		setIsLearning={setIsLearning}
		isCompletePath={isCompletePath}
		startState={localStartState}
		winState={localWinState}
		notes={notes}/>
}

export function TensorFlowSimple() {
	const gridSize = 5
	const numTrainings = 100

	const obstacles = []

	return <TensorFlow gridSize={gridSize} obstacles={obstacles} numTrainings={numTrainings}/>
}

export function TensorFlowObstacles() {
	const gridSize = 5
	const numTrainings = 100
	const obstacles = [
		// { row: 0, col: 0 },
		// { row: 1, col: 0 },
		// { row: 2, col: 0 },
		{ row: 3, col: 0 },
		{ row: 4, col: 0 },
		{ row: 5, col: 0 },
		{ row: 6, col: 0 },
		// { row: 1, col: 2 },
		// { row: 2, col: 2 },
		// { row: 3, col: 2 },
		// { row: 4, col: 2 },
		{ row: 5, col: 2 },
		{ row: 5, col: 3 },
		{ row: 5, col: 4 },
		{ row: 5, col: 5 },
		// { row: 5, col: 6 },
		{ row: 5, col: 7 },
		{ row: 0, col: 4 },
		// { row: 0, col: 6 },
		// { row: 1, col: 6 },
	]

	return <TensorFlow gridSize={gridSize} obstacles={obstacles} numTrainings={numTrainings}/>
}

export function TensorFlowObstaclesMedium() {
	const gridSize = 8
	const numTrainings = 100
	const obstacles = [
		// { row: 0, col: 0 },
		// { row: 1, col: 0 },
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

	return <TensorFlow gridSize={gridSize} obstacles={obstacles} numTrainings={numTrainings}/>
}
