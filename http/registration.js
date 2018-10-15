const Joi = require('joi')
const bcrypt = require('bcrypt')
const uuidv4 = require('uuid/v4')

function registration ({ Credential, Session, SessionExpires }) {
  return async (req, res) => {
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
      const user = await Credential.create({
        email: credData.email,
        hash
      })
      const sessid = uuidv4()
      const expires = new Date()
      expires.setMinutes(expires.getMinutes() + SessionExpires)
      await Session.create({
        _id: sessid,
        userId: user._id,
        createdAt: new Date()
      })
      res.cookie('sessid', sessid, { expires })
      res.cookie('email', credData.email, { expires })
      res.send({
        code: 200,
        message: 'OK'
      })
    } catch (error) {
      console.log(error)
      res.send({ code: 500 })
    }
  }
}

module.exports = registration
