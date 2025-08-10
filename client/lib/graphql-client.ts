"use client"

import { GraphQLClient, gql } from "graphql-request"

export type Role = "ADMIN" | "TEACHER" | "STUDENT"

export type User = {
  id: string
  name: string
  email: string
  role: Role
  bio?: string
  avatarUrl?: string
}

export type AuthPayload = {
  token: string
  user: User
}

const ENDPOINT =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_GRAPHQL_ENDPOINT) ||
  (typeof window !== "undefined" ? (window as any).NEXT_PUBLIC_GRAPHQL_ENDPOINT : "")

let client: GraphQLClient | null = null

export function getGraphQLClient(token?: string) {
  if (!ENDPOINT) return null
  if (!client) {
    client = new GraphQLClient(ENDPOINT, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  } else if (token) {
    client.setHeaders({ Authorization: `Bearer ${token}` })
  }
  return client
}

// GraphQL operations (adjust to your schema)
export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
        bio
        avatarUrl
      }
    }
  }
`

export const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      token
      user {
        id
        name
        email
        role
        bio
        avatarUrl
      }
    }
  }
`

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
      role
      bio
      avatarUrl
    }
  }
`

export const DASHBOARD_QUERY = gql`
  query Dashboard($filters: DashboardFilters) {
    dashboard(filters: $filters) {
      summary {
        totalTeachers
        totalStudents
        weeklySignups
        activeThisWeek
      }
      trend {
        date
        signups
      }
      users {
        id
        name
        email
        role
        createdAt
      }
    }
  }
`
export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      bio
      avatarUrl
      role
    }
  }
  `

// Auth helpers (mocked if no ENDPOINT)
export async function loginRequest(params: { email: string; password: string }): Promise<AuthPayload> {
  try {
    if (!ENDPOINT) {
      await new Promise((r) => setTimeout(r, 600))
      return {
        token: "mock-token",
        user: {
          id: "u_1",
          name: "Alex Johnson",
          email: params.email,
          role: "ADMIN",
          bio: "Education admin",
          avatarUrl: "/placeholder.svg?height=64&width=64",
        },
      }
    }
    const c = getGraphQLClient()
    if (!c) throw new Error("GraphQL client not initialized")
    const data = await c.request<{ login: AuthPayload }>(LOGIN_MUTATION, params)
    return data.login
  } catch (error) {
    console.error("Login request error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to log in")
  }
}

export async function signupRequest(params: {
  name: string
  email: string
  password: string
  role: Role
}): Promise<AuthPayload> {
  try {
    if (!ENDPOINT) {
      await new Promise((r) => setTimeout(r, 800))
      return {
        token: "mock-token",
        user: {
          id: "u_2",
          name: params.name,
          email: params.email,
          role: params.role,
          bio: "",
          avatarUrl: "/placeholder.svg?height=64&width=64",
        },
      }
    }
    const c = getGraphQLClient()
    if (!c) throw new Error("GraphQL client not initialized")
    const data = await c.request<{ signup: AuthPayload }>(SIGNUP_MUTATION, { input: params })
    return data.signup
  } catch (error) {
    console.error("Signup request error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to sign up")
  }
}

// Dashboard
export type DashboardFilters = {
  startDate?: string
  endDate?: string
  role?: Role | "ALL"
  q?: string
}

export type DashboardData = {
  summary: {
    totalTeachers: number
    totalStudents: number
    weeklySignups: number
    activeThisWeek: number
  }
  trend: { date: string; signups: number }[]
  users: { id: string; name: string; email: string; role: Role; createdAt: string }[]
}

export async function fetchDashboard(params: { token?: string; filters?: DashboardFilters }) {
  try {
    if (!ENDPOINT) {
      const { generateMockDashboard } = await import("../lib/mock-data")
      await new Promise((r) => setTimeout(r, 400))
      return generateMockDashboard(params.filters)
    }
    const c = getGraphQLClient(params.token)
    if (!c) throw new Error("GraphQL client not initialized")
    const data = await c.request<{ dashboard: DashboardData }>(DASHBOARD_QUERY, { filters: params.filters })
    return data.dashboard
  } catch (error) {
    console.error("Fetch dashboard error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch dashboard")
  }
}

export async function updateProfileRequest(params: {
  token?: string
  input: Partial<Pick<User, "name" | "email" | "bio" | "avatarUrl">>
}): Promise<User> {
  try {
    if (!ENDPOINT) {
      await new Promise((r) => setTimeout(r, 500))
      return {
        id: "u_1",
        name: params.input.name || "Updated User",
        email: params.input.email || "updated@example.com",
        bio: params.input.bio || "Updated bio",
        avatarUrl: params.input.avatarUrl || "/placeholder.svg?height=64&width=64",
        role: "ADMIN",
      }
    }
    const c = getGraphQLClient(params.token)
    if (!c) throw new Error("GraphQL client not initialized")
    const data = await c.request<{ updateProfile: User }>(UPDATE_PROFILE_MUTATION, { input: params.input })
    return data.updateProfile
  } catch (error) {
    console.error("Update profile request error:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update profile")
  }
}

export async function getCurrentUserRequest(params: { token: string }) {
  const c = getGraphQLClient(params.token)
  if (!c) throw new Error("GraphQL client not initialized")
  const data = await c.request<{ me: User }>(ME_QUERY)
  return data.me
}
