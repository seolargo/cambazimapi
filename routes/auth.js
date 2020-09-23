const express = require('express');
const router = express.Router();
const { 
    signup, 
    signin, 
    signout, 
    requireSignin, 
    forgotPassword, 
    resetPassword,
    preSignup,
    googleLogin
} = require('../controllers/auth');

//validators
const {runValidation} = require('../validators');
const { 
    userSignupValidator, 
    userSigninValidator, 
    forgotPasswordValidator, 
    resetPasswordValidator
} = require('../validators/auth');

//Sign-up
router.post('/pre-signup', userSignupValidator, runValidation, preSignup);
router.post('/signup', signup);
//Sign-in
router.post('/signin', userSigninValidator, runValidation, signin);
//Sign-out
router.get('/signout', signout);
//Password (forget & reset)
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword);
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword);
//Google login
router.post('/google-login', googleLogin);

/*router.get('/secret', requireSignin, (req, res) => {
    res.json({
        user: req.user
    });
});*/

module.exports = router;