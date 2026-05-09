import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  define:{
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    },
    allowedHosts: ['d99f04fe9dc6.ngrok-free.app'], // 👈 tu subdominio ngrok
    //host: '0.0.0.0', // opcional, para que escuche en todas las interfaces
    port: 5173      // o el puerto que estés usando
  },


  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
