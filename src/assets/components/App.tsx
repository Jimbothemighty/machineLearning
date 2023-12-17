import { NavBar } from "./NavBar"
import { Tab, Tabs } from "~/assets/components/Tabs"
import { Bellman } from "~/assets/components/MachineLearning/Bellman"
import { NeuralNet } from "~/assets/components/MachineLearning/NeuralNetwork"
import "~/assets/css/style.css"
import { TensorFlowSimple, TensorFlowObstacles, TensorFlowObstaclesMedium, TensorFlowSimpleApi } from "~/assets/components/MachineLearning/TensorFlow/"

export function App() {
	return <div className="App">
		<NavBar />
		<div style={{ padding: `10px` }}>
			<Tabs>
				<Tab label="TensorFlow Simple API">
					<TensorFlowSimpleApi/>
				</Tab>
				<Tab label="TensorFlow Simple">
					<TensorFlowSimple/>
				</Tab>
				<Tab label="TensorFlow Obstacles">
					<TensorFlowObstacles/>
				</Tab>
				<Tab label="TensorFlow Obstacles Medium">
					<TensorFlowObstaclesMedium/>
				</Tab>
				<Tab label="Neural Network">
					<NeuralNet/>
				</Tab>
				<Tab label="Simple Bellman">
					<Bellman/>
				</Tab>
			</Tabs>
		</div>
	</div>
}
