import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-solid', '@wxt-dev/auto-icons'],
  manifest: {
    default_locale: 'en',
    permissions: ['storage', 'tabs'],
  },
});
