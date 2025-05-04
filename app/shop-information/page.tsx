"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function ShopInformationPage() {
  const router = useRouter()
  const [shopId, setShopId] = useState("")
  const [userName, setUserName] = useState("")
  const [shopToken, setShopToken] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!shopId || !userName || !shopToken) {
      setError("All fields are required")
      return
    }

    setIsLoading(true)

    try {
      // In a real app, you would validate the token with an API call
      // For this demo, we'll simulate a successful validation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store the information in localStorage for the next page
      localStorage.setItem(
        "shop_info_access",
        JSON.stringify({
          shopId,
          userName,
          shopToken,
          timestamp: Date.now(),
        }),
      )

      // Redirect to the shop information update form
      router.push(`/shop-information/update?id=${shopId}`)
    } catch (err) {
      setError("Failed to validate shop credentials")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Shop Information Access</CardTitle>
          <CardDescription>Enter your shop credentials to update your shop information</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="shopId">Shop ID</Label>
              <Input
                id="shopId"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                placeholder="Enter your shop ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopToken">Shop Access Token</Label>
              <Input
                id="shopToken"
                type="password"
                value={shopToken}
                onChange={(e) => setShopToken(e.target.value)}
                placeholder="Enter your shop access token"
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Validating..." : "Continue to Shop Information"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
