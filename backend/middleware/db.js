const mongoose = require('mongoose')

let isConnected = false

const connectDB = async () => {
  if (isConnected) return

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI

  if (!uri) {
    console.error('[MongoDB] No MONGODB_URI set in environment variables')
    return
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS:          45000,
    })
    isConnected = true
    console.log('[MongoDB] Connected successfully')
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message)
    // Do NOT call process.exit(1) — Railway restarts the container
    // which can cause crash loops if Atlas is temporarily unavailable.
    // The server stays up; requests that need DB will fail with 500.
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false
  console.warn('[MongoDB] Disconnected — will reconnect on next request')
})

mongoose.connection.on('reconnected', () => {
  isConnected = true
  console.log('[MongoDB] Reconnected')
})

module.exports = connectDB
