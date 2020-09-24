const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config()

//bring routes
const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const tagRoutes = require('./routes/tag');
const formRoutes = require('./routes/form');

const { requireSignin, adminMiddleware, authMiddleware } = require('./controllers/auth');

//app
const app = express()

//db
mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false})
.then(() => console.log('Database is connected...'));

//middlewares
app.use(morgan('dev'));
app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(cookieParser());
//cors
if (process.env.NODE_ENV === 'development') {
    app.use(cors({origin: `${process.env.CLIENT_URL}`}))
}


/*
    This works only between browsers to browsers.   
*/
if(process.env.NODE_ENV === 'development') {
    app.use(cors({origin: `${process.env.CLIENT_URL}`}));
}

//routes middleware
app.use('/api', blogRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', tagRoutes);
app.use('/api', formRoutes);

//port
/*
    Either pick from ENV or use 8000.
*/
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running port on: ${port}`)    
});


