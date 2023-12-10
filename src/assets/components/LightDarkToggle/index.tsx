import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '~/redux/store'
import styles from "./../Controls/Toggle/Toggle.module.css"
import { setTheme } from '~/redux/userPreferences'
import { THEME_DARK, THEME_LIGHT } from "~/assets/js/setUserPreferences"

export function useIsDarkTheme() {
	const theme = useSelector((state: RootState) => state.userPreferences.theme)
	return theme === THEME_DARK
}

/**
 * Pinched from https://codepen.io/Umer_Farooq/pen/eYJgKGN
 */
export function LightDarkToggle() {
	const dispatch: AppDispatch = useDispatch()
	const isDarkMode = useIsDarkTheme()

	return <div className={styles.toggleContainer}>
		<input type="checkbox" className={styles.checkbox} id="checkbox" checked={isDarkMode}
			onChange={(event) => {
				const { checked } = event.target
				dispatch(setTheme(checked ? THEME_DARK : THEME_LIGHT))
			}} />
		<label htmlFor="checkbox" className={styles.checkboxLabel}>
			<span className={`${styles.emoji} ${styles.left}`}>🌑</span>
			<span className={`${styles.emoji} ${styles.right}`}>☀️</span>
			<span className={styles.ball}></span>
		</label>
	</div>
}
