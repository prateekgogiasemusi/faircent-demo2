var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/individual', function(req, res, next) {
  res.render('individual');
});

router.get('/loan', function(req, res, next) {
  res.render('loan');
});

module.exports = router;
