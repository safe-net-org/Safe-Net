import { defineConfig } from 'wxt'

export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  dev: {
    server: {
      port: 3001,
    },
  },
  runner: {
    startUrls: ['http://localhost:3000'],
  },
  manifest: {
    default_locale: 'en',
    name: '__MSG_extensionName__',
    short_name: 'SafeNet Guard',
    description: '__MSG_extensionDescription__',
    version: '0.2.0',
    permissions: ['webNavigation', 'tabs', 'storage', 'activeTab', 'scripting'],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: '__MSG_actionTitle__',
    },
    commands: {
      'toggle-panel': {
        suggested_key: { default: 'Alt+Shift+S' },
        description: '__MSG_commandDescription__',
      },
    },
    web_accessible_resources: [
      {
        resources: ['sidebar.html'],
        matches: ['<all_urls>'],
      },
    ],
    icons: {
      '16': 'icon16.png',
      '48': 'icon48.png',
      '128': 'icon128.png',
    },
  },
})
