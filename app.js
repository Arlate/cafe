//import DB url from env
import * as dotenv from 'dotenv'
dotenv.config()
const dbUrl = process.env.dbUrl;

//imports for server
import express from "express";
import mongoose from "mongoose";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import methodOverride from 'method-override';
import ejsmate from "ejs-mate";
import Joi from "joi";

//session imports
import expressSession from 'express-session';
import flash from "express-flash";
import MongoStore from 'connect-mongo';

//import password and user
import passport from "passport";
import LocalStrategy from 'passport-local';
import { User } from "./models/user.js";

//security import
import mongoSanitize from "express-mongo-sanitize";
import helmet from 'helmet';

//models imports
import { Cafe } from './models/cafe.js';
import { Review } from "./models/review.js";
import { AppError } from "./utils/apperror.js";
import { catchAsync } from "./utils/catchAsync.js";

//server setup
const app = express();
app.listen(process.env.PORT, () => console.log(`LISTENING ON ${process.env.PORT}`))
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsmate); //for using layouts
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); //for DELETE PATCH
app.use(express.static(path.join(__dirname, 'public')));

//security setup
app.use(mongoSanitize({ replaceWith: '_' }));
// app.use(helmet.contentSecurityPolicy());
// app.use(helmet.crossOriginEmbedderPolicy());
// app.use(helmet.crossOriginOpenerPolicy());
// app.use(helmet.crossOriginResourcePolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

//allowed connections
import {scriptSrcUrls, styleSrcUrls, connectSrcUrls, fontSrcUrls} from './public/allow_paths.js'
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dwszziymi/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    }),

);

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
//configuring session in mongoDB Cloud
const store = MongoStore.create({
    mongoUrl: dbUrl,
    dbName: 'cafeLookout',
    secret: process.env.SESSIONSECRET,
    touchAfter: 24 * 3600
});

store.on('error', function(e) {
    console.log('SESSION ERROR', e)
});


const sessionConfig = {
    store: store,
    name: 'sessionss',
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24,
        // secure: true
    }
}

app.use(expressSession(sessionConfig));
app.use(flash());

//configuirng password from passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//connecting to DB
// mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true });


const db = mongoose.connection;
db.on('error', console.error.bind(console), "connection error");
db.once("open", () => { console.log("CONNECTED WITH DB") });

//setup of local variables
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//home page
app.get('/', (req, res) => {
    res.render('home')
})

//cafes router
import { cafesRouter } from "./routes/cafes.js";
app.use("/cafes", cafesRouter)

//review router
import { reviewRouter } from "./routes/reviews.js";
app.use('/campgrounds/:id/reviews', reviewRouter);

//users router
import { usersRouter } from "./routes/users.js";
app.use('/', usersRouter);

//if no page found 404
app.all('*', (req, res, next) => {
    next(new AppError('Page not found', 404))
})

//error handling
app.use((err, req, res, next) => {
    if (!err.message) err.message = "Something went wrong";
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).render('error', { err })
})