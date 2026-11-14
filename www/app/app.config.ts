export default defineAppConfig({
  ui: {
    colors: {
      primary: 'hub',
      secondary: 'zinc',
      accent: 'hub',
      success: 'green',
      info: 'sky',
      warning: 'amber',
      error: 'rose',
      neutral: 'zinc'
    }
    // Extend later, e.g. button overrides:
    // button: {
    //   slots: { base: 'font-display tracking-widest uppercase' },
    //   variants: { size: { lg: { base: 'px-8 py-3 text-lg' } } }
    // }
  }
})
