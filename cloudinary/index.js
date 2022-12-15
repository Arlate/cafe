//cloudinary setup
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

import * as dotenv from 'dotenv'
dotenv.config()

//configuration from env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

//storage setup
export const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'CafeLookout',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
})

export const Cloudinary = cloudinary;