//necessary imports
import { Router } from "express";
import { AppError } from "../utils/apperror.js";
import { catchAsync } from "../utils/catchAsync.js";
import { isLoggedIn, isAuthor } from "../utils/middleware.js";
import { Cafe } from '../models/cafe.js';
import { Joi } from "../utils/htmlsafe.js";

//for image upload
import multer from "multer"; //alows file upload
import { Cloudinary, storage } from "../cloudinary/index.js";
const upload = multer({ storage });

//map setup
import * as dotenv from 'dotenv'
dotenv.config()
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding.js';
const mapBoxToken = process.env.MAPTOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const router = Router();

//validation schema from Joi for Cafes
const validateCafe = (req, res, next) => {
    const cafeValSchema = Joi.object({
        cafe: Joi.object({
            title: Joi.string().required().escapeHTML(),
            price: Joi.string().required(),
            // image: Joi.string().required(),
            location: Joi.string().required().escapeHTML(),
            description: Joi.string().required().escapeHTML(),
        }).required(),
        deleteImages: Joi.array(),
    });
    const { error } = cafeValSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(msg, 400);
    } else {
        next();
    }
}

//validation key for maps
const mapsToken = process.env.MAPTOKEN

//all cafes page
router.get('/', async (req, res) => {
    const cafes = await Cafe.find({}).sort({created: -1});
    res.render('cafes/index', { cafes, mapsToken })
})

//create cafe page if logged in
router.get('/new', isLoggedIn, (req, res) => {
    res.render('cafes/new')
})

//creating cafe
router.post('/', isLoggedIn,  upload.array('image'), validateCafe, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new AppError("Invalid Campground Data", 400);
    const geoData = await geocoder.forwardGeocode({ //gets location
        query: req.body.cafe.location,
        limit: 1
    }).send()
    console.log(req.body.cafe.price)
    const cafe = new Cafe(req.body.cafe);
    cafe.geometry = geoData.body.features[0].geometry;
    cafe.author = req.user._id;
    cafe.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    let currentDate = new Date().toJSON();
    cafe.created = currentDate;
    await cafe.save();
    req.flash('success', "Successfully added a new Cafe!");
    res.redirect(`/cafes/${cafe._id}`);
}))

//Cafe page
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    //populates reviews and their author and author of cafe
    const cafe = await Cafe.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author');
    //if cannot find then redirect to cafes list
    if (!cafe) {
        req.flash('error', 'Cannot find that Cafe');
        return res.redirect('/cafes');
    }
    res.render('cafes/single', { cafe, mapsToken })
}))

//editing Cafe if author is logged in
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const cafe = await Cafe.findById(id);
    //if cannot find then redirect to cafes list
    if (!cafe) {
        req.flash('error', 'Cannot find that Cafe');
        return res.redirect('/cafes');
    }
    res.render('cafes/edit', { cafe })
}))

//editing Cafe if author is logged in
router.patch('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCafe, catchAsync(async (req, res) => {
    const { id } = req.params;
    let cafe = await Cafe.findByIdAndUpdate(id, { ...req.body.cafe });
    //adding images
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    cafe.images.push(...imgs);
    await cafe.save();
    //deleting images
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await Cloudinary.uploader.destroy(filename);
        }
        //delete links from cafe object
        await cafe.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', "Successfully updated the Cafe!");
    res.redirect(`/cafe/${id}`)
}))

//deleting Cafe if author is logged in
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Cafe.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted the Cafe!");
    res.redirect('/cafes')
}))

export const cafesRouter = router;