import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

const handler = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || ""
    })
  ]
})

export default handler
