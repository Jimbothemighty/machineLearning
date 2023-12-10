import * as React from 'react'
import styles from './Table.module.css'

export interface TableColumn {
	key: string;
	label: string;
	dataType?: `string` | `number` | `boolean`; // You can extend this for other data types
	hidden?: boolean;
}

interface TableProps {
  headers: TableColumn[];
  data: { [key: string]: any }[];
}

export const Table: React.FC<TableProps> = ({ headers, data }) => {
	const visibleHeaders = headers.filter((header) => !header.hidden)

	return (
		<table className={styles.table}>
			<thead>
				<tr>
					{visibleHeaders.map((header, index) => (
						<th key={index}>{header.label}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((row, rowIndex) => (
					<tr key={rowIndex}>
						{visibleHeaders.map((header, columnIndex) => (
							<td key={columnIndex}>{row[header.key]}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	)
}
