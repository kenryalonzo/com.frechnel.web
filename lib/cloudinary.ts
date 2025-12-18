import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload une image vers Cloudinary
 */
export async function uploadToCloudinary(
    file: File,
    folder: string = 'frechnel-shop/products'
): Promise<{ url: string; publicId: string }> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation: [
                    { width: 1200, height: 1200, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' },
                ],
            },
            (error, result) => {
                if (error) reject(error);
                else
                    resolve({
                        url: result!.secure_url,
                        publicId: result!.public_id,
                    });
            }
        );

        uploadStream.end(buffer);
    });
}

/**
 * Supprime une image de Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
}

/**
 * Extrait le public_id depuis une URL Cloudinary
 */
export function extractPublicId(url: string): string | null {
    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;

        const pathParts = parts.slice(uploadIndex + 2);
        const publicIdWithExt = pathParts.join('/');
        const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));

        return publicId;
    } catch (error) {
        console.error('Error extracting public_id:', error);
        return null;
    }
}
