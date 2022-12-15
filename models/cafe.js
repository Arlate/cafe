//build schema
import mongoose from "mongoose";
import { Review } from "./review.js";
const Schema = mongoose.Schema;

//schema for images
const ImageSchema = new Schema({
    url: String,
    filename: String
})

//for editing repleces whole image with smaller ones for performance
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload','/upload/w_300');
})

//setting for virtual usage in JSON
const opts = {toJSON: {virtuals: true}};

//schema of a Cafe
const CafeSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String,
    images: [ImageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    geometry: {
        type: {
            type: String,
            enum:['Point'],
            // required: true
        },
        coordinates: {
            type: [Number],
            // required: true
        }
    }
}, opts);

//virtual property for popUps on maps
CafeSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/cafes/${this._id}">${this.title}</a><strong>`
})

//if a cafe is deleted all reviews are too
CafeSchema.post('findOneAndDelete', async(cafe) => {
    if(cafe) {
        await Review.deleteMany( { _id: {$in: cafe.reviews}})
    }
})

export const Cafe =  mongoose.model('Cafe', CafeSchema);