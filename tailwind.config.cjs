/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: ["*.{html, css, js}"],
    relative: true
  },
  safelist: [
    'bg-black',
    'bg-white',
    'bg-custom-white',
    'hover:bg-custom-white',
    'bg-custom-gray',
    'bg-stone-900',
    'border-blue-400',
    'bg-blue-400',
    'border-red-400',
    'bg-red-400',
    'bg-green-400',
    'w-[135px]',
    'h-[45px]',
  ],
  theme: {
    extend: {
      fontFamily: {
        'inconsolata': ["Inconsolata", "monospace"],
        'inika': ["Inika", "serif"],
      },
      container: {
        center: true,
        padding: "1rem",
        screens: {
          lg: "1024px",
          xl: "1024px",
          "2xl": "1024px",
        },
      },
      colors: {
        "custom-black": "#242424",
        "custom-black-2": "#2F2F2F",
        "custom-purple": "#646CFF",
        "custom-gray": "#999",
        "custom-white": "#a8a8a8",
        // ...color-name: color-code (hex/hsl/rgb/rgba/hsla...)
      },
    },
  },
  plugins: [
    'preflight'
  ],
};
