import { coordsType } from "~/assets/components/MachineLearning/Bellman/functions"

export function NeuralNet() {
	return <div>Neural Network</div>
}

// Simple matrix class for basic operations
class Matrix {
	rows : number
	cols : number
	data : Array<Array<number>>

	constructor(rows, cols) {
		this.rows = rows
		this.cols = cols
		this.data = Array.from({ length: rows }, () => Array(cols).fill(0))
	}

	randomize() {
		this.data = this.data.map(row =>
			row.map(() => Math.random() * 2 - 1) // Random values between -1 and 1
		)
		return this
	}

	dot(matrix) {
		if (this.cols !== matrix.rows) {
			throw new Error(`Incompatible matrix sizes for dot product`)
		}

		return new Matrix(this.rows, matrix.cols).map((_, i, j) => {
			return this.data[i].reduce((sum, el, k) => sum + el * matrix.data[k][j], 0)
		})
	}

	transpose() {
		return new Matrix(this.cols, this.rows).map((_, i, j) => this.data[j][i])
	}

	multiply(value) {
		return new Matrix(this.rows, this.cols).map((el, i, j) => this.data[i][j] * value)
	}

	add(matrix) {
		if (this.rows !== matrix.rows || this.cols !== matrix.cols) {
			throw new Error(`Incompatible matrix sizes for addition`)
		}

		return new Matrix(this.rows, this.cols).map((el, i, j) => this.data[i][j] + matrix.data[i][j])
	}

	map(callback) {
		return new Matrix(this.rows, this.cols).setData(
			this.data.map((row, i) => row.map((el, j) => callback(el, i, j)))
		)
	}

	setData(data) {
		this.data = data
		return this
	}
}

// Define the neural network class
class NeuralNetwork {
	inputSize: number
	hiddenSize: number
	outputSize: number

	weightsInputHidden: Matrix
	biasHidden: Matrix
	weightsHiddenOutput: Matrix
	biasOutput: Matrix

	hiddenLayerOutput: number
	output: number

	constructor(inputSize, hiddenSize, outputSize) {
		this.inputSize = inputSize
		this.hiddenSize = hiddenSize
		this.outputSize = outputSize

		// Initialize weights and biases with random values
		this.weightsInputHidden = this.randomMatrix(inputSize, hiddenSize)
		this.biasHidden = this.randomMatrix(1, hiddenSize)
		this.weightsHiddenOutput = this.randomMatrix(hiddenSize, outputSize)
		this.biasOutput = this.randomMatrix(1, outputSize)
	}

	// Sigmoid activation function
	sigmoid(x : number) : number {
		return 1 / (1 + Math.exp(-x))
	}

	// Derivative of the sigmoid function
	sigmoidDerivative(x : number) : number {
		return x * (1 - x)
	}

	// Forward pass through the network
	forward(input : Matrix) : Matrix {
		const hiddenLayerOutput = this.sigmoid(
			this.dot(input, this.weightsInputHidden)
		)
		const output = this.sigmoid(
			this.dot(hiddenLayerOutput, this.weightsHiddenOutput)
		)
		return new Matrix(1, this.outputSize).setData([output]) // Wrap output in a Matrix
	}

	// Backpropagation to train the network
	train(input, target, learningRate) {
		// Forward pass
		this.forward(input)

		// Convert hiddenLayerOutput to a matrix
		const hiddenLayerOutputMatrix = new Matrix(1, this.hiddenSize).setData([this.hiddenLayerOutput])

		// Calculate output layer error
		const outputError = target.subtract(this.output)
		const outputDelta = outputError.multiply(this.sigmoidDerivative(this.output))

		// Calculate hidden layer error
		const hiddenError = this.dot(outputDelta, this.weightsHiddenOutput.transpose())
		const hiddenDelta = hiddenError.multiply(this.sigmoidDerivative(hiddenLayerOutputMatrix))

		// Update weights and biases
		this.weightsHiddenOutput = this.weightsHiddenOutput.add(
			hiddenLayerOutputMatrix.transpose().dot(outputDelta).multiply(learningRate)
		)
		this.biasOutput = this.biasOutput.add(outputDelta.multiply(learningRate))

		this.weightsInputHidden = this.weightsInputHidden.add(
			input.transpose().dot(hiddenDelta).multiply(learningRate)
		)
		this.biasHidden = this.biasHidden.add(hiddenDelta.multiply(learningRate))
	}

	// Helper function to generate a matrix with random values
	randomMatrix(rows, cols) {
		return new Matrix(rows, cols).randomize()
	}

	// Helper function for dot product of two matrices
	dot(a : Matrix, b : Matrix) {
		return a.dot(b)
	}
}

// Grid class to represent the environment
class Grid {
	rows : number
	cols : number
	grid : Array<Array<number>>

	constructor(rows, cols) {
		this.rows = rows
		this.cols = cols
		this.grid = Array.from({ length: rows }, () => Array(cols).fill(0))
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
	currentPosition: coordsType

	constructor(grid, neuralNetwork) {
		this.grid = grid
		this.neuralNetwork = neuralNetwork
		this.currentPosition = { row: 0, col: 0 }
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
		const output = this.neuralNetwork.forward(input).data[0][0]

		// Determine the next move based on the output
		const nextMove = output > 0.5 ? `RIGHT` : `DOWN`

		// Update the current position
		if (nextMove === `RIGHT` && this.grid.isValidMove(this.currentPosition.row, this.currentPosition.col + 1)) {
			this.currentPosition.col += 1
		} else if (nextMove === `DOWN` && this.grid.isValidMove(this.currentPosition.row + 1, this.currentPosition.col)) {
			this.currentPosition.row += 1
		}
	}

	// Train the neural network to navigate the grid
	train(epochs, learningRate) {
		for (let epoch = 0; epoch < epochs; epoch++) {
			// Randomly place the AI in the grid
			this.currentPosition = { row: Math.floor(Math.random() * this.grid.rows), col: 0 }

			// Randomly choose a goal position
			const goalPosition = { row: Math.floor(Math.random() * this.grid.rows), col: this.grid.cols - 1 }

			// Train the neural network to estimate the cost to the goal
			const input = this.getInput()
			const target = new Matrix(1, 1).setData([[1 / (goalPosition.col + 1)]])
			this.neuralNetwork.train(input, target, learningRate)
		}
	}

	// Display the current position of the AI
	display() {
		const gridWithAI = JSON.parse(JSON.stringify(this.grid.grid))
		gridWithAI[this.currentPosition.row][this.currentPosition.col] = `A`
		console.log(gridWithAI.map(row => row.join(` `)).join(`\n`))
	}
}

// Example usage
const grid = new Grid(5, 5)
grid.setObstacle(2, 1)
grid.setObstacle(3, 1)
grid.setObstacle(4, 1)

const inputSize = 2
const hiddenSize = 3
const outputSize = 1

const neuralNetwork = new NeuralNetwork(inputSize, hiddenSize, outputSize)

const ai = new AI(grid, neuralNetwork)

// Train the AI
const trainingEpochs = 1000
const learningRate = 0.1
ai.train(trainingEpochs, learningRate)

// Display the initial grid
console.log(`Initial Grid:`)
grid.display()
console.log(`\nTraining AI...\n`)

// Perform AI moves and display the grid after each move
for (let i = 0; i < 5; i++) {
	ai.move()
	ai.display()
	console.log(`\n`)
}
