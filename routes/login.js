/**
 * Created by lakshan on 11/5/16.
 */
var express = require('express');
var router = express.Router();

/* GET login page. */
router.get('/', function(req, res, next) {
    res.render('login', { title: 'WireMe-Login' });
});

module.exports = router;
