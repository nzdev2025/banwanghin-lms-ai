/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      fontFamily: {
        'sarabun': ['"Sarabun"', 'sans-serif'],
      },
      // +++ เพิ่มโค้ดส่วนนี้เข้าไป +++
      boxShadow: {
        'glow-teal': '0 0 20px -5px rgba(45, 212, 191, 0.4)',
        'glow-sky': '0 0 20px -5px rgba(56, 189, 248, 0.4)',
        'glow-purple': '0 0 20px -5px rgba(168, 85, 247, 0.4)',
        'glow-rose': '0 0 20px -5px rgba(244, 63, 94, 0.4)',
        'glow-amber': '0 0 20px -5px rgba(245, 158, 11, 0.4)',
        'glow-lime': '0 0 20px -5px rgba(132, 204, 22, 0.4)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.4)',
      }
    },
  },
  plugins: [],
}
