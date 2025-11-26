/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '0x000000',
        foreground: '#ffffff',
        card: '#2d2d2d',
        "card-foreground": '#ffffff',
        muted: '#3a3a3a',
        "muted-foreground": '#a0a0a0',
        accent: '#7289da',
        primary: '#7289da',
        "primary-foreground": '#ffffff',
        secondary: '#1e1e1e',
        "secondary-foreground": '#a0a0a0',
      },
    },
  },
  plugins: [],
}