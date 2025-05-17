import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Buffer } from "buffer";
import { uploadToStorage } from "@/lib/supabase/storage-utils";
import { generateRequestId } from "@/lib/error-monitoring";

// Types for image generation options
type ImageFormat = "png" | "jpeg" | "webp";
type ImageQuality = "low" | "medium" | "high" | "auto"; 
type ImageSize = "1024x1024" | "1024x1536" | "1536x1024" | "auto";
type ImageBackground = "transparent" | "opaque" | "auto";

interface GenerateImageOptions {
  prompt: string;
  size?: ImageSize;
  quality?: ImageQuality;
  format?: ImageFormat;
  background?: ImageBackground;
  outputCompression?: number;
}

interface ImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Generate an image using OpenAI's GPT-Image-1 model
 */
export async function generateImageWithGPT(options: GenerateImageOptions): Promise<ImageResult> {
  const requestId = generateRequestId();
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      return {
        success: false,
        error: "OpenAI API key is not configured",
      };
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log(`Preparing to generate image with GPT-Image-1 model - RequestID: ${requestId}`);

    // Extract and validate options
    const { 
      prompt, 
      size = "1024x1024", 
      quality = "medium", 
      format = "png",
      background = format === "png" ? "transparent" : "opaque",
      outputCompression
    } = options;

    // Sanitize prompt - remove any leading/trailing whitespace
    const sanitizedPrompt = prompt.trim();

    if (!sanitizedPrompt) {
      return {
        success: false,
        error: "Prompt cannot be empty",
      };
    }

    // Log parameters (without the full prompt for privacy)
    console.log("GPT-Image-1 parameters:", {
      model: "gpt-image-1",
      promptLength: sanitizedPrompt.length,
      size,
      quality,
      format,
      background,
      outputCompression: outputCompression || "default",
      requestId
    });

    // Prepare request parameters
    const params: any = {
      model: "gpt-image-1",
      prompt: sanitizedPrompt,
      n: 1,
      size,
      quality,
    };

    // Add output format if specified
    if (format) {
      params.output_format = format;
    }

    // Add background if specified
    if (background && background !== "auto") {
      params.background = background;
    }

    // Add compression for jpeg and webp formats
    if ((format === "jpeg" || format === "webp") && typeof outputCompression === "number") {
      params.output_compression = outputCompression;
    }

    console.log(`Sending request to OpenAI API - RequestID: ${requestId}`, JSON.stringify({
      ...params,
      prompt: sanitizedPrompt.substring(0, 50) + (sanitizedPrompt.length > 50 ? "..." : "")
    }, null, 2));

    // Generate the image with the OpenAI API
    const response = await openai.images.generate(params);
    
    if (!response.data || response.data.length === 0 || !response.data[0].b64_json) {
      console.error(`No image data returned from OpenAI - RequestID: ${requestId}`, response);
      return {
        success: false,
        error: "No image data returned from OpenAI",
      };
    }

    // Get the image base64 data from the response
    const imageBase64 = response.data[0].b64_json;
    console.log(`Image data received from OpenAI - RequestID: ${requestId}`);

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64, "base64");
    console.log(`Image decoded, size: ${imageBuffer.length} bytes - RequestID: ${requestId}`);

    // Get current user
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const userId = session.user.id;
    const timestamp = Date.now();
    const filename = `gpt-image-${timestamp}.${format}`;
    const filePath = `${userId}/gpt-images/${filename}`;

    // Convert buffer to blob for uploading
    const imageBlob = new Blob([imageBuffer], { type: `image/${format}` });
    
    console.log(`Uploading image to storage - RequestID: ${requestId}`);

    // Use the uploadToStorage helper function instead of direct upload
    const { publicUrl } = await uploadToStorage({
      bucketName: "assets", // Use the same bucket as Gemini implementation
      filePath: filePath,
      fileBlob: imageBlob,
      contentType: `image/${format}`,
      userId,
      requestId
    });

    console.log(`Image successfully uploaded and public URL generated - RequestID: ${requestId}`);

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error: any) {
    console.error(`Error generating image with GPT Image - RequestID: ${requestId}:`, error);
    return {
      success: false,
      error: error.message || "Failed to generate image",
    };
  }
}

/**
 * Edit an image using OpenAI's GPT-Image model
 */
export async function editImageWithGPT(options: EditImageOptions): Promise<ImageResult> {
  const requestId = generateRequestId();
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log(`Starting image edit with GPT-Image-1 - RequestID: ${requestId}`);

    // Set default values for optional parameters
    const size = options.size || "1024x1024";
    const quality = options.quality || "auto";
    const format = options.format || "png";
    const background = options.background || (format === "png" ? "transparent" : "opaque");
    
    // Convert File object(s) to OpenAI file format
    let images: any[];
    if (Array.isArray(options.image)) {
      // Handle multiple images
      images = await Promise.all(
        options.image.map(async (img) => {
          const buffer = Buffer.from(await img.arrayBuffer());
          return buffer;
        })
      );
    } else {
      // Handle single image
      const buffer = Buffer.from(await options.image.arrayBuffer());
      images = [buffer];
    }

    // Prepare mask if provided
    let mask: Buffer | undefined;
    if (options.mask) {
      mask = Buffer.from(await options.mask.arrayBuffer());
    }

    // Create image edit parameters
    const params: any = {
      model: "gpt-image-1", // Using the gpt-image-1 model
      prompt: options.prompt,
      image: images,
      response_format: "b64_json",
      size,
      quality,
    };

    // Add mask if provided
    if (mask) {
      params.mask = mask;
    }

    // Add optional parameters if provided
    if (background && background !== "auto") {
      params.background = background;
    }

    // Add compression for jpeg and webp formats
    if ((format === "jpeg" || format === "webp") && typeof options.outputCompression === "number") {
      params.output_compression = options.outputCompression / 100; // Convert percentage to decimal
    }

    // Edit the image
    console.log(`Calling OpenAI API with edit params - RequestID: ${requestId}:`, {
      ...params,
      prompt: params.prompt.substring(0, 100) + (params.prompt.length > 100 ? "..." : ""),
      image: "<<image buffer(s)>>",
      mask: mask ? "<<mask buffer>>" : undefined,
    });
    
    const response = await openai.images.edit(params);
    
    if (!response.data[0].b64_json) {
      throw new Error("No image data returned from the API");
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(response.data[0].b64_json, "base64");
    const blob = new Blob([imageBuffer], { type: `image/${format}` });
    
    // Generate a unique filename
    const fileName = `${options.prompt ? options.prompt.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '-') : 'edited'}-${uuidv4().substring(0, 8)}.${format}`;
    const filePath = `edited-images/${fileName}`;
    
    // Get user ID from session
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No authenticated user found");
    }
    
    const userId = session.user.id;
    
    // Upload to storage using the helper function
    const { publicUrl } = await uploadToStorage({
      bucketName: "assets",
      filePath: `${userId}/${filePath}`,
      fileBlob: blob,
      contentType: `image/${format}`,
      userId,
      requestId
    });
    
    return {
      success: true,
      url: publicUrl,
    };
  } catch (error: any) {
    console.error(`Error editing image with GPT Image - RequestID: ${requestId}:`, error);
    return {
      success: false,
      error: error.message || "Failed to edit image",
    };
  }
}
