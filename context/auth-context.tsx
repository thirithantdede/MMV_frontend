'use client';
import { toast } from "@/components/ui/use-toast"
import config from "@/config"
import useMutate, { useMutateCallbackType } from "@/hooks/use-mutate"
import useSecureStorage from "@/hooks/use-secure-storage"
import useServerValidation from "@/hooks/use-server-validation"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string,setError : any) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { set, remove } = useSecureStorage()
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { handleServerErrors } = useServerValidation()

  const loginOnSuccess: useMutateCallbackType = (response: any) => {
    set("auth-token", response.token)
    set("auth-type", "user")
    localStorage.setItem("expiresAt", (new Date().getTime() + config.userExpireIn).toString())

    set("user", JSON.stringify(response.user))
    setUser(response.user)
    setIsAuthenticated(true)

    toast({
      title: "Login Successful",
      description: "Welcome back!",
      variant: "success",
    })

    setTimeout(() => {
      window.location.href = "/"
    }, 1000)
  }

  const [postLogin] = useMutate({ callback: loginOnSuccess, navigateBack: false })

  const login = async (email: string, password: string,setError : any): Promise<boolean> => {
    const response = await postLogin("login", { email, password }) as any
    console.log('here',response);
    if (response?.status != "success") {
      handleServerErrors(response.error, setError)
      toast({
        title:"Login Fail",
        description:"faile",
        variant:"destructive"
      })
      return false
    }
    return true
  }

  const logout = () => {
    remove("auth-token")
    remove("auth-type")
    remove("user")
    localStorage.removeItem("expiresAt")

    setUser(null)
    setIsAuthenticated(false)

    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
      variant: "default",
    })

    // Redirect to login page or home
    window.location.href = "/login"
  }

  useEffect(() => {
    setIsAuthenticated(!!user)
  }, [user])

  return (
    <AuthContext.Provider  value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
