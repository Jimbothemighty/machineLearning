import { useEffect, useRef, useState } from "react"
import { coordsType, pathType, sleep } from "~/assets/components/MachineLearning/Bellman/functions"
import { GridUi } from "~/assets/components/MachineLearning/components/GridUi"

const gridSize = 5
const loseState = { row: 99, col: 99 }
const obstacles = []

const inputSize = 2
const hiddenSize = 3
const outputSize = 1

const trainingEpochs = 1000
const learningRate = 0.1

class Matrix {
	rows: number
	cols: number
	data: number[][]

	constructor(rows: number, cols: number) {
		this.rows = rows
		this.cols = cols
		this.data = JSON.parse(JSON.stringify(Array.from({ length: rows }, () => Array(cols).fill(0))))
	}

	randomize(): this {
		this.data = this.data.map(row =>
			row.map(() => Math.random() * 2 - 1)
		)
		return this
	}

	dot(matrix: Matrix): Matrix {
		if (this.cols !== matrix.rows) {
			throw new Error(`Incompatible matrix sizes for dot product`)
		}

		return new Matrix(this.rows, matrix.cols).map((_, i, j) => {
			return this.data[i].reduce((sum, el, k) => sum + el * matrix.data[k][j], 0)
		})
	}

	transpose(): Matrix {
		return new Matrix(this.cols, this.rows).map((_, i, j) => this.data[j][i])
	}

	multiply(value: number): Matrix {
		return new Matrix(this.rows, this.cols).map((el, i, j) => this.data[i][j] * value)
	}

	multiplyMatrix(matrix: Matrix): Matrix {
		if (this.rows !== matrix.rows || this.cols !== matrix.cols) {
			throw new Error(`Incompatible matrix sizes for multiplication`)
		}

		return new Matrix(this.rows, this.cols).map((_, i, j) => this.data[i][j] * matrix.data[i][j])
	}

	add(matrix: Matrix): Matrix {
		if (this.rows !== matrix.rows || this.cols !== matrix.cols) {
			throw new Error(`Incompatible matrix sizes for addition`)
		}

		return new Matrix(this.rows, this.cols).map((el, i, j) => this.data[i][j] + matrix.data[i][j])
	}

	subtract(matrix: Matrix): Matrix {
		if (this.rows !== matrix.rows || this.cols !== matrix.cols) {
			throw new Error(`Incompatible matrix sizes for subtraction`)
		}

		return new Matrix(this.rows, this.cols).map((el, i, j) => this.data[i][j] - matrix.data[i][j])
	}

	map(callback: (value: number, i: number, j: number) => number): Matrix {
		return new Matrix(this.rows, this.cols).setData(
			this.data.map((row, i) => row.map((el, j) => callback(el, i, j)))
		)
	}

	setData(data: number[][]): this {
		this.data = data
		return this
	}
}

class NeuralNetwork {
	inputSize: number
	hiddenSize: number
	outputSize: number
	weightsInputHidden: Matrix
	biasHidden: Matrix
	weightsHiddenOutput: Matrix
	biasOutput: Matrix
	hiddenLayerOutput: Matrix
	output: Matrix

	constructor(inputSize: number, hiddenSize: number, outputSize: number) {
		this.inputSize = inputSize
		this.hiddenSize = hiddenSize
		this.outputSize = outputSize

		this.weightsInputHidden = new Matrix(inputSize, hiddenSize).randomize()
		this.biasHidden = new Matrix(1, hiddenSize).randomize()
		this.weightsHiddenOutput = new Matrix(hiddenSize, outputSize).randomize()
		this.biasOutput = new Matrix(1, outputSize).randomize()

		// this.weightsInputHidden = new Matrix(inputSize, hiddenSize).randomize().multiply(0.5)
		// this.biasHidden = new Matrix(1, hiddenSize).randomize().multiply(0.5)
		// this.weightsHiddenOutput = new Matrix(hiddenSize, outputSize).randomize().multiply(0.5)
		// this.biasOutput = new Matrix(1, outputSize).randomize().multiply(0.5)
	}

	sigmoid(x: number): number {
		return 1 / (1 + Math.exp(-x))
	}

	sigmoidDerivative(x: number): number {
		return this.sigmoid(x) * (1 - this.sigmoid(x))
	}

