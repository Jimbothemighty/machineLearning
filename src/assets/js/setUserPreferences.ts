import { themeColor } from "~/redux/userPreferences"

export const THEME_DARK = `dark`
export const THEME_LIGHT = `light`

export function isDarkTheme(theme) {
	return theme === THEME_DARK
}

export function rootThemeClass(theme) {
	const rootClassList = document.documentElement.classList
	const isDarkMode = isDarkTheme(theme)

	if (isDarkMode) {
		rootClassList.add(THEME_DARK)
		rootClassList.remove(THEME_LIGHT)
	} else {
		rootClassList.add(THEME_LIGHT)
		rootClassList.remove(THEME_DARK)
	}
}

export function rootThemeColour(theme : themeColor) {
	let themeElement = document.querySelector(`style#theme`)

	themeElement.innerHTML = `
	* {
		--theme-bg-colour: ${theme.bg};
		--theme-txt-colour: ${theme.txt};
	}
    `
}
