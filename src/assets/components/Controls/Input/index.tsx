// Input.tsx
import { ChangeEvent } from 'react'
import styles from './Input.module.css'
import * as React from 'react'

interface InputProps {
  label?: string;
  type?: `text` | `number` | `date` | `checkbox`; // You can extend this for other data types
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
}

const Input: React.FC<InputProps> = ({ label, type, placeholder, value, onChange }) => {
	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.value)
	}

	return (
		<div className={styles.inputContainer}>
			{label && <label className={styles.label}>{label}</label>}
			<input
				type={type}
				className={styles.input}
				placeholder={placeholder}
				value={value}
				onChange={handleChange}
			/>
		</div>
	)
}

export default Input
