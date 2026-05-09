const mongoose = require('mongoose')

let isConnected = false

const connectDB = async () => {
  if (isConnected) return

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/master_computers'

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    isConnected = true
    console.log(`[MongoDB] Connected: ${uri}`)
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message)
    process.exit(1)
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false
  console.warn('[MongoDB] Disconnected')
})

module.exports = connectDB
