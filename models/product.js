const mongoose = require('mongoose');

const {ObjectId} = mongoose.Schema

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            min: 3,
            max: 160,
            required: true
        },
        slug: {
            type: String,
            unique: true,
            index: true
        },
        body: {
            type: {},
            required: true,
            min: 200,
            max: 200000
        },
        excerpt: {
            type: String,
            max: 1000
        },
        mtitle: {
            type: String
        },
        mdesc: {
            type: String
        },

        photo1: {
            data: Buffer,
            contentType: String
        },
        photo2: {
            data: Buffer,
            contentType: String
        },
        photo3: {
            data: Buffer,
            contentType: String
        },
        photo4: {
            data: Buffer,
            contentType: String
        },
        photo5: {
            data: Buffer,
            contentType: String
        },
        photo6: {
            data: Buffer,
            contentType: String
        },

        price: {
            type: Number,
            trim: true,
            required: false,
            maxlength: 32
        },
        quantity: {
            type: Number
        },
        age: {
            type: Number
        },
        
        city: {
            type: String
        },
        town: {
            type: String
        },
        village: {
            type: String
        },

        sellerCellphone: {
            type: String
        },
        sellerAddress: {
            type: String
        },
        
        latProduct: {
            type: String
        },
        lngProduct: {
            type: String
        },

        sellerType: {
            type: String
        },
        estimatedWeight: {
            type: Number
        },
        animalType: {
            type: String
        },
        poultry: {
            type: String
        },
        animalSubCategory: {
            type: String
        },
        animalVariety: {
            type: String
        },
        postedBy: {
            type: ObjectId,
            ref: 'User'
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model('Product', productSchema);