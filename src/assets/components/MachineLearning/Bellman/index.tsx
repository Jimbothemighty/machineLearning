import { MutableRefObject, useEffect, useRef, useState } from "react"
import { aiStartPosition, gridSize, numActions, winState } from "~/assets/components/MachineLearning/Bellman/fixtures"
import { getPreferredPath, qLearningBatch, sleep } from "~/assets/components/MachineLearning/Bellman/functions"
import { GridUi } from "~/assets/components/MachineLearning/components/GridUi"

export function Bellman() {
	const [isLearning, setIsLearning] = useState(false)
	const [isStarted, setIsStarted] = useState(false)
	const [preferredPath, setPreferredPath] = useState(null)
	const [isCompletePath, setIsCompletePath] = useState(false)
	// const [episode, setEpisode] = useState(0)
	const qValues : MutableRefObject<Array<Array<Array<number>>>> = useRef(
		JSON.parse(
			JSON.stringify(
				Array.from({ length: gridSize }, () => Array(gridSize).fill(Array(numActions).fill(0)))
			)
		)
	)

	useEffect(() => {
		if (!isLearning) {
			return
		}

		console.log(`started learning`)
		qLearningBatch(qValues.current)
		console.log(`finished learning`)
		// setEpisode(currentEpisode)

		const { path, complete } = getPreferredPath(qValues.current)
		console.log(`Preferred Path:`, path)
		setPreferredPath(path)
		sleep(500).then(() => setIsLearning(false))
		setIsCompletePath(complete)

		if (complete) {
			console.log(`qValues:`, qValues.current)
		}
	}, [isLearning])

	return <GridUi preferredPath={preferredPath}
		isStarted={isStarted}
		setIsStarted={setIsStarted}
		isLearning={isLearning}
		setIsLearning={setIsLearning}
		isCompletePath={isCompletePath}
		startState={aiStartPosition}
		winState={winState}/>
}
