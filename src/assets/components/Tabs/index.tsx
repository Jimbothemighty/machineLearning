// Tabs.tsx
import { useState, ReactNode, ReactElement } from 'react'
import styles from './Tabs.module.css'
import * as React from 'react'

interface TabProps {
  label: string;
  children: ReactNode;
}

const Tab: React.FC<TabProps> = ({ children }) => <>{children}</>

interface TabsProps {
  children: ReactElement<TabProps>[];
}

const Tabs: React.FC<TabsProps> = ({ children }) => {
	const [activeIndex, setActiveIndex] = useState(0)

	const handleTabClick = (index: number) => {
		setActiveIndex(index)
	}

	return (
		<div className={styles.tabsContainer}>
			<div className={styles.tabs}>
				{children.map((tab, index) => (
					<div
						key={index}
						className={`${styles.tab} ${index === activeIndex ? styles.active : ``}`}
						onClick={() => handleTabClick(index)}
					>
						{tab.props.label}
					</div>
				))}
			</div>
			<div className={styles.tabContent}>{children[activeIndex]}</div>
		</div>
	)
}

export { Tabs, Tab }
