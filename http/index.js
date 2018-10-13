const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const login = require('./login')
const registration = require('./registration')
const logout = require('./logout')

module.exports = (deps) => {
  const { app } = deps
  var corsOptions = {
    origin: 'https://nikkita.ru',
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
  app.use(cookieParser())
  app.use(cors(corsOptions))
  app.use(bodyParser.json())
  app.post('/login', login(deps))
  app.post('/reg', registration(deps))
  app.get('/logout', logout(deps))
}
