const express = require('express')
const Multer = require('multer')
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})
const {
  addAccount,
  getAllAccount,
  Login,
  updateAccount,
  deleteAccount
} = require('../controllers/loginController')

const {
  getStore,
  addStore,
  updateStore,
  addimgStore,
  getStoreView,
  addimgStoreView,
  delimgStoreView,
  updateimgStoreView,
  getStoreByID
} = require('../controllers/storeController')

const {
  commentImgReview,
  commentReview,
  commentLike
} = require('../controllers/reviewController')

const { sendEmail } = require('../controllers/forgotController')

const router = express.Router()

router.get('/account', getAllAccount)
router.get('/account/:email/:password', Login)
router.post('/account', addAccount)
router.put('/account/:id', updateAccount)
router.delete('/account/:id', deleteAccount)

// forgot
router.post('/forgot', sendEmail)

// stores
router.get('/store', getStore)
router.get('/store/:id', getStoreByID)
router.post('/store/add', addStore)
router.put('/store/update/:id', updateStore)
router.post('/store/uploadimg/:id', multer.single('img'), addimgStore)

// storeView
router.get('/store/imgView', getStoreView)
router.post(
  '/store/uploadimgView/:id/:folderid',
  multer.single('img'),
  addimgStoreView
)
router.patch('/store/delimgView/:id/:index', delimgStoreView)
router.put(
  '/store/uploadimgView/:id/:folderid/:index',
  multer.single('img'),
  updateimgStoreView
)

// ReviewComment
router.post('/review/commentImg/:id', multer.array('img'), commentImgReview)
router.put('/review/comment/:id', commentReview)
router.put('/review/like/:id', commentLike)

module.exports = {
  routes: router
}
