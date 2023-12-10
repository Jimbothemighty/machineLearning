import { MutableRefObject, useEffect, useRef, useState } from "react"
import styles from "./BellmanSimple.module.css"
import Button from "~/assets/components/Controls/Button"
import { gridSize, numActions } from "~/assets/components/MachineLearning/BellmanSimple/fixtures"
import { getPreferredPath, qLearningBatch, sleep } from "~/assets/components/MachineLearning/BellmanSimple/functions"
import { DrawGrid } from "~/assets/components/MachineLearning/BellmanSimple/DrawGrid"

export function BellmanSimple() {
	const [isLearning, setIsLearning] = useState(false)
	const [isStarted, setIsStarted] = useState(false)
	const [preferredPath, setPreferredPath] = useState(null)
	const [isCompletePath, setIsCompletePath] = useState(false)
	const [episode, setEpisode] = useState(0)
	const qValues : MutableRefObject<Array<Array<Array<number>>>> = useRef(Array.from({ length: gridSize }, () => Array(gridSize).fill(Array(numActions).fill(0))))

	useEffect(() => {
		if (!isLearning) {
			return
		}

		// console.log(`started learning`)
		const currentEpisode = qLearningBatch(episode, qValues.current)
		// console.log(`finished learning`)
		setEpisode(currentEpisode)

		const { path, complete } = getPreferredPath(qValues.current)
		console.log(`Preferred Path:`, path)
		setPreferredPath(path)
		sleep(500).then(() => setIsLearning(false))
		setIsCompletePath(complete)

		if (complete) {
			console.log(`qValues:`, qValues.current)
		}
	}, [isLearning])

	// console.log(`isStarted ${isStarted.toString()}`)
	// console.log(`isLearning ${isLearning.toString()}`)

	return <div>
		<div>{preferredPath && JSON.stringify(preferredPath)}</div>
		<br/>
		<div className={styles.flexGap}>
			<DrawGrid isStarted={isStarted} onFinish={() => setIsStarted(false)} preferredPath={preferredPath} />
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
