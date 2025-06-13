"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react"
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
import Link from "next/link"

export default function LoginPage() {
  const { register } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const data = {  
      name,
      email,
      password : password,
      password_confirmation : confirmPassword
    }

    await register(data, setError,'register')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

      {/* Floating Elements */}
      <div className="absolute -bottom-8 left-1/4 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000" />

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-4 items-center">
        {/* Left Side - Welcome Section */}
        <div className="lg:hidden text-center px-4 mb-6">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 shadow-lg mx-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-slate-700">Register For Free</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 leading-tight">
              Register for free
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                and start creating your own project
              </span>
            </h1>
          </div>
        </div>

        <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 shadow-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-slate-700">Register For Free</span>
            </div>  

            <h1 className="text-5xl font-bold text-slate-900 leading-tight">
              Register for free
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                and start creating your own project
              </span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-md">
              Access your dashboard and manage your projects with ease. Your journey starts here.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-slate-600">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              </div>
              <span>Secure authentication</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
              </div>
              <span>Fast and reliable</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600">
              <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full" />
              </div>
              <span>24/7 support</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center w-full px-4 lg:px-0">
          <Card className="w-full max-w-md bg-transparent border-none md:bg-white/80 md:backdrop-blur-xl md:border-white/20 md:shadow-2xl shadow-blue-500/10">
            <CardHeader className="space-y-1 pb-2">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30" />
                  <div className="relative bg-white rounded-2xl p-3 shadow-lg">
                    <Image
                      src={LogoIcon || "/placeholder.svg"}
                      alt="Logo"
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  </div>
                </div>
                <Image
                  src={LogoText || "/placeholder.svg"}
                  alt="Logo"
                  width={300}
                  height={30}
                  className="object-contain"
                />
              </div>

            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-3">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Label htmlFor="name" className="text-slate-700 font-medium">
                    Name
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-11 h-12 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-sm text-slate-500">Password must be at least 6 characters long</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-sm text-slate-500">Password must be at least 6 characters long</p>
                </div>


              </CardContent>

              <CardFooter className="pt-1 flex flex-col gap-2">
                <Button
                  type="submit"
                  className="w-full h-12 text-white font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in to your account"
                  )}
                </Button>
                <div className="text-center space-y-2 block">
                  <p className="text-sm text-slate-500">Already have an account? <Link href="/login" className="text-blue-500">Login</Link></p>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
