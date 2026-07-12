import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./providers/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        dark: "#050505",
        surface: "#0A0A0A",
        elevated: "#111111",
        border: "#1A1A1A",
        "border-light": "#222222",
        muted: "#555555",
        silver: "#9A9A9A",
        "off-white": "#F5F5F3",
        blue: {
          DEFAULT: "#0041F9",
          light: "#2558FF",
          dark: "#0030CC",
        },
        gold: "#C6AA72",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(5rem,14vw,18rem)", { lineHeight: "0.88", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(3.5rem,9vw,11rem)", { lineHeight: "0.9", letterSpacing: "-0.01em" }],
        "display-md": ["clamp(2.5rem,6vw,7rem)", { lineHeight: "0.92", letterSpacing: "0.02em" }],
        "display-sm": ["clamp(1.8rem,4vw,4.5rem)", { lineHeight: "0.95" }],
      },
      spacing: {
        section: "clamp(80px,12vh,160px)",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "float-delay": "float 8s ease-in-out 2s infinite",
        "float-slow": "float 12s ease-in-out infinite",
        grain: "grain 0.4s steps(1) infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "line-grow": "lineGrow 1.2s cubic-bezier(0.16,1,0.3,1) forwards",
        shimmer: "shimmer 2.5s ease-in-out infinite",
        "scroll-down": "scrollDown 2.2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-18px) rotate(1deg)" },
          "66%": { transform: "translateY(-8px) rotate(-0.5deg)" },
        },
        grain: {
          "0%,100%": { transform: "translate(0,0)" },
          "10%": { transform: "translate(-2%,-3%)" },
          "20%": { transform: "translate(3%,2%)" },
          "30%": { transform: "translate(-1%,4%)" },
          "40%": { transform: "translate(4%,-1%)" },
          "50%": { transform: "translate(-3%,3%)" },
          "60%": { transform: "translate(2%,-2%)" },
          "70%": { transform: "translate(-4%,1%)" },
          "80%": { transform: "translate(1%,-4%)" },
          "90%": { transform: "translate(-2%,2%)" },
        },
        pulseGlow: {
          "0%,100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.08)" },
        },
        lineGrow: {
          from: { scaleX: "0" },
          to: { scaleX: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        scrollDown: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "70%": { transform: "translateY(22px)", opacity: "0" },
          "71%": { transform: "translateY(-22px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backgroundImage: {
        "blue-radial": "radial-gradient(ellipse at center, #0041F9 0%, transparent 70%)",
        "gold-radial": "radial-gradient(ellipse at center, #C6AA72 0%, transparent 70%)",
        "shimmer-gradient":
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-expo": "cubic-bezier(0.7, 0, 0.84, 0)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1000": "1000ms",
        "1200": "1200ms",
      },
      zIndex: {
        cursor: "9999",
        overlay: "9990",
        modal: "9980",
        nav: "500",
        above: "10",
        base: "1",
      } as Record<string, string>,
    },
  },
  plugins: [],
};

export default config;
