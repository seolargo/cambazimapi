const express = require('express');
const router = express.Router();

const {
    create,
    list,
    listAllProducts,
    read,
    remove,
    update,
    photo1,
    photo2,
    photo3,
    photo4,
    photo5,
    photo6,
    listSearch,
    listByUser,
    listBySearch
} = require('../controllers/product');

const { 
    requireSignin, 
    adminMiddleware, 
    authMiddleware, 
    canUpdateDeleteProduct 
} = require('../controllers/auth');

//products
router.get('/product/search', listSearch);
router.get('/products', list);
router.get('/product/:slug', read);

//Product photos
router.get('/product/photo1/:slug', photo1);
router.get('/product/photo2/:slug', photo2);
router.get('/product/photo3/:slug', photo3);
router.get('/product/photo4/:slug', photo4);
router.get('/product/photo5/:slug', photo5);
router.get('/product/photo6/:slug', photo6);

router.post('/product', requireSignin, adminMiddleware, create);
router.post('/productsAll', listAllProducts);
router.post('/products/by/search', listBySearch)

router.delete('/product/:slug', requireSignin, adminMiddleware, remove);

router.put('/product/:slug', requireSignin, adminMiddleware, update);

//user
router.post('/user/product', requireSignin, authMiddleware, create);
router.get('/:username/products', listByUser);
router.delete('/user/product/:slug', requireSignin, authMiddleware, canUpdateDeleteProduct, remove);
router.put('/user/product/:slug', requireSignin, authMiddleware, canUpdateDeleteProduct ,update);

router.get("/category/:id", read);

module.exports = router;