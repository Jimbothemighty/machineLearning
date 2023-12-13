import * as tf from '@tensorflow/tfjs'
import { useEffect, useState } from 'react'
import { coordsType, pathType, sleep } from '~/assets/components/MachineLearning/Bellman/functions'
import { GridUi } from '~/assets/components/MachineLearning/components/GridUi'

class DQNAgent {
	private model: tf.Sequential
	private readonly actions: number[]
	private readonly learningRate: number
	private readonly discountFactor: number
	private readonly stateSize: number

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

	public chooseAction(state: number[]): number {
		const stateTensor = tf.tensor2d([state])
		const qValues = this.model.predict(stateTensor) as tf.Tensor
		const actionIndex = qValues.argMax(-1).arraySync() as number
		stateTensor.dispose()
		qValues.dispose()
		return this.actions[actionIndex]
	}
}

class GridEnvironment {
	private grid: number[][]
	private gridSize: number
	private agentPosition: {x: number, y: number}

	constructor(size: number) {
		this.gridSize = size
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
		}

		return { state: this.getState(), reward, done }
	}

	private getState(): number[] {
		// Convert the agent's position to a state representation
		// Example: one-hot encoded vector or the coordinates
		return [this.agentPosition.x, this.agentPosition.y]
	}
}

async function trainAgent(episodes: number): Promise<void> {
	const env = new GridEnvironment(3) // 5x5 grid
	const agent = new DQNAgent([0, 1, 2, 3], 2) // Actions: up, down, left, right

	for (let episode = 0; episode < episodes; episode++) {
		let state = env.reset()
		let done = false
		let totalReward = 0
		const maxIteration = 1000
		let iteration = 0

		while (!done && iteration < maxIteration) {
			const action = agent.chooseAction(state)
			const { state: nextState, reward, done: isDone } = env.step(action)

			console.log(`training ${iteration}`)
			await agent.train(state, action, reward, nextState, isDone)
			console.log(`training end ${iteration}`)

			state = nextState
			done = isDone
			totalReward += reward

			iteration++
		}

		console.log(`Episode ${episode}, Total Reward: ${totalReward}`)
	}
}

export function TensorFlow() {
	const [isLearning, setIsLearning] = useState(false)
	const [isStarted, setIsStarted] = useState(false)
	const [preferredPath, setPreferredPath] = useState(null)
	const [isCompletePath, setIsCompletePath] = useState(false)
	const [localWinState, setLocalWinState] = useState<coordsType>({ row: -1, col: -1 })
	const [localStartState, setLocalStartState] = useState<coordsType>({ row: -1, col: -1 })

	useEffect(() => {
		if (!isLearning) {
			return
		}

		// Train for 100 episodes
		trainAgent(1).then(() => {
			setLocalStartState(localWinState)
			setLocalWinState(localWinState)

			const getPreferredPath = () : pathType => { return { path: [], complete: false } }
			const { path, complete } = getPreferredPath()

			setPreferredPath(path)
			sleep(500).then(() => setIsLearning(false))
			setIsCompletePath(complete)
		})
	}, [isLearning])
	return <GridUi preferredPath={preferredPath}
		isStarted={isStarted}
		setIsStarted={setIsStarted}
		isLearning={isLearning}
		setIsLearning={setIsLearning}
		isCompletePath={isCompletePath}
		startState={localStartState}
		winState={localWinState}/>
}

// // Example usage
// const actions = [0, 1, 2, 3] // Define actions (e.g., up, down, left, right)
// const agent = new DQNAgent(actions)
// // Train the agent with state, action, reward, nextState, and done signal
// // agent.train(...)
// // Use agent.chooseAction(state) to navigate
