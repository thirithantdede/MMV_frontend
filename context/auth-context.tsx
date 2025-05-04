"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Default to a logged-in state with a dummy user
  const [user, setUser] = useState<User | null>({
    email: "user@example.com",
    name: "Demo User",
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=DU`,
  })
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  // Dummy login function - just updates the user state
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simple validation
    if (email && password.length >= 6) {
      const newUser = {
        email,
        name: email.split("@")[0], // Use part of email as name
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`, // Generate avatar from email
      }

      setUser(newUser)
      setIsAuthenticated(true)

      // Reset the loading state so it shows again after login
      localStorage.removeItem("has-seen-loading")

      return true
    }

    return false
  }

  const logout = () => {
    // Don't actually log out, just show a different user
    setUser({
      email: "user@example.com",
      name: "Demo User",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=DU`,
    })
  }

  return <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
