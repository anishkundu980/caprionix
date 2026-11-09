import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
dotenv.config()
const seed = JSON.parse(readFileSync(new URL('./products.json', import.meta.url)))
const Product = mongoose.model('Product', new mongoose.Schema({
  id: String, category: String, name: String, scent: String, size: String,
  price: Number, image: String, accent: String, soft: String, blurb: String
}))
const app = express()
app.use(cors(), express.json())
app.get('/api/products', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json(seed)
    if (!(await Product.countDocuments())) await Product.insertMany(seed)
    res.json(await Product.find({}, '-_id -__v').lean())
  } catch { res.json(seed) }
})
const port = process.env.PORT || 5000
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/caprionix')
  .catch(() => console.log('MongoDB unavailable, serving bundled product data'))
app.listen(port, () => console.log(`API on http://localhost:${port}`))
