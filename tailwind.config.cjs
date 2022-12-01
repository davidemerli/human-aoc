/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bronze: "#C68E17",
        "bronze-light": "#F2E8C3",
        "bronze-dark": "#8B5E10",
        silver: "#C0C0C0",
        "silver-light": "#E5E5E5",
        "silver-dark": "#808080",
        gold: "#FFD700",
        "gold-light": "#FFF8E1",
        "gold-dark": "#C7A701",
      },
      // add text shadow classes
      textShadow: {
        default: "0 2px 5px rgba(0, 0, 0, 0.5)",
        lg: "0 2px 10px rgba(0, 0, 0, 0.5)",
      }
    },
  },
  plugins: [require("daisyui")],
  important: true
};
