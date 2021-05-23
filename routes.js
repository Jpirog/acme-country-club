const express = require("express");
const router = express.Router();

const { 
  getMembers,
  getFacilities,
  getBookings
} = require('./db')

router.get('/facilities', async (req, res, next) => {
  try {
    res.header("Content-Type",'application/json');
    res.send(await getFacilities())
  }
  catch (err) {
    next(err)
  }
})

router.get('/bookings', async (req, res, next) => {
  try {
    res.header("Content-Type",'application/json');
    res.send(await getBookings())
  }
  catch (err) {
    next(err)
  }
})

router.get('/members', async (req, res, next) => {
  try {
    res.header("Content-Type",'application/json');
    res.send(await getMembers())
  }
  catch (err) {
    next(err)
  }
})

module.exports = router;