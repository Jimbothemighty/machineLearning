import styles from './ContextMenu.module.css'
import * as React from 'react'

interface ContextMenuProps {
	isOpen : boolean;
	xPos: number;
	yPos: number;
	onClose: () => void;
	children: React.ReactNode
}

const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, xPos, yPos, onClose, children }) => {
	const thisRef = React.useRef(null)

	useOnClickOutside(thisRef.current, onClose)

	const menuStyle: React.CSSProperties = {
		top: yPos,
		left: xPos,
		display: isOpen ? `block` : `none`,
	}

	const handleItemClick = (action: string) => {
		// You can handle the selected action here
		console.log(`Clicked on:`, action)
		onClose()
	}

	return (
		<div ref={thisRef} className={styles.contextMenu} style={menuStyle}>
			{children && (
				<ul>
					{React.Children.map(children, (child) =>
						React.cloneElement(child as React.ReactElement, {
							onClick: handleItemClick,
						})
					)}
				</ul>
			)}
		</div>
	)
}

function useOnClickOutside(el, handler, handleKeyup = null) {
	React.useEffect(
		() => {
			const listener = event => {
				// Do nothing if clicking ref's element or descendent elements
				if (!el || el?.contains(event.target)) {
					return
				}

				handler && handler(event)
			}

			if (handleKeyup) {
				document.addEventListener(`keyup`, listener)
			}

			document.addEventListener(`mouseup`, listener)
			document.addEventListener(`touchend`, listener)

			return () => {
				if (handleKeyup) {
					document.addEventListener(`keyup`, listener)
				}
				document.removeEventListener(`mouseup`, listener)
				document.removeEventListener(`touchend`, listener)
			}
		},
		// Add ref and handler to effect dependencies
		// It's worth noting that because passed in handler is a new ...
		// ... function on every render that will cause this effect ...
		// ... callback/cleanup to run every render. It's not a big deal ...
		// ... but to optimize you can wrap handler in useCallback before ...
		// ... passing it into this hook.
		[el, handler]
	)
}

export default ContextMenu
