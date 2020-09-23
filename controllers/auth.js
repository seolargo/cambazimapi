const User = require('../models/user');
const Blog = require('../models/blog');
const Product = require('../models/product'); 

const shortId = require('shortid');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { errorHandler } = require('../helpers/dbErrorHandler');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const _ = require('lodash');
const fetch = require('node-fetch');
const {OAuth2Client} = require('google-auth-library');
const { response } = require('express');

exports.preSignup = (req, res) => {
    const {name, email, password} = req.body;
    User.findOne({email: email.toLowerCase()}, (err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Bu e-posta ile daha önceden kayıtlı bir kullanıcımız var'
            })
        }
        const token = jwt.sign({name, email, password}, process.env.JWT_ACCOUNT_ACTIVATION, {expiresIn: '10m'});
        
        //email
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Hesap doğrulama linki`,
            html: `
                <p>Lütfen aşağıdaki linki kullanarak hesabınızı doğrulayın: </p>
                <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
                <hr />
                <p>http://cambazim.com</p>
            `
        };

        sgMail.send(emailData).then(sent => {
            return res.json({
                message: `${email} isimli e-posta adresinize bir e-posta gönderdik. Yönergeleri izleyerek hesabınızı aktif hale getirebilirsiniz`
            })
        })
    });
}

exports.read = (req, res) => {
    req.profile.hashed_password = undefined;
    return res.json(req.profile);
};

exports.signup = (req, res) => {
    const token = req.body.token;
    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
            if(err) {
                return res.status(401).json({
                    error: 'Tüh :( Tekrardan kayıt olun'
                })
            }

            const {name, email, password} = jwt.decode(token);
            
            let username = shortId.generate();
            let profile = `${process.env.CLIENT_URL}/profile/${username}`;

            const user = new User({name, email, password, profile, username});
            user.save((err, user) => {
                if(err) {
                    return res.status(401).json({
                        error: 'Tüh :( Tekrardan kayıt olun'
                    })
                }
                return res.json({
                    message: 'Başarılı bir şekilde kayıt oldunuz! Lütfen giriş yapın.'
                })
            });
        });
    }
    else {
        return res.json({
            message: 'Bir şeyler ters gitti :( Lütfen tekrar deneyin.'
        })
    }  
}

/*exports.signup = (req, res) => {
    User.findOne({email: req.body.email}).exec((err, user) => {
        if(user) {
            return res.status(400).json({
                error: 'Bu e-posta adresi ile zaten bir kaydımız var'
            });
        }

    const {name, email, password} = req.body;
    let username = shortId.generate();
    let profile = `${process.env.CLIENT_URL}/profile/${username}`;

    let newUser = new User({name, email, password, profile, username});
    newUser.save((err, success) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }  

        res.json({
            user: success
        });

        //res.json({
        //    message: 'Signup success! Please sign-in.'
        //});
    })
    })
};*/

exports.signin = (req, res) => {
    const {email, password} = req.body;
    
    User.findOne({email}).exec((err, user) => {
        if(err || !user) {
            return res.status(400).json({
                error: "Böyle bir e-posta adresine kayıtlı kullanıcı yok. Hadi, kayıt olun."
            });
        }
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: "E-posta ve şifre uyuşmuyor."
            });
        }
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});
        //console.log(token);
        res.cookie('token', token, {expiresIn: '1d'})
        const {_id, username, name, email, role} = user
        return res.json({
            token,
            user: {_id, username, name, email, role}
        });
    });
};

exports.signout = (req, res) => {
    res.clearCookie("token");
    res.json({
        message: "Çıkış yaptınız..."
    });
};

//Using expressJwt package, it checks for the valid token.
//If it is valid token, then it needs to authenticate.
exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    //userProperty: "auth",
    algorithms: ['HS256']
});
/* It will take the incoming tokens secret and it will compare with process.env.JWT_SECRET */

exports.authMiddleware = (req, res, next) => {
    const authUserId = req.user._id;
    User.findById({ _id: authUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'Böyle bir kullanıcı yok :/'
            });
        }
        req.profile = user;
        next();
    });
};

exports.adminMiddleware = (req, res, next) => {
    const adminUserId = req.user._id;
    User.findById({ _id: adminUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'Böyle bir admin yok :/'
            });
        }

        if (user.role !== 1) {
            return res.status(400).json({
                error: 'Admin kaynağına erişim sağlanamaz. Girişiniz reddedildi.'
            });
        }
        req.profile = user;
        next();
    });
};

exports.canUpdateDeleteBlog = (req, res, next) => {
    const slug = req.params.slug.toLowerCase()
    Blog.findOne({slug}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString()
        if(!authorizedUser) {   
            return res.status(400).json({
                error: 'Yetkili girişi yok'
            });
        }
        next();
    });
};

exports.canUpdateDeleteProduct = (req, res, next) => {
    const slug = req.params.slug.toLowerCase()
    Product.findOne({slug}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString()
        if(!authorizedUser) {   
            return res.status(400).json({
                error: 'Yetkili girişi yok'
            });
        }
        next();
    });
};

exports.forgotPassword = (req, res) => {
    const {email} = req.body
    User.findOne({email}, (err, user) => {
        if(err || !user) {
            return res.status(401).json({
                error: 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunmamaktadır'
            })
        }

        const token =jwt.sign({_id: user._id}, process.env.JWT_RESET_PASSWORD, {expiresIn: '10m'})
    
        //email
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Şifre sıfırlama linki | ${process.env.APP_NAME}`,
            html: `
                <h4>Aşağıdaki bağlantıya tıklayarak şifrenizi yenileyin: </h4>
                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                <hr />
                <p>http://cambazim.com</p>
            `
        };

        //populating the db > user > resetPasswordLink
        return user.updateOne({resetPasswordLink: token}, (err, success) => {
            if(err) {
                return res.json({error: errorHandler(err)})
            } else {
                sgMail.send(emailData).then(sent => {
                    return res.json({
                        message: `${email} e-posta adresinize kurtarma mesajınızı gönderdik. 10 dakika içerisinde lütfen bağlantıya tıklayın.`
                    })
                })
            }
            
        }) 
    })
} 

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err, decoded) {
            if (err) {
                return res.status(401).json({
                    error: 'Linke tıklamakta geç kaldınız :( Lütfen tekrar deneyin'
                });
            }
            User.findOne({ resetPasswordLink }, (err, user) => {
                if (err || !user) {
                    return res.status(401).json({
                        error: 'Bir problem var :( Daha sonra tekrar deneyin'
                    });
                }
                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                };

                user = _.extend(user, updatedFields);

                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }
                    res.json({
                        message: `Süper! Yeni şifreniz ile tekrar giriş yapın`
                    });
                });
            });
        });
    }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
    const idToken = req.body.tokenId;
    client.verifyIdToken({idToken, audience: process.env.GOOGLE_CLIENT_ID}).then(response => {
        //console.log(response)
        const {email_verified, name, email, jti} = response.payload
        if (email_verified) {
            User.findOne({email}).exec((err, user) => {
                if(user) {
                    //console.log(user);
                    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'})
                    res.cookie('token', token, {expiresIn: '1d'});
                    const {_id, email, name, role, username} = user;
                    return res.json({token, user: {_id, email, name, role, username}})
                } else {
                    let username = shortId.generate()
                    let profile = `${process.env.CLIENT_URL}/profile/${username}}`
                    let password = jti + process.env.JWT_SECRET;
                    user = new User({name, email, profile, username, password});
                    user.save((err, data) => {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            })
                        } else {
                            //then we can generate the token
                            const token = jwt.sign({_id: data._id}, process.env.JWT_SECRET, {expiresIn: '1d'})
                            res.cookie('token', token, {expiresIn: '1d'});
                            const {_id, email, name, role, username} = user;
                            return res.json({token, user: {_id, email, name, role, username}})
                        }
                    });
                }
            });
        } else {
            return res.status(400).json({
                error: 'Google ile giriş yapılamıyor. Lütfen daha sonra tekrar deneyin!'
            })
        }
    })
}

exports.facebookLogin = (req, res) => {
    console.log('FACEBOOK LOGIN REQ BODY', req.body);
    const { userID, accessToken } = req.body;

    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

    return (
        fetch(url, {
            method: 'GET'
        })
            .then(response => response.json())
            // .then(response => console.log(response))
            .then(response => {
                const { email, name } = response;
                User.findOne({ email }).exec((err, user) => {
                    if (user) {
                        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                        const { _id, email, name, role } = user;
                        return res.json({
                            token,
                            user: { _id, email, name, role }
                        });
                    } else {
                        let password = email + process.env.JWT_SECRET;
                        user = new User({ name, email, password });
                        user.save((err, data) => {
                            if (err) {
                                console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err);
                                return res.status(400).json({
                                    error: 'User signup failed with facebook'
                                });
                            }
                            const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                            const { _id, email, name, role } = data;
                            return res.json({
                                token,
                                user: { _id, email, name, role }
                            });
                        });
                    }
                });
            })
            .catch(error => {
                res.json({
                    error: 'Facebook login failed. Try later'
                });
            })
    );
};