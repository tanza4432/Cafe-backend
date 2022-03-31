'use strict'

const firebase = require('../db')
const firestore = firebase.firestore()
const StoreModel = require('../models/store')
const storage = require('../storage')
const bucket = storage.bucket()

const getStore = async (req, res, next) => {
  try {
    const store = await firestore.collection('stores')
    const data = await store.get()
    const storeArray = []
    if (data.empty) {
      return res.status(404).send('ไม่พบข้อมูลใด')
    }
    data.forEach(doc => {
      const fetchStore = new StoreModel(
        doc.id,
        doc.data().address,
        doc.data().idstore,
        doc.data().image,
        doc.data().latitude,
        doc.data().longitude,
        doc.data().name,
        doc.data().open,
        doc.data().tel,
        doc.data().total_review,
        doc.data().website
      )
      storeArray.push(fetchStore)
    })

    return res.status(200).send(storeArray)
  } catch (error) {
    return res.status(400).send(error)
  }
}

const getStoreByID = async (req, res, next) => {
  try {
    const id = req.params.id
    const Store = await firestore
      .collection('stores')
      .where('idstore', '==', id)
    const data = await Store.get()

    return res.status(200).send(data.data())
  } catch (error) {
    return res.status(400).send(error)
  }
}

const addStore = async (req, res, next) => {
  try {
    const data = req.body
    const addstore_img = {
      idstore: data.idstore,
      image: []
    }
    const addreview = {
      idstore: data.idstore,
      data: []
    }
    await firestore
      .collection('stores')
      .doc()
      .set(data)
    await firestore
      .collection('image_store')
      .doc()
      .set(addstore_img)
    await firestore
      .collection('review')
      .doc()
      .set(addreview)

    res.status(200).send('true')
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const updateStore = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = req.body
    const Store = await firestore.collection('stores').doc(id)
    await Store.update(data)
    res.status(200).send('อัพเดตข้อมูลแล้ว')
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const addimgStore = async (req, res, next) => {
  const id = req.params.id
  const folder = 'image-' + id
  const filename = `${folder}/${Date.now()}`
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
      contentType: req.file.mimetype,
      nane: filename
    }
  })

  blobStream.on('error', err => {
    return res.status(405).json(err)
  })

  blobStream.on('finish', async () => {
    const Store = await firestore
      .collection('stores')
      .where('idstore', '==', id)

    const data = await Store.get()
    var result = data.docs[0].data()
    result.image = link
    await firestore
      .collection('stores')
      .doc(data.docs[0].id)
      .update(result)
    return res.status(200).send(result)
  })

  blobStream.end(req.file.buffer)
}

const getStoreView = async (req, res, next) => {
  try {
    const store = await firestore.collection('image_store')
    const data = await store.get()
    const storeArray = []
    if (data.empty) {
      return res.status(404).send('ไม่พบข้อมูลใด')
    }
    data.forEach(doc => {
      const fetchStore = {
        id: doc.id,
        idstore: doc.data().idstore,
        image: doc.data().image
      }
      storeArray.push(fetchStore)
    })

    return res.status(200).send(storeArray)
  } catch (error) {
    return res.status(400).send(error)
  }
}

const addimgStoreView = async (req, res, next) => {
  const id = req.params.id
  const idfolder = req.params.folderid
  const folder = 'image-' + idfolder
  const filename = `${folder}/${Date.now()}`
  const fileupload = bucket.file(filename)
  const file = bucket.file(`image-${idfolder}/${filename.split('/')[1]}`)
  const link =
    'https://firebasestorage.googleapis.com/v0' +
    file.parent.baseUrl +
    '/' +
    file.parent.name +
    file.baseUrl +
    '/image-' +
    idfolder +
    '%2F' +
    filename.split('/')[1] +
    '?alt=media'
  const blobStream = fileupload.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
      nane: filename
    }
  })

  blobStream.on('error', err => {
    return res.status(405).json(err)
  })

  blobStream.on('finish', async () => {
    const Store = await firestore
      .collection('image_store')
      .where('idstore', '==', id)
    const data = await Store.get()
    var result = data.docs[0].data()
    result.image.push(link)
    await firestore
      .collection('image_store')
      .doc(data.docs[0].id)
      .update(result)
    return res.status(200).send(result)
  })

  blobStream.end(req.file.buffer)
}

const delimgStoreView = async (req, res, next) => {
  try {
    const id = req.params.id
    const index = req.params.index

    const Store = await firestore
      .collection('image_store')
      .where('idstore', '==', id)
    const data = await Store.get()
    var result = data.docs[0].data()
    result.image.splice(index, 1)
    await firestore
      .collection('image_store')
      .doc(data.docs[0].id)
      .update(result)

    res.status(200).send('อัพเดตข้อมูลสำเร็จ')
  } catch (error) {
    res.status(400).send(error.message)
  }
}

const updateimgStoreView = async (req, res, next) => {
  const id = req.params.id
  const idfolder = req.params.folderid
  const index = req.params.index
  const folder = 'image-' + idfolder
  const filename = `${folder}/${Date.now()}`
  const fileupload = bucket.file(filename)
  const file = bucket.file(`image-${idfolder}/${filename.split('/')[1]}`)
  const link =
    'https://firebasestorage.googleapis.com/v0' +
    file.parent.baseUrl +
    '/' +
    file.parent.name +
    file.baseUrl +
    '/image-' +
    idfolder +
    '%2F' +
    filename.split('/')[1] +
    '?alt=media'
  const blobStream = fileupload.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
      nane: filename
    }
  })

  blobStream.on('error', err => {
    return res.status(405).json(err)
  })

  blobStream.on('finish', async () => {
    const Store = await firestore
      .collection('image_store')
      .where('idstore', '==', id)
    const data = await Store.get()
    var result = data.docs[0].data()
    result.image[index] = link
    await firestore
      .collection('image_store')
      .doc(data.docs[0].id)
      .update(result)

    return res.status(200).send(result)
  })

  blobStream.end(req.file.buffer)
}

module.exports = {
  getStore,
  getStoreByID,
  addStore,
  updateStore,
  addimgStore,
  getStoreView,
  addimgStoreView,
  delimgStoreView,
  updateimgStoreView
}
