import { createRoot } from "react-dom/client"
import { App } from "~/assets/components/App"
import { Provider } from "react-redux"
import { store } from "~/redux/store"

const container = document.querySelector(`.wrapper`)
const root = createRoot(container)

root.render(
	// <StrictMode>
	<Provider store={store}>
		<App />
	</Provider>
	// </StrictMode>
)
