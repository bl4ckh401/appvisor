export async function generateImage(prompt: string, size: "256x256" | "512x512" | "1024x1024" = "512x512") {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key is not configured. Please add the OPENAI_API_KEY environment variable.",
      }
    }

    console.log("Generating image with parameters:", { prompt, size, model: "dall-e-2" })

    const apiKey = process.env.OPENAI_API_KEY

    // Direct API call using fetch
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-2",
        prompt: `High quality app screenshot mockup: ${prompt}`,
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

export async function generateAppDescription(appName: string, category: string) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key is not configured. Please add the OPENAI_API_KEY environment variable.",
      }
    }

    const apiKey = process.env.OPENAI_API_KEY

    // Direct API call using fetch
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert app marketer who writes compelling app store descriptions.",
          },
          {
            role: "user",
            content: `Write a short, compelling app store description for an app called "${appName}" in the ${category} category. Keep it under 100 words.`,
          },
        ],
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

    return {
      success: true,
      text: data.choices[0].message.content,
    }
  } catch (error) {
    console.error("Error generating description:", error)
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    }
  }
}
