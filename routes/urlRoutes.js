const express = require('express')
const { urlShotner, urlRedirect, redirectProtected, getAnalytics, getAllUrls } = require('../controller/urlController')
const { signInUserData, loginUser, refreshToken, getProfileData } = require('../controller/authController')
const auth = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/', auth, urlShotner)
router.get('/analytics', auth, getAnalytics)
router.get('/all', auth, getAllUrls)
router.get('/redirect/:shotUrl', auth, redirectProtected)
router.get('/profile', auth, getProfileData)
router.get('/:shotUrl', auth, urlRedirect)
router.post('/siginup', signInUserData)
router.post('/login', loginUser)
router.post('/refresh', refreshToken)

module.exports = router