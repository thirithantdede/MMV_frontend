"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import ProtectedRoute from "@/components/auth/protected-route"
import useMutate from "@/hooks/use-mutate"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/hooks/use-toast"
import useSecureStorage from "@/hooks/use-secure-storage"

export default function ShopInformationPage() {
  const router = useRouter()
  const [shopId, setShopId] = useState("")
  const [shopToken, setShopToken] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const {set} = useSecureStorage();

  const getSuccessShopInfo = (response : any) => {
      set("shop_token",response.shop_information.id);
      router.push(`/shop-information/update?id=${response.shop_information.readable_id}`)
  }

  const [getShopInfo, { isLoading:isChecking,isError,error:serverError }] = useMutate({ callback: getSuccessShopInfo,disableAlert:false });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!shopId  || !shopToken) {
      setError("All fields are required")
      return
    }

    setIsLoading(true)

    try {
      
      const getinfo = await getShopInfo('/get-shop-info',{
        shop_id : shopId,
        shop_token : shopToken
      })

      if(getinfo.error){
        toast({
          title: "Error",
          description: "Failed to validate shop credentials ! Please try again.",
          variant: "destructive",
        })
      }

    } catch (err) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = useCallback(() => {
    router.push("/explore")
  }, [])

  return (
    <ProtectedRoute>
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

            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                className=""
                variant={"destructive"}
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="" disabled={isLoading}>
                {isLoading ? "Validating..." : "Continue"}
              </Button>
            </CardFooter>

          </form>
        </Card>
      </div>
      <Toaster />

    </ProtectedRoute>
  )
}
