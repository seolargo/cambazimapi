const {check} = require('express-validator');

exports.userSignupValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('email')
        .isEmail()
        .withMessage('Lütfen doğru bir e-posta adresi giriniz')
        .matches(
            /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
        )
        .withMessage('Lütfen doğru bir e-posta adresi giriniz')
        .isLength({
            min: 4,
            max: 32
        }),
    check('password')
        .isLength({min: 6, max: 32})
        .withMessage('Şifreniz en az 6 karakter olmalıdır')   
        .matches(/\d/)
        .withMessage('Şifrenizde en az bir rakam olmalıdır')
];

exports.userSigninValidator = [
    check('email')
        .isEmail()
        .withMessage('Lütfen doğru bir e-posta adresi giriniz'),
    check('password')
        .isLength({min: 6})
        .withMessage('Şifreniz en az 6 karakter olmalıdır')
];

exports.forgotPasswordValidator = [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Lütfen doğru bir e-posta adresi giriniz')
];

exports.resetPasswordValidator = [
    check('newPassword')
        .isLength({min: 6})
        .withMessage('Şifreniz en az 6 karakter olmalıdır')
];