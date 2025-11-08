import { v2 as cloudinary } from "cloudinary";

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error("CLOUDINARY_CLOUD_NAME is not set");
}

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error("CLOUDINARY_API_KEY is not set");
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error("CLOUDINARY_API_SECRET is not set");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
}

/**
 * Upload an image to Cloudinary
 * @param imageUrl - URL of the image to upload OR base64 data URL
 * @param userId - User ID for folder organization
 * @param timestamp - Timestamp for unique naming
 * @returns Upload result with public_id and URLs
 */
export async function uploadToCloudinary(
  imageUrl: string,
  userId?: string,
  timestamp?: number
): Promise<UploadResult> {
  try {
    const folder = "moodscape/wallpapers";
    const timestampStr = timestamp?.toString() || Date.now().toString();
    const publicId = userId
      ? `${folder}/${userId}_${timestampStr}`
      : `${folder}/guest_${timestampStr}`;

    // Check if it's a data URL (base64)
    if (imageUrl.startsWith("data:image")) {
      // Extract base64 data from data URL
      const base64Data = imageUrl.split(",")[1];
      if (!base64Data) {
        throw new Error("Invalid base64 data URL");
      }
      
      // Convert base64 to Buffer
      const buffer = Buffer.from(base64Data, "base64");
      
      // Use buffer upload method with timeout
      return new Promise((resolve, reject) => {
        // Set a timeout for the upload (2 minutes)
        const timeout = setTimeout(() => {
          reject(new Error("Cloudinary upload timeout after 2 minutes"));
        }, 120000); // 2 minutes

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "moodscape/wallpapers",
            public_id: publicId.split("/").pop(),
            resource_type: "image",
            format: "png",
            overwrite: false,
            timeout: 120000, // 2 minutes timeout
            chunk_size: 6000000, // 6MB chunks for large files
          },
          (error, result) => {
            clearTimeout(timeout); // Clear timeout on completion
            
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else if (result) {
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
                url: result.url,
                width: result.width,
                height: result.height,
              });
            } else {
              reject(new Error("Upload failed - no result returned"));
            }
          }
        );

        // Handle stream errors
        uploadStream.on("error", (error) => {
          clearTimeout(timeout);
          console.error("Upload stream error:", error);
          reject(error);
        });

        uploadStream.end(buffer);
      });
    }

    // If it's a regular URL, use the original method with timeout
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "moodscape/wallpapers",
      public_id: publicId.split("/").pop(),
      resource_type: "image",
      format: "png",
      overwrite: false,
      timeout: 120000, // 2 minutes timeout
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      width: result.width,
      height: result.height,
    };
  } catch (error: any) {
    console.error("Error uploading to Cloudinary:", error);
    
    // Provide more specific error messages
    if (error.message?.includes("timeout")) {
      throw new Error("Cloudinary upload timed out. The image may be too large. Please try again.");
    }
    
    if (error.http_code === 499) {
      throw new Error("Cloudinary request timed out. Please try again with a smaller image.");
    }
    
    throw new Error(`Failed to upload image to Cloudinary: ${error.message || "Unknown error"}`);
  }
}

/**
 * Upload image buffer to Cloudinary
 * @param buffer - Image buffer
 * @param userId - User ID for folder organization
 * @param timestamp - Timestamp for unique naming
 * @returns Upload result with public_id and URLs
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  userId?: string,
  timestamp?: number
): Promise<UploadResult> {
  try {
    const folder = "moodscape/wallpapers";
    const timestampStr = timestamp?.toString() || Date.now().toString();
    const publicId = userId
      ? `${folder}/${userId}_${timestampStr}`
      : `${folder}/guest_${timestampStr}`;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "moodscape/wallpapers",
          public_id: publicId.split("/").pop(),
          resource_type: "image",
          format: "png",
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              width: result.width,
              height: result.height,
            });
          } else {
            reject(new Error("Upload failed"));
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Error uploading buffer to Cloudinary:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
}

export default cloudinary;

