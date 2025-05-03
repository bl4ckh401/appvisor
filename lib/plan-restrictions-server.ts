// Server-side version of plan features (without React hooks)
export const planFeatures = {
  free: {
    mockupsPerMonth: 5,
    templates: "basic",
    exportFormats: ["png"],
    bulkGeneration: 3,
    teamMembers: 1,
    customBranding: false,
    apiAccess: false,
    prioritySupport: false,
    whiteLabeling: false,
  },
  pro: {
    mockupsPerMonth: Number.POSITIVE_INFINITY, // Unlimited
    templates: "all",
    exportFormats: ["png", "jpg", "svg", "pdf"],
    bulkGeneration: 10,
    teamMembers: 1,
    customBranding: true,
    apiAccess: false,
    prioritySupport: true,
    whiteLabeling: false,
  },
  team: {
    mockupsPerMonth: Number.POSITIVE_INFINITY, // Unlimited
    templates: "all",
    exportFormats: ["png", "jpg", "svg", "pdf"],
    bulkGeneration: 20,
    teamMembers: 5,
    customBranding: true,
    apiAccess: true,
    prioritySupport: true,
    whiteLabeling: true,
  },
}

// Check if user has access to a feature based on their plan
export function hasFeatureAccess(plan: string, feature: keyof typeof planFeatures.free): boolean {
  if (!plan || !planFeatures[plan]) {
    return planFeatures.free[feature]
  }
  return planFeatures[plan][feature]
}

// Check if user has reached their mockup limit
export function hasReachedMockupLimit(plan: string, currentUsage: number): boolean {
  if (!plan || !planFeatures[plan]) {
    plan = "free"
  }

  const limit = planFeatures[plan].mockupsPerMonth

  // If unlimited
  if (limit === Number.POSITIVE_INFINITY) {
    return false
  }

  return currentUsage >= limit
}

// Get the limit for a specific feature
export function getFeatureLimit(plan: string, feature: keyof typeof planFeatures.free) {
  if (!plan || !planFeatures[plan]) {
    plan = "free"
  }

  return planFeatures[plan][feature]
}

// Calculate remaining usage
export function getRemainingUsage(plan: string, feature: keyof typeof planFeatures.free, currentUsage: number): number {
  if (!plan || !planFeatures[plan]) {
    plan = "free"
  }

  const limit = planFeatures[plan][feature]

  // If unlimited
  if (limit === Number.POSITIVE_INFINITY) {
    return Number.POSITIVE_INFINITY
  }

  return Math.max(0, Number(limit) - currentUsage)
}
