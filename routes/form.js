const express = require('express');
const router = express.Router();
const { contactForm, contactProductAuthorForm } = require('../controllers/form');

//validators
const {runValidation} = require('../validators');
const {contactFormValidator} = require('../validators/form');

router.post('/contact', contactFormValidator, runValidation, contactForm);
router.post('/contact-product-author', contactFormValidator, runValidation, contactProductAuthorForm);

module.exports = router;