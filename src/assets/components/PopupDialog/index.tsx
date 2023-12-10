// PopupDialog.tsx
import { useState, useEffect } from 'react'
import styles from './PopupDialog.module.css'
import * as React from 'react'

interface PopupDialogProps {
  isOpen: boolean;
  onClose: (answer: boolean) => void;
}

const PopupDialog: React.FC<PopupDialogProps> = ({ isOpen, onClose }) => {
	const [answer, setAnswer] = useState<boolean | null>(null)

	useEffect(() => {
		if (!isOpen) {
			setAnswer(null) // Reset answer when the dialog is closed
		}
	}, [isOpen])

	const handleConfirm = () => {
		setAnswer(true)
		handleClose()
	}

	const handleCancel = () => {
		setAnswer(false)
		handleClose()
	}

	const handleClose = () => {
		onClose(Boolean(answer))
	}

	return (
		isOpen && (
			<div className={styles.popupContainer}>
				<div className={styles.popupContent}>
					<p>Are you sure you want to proceed?</p>
					<button onClick={handleConfirm}>Yes</button>
					<button onClick={handleCancel}>No</button>
					<button onClick={handleClose}>Close</button>
				</div>
			</div>
		)
	)
}

export { PopupDialog }
