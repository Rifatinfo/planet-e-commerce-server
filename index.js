require('dotenv').config()
const cors = require('cors')
const express = require('express')
const app = express()
const port = process.env.PORT || 5000
app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
  res.send('PlantNet!')
})

app.listen(port, () => {
  console.log(`PlantNet on port ${port}`)
})
