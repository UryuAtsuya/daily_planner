import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        accessToken?: string
        error?: "RefreshAccessTokenError"
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
        refreshToken?: string
        expiresAt?: number
        error?: "RefreshAccessTokenError"
    }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        if (!token.refreshToken) throw new Error("No refresh token")

        const url =
            "https://oauth2.googleapis.com/token?" +
            new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
            })

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
        })

        const refreshedTokens = await response.json()

        if (!response.ok) {
            throw refreshedTokens
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
        }
    } catch (error) {
        console.error("Error refreshing access token", error)

        return {
            ...token,
            error: "RefreshAccessTokenError",
        }
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/calendar",
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // Initial sign in
            if (account) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    expiresAt:
                        account.expires_at ??
                        Math.floor(Date.now() / 1000 + (account.expires_in ?? 3600)),
                    refreshToken: account.refresh_token ?? token.refreshToken,
                    error: undefined,
                }
            }

            if (!token.accessToken || !token.expiresAt) {
                return token
            }

            // Return previous token if the access token has not expired yet
            if (token.expiresAt && Date.now() < token.expiresAt * 1000) {
                return token
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token)
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken
            session.error = token.error
            return session
        },
    },
})
