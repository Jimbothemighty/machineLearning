import { useEffect, useState } from "react"
import styles from "~/assets/components/MachineLearning/MachineLearning.module.css"
import { sleep } from "~/assets/components/MachineLearning/Bellman/functions"
import Button from "~/assets/components/Controls/Button"

function DrawGrid({ gridSize, obstacles, isStarted, onFinish, preferredPath, startState, winState, loseState }) {
	const [aiLocation, setAiLocation] = useState(startState)
	const grid = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, (e, i) => i))

	useEffect(() => {
		async function renderPath() {
			if (!isStarted) {
				return
			}

			for (const thisCell of preferredPath) {
				// console.log(thisCell)
				setAiLocation(thisCell)
				await sleep(100)
			}

			onFinish()
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

function GridLegend({ isCompletePath, preferredPath, startState, winState, notes }) {
	return <div style={{ display: `flex`, gap: `10px` }}>
		<div>
			<h3>Legend</h3>
			<p>Yellow: AI location</p>
			<p>Green: Win location</p>
			<p>Red: Lose location</p>
			<p>Grey: Obstacle location</p>
		</div>
		<div>
			<h3>Training Info</h3>
			<p>Did find path: {!isCompletePath ? `No` : `Yes`}</p>
			<p>Start: {JSON.stringify(startState)}</p>
			<p>Goal: {JSON.stringify(winState)}</p>
			<p>Steps: {preferredPath === null ? `N/A` : preferredPath.length}</p>
		</div>
	</div>
}

export function GridUi({ gridSize, obstacles, preferredPath, isStarted, setIsStarted, isLearning, setIsLearning, isCompletePath, startState, winState, loseState, notes }) {
	return <div>
		{/* <div>{preferredPath && JSON.stringify(preferredPath)}</div> */}
		<br/>
		<div className={styles.flexGap}>
			<DrawGrid gridSize={gridSize} obstacles={obstacles} isStarted={isStarted} onFinish={() => setIsStarted(false)} preferredPath={preferredPath} startState={startState} winState={winState} loseState={loseState} />
			<div>
				<div className={styles.flexGap} style={{ alignItems: `center` }}>
					<Button label={isLearning ? `Training...` : `Start Learning`} onClick={() => setIsLearning(true)} disabled={isLearning}/>
					<Button label={`Step learned path`} onClick={() => setIsStarted(true)} disabled={isLearning || isStarted || !preferredPath}/>
					{notes}
				</div>
				<GridLegend isCompletePath={isCompletePath} preferredPath={preferredPath} startState={startState} winState={winState} notes={notes}/>
			</div>
		</div>
	</div>
}
