const Joi = require('joi')
const bcrypt = require('bcrypt')
const uuidv4 = require('uuid/v4')

function login ({ Credential, Session, SessionExpires }) {
  return async (req, res) => {
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
      const sessid = uuidv4()
      const expires = new Date()
      expires.setMilliseconds(expires.getMilliseconds() + SessionExpires)
      await Session.create({
        _id: sessid,
        userId: findResult._id,
        createdAt: new Date()
      })
      res.cookie('sessid', sessid, { expires })
      res.send({ code: 200, message: 'OK' })
    } catch (error) {
      res.send({ code: 500 })
    }
  }
}

module.exports = login
