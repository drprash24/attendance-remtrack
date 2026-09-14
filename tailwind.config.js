/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#15181B',
        surface: '#1E2226',
        surface2: '#262B30',
        line: '#31373D',
        ink: '#EDEDED',
        muted: '#9AA1A9',
        present: '#3DD68C',
        late: '#F2B84B',
        absent: '#F2545B'
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      borderRadius: {
        card: '20px'
      }
    }
  },
  plugins: []
}
