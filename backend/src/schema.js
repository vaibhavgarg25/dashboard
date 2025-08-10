import { buildSchema } from "graphql";
import { signup, login, updateProfile } from "./authController.js";
import { prisma } from "./utils/db.js";

export const typeDefs = buildSchema(`
  enum Role {
    ADMIN
    TEACHER
    STUDENT
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    bio: String
    avatarUrl: String
    createdAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input SignupInput {
    name: String!
    email: String!
    password: String!
    role: Role!
  }

  input UpdateProfileInput {
    name: String
    email: String
    bio: String
    avatarUrl: String
  }

  input DashboardFilters {
    startDate: String
    endDate: String
    role: Role
    q: String
  }

  type DashboardSummary {
    totalTeachers: Int!
    totalStudents: Int!
    weeklySignups: Int!
    activeThisWeek: Int!
  }

  type DashboardTrend {
    date: String!
    signups: Int!
  }

  type DashboardData {
    summary: DashboardSummary!
    trend: [DashboardTrend!]!
    users: [User!]!
  }

  type Query {
    dashboard(filters: DashboardFilters): DashboardData!
    me: User
  }

  type Mutation {
    signup(input: SignupInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): User!
  }
`);

export const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) return null;
      return prisma.user.findUnique({ where: { id: user.id } });
    },
    dashboard: async (_, { filters }, { user }) => {
      const start = filters?.startDate
        ? new Date(filters.startDate)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const end = filters?.endDate ? new Date(filters.endDate) : new Date();

      const totalTeachers = await prisma.user.count({ where: { role: "TEACHER" } });
      const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
      const weeklySignups = await prisma.user.count({
        where: { createdAt: { gte: start } }
      });

      // Build daily signups trend
      const usersInRange = await prisma.user.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          ...(filters?.role ? { role: filters.role } : {})
        },
        select: { createdAt: true }
      });

      // Aggregate counts per date
      const trendMap = {};
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        trendMap[dateStr] = 0;
      }

      usersInRange.forEach(u => {
        const dateStr = u.createdAt.toISOString().slice(0, 10);
        if (trendMap[dateStr] !== undefined) {
          trendMap[dateStr]++;
        }
      });

      const trend = Object.entries(trendMap).map(([date, signups]) => ({
        date,
        signups
      }));

      const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

      return {
        summary: { totalTeachers, totalStudents, weeklySignups, activeThisWeek: 0 },
        trend,
        users
      };
    }
  },
  Mutation: {
    signup,
    login,
    updateProfile
  }
};
