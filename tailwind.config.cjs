/**
 * Tailwind CSS configuration
 *
 * - Enables class-based dark mode so `dark:` utilities respond to the `.dark` class
 *   (works with next-themes when `ThemeProvider attribute="class"` is used).
 * - Scans the app and components directories for class usage.
 *
 * Adjust the `content` globs if your source files live elsewhere.
 */

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add any custom tokens, spacing, or color overrides here.
      // Example:
      // colors: {
      //   primary: "#1E293B",
      // },
    },
  },
  plugins: [
    // Add Tailwind plugins here if you need them, e.g.:
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/forms'),
  ],
};
