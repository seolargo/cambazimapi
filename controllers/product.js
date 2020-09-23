const Product = require('../models/product');
const User = require('../models/user');

const formidable = require('formidable');
const slugify = require('slugify');
const stripHtml = require('string-strip-html');
const _ = require('lodash');
const { errorHandler } = require('../helpers/dbErrorHandler');
const fs = require('fs');
const { smartTrim } = require('../helpers/product');
const { search } = require('../routes/product');

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        //console.log(fields);
        
        //***console.log(JSON.stringify(files.photo1));
        
        //console.log(typeof files); //type: object
        //console.log(Buffer.from(files.photo, "base64"));
        if (err) {
            return res.status(400).json({
                error: 'Resim yüklenemedi'
            });
        }

        const { 
            title, 
            body, 
            price, 
            quantity,  
            age,

            city, 
            town,
            village, 
            
            sellerAddress,
            sellerCellphone,

            sellerType, 
            estimatedWeight, 
            animalType, 
            poultry, 
            animalSubCategories, 
            animalVariety
        } = fields;

        if (!title || !title.length) {
            return res.status(400).json({
                error: 'İlan başlığı girmeniz gerekiyor'
            });
        }

        let product = new Product();
        product.title = title;
        product.body = body;
        //product.excerpt = smartTrim(body, 320, ' ', ' ...');
        product.slug = slugify(title).toLowerCase();
        product.mtitle = `${title} | ${process.env.APP_NAME}`;
        product.mdesc = stripHtml(body.substring(0, 160));
        product.postedBy = req.user._id;
        product.createdAt = req.user.createdAt;

        product.price = price;
        product.quantity = quantity;
        product.age = age;

        product.city = city;
        product.town = town;
        product.village = village;

        product.sellerAddress = sellerAddress;
        product.sellerCellphone = sellerCellphone;

        product.sellerType = sellerType;
        product.estimatedWeight = estimatedWeight;
        product.animalType = animalType;
        product.poultry = poultry;
        product.animalSubCategories = animalSubCategories;
        product.animalVariety = animalVariety;
        //blog.photo.data = 
        // categories and tags
        //let arrayOfCategories = categories && categories.split(',');
        //let arrayOfTags = tags && tags.split(',');

        /* PHOTOS CHECK */
        if (files.photo1) {
            if (files.photo1.size > 10000000) {
                return res.status(400).json({
                    error: 'Resmin boyutu 1MBden daha az olmalıdır'
                });
            }
            product.photo1.data = fs.readFileSync(files.photo1.path);
            product.photo1.contentType = files.photo1.type;
        }
        if (files.photo2) {
            if (files.photo2.size > 10000000) {
                return res.status(400).json({
                    error: 'Resmin boyutu 1MBden daha az olmalıdır'
                });
            }
            product.photo2.data = fs.readFileSync(files.photo2.path);
            product.photo2.contentType = files.photo2.type;
        }
        if (files.photo3) {
            if (files.photo3.size > 10000000) {
                return res.status(400).json({
                    error: 'Resmin boyutu 1MBden daha az olmalıdır'
                });
            }
            product.photo3.data = fs.readFileSync(files.photo3.path);
            product.photo3.contentType = files.photo3.type;
        }
        if (files.photo4) {
            if (files.photo4.size > 10000000) {
                return res.status(400).json({
                    error: 'Resmin boyutu 1MBden daha az olmalıdır'
                });
            }
            product.photo4.data = fs.readFileSync(files.photo4.path);
            product.photo4.contentType = files.photo4.type;
        }
        if (files.photo5) {
            if (files.photo5.size > 10000000) {
                return res.status(400).json({
                    error: 'Resmin boyutu 1MBden daha az olmalıdır'
                });
            }
            product.photo5.data = fs.readFileSync(files.photo5.path);
            product.photo5.contentType = files.photo5.type;
        }
        if (files.photo6) {
            if (files.photo6.size > 10000000) {
                return res.status(400).json({
                    error: 'Resmin boyutu 1MBden daha az olmalıdır'
                });
            }
            product.photo6.data = fs.readFileSync(files.photo6.path);
            product.photo6.contentType = files.photo6.type;
        }

        product.save((err, result) => {
            console.log('PRODUCT CREATE ERROR: ', err);
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });

    });
};

