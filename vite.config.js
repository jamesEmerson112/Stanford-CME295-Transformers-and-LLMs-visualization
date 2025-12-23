import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get the project from command line args or default to architecture
const project = process.env.PROJECT || 'architecture'

const projectPaths = {
  architecture: './lecture 1 architecture visualization',
  attention: './lecture 1 attention mechanism',
  rotary: './lecture 2 rotary position embeddings',
  ropemath: './lecture 2b rope math'
}

export default defineConfig({
  plugins: [react()],
  root: projectPaths[project] || projectPaths.architecture,
  build: {
    outDir: `../../dist/${project}`
  }
})
