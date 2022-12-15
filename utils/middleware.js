import { Cafe } from "../models/cafe.js";
import { Review } from "../models/review.js";

//checks if any user is logged in
export const isLoggedIn = (req, res, next) => {
    //if not then save the url for later redirection and go to login page
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You need to be logged in!');
        return res.redirect('/login');
    }
    next();
}

//checks if logged user is author of the cafe
export const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const cafe = await Cafe.findById(id);
    /*if not then flash error and redirect to cafe page
    (this can only happen through direct request because link on website is hidden if author is not logged in) */
    if (!cafe.author.equals(req.user._id)) {
        req.flash('error', "You don't have permission to do that");
        return res.redirect(`/cafes/${id}`);
    }
    next();
}

//checks if logged user is author of the review
export const isReviewAuthor = async (req, res, next) => {
    const { id, reviewID } = req.params;
    const review = await Review.findById(reviewID);
    //if not then flash error and redirect to cafe page
    if (!review.author.equals(req.user._id)) {
        req.flash('error', "You don't have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}