	forward(input: Matrix): Matrix {
		this.hiddenLayerOutput = input.dot(this.weightsInputHidden).map(x => this.sigmoid(x))
		this.output = this.hiddenLayerOutput.dot(this.weightsHiddenOutput).map(x => this.sigmoid(x))
		return this.output
	}

	train(input: Matrix, target: Matrix, learningRate: number): void {
		// Forward pass
		this.forward(input)

		// Calculate output layer error
		const outputError = target.subtract(this.output)
		const outputDelta = outputError.multiplyMatrix(this.output.map(x => this.sigmoidDerivative(x)))

		// Calculate hidden layer error
		const hiddenError = outputDelta.dot(this.weightsHiddenOutput.transpose())
		const hiddenDelta = hiddenError.multiplyMatrix(this.hiddenLayerOutput.map(x => this.sigmoidDerivative(x)))

		// Update weights and biases
		this.weightsHiddenOutput = this.weightsHiddenOutput.add(
			this.hiddenLayerOutput.transpose().dot(outputDelta).multiply(learningRate)
		)
		this.biasOutput = this.biasOutput.add(outputDelta.multiply(learningRate))

		this.weightsInputHidden = this.weightsInputHidden.add(
			input.transpose().dot(hiddenDelta).multiply(learningRate)
		)
		this.biasHidden = this.biasHidden.add(hiddenDelta.multiply(learningRate))
	}
}

// Grid class to represent the environment
class Grid {
	rows : number
	cols : number
	grid : number[][]

	constructor(rows, cols) {
		this.rows = rows
		this.cols = cols
		this.grid = JSON.parse(JSON.stringify(Array.from({ length: rows }, () => Array(cols).fill(0))))
	}

	// Set obstacle at specified coordinates
	setObstacle(row, col) {
		this.grid[row][col] = 1
	}

	// Check if the specified coordinates are within the grid and not blocked
	isValidMove(row, col) {
		return row >= 0 && row < this.rows && col >= 0 && col < this.cols && this.grid[row][col] === 0
	}

	// Display the grid with obstacles
	display() {
		for (let row = 0; row < this.rows; row++) {
			console.log(this.grid[row].join(` `))
		}
	}
}

// AI class for navigating the grid using the neural network
class AI {
	grid: Grid
	neuralNetwork: NeuralNetwork
	startPosition: coordsType
	currentPosition: coordsType
	goalPosition: coordsType
	movesOutputs: number[]

	// epsilon-greedy properties
	private epsilon: number = 0.95 /* 1.0 number between 0 and 1. 1 = random, 0 is explicit to algorithm.
		we'll drop from 1 to 0.5 after 1st pass. Then gradually decay thereafter
		maybe 0.3-0.4 is a good value */
	private epsilonMin: number = 0.01
	private epsilonDecay: number = 0.995

	constructor(grid, neuralNetwork) {
		this.grid = grid
		this.neuralNetwork = neuralNetwork
		this.currentPosition = null
		this.movesOutputs = []
	}

	getMovesOutput() {
		return this.movesOutputs
	}

	// Get the input features for the neural network based on the current position
	getInput() : Matrix {
		const { row, col } = this.currentPosition
		const input = new Matrix(1, 2).setData([[row / this.grid.rows, col / this.grid.cols]])
		return input
	}

