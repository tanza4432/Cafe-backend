'use strict'

const firebase = require('../db')
const Account = require('../models/login')
const firestore = firebase.firestore()
var md5 = require('md5')

const addAccount = async (req, res, next) => {
  try {
    const data = req.body
    const hashPassword = md5(data.password)
    const newdata = {
      email: data.email,
      id_store: data.id_store,
      name: data.name,
      password: hashPassword,
      status: data.status,
      tel: data.tel,
      type: data.type
    }
    await firestore
      .collection('account')
      .doc()
      .set(newdata)
    res.status(200).send('true')
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const getAllAccount = async (req, res, next) => {
  try {
    const account = await firestore.collection('account')
    const data = await account.get()
    const AccountArray = []
    if (data.empty) {
      res.status(404).send('ไม่พบข้อมูลใด')
    } else {
      data.forEach(doc => {
        const account = new Account(
          doc.id,
          doc.data().email,
          doc.data().id_store,
          doc.data().name,
          doc.data().tel,
          doc.data().type,
          doc.data().status
        )
        AccountArray.push(account)
      })
      res.send(AccountArray)
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const Login = async (req, res, next) => {
  try {
    const email = req.params.email
    const password = req.params.password
    const hashPassword = md5(password)
    const accounts = await firestore
      .collection('account')
      .where('email', '==', email)
      .where('password', '==', hashPassword)
    const fetchAccount = await accounts.get()
    if (fetchAccount.empty) {
      res.status(200).send({
        id: '',
        email: '',
        id_store: '',
        name: '',
        status: '',
        tel: '',
        type: '',
        verify: false
      })
    } else {
      return res.status(200).send({
        id: fetchAccount.docs[0].id,
        email: fetchAccount.docs[0].data().email,
        id_store: fetchAccount.docs[0].data().id_store,
        name: fetchAccount.docs[0].data().name,
        status: fetchAccount.docs[0].data().status,
        tel: fetchAccount.docs[0].data().tel,
        type: fetchAccount.docs[0].data().type,
        verify: true
      })
    }
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const updateAccount = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = req.body
    const Account = await firestore.collection('account').doc(id)
    await Account.update(data)
    res.send('แก้ไขข้อมูลแล้ว')
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const deleteAccount = async (req, res, next) => {
  try {
    const id = req.params.id
    await firestore
      .collection('account')
      .doc(id)
      .delete()
    res.send('ลบสำเร็จ')
  } catch (error) {
    res.status(400).send(error.message)
  }
}

module.exports = {
  addAccount,
  getAllAccount,
  Login,
  updateAccount,
  deleteAccount
}
