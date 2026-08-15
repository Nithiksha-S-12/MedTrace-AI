import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "./db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        id: { label: "ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.id || !credentials?.password) return null;

        let user = null;
        let dbConnected = false;
        try {
          await connectToDatabase();
          dbConnected = true;
          // Check if user exists by govId or licenseNumber
          user = await User.findOne({
            $or: [{ govId: credentials.id }, { licenseNumber: credentials.id }, { healthId: credentials.id }],
          });
        } catch (error) {
          console.warn("Database connection failed, falling back to mock data");
        }

        if (user && user.password === credentials.password) {
          return {
            id: user._id.toString(),
            name: user.name,
            role: user.role,
            dbId: user._id.toString()
          };
        }

        // Mock users logic (if DB is empty, maybe create them or handle fallback)
        const mockUsers: Record<string, any> = {
          "1234567890": { role: "citizen", name: "Arjun Kumar", govId: "1234567890", healthId: "HID-A7X2K", password: "password" },
          "DOC001": { role: "doctor", name: "Dr. Priya Sharma", licenseNumber: "DOC001", password: "password", isVerified: true },
          "DOC002": { role: "diagnostic", name: "Dr. Rajesh Mehta", licenseNumber: "DOC002", hospital: "Apollo Diagnostics", password: "password", isVerified: true },
          "ADMIN001": { role: "admin", name: "System Administrator", licenseNumber: "ADMIN001", password: "password", isVerified: true }
        };

        if (mockUsers[credentials.id] && mockUsers[credentials.id].password === credentials.password) {
          const mockData = mockUsers[credentials.id];
          let userId = credentials.id;
          
          if (dbConnected) {
            try {
              // Upsert mock user — get real MongoDB _id
              const upserted = await User.findOneAndUpdate(
                { $or: [{ govId: mockData.govId }, { licenseNumber: mockData.licenseNumber }] },
                { $setOnInsert: { ...mockData } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );
              if (upserted) userId = upserted._id.toString();
            } catch (error) {
              console.warn("Could not upsert mock user to DB. Using fallback ID.", error);
            }
          }

          return {
            id: userId,
            name: mockData.name,
            role: mockData.role,
            dbId: userId
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.dbId = (user as any).dbId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).dbId = token.dbId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "medtrace-secret-key-for-hackathon",
};
