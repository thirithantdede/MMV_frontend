"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Save, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import type { ShopInformation } from "@/types"

export default function ShopInformationUpdatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get("id")

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [shopInfo, setShopInfo] = useState<ShopInformation>({
    id: "",
    name: "",
    description: "",
    category: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    openingHours: {
      monday: "9:00 AM - 9:00 PM",
      tuesday: "9:00 AM - 9:00 PM",
      wednesday: "9:00 AM - 9:00 PM",
      thursday: "9:00 AM - 9:00 PM",
      friday: "9:00 AM - 9:00 PM",
      saturday: "10:00 AM - 10:00 PM",
      sunday: "10:00 AM - 8:00 PM",
    },
    website: "",
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
    promotions: {
      current: "",
      upcoming: "",
    },
  })

  // Check if user is authorized
  useEffect(() => {
    const checkAuth = async () => {
      const accessData = localStorage.getItem("shop_info_access")

      if (!accessData) {
        router.push("/shop-information")
        return
      }

      const { shopId: storedId, timestamp } = JSON.parse(accessData)

      // Check if the token is expired (30 minutes)
      if (Date.now() - timestamp > 30 * 60 * 1000) {
        localStorage.removeItem("shop_info_access")
        router.push("/shop-information")
        return
      }

      // Check if the shop ID matches
      if (storedId !== shopId) {
        setError("Shop ID mismatch. Please log in again.")
        setTimeout(() => {
          localStorage.removeItem("shop_info_access")
          router.push("/shop-information")
        }, 3000)
        return
      }

      // Fetch shop information (simulated)
      try {
        // In a real app, you would fetch this from an API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setShopInfo((prev) => ({
          ...prev,
          id: shopId || "",
          name: `Shop ${shopId}`,
          description: "This is a sample shop description. Update this with your shop's details.",
          category: "Retail",
          contactPerson: "John Doe",
          contactEmail: "contact@shop.com",
          contactPhone: "+1 234 567 8900",
        }))

        setIsLoading(false)
      } catch (err) {
        setError("Failed to load shop information")
      }
    }

    checkAuth()
  }, [shopId, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [section, field] = name.split(".")
      setShopInfo((prev) => ({
        ...prev,
        [section]: {
          ...prev[section as keyof ShopInformation],
          [field]: value,
        },
      }))
    } else {
      setShopInfo((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSave = async () => {
    setError("")
    setSuccess("")
    setIsSaving(true)

    try {
      // In a real app, you would send this to an API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccess("Shop information updated successfully!")
      setTimeout(() => setSuccess(""), 5000)
    } catch (err) {
      setError("Failed to update shop information")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("shop_info_access")
    router.push("/shop-information")
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading shop information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Shop Information</h1>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Log Out
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Update Shop Information</CardTitle>
          <CardDescription>Update your shop details, contact information, and promotional content</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic">
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="contact">Contact Details</TabsTrigger>
              <TabsTrigger value="hours">Opening Hours</TabsTrigger>
              <TabsTrigger value="promotions">Promotions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Shop Name</Label>
                <Input id="name" name="name" value={shopInfo.name} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={shopInfo.category} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={shopInfo.description}
                  onChange={handleInputChange}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={shopInfo.website}
                  onChange={handleInputChange}
                  placeholder="https://"
                />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={shopInfo.contactPerson}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={shopInfo.contactEmail}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={shopInfo.contactPhone}
                  onChange={handleInputChange}
                />
              </div>

              <Separator className="my-4" />

              <h3 className="text-lg font-medium mb-2">Social Media</h3>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  name="socialMedia.facebook"
                  value={shopInfo.socialMedia.facebook}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="socialMedia.instagram"
                  value={shopInfo.socialMedia.instagram}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  name="socialMedia.twitter"
                  value={shopInfo.socialMedia.twitter}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/"
                />
              </div>
            </TabsContent>

            <TabsContent value="hours" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monday">Monday</Label>
                  <Input
                    id="monday"
                    name="openingHours.monday"
                    value={shopInfo.openingHours.monday}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tuesday">Tuesday</Label>
                  <Input
                    id="tuesday"
                    name="openingHours.tuesday"
                    value={shopInfo.openingHours.tuesday}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wednesday">Wednesday</Label>
                  <Input
                    id="wednesday"
                    name="openingHours.wednesday"
                    value={shopInfo.openingHours.wednesday}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thursday">Thursday</Label>
                  <Input
                    id="thursday"
                    name="openingHours.thursday"
                    value={shopInfo.openingHours.thursday}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="friday">Friday</Label>
                  <Input
                    id="friday"
                    name="openingHours.friday"
                    value={shopInfo.openingHours.friday}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saturday">Saturday</Label>
                  <Input
                    id="saturday"
                    name="openingHours.saturday"
                    value={shopInfo.openingHours.saturday}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sunday">Sunday</Label>
                  <Input
                    id="sunday"
                    name="openingHours.sunday"
                    value={shopInfo.openingHours.sunday}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="promotions" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPromotion">Current Promotion</Label>
                <Textarea
                  id="currentPromotion"
                  name="promotions.current"
                  value={shopInfo.promotions.current}
                  onChange={handleInputChange}
                  placeholder="Describe your current promotion"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upcomingPromotion">Upcoming Promotion</Label>
                <Textarea
                  id="upcomingPromotion"
                  name="promotions.upcoming"
                  value={shopInfo.promotions.upcoming}
                  onChange={handleInputChange}
                  placeholder="Describe your upcoming promotion"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving} className="ml-auto">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
