"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"

export default function ApiKeyManagement() {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">API Key Management</CardTitle>
        <CardDescription>Learn how API keys are handled in our application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Server-side API Keys</AlertTitle>
          <AlertDescription>
            All API keys are stored securely as environment variables on the server. Your keys are never exposed to the
            client.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">How API Keys Work in Our App</h3>
          <p className="text-sm text-muted-foreground">
            We use environment variables to securely store API keys on the server. These keys are used to authenticate
            with external services like OpenAI.
          </p>

          <Button variant="outline" onClick={() => setShowInfo(!showInfo)} className="mt-2">
            {showInfo ? "Hide Details" : "Show Details"}
          </Button>

          {showInfo && (
            <div className="mt-4 space-y-4 p-4 border rounded-md bg-muted/50">
              <div>
                <h4 className="font-medium">Environment Variables</h4>
                <p className="text-sm mt-1">API keys are stored as environment variables on the server:</p>
                <pre className="bg-black text-white p-2 rounded-md mt-2 text-xs overflow-x-auto">
                  OPENAI_API_KEY=sk-... GEMINI_API_KEY=...
                </pre>
              </div>

              <div>
                <h4 className="font-medium">Server-Side Only</h4>
                <p className="text-sm mt-1">
                  API requests are always made from the server, never from the client. This ensures your API keys remain
                  secure.
                </p>
              </div>

              <div>
                <h4 className="font-medium">API Routes</h4>
                <p className="text-sm mt-1">
                  We use Next.js API routes to create secure endpoints that make authenticated requests to external
                  services.
                </p>
                <pre className="bg-black text-white p-2 rounded-md mt-2 text-xs overflow-x-auto">
                  {`// Example API route
export async function POST(request) {
  // Initialize OpenAI with server-side API key
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  // Make authenticated request
  const result = await openai.images.generate({...});
  
  // Return result to client
  return NextResponse.json({ url: result.url });
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Info className="h-4 w-4 mr-2" />
          Need help? Contact our support team.
        </div>
      </CardFooter>
    </Card>
  )
}
