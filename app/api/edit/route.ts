import { fal } from "@fal-ai/client";
import sharp from 'sharp';

// Initialize fal.ai client with API key
if (process.env.FAL_KEY) {
  fal.config({
    credentials: process.env.FAL_KEY,
  });
}

// Helper function to create mask from polygon and upload to fal.storage
async function createMaskFromPolygon(imageUrl: string, polygon: Array<{x: number, y: number}>): Promise<string> {
  // Fetch the image
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  
  // Get image dimensions
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width!;
  const height = metadata.height!;
  
  // Create SVG path for polygon
  const pathData = polygon.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x * width} ${p.y * height}`
  ).join(' ') + ' Z';
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="black"/>
      <path d="${pathData}" fill="white"/>
    </svg>
  `;
  
  // Create mask image
  const maskBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
  
  // Upload to fal.storage
  // Convert Buffer to Uint8Array for File constructor
  const maskArray = new Uint8Array(maskBuffer);
  const maskFile = new File([maskArray], 'mask.png', { type: 'image/png' });
  const maskUrl = await fal.storage.upload(maskFile);
  
  return maskUrl;
}

export async function POST(req: Request) {
  try {
    if (!process.env.FAL_KEY) {
      return Response.json(
        { error: "FAL_KEY is not configured. Please set it in .env.local" },
        { status: 500 }
      );
    }

    const { action, imageUrl, prompt, selection, referenceImageUrl } = await req.json();

    if (!imageUrl) {
      return Response.json({ error: "Image URL is required" }, { status: 400 });
    }

    let result; 
    
    switch (action) {
      case "clean":
        // POLYGON SELECTION: Convert to mask and use object-removal/mask
        if (selection && Array.isArray(selection) && selection.length >= 3) {
          const maskUrl = await createMaskFromPolygon(imageUrl, selection);
          result = await fal.subscribe("fal-ai/object-removal/mask", {
            input: {
              image_url: imageUrl,
              mask_url: maskUrl,
              model: "best_quality",
              mask_expansion: 15
            }
          });
        } else if (prompt) {
          // PROMPT-BASED REMOVAL: Keep original object-removal API
          result = await fal.subscribe("fal-ai/object-removal", {
            input: { 
              image_url: imageUrl, 
              prompt              
            }
          });
        } else {
          return Response.json({ error: "Either polygon selection or prompt is required for cleaning" }, { status: 400 });
        }
        // Handle both result.data and result directly
        const cleanData = result.data || result;
        return Response.json({ imageUrl: cleanData.images[0].url });

      case "stage":
        // This model is specifically fine-tuned for interior design/staging
        if (!prompt) {
          return Response.json({ error: "Prompt is required for staging" }, { status: 400 });
        }
        result = await fal.subscribe("fal-ai/flux-2-lora-gallery/apartment-staging", {
          input: {
            image_urls: [imageUrl], 
            prompt: `A high-end ${prompt} style room with modern furniture, realistic lighting, and professional decor.`,
            // LoRA scale: 1.0 is standard; higher (up to 2.0) adds more furniture
            lora_scale: 1.2, 
            guidance_scale: 3.5,
            num_inference_steps: 30,
            image_size: "square_hd"
          }
        });
        // Handle both result.data and result directly
        const stageData = result.data || result;
        return Response.json({ imageUrl: stageData.images[0].url });

      case "add-item":
        // Add item to image using polygon selection
        if (!selection || !Array.isArray(selection) || selection.length < 3) {
          return Response.json({ error: "Polygon selection is required for adding items" }, { status: 400 });
        }
        if (!prompt) {
          return Response.json({ error: "Prompt is required for adding items" }, { status: 400 });
        }
        
        // Create mask from polygon
        const addItemMaskUrl = await createMaskFromPolygon(imageUrl, selection);
        
        if (referenceImageUrl) {
          // Mode 2: With reference image - use flux-kontext-lora/inpaint
          
          result = await fal.subscribe("fal-ai/flux-kontext-lora/inpaint", {
            input: {
              image_url: imageUrl,
              mask_url: addItemMaskUrl,
              reference_image_url: referenceImageUrl,
              prompt: prompt,
              strength: 0.65,
              guidance_scale: 3.5,
              num_inference_steps: 40
            }
          });
          
        } else {
          // Mode 1: Prompt only - use flux-pro/v1/fill
          result = await fal.subscribe("fal-ai/flux-pro/v1/fill", {
            input: {
              image_url: imageUrl,
              mask_url: addItemMaskUrl,
              prompt: prompt,
              safety_tolerance: "5"
            }
          });
        }
        // Handle both result.data and result directly
        const addItemData = result.data || result;
        return Response.json({ imageUrl: addItemData.images[0].url });

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("API Error:", error);
    return Response.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}

