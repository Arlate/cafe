//necessary imports
import { Router } from "express";
import { AppError } from "../utils/apperror.js";
import { catchAsync } from "../utils/catchAsync.js";
import { Review } from "../models/review.js";
import { Cafe } from '../models/cafe.js';
import {Joi} from "../utils/htmlsafe.js";
import { isLoggedIn, isReviewAuthor } from "../utils/middleware.js";

const router = Router({mergeParams: true});

//schema for review validation
const validateReview = (req,res,next) => {
    const reviewValSchema = Joi.object({
        review: Joi.object({
            rating: Joi.number().required().min(1).max(5),
            body: Joi.string().required().escapeHTML()
        }).required()
    });
    const {error} = reviewValSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(msg, 400);
    } else{
        next();
    }
}

//posting review if validated and user logged in
router.post('/', validateReview, isLoggedIn, catchAsync(async(req,res) => {
    const {id} = req.params
    const cafe = await Cafe.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    //adds review to cafe object
    cafe.reviews.push(review);
    await review.save();
    await cafe.save();
    req.flash('success', "Successfully added a new review");
    res.redirect(`/cafes/${id}`)
}))

//deleting review if author is looged in
router.delete('/:reviewID', isLoggedIn, isReviewAuthor, catchAsync(async (req,res) => {
    const {id, reviewID} = req.params;
    await Cafe.findByIdAndUpdate(id, {$pull: {reviews: reviewID}});
    await Review.findByIdAndDelete(reviewID);
    req.flash('success', "Successfully deleted the review");
    res.redirect(`/cafes/${id}`);
}))

export const reviewRouter = router;