	// Move the AI based on the output of the neural network
	move() {
		const input = this.getInput()
		const outputMatrix = this.neuralNetwork.forward(input)
		const output = outputMatrix.data[0] // Assuming the output is an array of probabilities for [UP, RIGHT, DOWN, LEFT]

		const moveProbabilities = {
			UP: output[0],
			RIGHT: output[1],
			DOWN: output[2],
			LEFT: output[3],
		}

		// this.movesOutputs.push(moveProbabilities)

		// Determine the next move based on the output
		/** Uses epsilon-greedy exploration strategy */
		if (Math.random() < this.epsilon) {
			const possibleMoves = Object.keys(moveProbabilities)
			const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]

			this.executeMove(randomMove)
		} else {
			const nextMove = Object.keys(moveProbabilities)
				.reduce((a, b) => moveProbabilities[a] > moveProbabilities[b] ? a : b)

			this.executeMove(nextMove)
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

	executeMove(move) {
		if (move === `RIGHT` && this.grid.isValidMove(this.currentPosition.row, this.currentPosition.col + 1)) {
			this.currentPosition.col += 1
		} else if (move === `DOWN` && this.grid.isValidMove(this.currentPosition.row + 1, this.currentPosition.col)) {
			this.currentPosition.row += 1
		} else if (move === `UP` && this.grid.isValidMove(this.currentPosition.row - 1, this.currentPosition.col)) {
			this.currentPosition.row -= 1
		} else if (move === `LEFT` && this.grid.isValidMove(this.currentPosition.row, this.currentPosition.col - 1)) {
			this.currentPosition.col -= 1
		}
	}

	// Train the neural network to navigate the grid
	train(epochs, learningRate) {
		for (let epoch = 0; epoch < epochs; epoch++) {
			// Randomly place the AI in the grid

			this.startPosition = {
				row: Math.floor(Math.random() * this.grid.rows),
				col: Math.floor(Math.random() * this.grid.cols),
			} // aiStartPosition // { row: Math.floor(Math.random() * this.grid.rows), col: 0 }

			// Randomly choose a goal position
			this.goalPosition = {
				row: Math.floor(Math.random() * this.grid.rows),
				col: Math.floor(Math.random() * this.grid.cols),
			} // winState

			this.currentPosition = { ...this.startPosition } // clone

			// Train the neural network to estimate the cost to the goal
			const input = this.getInput()

			// Calculate the reward for the current state
			const currentStateReward = simpleRewardSignal(this.currentPosition, this.goalPosition)

			// Train the neural network to estimate the cost to the goal with the reward signal
			const target = new Matrix(1, 1).setData([[currentStateReward]])
			this.neuralNetwork.train(input, target, learningRate)
		}
	}

	// Display the current position of the AI
	display() {
		return { row: this.currentPosition.row, col: this.currentPosition.col }
	}
}

function simpleRewardSignal(currentPosition, goalPosition) {
	const distance = Math.abs(currentPosition.row - goalPosition.row) + Math.abs(currentPosition.col - goalPosition.col)

	const reward = 1 / (distance + 1)
	console.log(`distance: ${distance}, reward: ${reward}`)
	return 1 / (distance + 1) // Increase reward as the AI gets closer to the goal
}

function getGrid() : Grid {
	const grid = new Grid(gridSize, gridSize)
	for (let index = 0; index < obstacles.length; index++) {
		const obstacle = obstacles[index]

		grid.setObstacle(obstacle.row, obstacle.col)
	}

	return grid
}

function getNN() : NeuralNetwork {
	return new NeuralNetwork(inputSize, hiddenSize, outputSize)
}

function getNNPathPostTraining(ai : AI) : pathType {
	let path = [ai.startPosition]
	const maxSteps = gridSize * gridSize * 100
	let iterations = 0
	const winState = ai.goalPosition

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

		ai.move()
		path.push(ai.display())

		iterations++
	}

	console.log(path)

	return {
		path,
		complete: true,
	}
}

export function NeuralNet() {
	const [isLearning, setIsLearning] = useState(false)
	const [isStarted, setIsStarted] = useState(false)
	const [preferredPath, setPreferredPath] = useState(null)
	const [isCompletePath, setIsCompletePath] = useState(false)
	const [localWinState, setLocalWinState] = useState<coordsType>({ row: -1, col: -1 })
	const [localStartState, setLocalStartState] = useState<coordsType>({ row: -1, col: -1 })
	const ai = useRef(new AI(getGrid(), getNN()))

	useEffect(() => {
		if (!isLearning) {
			return
		}

		ai.current.train(trainingEpochs, learningRate)
		setLocalStartState(ai.current.startPosition)
		setLocalWinState(ai.current.goalPosition)

		const { path, complete } = getNNPathPostTraining(ai.current)

		setPreferredPath(path)
		sleep(500).then(() => setIsLearning(false))
		setIsCompletePath(complete)

		if (complete) {
			console.log(`COMPLETE: ai:`, ai.current)
		}
	}, [isLearning])

	return <GridUi
		gridSize={gridSize}
		preferredPath={preferredPath}
		isStarted={isStarted}
		setIsStarted={setIsStarted}
		isLearning={isLearning}
		setIsLearning={setIsLearning}
		isCompletePath={isCompletePath}
		startState={localStartState}
		winState={localWinState}
		loseState={loseState}
		obstacles={obstacles}
		notes={``}/>
}