exports.productById = (req, res, next, id) => {
    Product.findById(id)
        .populate('categories')
        .exec((err, product) => {
            if (err || !product) {
                return res.status(400).json({
                    error: 'Product not found'
                });
            }
            req.product = product;
            next();
        });
};

/*exports.list = (req, res) => {
    //Product.find() --> This will give us the all products.
    Product.find({})
        .populate('categories', '_id name slug') //what fields you want to populate
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .select('_id title slug excerpt categories tags postedBy createdAt updatedAt price quantity age city town sellerType estimatedWeight animalType poultry animalSubCategories animalVariety')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
};*/

exports.list = (req, res) => {
    let order = req.query.order ? req.query.order : 'desc';
    let sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt';
    let limit = req.query.limit ? parseInt(req.query.limit) : 50;

    Product.find()
        .select('-photo1 -photo2 -photo3 -photo4 -photo5 -photo6')
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: 'Products not found'
                });
            }
            res.json(products);
        });
};

exports.listAllProducts = async (req, res) => {
    //If we do not use POST method, we do not have access to body.
    let limit = req.body.limit ? parseInt(req.body.limit) : 8;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let products;

    Product.find({})
        .populate('postedBy', '_id name username profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('_id title slug excerpt categories postedBy createdAt updatedAt price quantity age city town village sellerType sellerCellphone sellerAddress estimatedWeight animalType poultry animalSubCategories animalVariety')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            products = data;
            res.json({ products, size: products.length });
        });
};

// We can return the single product with this method.
exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    
    Product.findOne({ slug })
        // .select("-photo") You do not send photo.
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')
        .select('_id title body slug mtitle mdesc categories tags postedBy createdAt updatedAt price quantity age city town village sellerType sellerCellphone sellerAddress estimatedWeight animalType poultry animalSubCategories animalVariety')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
};

/**
 ** REMOVE
 **/
// Delete a product.
exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Product.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'İlan silindi'
        });
    });
};

/**
 ** UPDATE
 **/
exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Product.findOne({ slug }).exec((err, oldProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        let form = new formidable.IncomingForm();
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {
            //console.log('fields: ', fields);
            //console.log('files: ', files);
            if (err) {
                return res.status(400).json({
                    error: 'Resim yüklenemiyor'
                });
            }

            let slugBeforeMerge = oldProduct.slug;
            oldProduct = _.merge(oldProduct, fields);
            oldProduct.slug = slugBeforeMerge;

            const { body, desc } = fields;
            //console.log('fields: ', fields);

            if (body) {
                //oldProduct.excerpt = smartTrim(body, 320, ' ', ' ...');
                oldProduct.desc = stripHtml(body.substring(0, 160));
            }

            if (files.photo1) {
                if (files.photo1.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldProduct.photo1.data = fs.readFileSync(files.photo1.path);
                oldProduct.photo1.contentType = files.photo1.type;
            }

            if (files.photo2) {
                if (files.photo2.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldProduct.photo2.data = fs.readFileSync(files.photo2.path);
                oldProduct.photo2.contentType = files.photo2.type;
            }

            if (files.photo3) {
                if (files.photo3.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldProduct.photo3.data = fs.readFileSync(files.photo3.path);
                oldProduct.photo3.contentType = files.photo3.type;
            }

            if (files.photo4) {
                if (files.photo4.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldProduct.photo4.data = fs.readFileSync(files.photo4.path);
                oldProduct.photo4.contentType = files.photo4.type;
            }

            if (files.photo5) {
                if (files.photo5.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldProduct.photo5.data = fs.readFileSync(files.photo5.path);
                oldProduct.photo5.contentType = files.photo5.type;
            }

            if (files.photo6) {
                if (files.photo6.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldProduct.photo6.data = fs.readFileSync(files.photo6.path);
                oldProduct.photo6.contentType = files.photo6.type;
            }

            oldProduct.save((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                // result.photo = undefined;
                res.json(result);
            });
        });
    });
};

/***************************PHOTOS**************************************/
exports.photo1 = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Product.findOne({ slug })
        .select('photo1')
        .exec((err, product) => {
            if (err || !product) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', product.photo1.contentType);
            return res.send(product.photo1.data);
        });
};

exports.photo2 = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Product.findOne({ slug })
        .select('photo2')
        .exec((err, product) => {
            if (err || !product) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', product.photo2.contentType);
            return res.send(product.photo2.data);
        });
};

exports.photo3 = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    console.log(slug);
    Product.findOne({ slug })
        .select('photo3')
        .exec((err, product) => {
            if (err || !product) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', product.photo3.contentType);
            return res.send(product.photo3.data);
        });
};

exports.photo4 = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Product.findOne({ slug })
        .select('photo4')
        .exec((err, product) => {
            if (err || !product) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', product.photo4.contentType);
            return res.send(product.photo4.data);
        });
};

