"use client"

import type React from "react"
import { memo, useCallback, useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Loader2, Facebook, Instagram, Twitter, Globe, Calendar } from "lucide-react"
import TimeRangePicker from "@/components/ui/time-range-picker"
import type { ShopInformation } from "@/types"
import useQuery from "@/hooks/use-query"
import { storeCategories } from "@/components/panels/store-properties-panel"
import useSecureStorage from "@/hooks/use-secure-storage"
import useMutate from "@/hooks/use-mutate"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/hooks/use-toast"

interface FormData extends Omit<ShopInformation, "social_media" | "promotions" | "opening_hours" | "closed_days"> {
  social_media: {
    facebook?: string
    instagram?: string
    twitter?: string
    website?: string
  }
  promotions: {
    is_now: boolean
    end_date: string
    detail: string
  }
  opening_hours: {
    start: string
    end: string
  }
  closed_days: string
}

const closedDays = [
  { value: "none", label: "None" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
]

const ShopInformationUpdatePage = memo(function ShopInformationUpdatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get("id")

  const [isLoading, setIsLoading] = useState(true)
  const [showSocialMediaDialog, setShowSocialMediaDialog] = useState(false)
  const [tempSocialMedia, setTempSocialMedia] = useState<ShopInformation["social_media"]>({})

  const { get } = useSecureStorage()
  const ShopInformation = useQuery(`/shop-information/${shopId}`)
  const [updateShopInfo, { isLoading: isUpdating, isError, error: serverError }] = useMutate({
    callback: undefined,
    disableAlert: false,
  })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      id: "",
      readable_id: "",
      name: "",
      description: "",
      category: "Retail",
      contact_person: "",
      contact_email: "",
      contact_phone: "",
      is_foc: false,
      opening_hours: { start: "09:00", end: "21:00" },
      closed_days: "none",
      website: "",
      store_category_id: 1,
      social_media: { facebook: "", instagram: "", twitter: "", website: "" },
      promotions: { is_now: false, end_date: "", detail: "" },
    },
  })

  const shopInfo = useMemo(() => watch(), [watch])

  // Check authorization and fetch shop data
  useEffect(() => {
    const checkAuth = async () => {
      const accessData = get("shop_token")
      if (!accessData) {
        router.push("/shop-information")
        return
      }

      if (ShopInformation.isLoading) return

      try {
        const fetchedData = ShopInformation.data.shop_information
        Object.entries(fetchedData).forEach(([key, value]) => {
          if (key === "closed_days" && Array.isArray(value)) {
            setValue("closed_days", value.length > 0 ? value[0] : "none")
          } else {
            setValue(key as keyof FormData, value as any)
          }
        })
        setTempSocialMedia(fetchedData.social_media || {})
        setIsLoading(false)
      } catch (err) {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [shopId, router, setValue, ShopInformation.isLoading, ShopInformation.data, get])

  const handleCategoryChange = useCallback(
    (value: string) => {
      setValue("category", value)
      setValue("store_category_id", storeCategories.find((cat) => cat.name === value)?.id || 0)
    },
    [setValue]
  )

  const handleTempSocialMediaChange = useCallback(
    (platform: keyof ShopInformation["social_media"], value: string) => {
      setTempSocialMedia((prev) => ({ ...prev, [platform]: value }))
    },
    []
  )

  const handleApplySocialMedia = useCallback(() => {
    setValue("social_media", tempSocialMedia)
    setShowSocialMediaDialog(false)
  }, [tempSocialMedia, setValue])

  const handleSave = useCallback(
    async (data: FormData) => {
      try {
        const payload: ShopInformation = {
          ...data,
          closed_days: data.closed_days === "none" ? [] : [data.closed_days],
          token_key: get("shop_token"),
        }
       const handle = await updateShopInfo("/update-shop-info", payload)
       if(!handle.error){
          toast({
            title: "Success",
            description: "Shop information updated successfully",
            duration: 3000,
            variant: "success",
          })
       }else{
        toast({
          title: "Error",
          description: "Something went wrong",
          duration: 3000,
          variant: "destructive",
        })
       }
      } catch (err) {
        // Error is handled by useMutate
      }
    },
    [get, updateShopInfo]
  )

  const handleLogout = useCallback(() => {
    localStorage.removeItem("shop_token")
    router.push("/shop-information")
  }, [router])

  if (isLoading || ShopInformation.isLoading) {
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
    <div className="container max-w-5xl py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/shop-information")}
            className="rounded-full border-2 border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Shop Information</h1>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-2 border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Log Out
        </Button>
      </div>

      {(isError || serverError) && (
        <Alert variant="destructive" className="mb-8 rounded-lg">
          <AlertDescription>
            {serverError?.message || "Failed to load or update shop information"}
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg rounded-xl border-0">
        <CardHeader className="pb-6 relative">
          <CardTitle className="text-2xl font-semibold text-gray-800">Update Shop Information</CardTitle>
          <CardDescription className="text-gray-600">
            Manage your shop details, contact information, and promotional content
          </CardDescription>


          <div className=" flex items-center gap-3 absolute top-3 right-3">
             <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSocialMediaDialog(true)}
                    className="border-2transition-colors"
                  >
                    Edit Links
                  </Button>
            <Button
              onClick={handleSubmit(handleSave)}
              size={"sm"}
              disabled={isUpdating}
              variant={"outline"}
              className="ml-auto rounded-lg px-6 py-2 transition-colors"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>

        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Basic Information */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Shop Name
                </Label>
                <Input
                  id="name"
                  className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  {...register("name", { required: "Shop name is required" })}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  {...register("description")}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="store-category" className="text-sm font-medium text-gray-700">
                  Store Category
                </Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(value) => handleCategoryChange(value)}>
                      <SelectTrigger
                        id="store-category"
                        className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {storeCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="store-foc" className="text-sm font-medium text-gray-700">
                    Free of Charge
                  </Label>
                  <Controller
                    control={control}
                    name="is_foc"
                    render={({ field }) => (
                      <Switch
                        id="store-foc"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                    )}
                  />
                </div>
                <p className="text-xs text-gray-500">Enable if the store offers free services</p>
              </div>


              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="store-has-promotion" className="text-sm font-medium text-gray-700">
                    Has Promotion
                  </Label>
                  <Controller
                    control={control}
                    name="promotions.is_now"
                    render={({ field }) => (
                      <Switch
                        id="store-has-promotion"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                    )}
                  />
                </div>

                {shopInfo.promotions.is_now && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="promotion-end-date" className="text-sm font-medium text-gray-700">
                        Promotion End Date
                      </Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <Input
                          id="promotion-end-date"
                          type="date"
                          className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                          {...register("promotions.end_date")}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="promotion-details" className="text-sm font-medium text-gray-700">
                        Promotion Details
                      </Label>
                      <Textarea
                        id="promotion-details"
                        className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the promotion"
                        rows={3}
                        {...register("promotions.detail")}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Contact, Hours, Promotions, Social Media */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="contact_person" className="text-sm font-medium text-gray-700">
                  Contact Person
                </Label>
                <Input
                  id="contact_person"
                  className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  {...register("contact_person")}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="contact_email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  {...register("contact_email", { pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                />
                {errors.contact_email && <p className="text-sm text-red-500">{errors.contact_email.message}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="contact_phone" className="text-sm font-medium text-gray-700">
                  Phone
                </Label>
                <Input
                  id="contact_phone"
                  className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  {...register("contact_phone")}
                />
              </div>

              <Separator className="my-4 bg-gray-200" />

              <div className="space-y-3">
                <Label htmlFor="opening-hours" className="text-sm font-medium text-gray-700 block">
                  Opening Hours
                </Label>
                <Controller
                  control={control}
                  name="opening_hours"
                  render={({ field }) => (
                    <TimeRangePicker
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 w-full"
                    />
                  )}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="store-closed-days" className="text-sm font-medium text-gray-700">
                  Closed Days
                </Label>
                <Controller
                  control={control}
                  name="closed_days"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger
                        id="store-closed-days"
                        className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                      >
                        <SelectValue placeholder="Select closed day" />
                      </SelectTrigger>
                      <SelectContent>
                        {closedDays.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-gray-500">Day when the store is regularly closed</p>
              </div>

              <Separator className="my-4 bg-gray-200" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Social Media Links</h3>
                </div>

                {Object.keys(shopInfo.social_media).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {shopInfo.social_media.website && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Globe className="h-3 w-3" />
                        Website
                      </Badge>
                    )}
                    {shopInfo.social_media.facebook && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Facebook className="h-3 w-3" />
                        Facebook
                      </Badge>
                    )}
                    {shopInfo.social_media.instagram && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Instagram className="h-3 w-3" />
                        Instagram
                      </Badge>
                    )}
                    {shopInfo.social_media.twitter && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Twitter className="h-3 w-3" />
                        Twitter
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Dialog open={showSocialMediaDialog} onOpenChange={setShowSocialMediaDialog}>
            <DialogContent className="sm:max-w-[500px] rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-gray-800">
                  Edit Social Media Links
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Add social media links for {shopInfo.name}. These will be visible to visitors.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="social-website" className="text-sm font-medium text-gray-700">
                    Website
                  </Label>
                  <Input
                    id="social-website"
                    placeholder="https://example.com"
                    value={tempSocialMedia.website || ""}
                    onChange={(e) => handleTempSocialMediaChange("website", e.target.value)}
                    className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social-facebook" className="text-sm font-medium text-gray-700">
                    Facebook
                  </Label>
                  <Input
                    id="social-facebook"
                    placeholder="https://facebook.com/storename"
                    value={tempSocialMedia.facebook || ""}
                    onChange={(e) => handleTempSocialMediaChange("facebook", e.target.value)}
                    className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social-instagram" className="text-sm font-medium text-gray-700">
                    Instagram
                  </Label>
                  <Input
                    id="social-instagram"
                    placeholder="https://instagram.com/storename"
                    value={tempSocialMedia.instagram || ""}
                    onChange={(e) => handleTempSocialMediaChange("instagram", e.target.value)}
                    className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social-twitter" className="text-sm font-medium text-gray-700">
                    Twitter
                  </Label>
                  <Input
                    id="social-twitter"
                    placeholder="https://twitter.com/storename"
                    value={tempSocialMedia.twitter || ""}
                    onChange={(e) => handleTempSocialMediaChange("twitter", e.target.value)}
                    className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowSocialMediaDialog(false)}
                  className="border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplySocialMedia}
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Apply Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
})

export default ShopInformationUpdatePage
