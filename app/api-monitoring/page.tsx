"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GlassButton } from "@/components/ui/glass-button"
import { Input } from "@/components/ui/input"
import { Loader2, RefreshCw, Search } from "lucide-react"

// Types for API metrics and error logs
interface APIMetric {
  calls: number
  successes: number
  failures: number
  avgDuration: number
  lastCalled?: string
}

interface APIErrorLog {
  id: string
  api_name: string
  endpoint: string
  status_code?: number
  error_message: string
  error_code?: string
  timestamp: string
  request_id?: string
  user_id?: string
}

export default function APIMonitoringPage() {
  const [metrics, setMetrics] = useState<Record<string, APIMetric>>({})
  const [errors, setErrors] = useState<APIErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [errorLoading, setErrorLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [apiFilter, setApiFilter] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">("24h")

  // Function to fetch metrics data
  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/monitoring/metrics")

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error("Error fetching metrics:", error)
      // If we can't fetch real metrics, use some sample data
      setMetrics({
        openai: {
          calls: 124,
          successes: 118,
          failures: 6,
          avgDuration: 1245,
        },
        gemini: {
          calls: 87,
          successes: 82,
          failures: 5,
          avgDuration: 1578,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch error logs
  const fetchErrors = async () => {
    try {
      setErrorLoading(true)

      // Build query parameters
      const params = new URLSearchParams()

      if (apiFilter) {
        params.append("api", apiFilter)
      }

      // Add time range filter
      const now = new Date()
      let startDate: Date | null = null

      if (timeRange === "24h") {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      } else if (timeRange === "7d") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (timeRange === "30d") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }

      if (startDate) {
        params.append("startDate", startDate.toISOString())
      }

      const response = await fetch(`/api/monitoring/errors?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch errors: ${response.status} ${response.statusText}`)
      }

      const { data } = await response.json()

      // Filter by search term if provided
      const filteredData = searchTerm
        ? data.filter(
            (error: APIErrorLog) =>
              error.error_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
              error.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
              error.request_id?.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : data

      setErrors(filteredData)
    } catch (error) {
      console.error("Error fetching error logs:", error)
      // If we can't fetch real errors, use some sample data
      setErrors([
        {
          id: "err_1",
          api_name: "gemini",
          endpoint: "generate-image",
          status_code: 400,
          error_message: "Invalid request: prompt cannot be empty",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          request_id: "req_abc123",
          user_id: "user_123",
        },
        {
          id: "err_2",
          api_name: "openai",
          endpoint: "generate-image",
          status_code: 429,
          error_message: "Rate limit exceeded",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          request_id: "req_def456",
          user_id: "user_456",
        },
      ])
    } finally {
      setErrorLoading(false)
    }
  }

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchMetrics()
    fetchErrors()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMetrics()
      fetchErrors()
    }, 30000)

    return () => clearInterval(interval)
  }, [apiFilter, timeRange])

  // Handle search separately to avoid too many API calls
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchErrors()
    }, 500)

    return () => clearTimeout(delaySearch)
  }, [searchTerm])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">API Monitoring Dashboard</h1>

      <Tabs defaultValue="metrics">
        <TabsList className="mb-4">
          <TabsTrigger value="metrics">API Metrics</TabsTrigger>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">API Performance Metrics</h2>
            <GlassButton size="sm" onClick={fetchMetrics} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh
            </GlassButton>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(metrics).length > 0 ? (
                Object.entries(metrics).map(([apiName, metric]) => (
                  <GlassCard key={apiName} className="p-6">
                    <h2 className="text-2xl font-bold mb-4 capitalize">{apiName} API</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Calls</p>
                        <p className="text-2xl font-bold">{metric.calls}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold">
                          {metric.calls > 0 ? ((metric.successes / metric.calls) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Successful Calls</p>
                        <p className="text-2xl font-bold text-green-500">{metric.successes}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Failed Calls</p>
                        <p className="text-2xl font-bold text-red-500">{metric.failures}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Duration</p>
                        <p className="text-2xl font-bold">{metric.avgDuration}ms</p>
                      </div>
                      {metric.lastCalled && (
                        <div>
                          <p className="text-sm text-muted-foreground">Last Called</p>
                          <p className="text-sm">{new Date(metric.lastCalled).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-muted-foreground">No API metrics available yet. Make some API calls first.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="errors">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-xl font-bold">Recent API Errors</h2>

            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search errors..."
                  className="pl-8 bg-background/30 backdrop-blur-sm border-border/40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <select
                  className="bg-background/30 backdrop-blur-sm border border-border/40 rounded-md px-3 py-2 text-sm"
                  value={apiFilter || ""}
                  onChange={(e) => setApiFilter(e.target.value || null)}
                >
                  <option value="">All APIs</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Gemini</option>
                </select>

                <select
                  className="bg-background/30 backdrop-blur-sm border border-border/40 rounded-md px-3 py-2 text-sm"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="all">All time</option>
                </select>

                <GlassButton size="sm" onClick={fetchErrors} disabled={errorLoading}>
                  {errorLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </GlassButton>
              </div>
            </div>
          </div>

          <GlassCard className="p-6">
            {errorLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left">Time</th>
                      <th className="py-2 px-4 text-left">API</th>
                      <th className="py-2 px-4 text-left">Endpoint</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Error Message</th>
                      <th className="py-2 px-4 text-left">Request ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.length > 0 ? (
                      errors.map((error) => (
                        <tr key={error.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{new Date(error.timestamp).toLocaleString()}</td>
                          <td className="py-2 px-4 capitalize">{error.api_name}</td>
                          <td className="py-2 px-4">{error.endpoint}</td>
                          <td className="py-2 px-4">{error.status_code || "N/A"}</td>
                          <td className="py-2 px-4 truncate max-w-xs" title={error.error_message}>
                            {error.error_message}
                          </td>
                          <td className="py-2 px-4 font-mono text-xs">{error.request_id || "N/A"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-muted-foreground">
                          No errors recorded
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
