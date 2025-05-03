import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

async function generateImage(prompt: string, size: "256x256" | "512x512" | "1024x1024" = "512x512") {
  try {
    console.log("Generating image with parameters:", { prompt, size, model: "dall-e-2" })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set")
    }

    // Direct API call using fetch
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-2",
        prompt,
        n: 1,
        size,
        response_format: "url",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenAI API Error:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      })
      throw new Error(`OpenAI API error: ${response.status} ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    console.log("OpenAI response received successfully")

    return {
      success: true,
      url: data.data[0].url,
    }
  } catch (error) {
    console.error("Error generating image:", error)
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    }
  }
}

export async function POST(request: Request) {
  try {
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please add the OPENAI_API_KEY environment variable." },
        { status: 500 },
      )
    }

    // Verify authentication
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    console.log(
      "Request body:",
      JSON.stringify({
        ...body,
        prompt: body.prompt ? `${body.prompt.substring(0, 50)}...` : undefined,
      }),
    )

    const { prompt, size } = body

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Generate image
    const result = await generateImage(prompt, size)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Store the generated image in Supabase storage
    try {
      const imageUrl = result.url
      console.log("Fetching image from URL:", imageUrl ? "URL_EXISTS" : "NO_URL")

      const imageResponse = await fetch(imageUrl)

      if (!imageResponse.ok) {
        console.error("Failed to fetch image from OpenAI URL:", {
          status: imageResponse.status,
          statusText: imageResponse.statusText,
        })
        return NextResponse.json({ error: "Failed to fetch generated image" }, { status: 500 })
      }

      const imageBlob = await imageResponse.blob()
      console.log("Image blob size:", imageBlob.size)

      const fileName = `generated-images/${session.user.id}/${Date.now()}.png`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("assets")
        .upload(fileName, imageBlob, {
          contentType: "image/png",
          upsert: false,
        })

      if (uploadError) {
        console.error("Error uploading to Supabase:", uploadError)
        // Still return the OpenAI URL if Supabase upload fails
        return NextResponse.json({ url: imageUrl })
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("assets").getPublicUrl(fileName)

      console.log("Successfully uploaded and generated public URL")
      return NextResponse.json({ url: publicUrl })
    } catch (storageError) {
      console.error("Error with storage:", storageError)
      // Return the original URL if storage fails
      return NextResponse.json({ url: result.url })
    }
  } catch (error) {
    console.error("Error in generate-image API:", error)
    return NextResponse.json(
      { error: "Failed to generate image. Please check server logs for details." },
      { status: 500 },
    )
  }
}
