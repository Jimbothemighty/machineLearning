import { useState, useEffect, useRef } from 'react'
import styles from './Dropdown.module.css'
import * as React from 'react'

interface Option {
	value: string;
	label: string;
}

interface DropdownProps {
	options: Option[];
	onSetValue: (str : Option) => void
}

const Dropdown: React.FC<DropdownProps> = ({ options, onSetValue }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedOption, setSelectedOption] = useState<Option | null>(null)
	const [filteredOptions, setFilteredOptions] = useState<Option[]>(options)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus()
		}
	}, [isOpen])

	const handleToggleDropdown = () => {
		setIsOpen(!isOpen)
	}

	const handleSelectOption = (option: Option) => {
		setSelectedOption(option)
		onSetValue(option)
		setIsOpen(false)
	}

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const searchTerm = event.target.value.toLowerCase()
		const filtered = options.filter(
			(option) => option.label.toLowerCase().includes(searchTerm)
		)
		setFilteredOptions(filtered)
	}

	return (
		<div className={styles.dropdown}>
			<div className={styles.selectedOption} onClick={handleToggleDropdown}>
				{selectedOption ? selectedOption.label : `Select an option`}
			</div>
			{isOpen && (
				<div className={styles.dropdownContent}>
					<input
						type="text"
						placeholder="Search..."
						onChange={handleSearchChange}
						ref={inputRef}
						className={styles.searchInput}
					/>
					<ul>
						{filteredOptions.map((option) => (
							<li key={option.value} onClick={() => handleSelectOption(option)}>
								{option.label}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}

export default Dropdown
