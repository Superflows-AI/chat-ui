/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  important: true,
  plugins: [require("@tailwindcss/forms")],
  prefix: "sf-",
  theme: {
    extend: {
      colors: {
        gray: {
          850: "#171F2E",
        },
      },
      minWidth: {
        4: "1rem",
      },
      width: {
        18: "4.5rem",
        68: "17rem",
        120: "30rem",
        200: "50rem",
      },
      maxWidth: {
        40: "10rem",
        72: "18rem",
        88: "22rem",
        "1/2": "50%",
      },
      minHeight: {
        10: "2.5rem",
        12: "3rem",
        14: "3.5rem",
        16: "4rem",
        20: "5rem",
        40: "10rem",
      },
      height: {
        15: "3.75rem",
        120: "30rem",
      },
      maxHeight: {
        18: "4.5rem",
        21: "5.25rem",
        26: "6.5rem",
        35: "8.75rem",
      },
      fontSize: {
        little: "0.9325rem",
        "2xs": "0.625rem",
      },
      translate: {
        "1/8": "12.5%",
        "5/8": "62.5%",
      },
      spacing: {
        0.25: "0.0625rem",
        0.75: "0.1875rem",
        15: "3.75rem",
        29: "7.25rem",
      },
    },
  },
};
