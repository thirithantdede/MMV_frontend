"use client"

import type React from "react"
import {  useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import LogoIcon from "@/public/imgs/logo-icon.png"
import LogoText from "@/public/imgs/logo-text.png"
import { useAuth } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const response = await login(email,password,setError)
    setIsLoading(false)
  }


  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md ">
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center justify-center">
              <Image src={LogoIcon} alt="Logo" width={100} />
              <Image src={LogoText} alt="Logo" width={280} />
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
              <div className="text-sm text-muted-foreground">Password must be at least 6 characters long</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Toaster />
    </div>
  )
}
