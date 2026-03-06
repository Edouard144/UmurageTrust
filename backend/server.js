// server.js
// Entry point — loads the TypeScript app via ts-node-dev
require('dotenv').config()

// Register ts-node so Node.js can understand TypeScript files
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
  },
})

// Now import the TypeScript app
const app = require('./src/app').default

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})