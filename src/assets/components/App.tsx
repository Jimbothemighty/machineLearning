import { NavBar } from "./NavBar"
import "~/assets/css/style.css"
import { Tab, Tabs } from "~/assets/components/Tabs"
import * as React from "react"
import { BellmanSimple } from "~/assets/components/MachineLearning/BellmanSimple"

export function App() {
	return <div className="App">
		<NavBar />
		<div style={{ padding: `10px` }}>
			<Tabs>
				<Tab label="Simple Bellman">
					<BellmanSimple/>
				</Tab>
				<Tab label="Not yet added">
					<h3>Todo</h3>
				</Tab>
			</Tabs>
		</div>
	</div>
}
