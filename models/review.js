//build schema
import mongoose from "mongoose";
const {Schema} = mongoose;

//schema for reviews
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    } //conected to users collection
});

export const Review =  mongoose.model('Review', reviewSchema);

