const {check} = require('express-validator');

exports.contactFormValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('İsim gerekli'),
    check('email')
        .isEmail()
        .withMessage('Geçerli bir e-posta adresi gerekli'),
    check('message')
        .not()
        .isEmpty()
        .isLength({min: 5})
        .withMessage('Mesaj uzunluğu en az 5 karakter olmalı')
];