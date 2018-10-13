const mongoose = require('mongoose')
const httpHandler = require('./http')
const cookieLib = require('cookie')
const socketio = require('socket.io')

const fs = require('fs')
const https = require('https')
const express = require('express')

const SessionExpires = process.env.N_SESSION_EXPIRES || 1000 * 60 * 60 * 24

mongoose.connect('mongodb://localhost/nchat', {
  useNewUrlParser: true
})

const CredSchema = new mongoose.Schema({
  email: String,
  hash: String
})

const SessionSchema = new mongoose.Schema({
  _id: String,
  userId: String,
  createdAt: Date
})

const Credential = mongoose.model('Credential', CredSchema)
const Session = mongoose.model('Session', SessionSchema)

const options = {
  cert: fs.readFileSync('./cert/certificate.pem'),
  key: fs.readFileSync('./cert/private.pem')
}
const app = express()

httpHandler({ app, Credential, Session, SessionExpires })
const httpsServer = https.createServer(options, app)

httpsServer.listen(3000)

const io = socketio.listen(httpsServer)

io.use(async (socket, next) => {
  try {
    const { cookie } = socket.handshake.headers
    if (!cookie) throw new Error('sessid error')
    const sessid = cookieLib.parse(cookie).sessid
    if (!sessid) throw new Error('sessid error')
    const session = await Session.findOne({ _id: sessid })
    if (!session) throw new Error('sessid error')
    return next()
  } catch (error) {
    console.log(error.message)
    return next(error)
  }
})

io.on('connection', socket => {
})

// io.of('/').on('register')

// io.emit('hi', { for: 'everyone' })

// io.on('auth', socket => {

// })

// io.on('register', socket => {
//   console.log(socket)
// })
