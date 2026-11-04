/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#070707',
        ink: '#ececec',
        mid: '#8b8b8b',
        line: '#2b2b2b',
        bodyCopy: '#c9c9c9',
        softCopy: '#bdbdbd',
        inputBorder: '#3a3a3a',
        pureBlack: '#000',
        white: '#fff',
        solidShadow: '#4a4a4a',
      },
      fontFamily: {
        display: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        utility: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        label: ['12px', { lineHeight: '16px', letterSpacing: '0.14em' }],
        body: ['14px', { lineHeight: '22px' }],
        bodyLarge: ['16px', { lineHeight: '24px' }],
        heading: ['20px', { lineHeight: '24px', letterSpacing: '-0.045em' }],
        headingLarge: ['28px', { lineHeight: '34px' }],
        display: ['40px', { lineHeight: '48px', letterSpacing: '-0.045em' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
        page: '20px',
        section: '40px',
      },
      borderRadius: {
        pill: '99px',
        panel: '10px',
        dock: '22px',
        playerCard: '16px',
        smallLogoBox: '12px',
        idCard: '28px',
      },
      borderWidth: {
        1: '1px',
      },
    },
  },
  plugins: [],
}
