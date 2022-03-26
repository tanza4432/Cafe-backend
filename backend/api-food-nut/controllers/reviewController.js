'use strict'

const firebase = require('../db')
const firestore = firebase.firestore()
const StoreModel = require('../models/store')
const storage = require('../storage')
const bucket = storage.bucket()

const commentImgReview = async (req, res, next) => {
  try {
    const id = req.params.id
    var result = []
    const folder = 'image-' + id
    for (var i = 0; i < req.files.length; i++) {
      const filename = `${folder}/${Date.now() + i}`
      const fileupload = bucket.file(filename)
      const file = bucket.file(`image-${id}/${filename.split('/')[1]}`)
      const link =
        'https://firebasestorage.googleapis.com/v0' +
        file.parent.baseUrl +
        '/' +
        file.parent.name +
        file.baseUrl +
        '/image-' +
        id +
        '%2F' +
        filename.split('/')[1] +
        '?alt=media'

      const blobStream = fileupload.createWriteStream({
        metadata: {
          contentType: req.files[i].mimetype,
          nane: filename
        }
      })

      blobStream.on('error', err => {
        return res.status(405).json(err)
      })

      blobStream.on('finish', async () => {})

      blobStream.end(req.files[i].buffer)
      result.push(link)
    }

    return res.status(200).send(result)
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const commentReview = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = req.body
    const store = await firestore
      .collection('review')
      .where('idstore', '==', id)
    const set_data = await store.get()
    var result = set_data.docs[0].data()
    result.data.push(data)
    await firestore
      .collection('review')
      .doc(set_data.docs[0].id)
      .update(result)
    res.status(200).send(result)
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const commentLike = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = req.body
    const store = await firestore
      .collection('review')
      .where('idstore', '==', id)
    const set_data = await store.get()
    var result = set_data.docs[0].data()
    result.data.push(data)
    await firestore
      .collection('review')
      .doc(set_data.docs[0].id)
      .update(result)
    res.status(200).send(result)
  } catch (error) {
    res.status(400).send(error.message)
  }
}

module.exports = {
  commentImgReview,
  commentReview,
  commentLike
}
