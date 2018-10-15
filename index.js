const mongoose = require('mongoose')
const httpHandler = require('./http')
const socketHandler = require('./socket')
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

const MessageSchema = new mongoose.Schema({
  _id: String,
  id: String,
  from: String,
  createdAt: String,
  text: String
})

const Credential = mongoose.model('Credential', CredSchema)
const Session = mongoose.model('Session', SessionSchema)
const Message = mongoose.model('Message', MessageSchema)

const options = {
  cert: fs.readFileSync('./cert/certificate.pem'),
  key: fs.readFileSync('./cert/private.pem')
}
const app = express()

const httpsServer = https.createServer(options, app)

httpsServer.listen(3000)

const io = socketio.listen(httpsServer)
httpHandler({ app, Credential, Session, SessionExpires })
socketHandler({ io, Session, Message })
