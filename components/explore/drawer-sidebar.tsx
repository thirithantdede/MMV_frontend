"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Home, Search, LogIn, UserPlus, ShoppingBag, LogOut, Presentation } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

interface DrawerSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function DrawerSidebar({ isOpen, onClose }: DrawerSidebarProps) {
  const router = useRouter()
  const { user, logout } = useAuth() // Added logout function from auth context

  const handleNavigation = (path: string) => {
    router.push(path)
    onClose()
  }

  const handleLogout = () => {
    logout() // Call logout function
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">Mall Explorer</SheetTitle>
          </div>
        </SheetHeader>

        <div className="py-6">
          {/* User Info or Auth Buttons */}
          <div className="px-6 mb-6">
            {user ? (
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {user.name || "User"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="justify-start w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Button
                  variant="default"
                  className="justify-start w-full"
                  onClick={() => handleNavigation("/shop-user/login")}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  className="justify-start w-full"
                  onClick={() => handleNavigation("/shop-user/register")}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Register
                </Button>
              </div>
            )}
          </div>

          <div className="px-2">
            <nav className="space-y-1">
              <NavItem icon={<Presentation />} label="Project" onClick={() => handleNavigation("/")} />
              <NavItem icon={<Search />} label="Explore" onClick={() => handleNavigation("/explore")} />
              {user && (
                <NavItem
                  icon={<ShoppingBag />}
                  label="Edit Shop"
                  onClick={() => handleNavigation("/shop-information")}
                />
              )}
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
}

function NavItem({ icon, label, onClick, active }: NavItemProps) {
  return (
    <button
      className={`flex items-center w-full px-3 py-2 rounded-md text-left ${
        active ? "bg-blue-100 text-blue-900" : "text-gray-700 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      <span className={`mr-3 ${active ? "text-blue-600" : "text-gray-500"}`}>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  )
}