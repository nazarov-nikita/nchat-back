const cookieLib = require('cookie')
const uuidv4 = require('uuid/v4')

module.exports = ({ Session, io, Message }) => {
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

  io.on('connection', async socket => {
    const email = cookieLib.parse(socket.handshake.headers.cookie).email
    console.log('connection', email)
    const users = {}
    Object.keys(io.sockets.connected).forEach(key => {
      const _socket = io.sockets.connected[key]
      const _email = cookieLib.parse(_socket.handshake.headers.cookie).email
      users[_email] = {
        name: _socket.id
      }
    })
    try {
      const messages = await Message.find()
      socket.emit('message.info', messages)
    } catch (error) {
      console.log(error)
    }
    socket.emit('users.info', users)
    io.sockets.emit('users.added', {
      socketId: socket.id,
      name: email
    })

    socket.on('disconnect', () => {
      console.log('disconnect', email)
      io.sockets.emit('users.removed', {
        socketId: socket.id
      })
    })

    socket.on('message.send', async data => {
      try {
        console.log('message.send', data)
        const id = uuidv4()
        const message = {
          from: email,
          text: data.text,
          createdAt: Date.now(),
          _id: id,
          id
        }
        await Message.create(message)
        io.sockets.emit('message.created', message)
      } catch (error) {
        console.log(error)
      }
    })
  })

  io.on('disconnect', socket => {

  })
}
// io.of('/').on('register')

// io.emit('hi', { for: 'everyone' })

// io.on('auth', socket => {

// })

// io.on('register', socket => {
//   console.log(socket)
// })
