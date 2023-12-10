import { configureStore } from '@reduxjs/toolkit'
import { authentication } from './authentication'
import { userPreferences } from './userPreferences'

export const store = configureStore({
	reducer: {
		authentication,
		userPreferences,
	},
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
