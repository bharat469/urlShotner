const Url = require("../model/urlModel");
const Analytic = require('../model/analyticsModel')
const {isValidUrl} = require("../helper");
const { nanoid } = require("nanoid");
const UAParser = require('ua-parser-js')

async function urlShotner(req, res) {
  if (!req.body.url || !isValidUrl(req.body.url)) {
    return res.status(400).json({ status: "Please provide valid information" });
  }

  const duplicateValue = await Url.findOne({
    originalUrl: req.body.url,
    userId: req.user.id,
  })

  if (duplicateValue) {
    return res.status(200).json({
      status: "Record already present",
      value: duplicateValue.shortUrl,
    })
  }

  try {
    const shortUrl = nanoid(4)
    const url = await Url.create({
      userId: req.user.id,
      shortUrl,
      originalUrl: req.body.url,
    })
    
    return res.status(201).json({ status: "Successfully created short url", value: shortUrl })
  } catch (e) {
    return res.status(400).json({ status: "Please provide valid information" })
  }
}

async function urlRedirect(req, res) {
  if (!req.params.shotUrl) {
    return res.status(400).json({ status: "Please provide valid information" });
  }

  const urlPresent = await Url.findOne({ shortUrl: req.params.shotUrl });
  if (!urlPresent) {
    return res.status(404).json({ status: "Please provide valid information" });
  }

  const userAgent = req.headers["user-agent"]
  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  try {
    await Url.findByIdAndUpdate(urlPresent._id, { $inc: { clickCount: 1 } })
    await Analytic.create({
      userId: urlPresent.userId,
      shortUrl: urlPresent.shortUrl,
      lastVisitedAt: new Date().toLocaleString("en-IN"),
      ip: req.ip,
      browser: result.browser.name,
      device: `${result.device.model} ${result.device.vendor}`,
      os: result.os.name,
    })

    return res.redirect(urlPresent.originalUrl)
  } catch (e) {
    return res.status(404).json({ status: "Please provide valid information", error: e })
  }
}

async function getAnalytics(req, res) {
  const userUrls = await Url.find({ userId: req.user.id }).select('shortUrl')
  const shortCodes = userUrls.map((url) => url.shortUrl)
  const analytics = await Analytic.find({ shortUrl: { $in: shortCodes } })
  return res.status(200).json({ status: "success", data: analytics })
}

async function getAllUrls(req, res) {
  const urls = await Url.find({ userId: req.user.id })
  return res.status(200).json({ status: "success", data: urls })
}

async function redirectProtected(req, res) {
  if (!req.params.shotUrl) {
    return res.status(400).json({ status: "Please provide valid information" });
  }

  const urlPresent = await Url.findOne({ shortUrl: req.params.shotUrl, userId: req.user.id });
  if (!urlPresent) {
    return res.status(404).json({ status: "Please provide valid information" });
  }

  const userAgent = req.headers["user-agent"]
  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  try {
    await Url.findByIdAndUpdate(urlPresent._id, { $inc: { clickCount: 1 } })
    await Analytic.create({
      userId: urlPresent.userId,
      shortUrl: urlPresent.shortUrl,
      lastVisitedAt: new Date().toLocaleString("en-IN"),
      ip: req.ip,
      browser: result.browser.name,
      device: `${result.device.model} ${result.device.vendor}`,
      os: result.os.name,
    })

    return res.status(200).json({ status: "success", redirectUrl: urlPresent.originalUrl })
  } catch (e) {
    return res.status(500).json({ status: "Unable to process redirect", error: e.message || e })
  }
}

module.exports = { urlShotner, urlRedirect, getAnalytics, getAllUrls, redirectProtected };
