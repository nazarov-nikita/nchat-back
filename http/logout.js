function logout ({ Session }) {
  return async (req, res) => {
    try {
      const { sessid } = req.cookies
      await Session.deleteOne({ _id: sessid })
      res.clearCookie('sessid')
      res.send({ code: 200, message: 'OK' })
    } catch (error) {
      res.send({ code: 500 })
    }
  }
}

module.exports = logout
