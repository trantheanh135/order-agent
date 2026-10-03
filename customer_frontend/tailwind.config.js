export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef4fb', 100: '#d8e5f4', 200: '#b3cbe8', 300: '#82a8d4', 400: '#5483bb',
          500: '#35669f', 600: '#284f80', 700: '#1f3f66', 800: '#16304f', 900: '#0e2342', 950: '#08162b',
        },
        accent: { 400: '#ff9a3c', 500: '#ff7a1a', 600: '#ea6406' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      keyframes: {
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        riseIn: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        slideIn: 'slideIn .25s ease-out',
        fadeIn: 'fadeIn .2s ease-out',
        riseIn: 'riseIn .35s ease-out both',
      },
    },
  },
  plugins: [],
}
