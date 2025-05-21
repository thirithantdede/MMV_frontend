'use client';
import config from "@/config"
import useMutate, { useMutateCallbackType } from "@/hooks/use-mutate"
import useSecureStorage from "@/hooks/use-secure-storage"
import useServerValidation from "@/hooks/use-server-validation"
import { useToast } from "@/hooks/use-toast";
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
  isInitializing: "initializing" | "authenticated" | "unauthenticated"
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { get,set, remove } = useSecureStorage()
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitializing, setIsInitializing] = useState<"initializing" | "authenticated" | "unauthenticated">("initializing")
  const { handleServerErrors } = useServerValidation()
  const { toast } = useToast()


  const loginOnSuccess: useMutateCallbackType = (response: any) => {
    set("auth-token", response.token)
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
    if (response?.status != "success") {
      handleServerErrors(response.error, setError)
      toast({
        title:"Login Failed",
        description:response?.error?.data?.message,
        variant:"destructive"
      })
      return false
    }
    return true
  }

  const logout = () => {
    remove("auth-token")
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

  const initUser = () => {
    const user = get("user")
    console.log(user);
    if(user){
      setUser(JSON.parse(user))
      remove("hasLoggedIn")
      remove("has-seen-loading")
      setIsAuthenticated(true)
      setIsInitializing("authenticated")
    }else{
      setIsInitializing("unauthenticated")
    }
  }

  useEffect(() => {
    initUser()
  }, [])

  return (
    <AuthContext.Provider  value={{ user, isAuthenticated, login, logout, isInitializing }}>
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
