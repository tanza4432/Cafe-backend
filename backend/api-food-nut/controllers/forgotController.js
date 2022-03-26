'use strict'

const firebase = require('../db')
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
const firestore = firebase.firestore()

dotenv.config()

const { EMAIL, PASSWORD } = process.env

const sendEmail = async (req, res, next) => {
  try {
    var val = Math.floor(1000 + Math.random() * 9000)
    const data = req.body
    const date_ob = new Date()
    const date = ('0' + date_ob.getDate()).slice(-2)
    const month = ('0' + (date_ob.getMonth() + 1)).slice(-2)
    const year = date_ob.getFullYear()
    const hours = date_ob.getHours()
    const minutes = date_ob.getMinutes()
    const seconds = date_ob.getSeconds()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL,
        pass: PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    var FROM_ADDRESS = EMAIL

    function PageSendEmail (data) {
      const page_email =
        '<p><b>บัญชีของคุณได้มีการร้องขอรีเซ็ตรหัสผ่านโปรดตรวจสอบข้อมูลให้ถูกต้อง</b></p>' +
        '<p>OTP : ' +
        data +
        '</p>'
      return page_email
    }

    let mailOptions = {
      from: FROM_ADDRESS,
      to: data.email,
      subject: 'ResetPassword',
      html: PageSendEmail(val)
    }

    const verify = Buffer.from(
      year +
        '-' +
        month +
        '-' +
        date +
        ' ' +
        hours +
        ':' +
        minutes +
        ':' +
        seconds +
        ' ' +
        data.email +
        '/' +
        val
    ).toString('base64')

    if (!res.headersSent) {
      transporter.sendMail(mailOptions, function (err, success) {
        if (err) {
          console.log(err)
        } else {
          console.log('Emaill send Successfully')
        }
      })
      await firestore
        .collection('forgotpassword')
        .doc()
        .set({ verify })
      return res.status(200).send(val.toString())
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

module.exports = {
  sendEmail
}
