// Define the features available for each subscription plan
export const planFeatures = {
  free: {
    name: "Free",
    price: "Free",
    features: [
      "5 AI mockup generations per month",
      "5 Gemini image generations per month",
      "5 GPT image generations per month",
      "Basic device frames",
      "PNG export",
      "Community templates",
    ],
    limitations: ["No bulk generation", "No advanced editing", "No team sharing"],
    cta: "Get Started",
    popular: false,
    mockupGenerationsPerMonth: 5,
    geminiGenerationsPerMonth: 5,
    gptImageGenerationsPerMonth: 5,
    maxProjects: 3,
    maxTemplates: 5,
    maxTeamMembers: 1,
    allowBulkGeneration: false,
    allowAdvancedEditing: false,
    allowTeamSharing: false,
  },
  pro: {
    name: "Pro",
    price: "$19/month",
    yearlyPrice: "$190/year",
    features: [
      "50 AI mockup generations per month",
      "50 Gemini image generations per month",
      "50 GPT image generations per month",
      "Advanced device frames",
      "All export formats",
      "Premium templates",
      "Bulk generation",
      "Advanced editing tools",
    ],
    limitations: ["Limited team sharing"],
    cta: "Upgrade to Pro",
    popular: true,
    mockupGenerationsPerMonth: 50,
    geminiGenerationsPerMonth: 50,
    gptImageGenerationsPerMonth: 50,
    maxProjects: 10,
    maxTemplates: 20,
    maxTeamMembers: 3,
    allowBulkGeneration: true,
    allowAdvancedEditing: true,
    allowTeamSharing: true,
  },
  team: {
    name: "Team",
    price: "$49/month",
    yearlyPrice: "$490/year",
    features: [
      "Unlimited AI mockup generations",
      "Unlimited Gemini image generations",
      "Unlimited GPT image generations",
      "All Pro features",
      "Team collaboration",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
    ],
    limitations: [],
    cta: "Upgrade to Team",
    popular: false,
    mockupGenerationsPerMonth: Number.POSITIVE_INFINITY,
    geminiGenerationsPerMonth: Number.POSITIVE_INFINITY,
    gptImageGenerationsPerMonth: Number.POSITIVE_INFINITY,
    maxProjects: Number.POSITIVE_INFINITY,
    maxTemplates: Number.POSITIVE_INFINITY,
    maxTeamMembers: 10,
    allowBulkGeneration: true,
    allowAdvancedEditing: true,
    allowTeamSharing: true,
  },
}

// Helper function to get plan features by plan ID
export function getPlanFeatures(planId: string | null) {
  if (!planId) return planFeatures.free

  switch (planId) {
    case "pro_monthly":
    case "pro_annual":
      return planFeatures.pro
    case "team_monthly":
    case "team_annual":
      return planFeatures.team
    default:
      return planFeatures.free
  }
}

// Helper function to check if a feature is available for a given plan
export function isFeatureAvailable(planId: string | null, feature: keyof typeof planFeatures.pro) {
  const plan = getPlanFeatures(planId)
  return !!plan[feature]
}

// Helper function to get the usage limit for a specific feature
export function getFeatureLimit(planId: string | null, feature: keyof typeof planFeatures.pro) {
  const plan = getPlanFeatures(planId)
  return plan[feature]
}
