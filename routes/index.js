const express = require('express');
const router = express.Router();
const partnerController = require('../controller/partner')
const bodyParser = require('body-parser').json()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// router.post('/transactions/add', partnerController.addTransaction)
router.post('/transactions/add', partnerController.addTransaction)
router.post('/spend', partnerController.spend)
router.get('/all', partnerController.all)

module.exports = router;
