"use client"
import ProtectedRoute from "@/components/auth/protected-route"
import Dashboard from "./dashboard"

export default function DashboardPage() {

  return <ProtectedRoute><Dashboard /></ProtectedRoute>
}
