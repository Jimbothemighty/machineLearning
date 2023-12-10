import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface themeColor {
	txt: string;
	bg: string;
}

interface themeState {
	theme: string;
	themeColour: themeColor;
}

function getIfExists(str) : themeColor | null {
	function isThemeColors(strFromLocalStorage : string) {
		if (!strFromLocalStorage.startsWith(`{`)) {
			return null
		}

		let obj = JSON.parse(strFromLocalStorage)

		return (
			typeof obj === `object` &&
			obj !== null &&
			`id` in obj &&
			`gamecharacter_id` in obj &&
			`turn` in obj &&
			`name` in obj &&
			`moneyamount` in obj
		)
	}

	let fromLocalStorage = window.localStorage.getItem(str)

	if (fromLocalStorage && isThemeColors(fromLocalStorage)) {
		return JSON.parse(fromLocalStorage)
	}

	return null
}

const initialState : themeState = {
	theme: window.localStorage.getItem(`theme`) || `light`,
	themeColour: getIfExists(`themeColour`) || {
		txt: `white`,
		bg: `#2980B9`,
	},
}

const slice = createSlice({
	name: `userPreferences`,
	initialState,
	reducers: {
		setTheme: (state, action: PayloadAction<`light` | `dark`>) => {
			// todo - find a way for PayloadAction to receive the constant variables representing light and dark.
			state.theme = action.payload
			window.localStorage.setItem(`theme`, action.payload)
		},
		setThemeColour: (state, action: PayloadAction<themeColor>) => {
			// todo - find a way for PayloadAction to receive the constant variables representing light and dark.
			state.themeColour = action.payload
			window.localStorage.setItem(`themeColour`, JSON.stringify(action.payload))
		},
	},
})

export const { setTheme, setThemeColour } = slice.actions
export const userPreferences = slice.reducer
