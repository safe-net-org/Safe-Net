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
    name: 'SafeNet Guard',
    short_name: 'SafeNet Guard',
    description: 'AI-защита от фишинга в реальном времени. Определяет поддельные сайты, IDN-homograph атаки и тайпсквоттинг.',
    version: '0.1.0',
    permissions: ['webNavigation', 'tabs', 'storage', 'activeTab', 'scripting'],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: 'SafeNet Guard — открыть панель',
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
