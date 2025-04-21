import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 8080

// ✅ Root test route
app.get('/', (req, res) => {
  res.send('✅ v0Flow Agent is running!')
})

// ✅ Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// 🧠 Keep the app alive
app.listen(port, () => {
  console.log(`✅ Agent listening on port ${port}`)
})
