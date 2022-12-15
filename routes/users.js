import express from "express";
import { User } from "../models/user.js";
import { catchAsync } from "../utils/catchAsync.js";
import passport from "passport";

const router = express.Router();

//register page
router.get('/register', (req, res) => {
    res.render('../views/users/register.ejs');
})

//registering
router.post('/register', catchAsync(async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);  //save user with a safe hashed password
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `Welcome to Yelp Camp ${username} !`);
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/register');
    }
}))

//login page
router.get('/login', (req, res) => {
    const url = req.session.returnTo || '/'; //if user was redirected to this page by login request user will be redirected back
    res.render('../views/users/login.ejs', { url });
})

//logging in
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Logged In');
    res.redirect(req.body.url);
})

//logging out and redret to main page
router.get('/logout', (req,res,next) => {
    req.logout( (err) => {
        if (err) return next(err);
        req.flash('success', "Logged Out!");
        res.redirect('/');
    })
})

export const usersRouter = router;