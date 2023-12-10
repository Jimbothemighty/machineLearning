import { useState } from "react"
import styles from "./Toggle.module.css"

export function Toggle({ onToggle }) {
	const [checked, setChecked] = useState(false)

	return <div className={styles.toggleContainer}>
		<input type="checkbox" className={styles.checkbox} id="checkbox" checked={checked}
			onChange={(event) => {
				setChecked(event.target.checked)
				onToggle(checked)
			}} />
		<label htmlFor="checkbox" className={styles.checkboxLabel}>
			<span className={`${styles.emoji} ${styles.left}`}>✔️</span>
			<span className={`${styles.emoji} ${styles.right}`}>❌</span>
			<span className={styles.ball}></span>
		</label>
	</div>
}
