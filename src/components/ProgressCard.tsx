import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ProgressCardProps {
	title: string
	value?: string | ReactNode
}

const ProgressCard = ({ title, value }: ProgressCardProps) => {
	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary rounded-xl p-5 shadow-sm border border-accent-blue/50">
			<p className="text-sm text-text-light mb-2">{title}</p>
			<div className="text-2xl font-bold text-text-dark">{value ?? '—'}</div>
		</motion.div>
	)
}

export default ProgressCard


