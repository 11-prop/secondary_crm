import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function parseAllowedHosts(rawValue) {
  if (!rawValue) {
    return true
  }

  const hosts = rawValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

  return hosts.length > 0 ? hosts : true
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const allowedHosts = parseAllowedHosts(env.VITE_ALLOWED_HOSTS)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      allowedHosts,
    },
    preview: {
      host: '0.0.0.0',
      allowedHosts,
    },
  }
})
