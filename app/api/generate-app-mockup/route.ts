import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

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
        screenshot: body.screenshot ? "SCREENSHOT_DATA_EXISTS" : "NO_SCREENSHOT",
        prompt: body.prompt ? `${body.prompt.substring(0, 50)}...` : undefined,
      }),
    )

    const { screenshot, caption, backgroundColor, style, prompt } = body

    if (!screenshot) {
      return NextResponse.json({ error: "Screenshot is required" }, { status: 400 })
    }

    if (!caption) {
      return NextResponse.json({ error: "Caption is required" }, { status: 400 })
    }

    // In a production environment, we would process the screenshot here
    // For now, we'll use OpenAI to generate a mockup based on the prompt

    try {
      console.log("Generating app mockup with DALL-E 2")

      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is not set")
      }

      // Create a more detailed prompt that describes the app store style mockup
      const detailedPrompt = `
        Create a professional app store screenshot mockup with the following specifications:
        
        - Caption/Title: "${caption}"
        - Background: ${style === "gradient" ? "Gradient" : "Solid"} style using ${backgroundColor} as the base color
        - Style: Modern app store listing similar to Apple App Store or Google Play Store
        - Layout: The screenshot should be centered with the caption at the top
        - Text: Use clear, readable white text for the caption
        - Overall look: Professional, polished app store marketing material
        
        The mockup should look similar to professional app store screenshots with a ${style === "gradient" ? "gradient" : "solid"} background and the app screenshot prominently displayed.
      `

      console.log("Sending prompt to OpenAI:", detailedPrompt.substring(0, 100) + "...")

      // Direct API call using fetch
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-2",
          prompt: detailedPrompt.trim(),
          n: 1,
          size: "1024x1024",
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

      // Store the generated image in Supabase storage
      try {
        const imageUrl = data.data[0].url
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

        const fileName = `generated-mockups/${session.user.id}/${Date.now()}.png`

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
        return NextResponse.json({ url: data.data[0].url })
      }
    } catch (error) {
      console.error("Error generating mockup with OpenAI:", error)
      return NextResponse.json(
        { error: "Failed to generate mockup: " + (error.message || "Unknown error") },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in generate-app-mockup API:", error)
    return NextResponse.json(
      { error: "Failed to generate mockup. Please check server logs for details." },
      { status: 500 },
    )
  }
}
