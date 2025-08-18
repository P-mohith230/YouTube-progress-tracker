/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./index.html',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				primary: '#FFFFFF',
				'accent-pink': '#FCE7F3',
				'accent-blue': '#E0F2FE',
				'text-dark': '#1F2937',
				'text-light': '#6B7280',
			},
		},
	},
	plugins: [],
}


