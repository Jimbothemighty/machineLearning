import { useState, ChangeEvent } from 'react'
import styles from './FilePicker.module.css'
import * as React from 'react'

interface FilePickerProps {
  onFileSelected: (file: File | null) => void;
}

const FilePicker: React.FC<FilePickerProps> = ({ onFileSelected }) => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null)

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files && event.target.files[0]
		setSelectedFile(file)
		onFileSelected(file)
	}

	const handleClearFile = () => {
		setSelectedFile(null)
		onFileSelected(null)
	}

	const renderThumbnail = () => {
		if (selectedFile && selectedFile.type.startsWith(`image/`)) {
			const thumbnailStyle = {
				backgroundImage: `url(${URL.createObjectURL(selectedFile)})`,
			}

			return (
				<div className={styles.thumbnailContainer}>
					<div className={styles.thumbnailImage} style={thumbnailStyle}></div>
				</div>
			)
		}
		return null
	}

	return (
		<div className={styles.filePicker}>
			<label htmlFor="fileInput" className={styles.fileInputLabel}>
				{selectedFile
					? (
						<span>
							{selectedFile.name}
							<button type="button" onClick={handleClearFile} className={styles.clearButton}>
              Clear
							</button>
						</span>
					)
					: (
						`Choose a file`
					)}
			</label>
			{renderThumbnail()}
			<input
				type="file"
				id="fileInput"
				className={styles.fileInput}
				onChange={handleFileChange}
			/>
		</div>
	)
}

export default FilePicker
