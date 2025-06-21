"use client"

import { useState, useEffect, useContext, createContext, useCallback } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import type { AuthState } from "@/lib/auth"

interface AuthContextType {
  authState: AuthState
  login: () => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    principal: null,
    identity: null,
    authClient: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const isAuthenticated = await authService.isAuthenticated()

      if (isAuthenticated) {
        const principal = await authService.getPrincipal()
        const identity = await authService.getIdentity()
        const authClient = await authService.init()

        setAuthState({
          isAuthenticated: true,
          principal,
          identity,
          authClient,
        })

        // Check if user has completed setup
        const userData = localStorage.getItem("splitchain_user")
        if (!userData) {
          // First time login - redirect to setup
          router.push("/auth/setup")
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          principal: null,
          identity: null,
          authClient: null,
        })
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setAuthState({
        isAuthenticated: false,
        principal: null,
        identity: null,
        authClient: null,
      })
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const login = useCallback(async (): Promise<boolean> => {
    try {
      const success = await authService.login()
      if (success) {
        await checkAuth()
        return true
      }
      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }, [checkAuth])

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout()
      setAuthState({
        isAuthenticated: false,
        principal: null,
        identity: null,
        authClient: null,
      })
      localStorage.removeItem("splitchain_user")
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const contextValue: AuthContextType = {
    authState,
    login,
    logout,
    checkAuth,
    isLoading,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
