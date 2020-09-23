const express = require('express')
const router = express.Router()
const {
    create, 
    list, 
    listAllBlogsCategoriesTags, 
    read, 
    remove, 
    update, 
    photo, 
    listSearch,
    listByUser
} = require('../controllers/blog');

const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteBlog } = require('../controllers/auth');

//blogs
router.get('/blog/search', listSearch);
router.get('/blogs', list);
router.get('/blog/:slug', read);
router.get('/blog/photo/:slug', photo);

router.post('/blog', requireSignin, adminMiddleware, create);
router.post('/blogs-categories-tags', listAllBlogsCategoriesTags);

router.delete('/blog/:slug', requireSignin, adminMiddleware, remove);

router.put('/blog/:slug', requireSignin, adminMiddleware, update);

//user
router.post('/user/blog', requireSignin, authMiddleware, create);
router.get('/:username/blogs', listByUser);
router.delete('/user/blog/:slug', requireSignin, authMiddleware, canUpdateDeleteBlog, remove);
router.put('/user/blog/:slug', requireSignin, authMiddleware, canUpdateDeleteBlog ,update);

module.exports = router;