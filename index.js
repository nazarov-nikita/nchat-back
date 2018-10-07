const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const Joi = require('joi')
const bcrypt = require('bcrypt')

const app = express()

mongoose.connect('mongodb://localhost/nchat', {
  useNewUrlParser: true
})

const CredSchema = new mongoose.Schema({
  email: String,
  hash: String
})

const Credential = mongoose.model('Credential', CredSchema)

var corsOptions = {
  origin: 'http://nikkita.ru',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))
app.use(bodyParser.json())

app.post('/login', async (req, res) => {
  try {
    const JoiSchema = Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
    const result = Joi.validate(req.body, JoiSchema)
    if (result.error) return res.send({ code: 400, message: result.error.details[0].message, data: result.error })
    const credData = result.value
    const findResult = await Credential.findOne({ email: credData.email })
    if (!findResult) return res.send({ code: 400, message: 'Email not found' })
    const compareResult = await bcrypt.compare(credData.password, findResult.hash)
    if (!compareResult) return res.send({ code: 400, message: 'Password is incorrect' })
    res.send({ code: 200, message: 'OK' })
  } catch (error) {
    res.send({ code: 500 })
  }
})

app.post('/reg', async (req, res) => {
  try {
    const JoiSchema = Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    })
    const result = Joi.validate(req.body, JoiSchema)
    if (result.error) return res.send({ code: 400, message: result.error.details[0].message, data: result.error })
    const credData = result.value
    const findResult = await Credential.find({ email: credData.email })
    if (findResult.length !== 0) return res.send({ code: 400, message: 'An account with this email already exists' })
    const hash = await bcrypt.hash(credData.password, 10)
    await Credential.create({
      email: credData.email,
      hash
    })
    res.send({
      code: 200,
      message: 'OK'
    })
  } catch (error) {
    console.log(error)
    res.send({ code: 500 })
  }
})

app.listen(3000, () => {
  console.log('3000 Port listened')
})


// const io = require('socket.io')(3000)

// io.on('connection', socket => {

// })

// io.of('/').on('register')

// io.emit('hi', { for: 'everyone' })

// io.on('auth', socket => {

// })

// io.on('register', socket => {
//   console.log(socket)
// })