exports.photo5 = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Product.findOne({ slug })
        .select('photo5')
        .exec((err, product) => {
            if (err || !product) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', product.photo5.contentType);
            return res.send(product.photo5.data);
        });
};

exports.photo6 = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Product.findOne({ slug })
        .select('photo6')
        .exec((err, product) => {
            if (err || !product) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.set('Content-Type', product.photo6.contentType);
            return res.send(product.photo6.data);
        });
};
/***********************************************************************/

/**
 ** SEARCH IN TOOLBAR
 **/
exports.listSearch = (req, res) => {
    //console.log("query: ", req.query)
    const {search} = req.query;
    if (search) {
        Product.find({
            $or: [
                {title: {$regex: search, $options: 'i'}}, 
                {body: {$regex: search, $options: 'i'}}, 
                {city: {$regex: search, $options: 'i'}},
                {town: {$regex: search, $options: 'i'}},
                {village: {$regex: search, $options: 'i'}},
                {animalType: {$regex: search, $options: 'i'}},
                {poultry: {$regex: search, $options: 'i'}},
                {animalSubCategories: {$regex: search, $options: 'i'}},
                {animalVariety: {$regex: search, $options: 'i'}}
            ]
        }, (err, products) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(products);
        }).select('-photo1 -photo2 -photo3 -photo4 -photo5 -photo6 -body');
    }
}

exports.listByUser = (req, res) => {
    User.findOne({username: req.params.username}).exec((err, user) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            })
        }
        //If no err, means we have found the user.
        let userId = user._id
        Product.find({postedBy: userId})
            .populate('postedBy', '_id name username')
            .select('_id title slug postedBy createdAt updatedAt price quantity age city town village sellerType sellerAddress sellerCellphone estimatedWeight animalType poultry animalSubCategories animalVariety')
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(data);
            })
    });
};

exports.listBySearch = (req, res) => {
    //Mongoose query
    //let order = req.body.order ? req.body.order : "desc";
    //let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    /*let minutes4 = new Date().getMinutes();
    let seconds4 = new Date().getSeconds()
    console.log('minutes: ', minutes4);
    console.log('seconds: ', seconds4);*/
    let order = req.body.order ? req.body.order : "asc";
    //console.log('order: ', order); //ascending
    let sortBy = ("price");
    //console.log('sortby: ', sortBy);
    let limit = req.body.limit ? parseInt(req.body.limit) : 8;
    //console.log('limit: ', limit); //50
    let skip = parseInt(req.body.skip);
    //console.log('skip: ', skip) //0
    let findArgs = {};

    /*************************************************************************
                                PRODUCT SEARCH HERE
    **************************************************************************/
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key==="price") {
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
    /*let minutes5 = new Date().getMinutes();
    let seconds5 = new Date().getSeconds()
    console.log('minutes: ', minutes5);
    console.log('seconds: ', seconds5);*/

    Product.find(findArgs)
        .select('_id title price slug createdAt city town village sellerCellphone sellerAddress animalType poultry animalSubCategories animalVariety')
        //.populate('categories')
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: 'Products not found'
                });
            }
            res.json({
                size: data.length,
                data
            });
        });

    /*let minutes6 = new Date().getMinutes();
    let seconds6 = new Date().getSeconds()
    console.log('minutes: ', minutes6);
    console.log('seconds: ', seconds6);*/
}