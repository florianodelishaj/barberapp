/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#1C1C1C',
        surface: '#242424',
        accent: '#FA3D3B',
        'text-primary': '#F0F0F0',
        'text-secondary': '#C6C6C6',
        'text-muted': '#444444',
        success: '#4CD98A',
      },
      fontFamily: {
        'sora-light': ['Sora_300Light'],
        'sora': ['Sora_400Regular'],
        'sora-semibold': ['Sora_600SemiBold'],
        'sora-bold': ['Sora_700Bold'],
        'sora-extrabold': ['Sora_800ExtraBold'],
      },
      borderRadius: {
        'input': '28px',
        'card': '16px',
        'pill': '100px',
      },
    },
  },
  plugins: [],
};
