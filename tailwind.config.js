/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				mono: {
					900: '#0A0A0A',
					800: '#141414',
					700: '#1A1A1A',
					600: '#222222',
					500: '#2A2A2A',
					400: '#A0A0A0',
					300: '#D4D4D4',
					200: '#E5E5E5',
					100: '#F5F5F5'
				},
				gold: {
					DEFAULT: '#D4AF37',
					light: '#F4CF47',
					dark: '#B4901F',
					muted: 'rgba(212, 175, 55, 0.6)'
				},
				jade: {
					DEFAULT: '#00A86B',
					light: '#00C67E',
					dark: '#008C59',
					muted: 'rgba(0, 168, 107, 0.6)'
				},
				accent: {
					DEFAULT: '#D4AF37',
					muted: 'rgba(212, 175, 55, 0.6)'
				}
			},
			fontFamily: {
				display: ['Marcellus', 'serif'],
				sans: ['Inter', 'sans-serif']
			},
			backgroundImage: {
				'deco-pattern': `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 0L200 100L100 200L0 100L100 0z' fill='%23D4AF37' fill-opacity='0.03'/%3E%3C/svg%3E")`,
				'gradient-fade': 'linear-gradient(180deg, var(--tw-gradient-stops))'
			},
			boxShadow: {
				'glow': '0 0 30px rgba(212, 175, 55, 0.1)',
				'inner-top': 'inset 0 1px 0 0 rgba(212, 175, 55, 0.05)'
			}
		}
	},
	plugins: []
};