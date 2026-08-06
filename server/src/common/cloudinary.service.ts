import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });
    }

    async upload(base64: string, folder: '/profile_pictures' | '/threads'): Promise<string> {
        try {
            const result = await cloudinary.uploader.upload(base64, { folder });
            return result.public_id;
        } catch (error) {
            Logger.log(error);
            throw new InternalServerErrorException('Something went wrong');
        }
    }

    async destroy(publicId: string) {
        await cloudinary.uploader.destroy(publicId);
    }
}
