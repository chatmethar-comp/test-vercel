import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default <Partial<Config>> {
  content: [
    "./app.vue",
    "./components/**/*.{js,vue}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        star: {
          "primary-red": {
            300: "#DB5461",
            500: "#A63446",
          },
          "neutral": {
            300: "#E8E8E8", 
            500: "#777777",
            700: "#201E1F",
          },
          "blue": {
            100: "#EAF1FD",
            200: "#D1E3FC",
          },
          "grad-linear": "linear-gradient(180deg, #A63446 0%, #DB5461 100%)",
        },
      },
    },
  },
  plugins: [],
};

