import { useEffect, useState } from "react"
import styles from "./../Bellman.module.css"
import { aiStartPosition, gridSize, loseState, obstacles, winState } from "~/assets/components/MachineLearning/Bellman/fixtures"
import { sleep } from "~/assets/components/MachineLearning/Bellman/functions"

export function DrawGrid({ isStarted, onFinish, preferredPath }) {
	const [aiLocation, setAiLocation] = useState(aiStartPosition)
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
