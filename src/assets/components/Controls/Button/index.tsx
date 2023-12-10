import * as React from 'react'
import styles from './Button.module.css'

interface ButtonProps {
label: string;
onClick: () => void;
disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
	return (
		<button className={styles.customButton} onClick={onClick} disabled={disabled}>
			{label}
		</button>
	)
}

export default Button
