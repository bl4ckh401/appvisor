"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ModernButton } from "@/components/ui/modern-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Home, LayoutDashboard, LogIn, LogOut, User, Sparkles, CreditCard } from "lucide-react"

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [supabaseError, setSupabaseError] = useState(false)
  const pathname = usePathname()

  let supabase: ReturnType<typeof createClient> | null = null

  try {
    supabase = createClient()
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error)
    setSupabaseError(true)
  }

  useEffect(() => {
    if (!supabase) return

    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error("Auth error:", error)
          return
        }

        setIsLoggedIn(!!user)
      } catch (error) {
        console.error("Failed to check auth:", error)
      }
    }

    checkAuth()

    let authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null

    try {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        setIsLoggedIn(!!session?.user)
      })
      authListener = { data }
    } catch (error) {
      console.error("Failed to set up auth listener:", error)
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      authListener?.data?.subscription?.unsubscribe?.()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [supabase])

  const handleSignOut = async () => {
    if (!supabase) return

    try {
      await supabase.auth.signOut()
      setIsMenuOpen(false)
    } catch (error) {
      console.error("Failed to sign out:", error)
    }
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false
    return pathname.startsWith(path)
  }

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-lg" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <motion.div
            className="mr-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 p-2 shadow-md"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          <motion.span
            className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            AppVisor
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <NavLink href="/" active={pathname === "/"} icon={<Home className="h-4 w-4" />}>
            Home
          </NavLink>

          {isLoggedIn ? (
            <>
              <NavLink href="/dashboard" active={isActive("/dashboard")} icon={<LayoutDashboard className="h-4 w-4" />}>
                Dashboard
              </NavLink>
              <NavLink href="/profile" active={isActive("/profile")} icon={<User className="h-4 w-4" />}>
                Profile
              </NavLink>
              <NavLink href="/pricing" active={isActive("/pricing")} icon={<CreditCard className="h-4 w-4" />}>
                Pricing
              </NavLink>
              <ModernButton variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </ModernButton>
            </>
          ) : (
            <>
              <NavLink href="/pricing" active={isActive("/pricing")} icon={<CreditCard className="h-4 w-4" />}>
                Pricing
              </NavLink>
              <ModernButton asChild>
                <Link href="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </ModernButton>
            </>
          )}

          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden space-x-2">
          <ThemeToggle />
          <ModernButton variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </ModernButton>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
              />

              <motion.div
                className="fixed inset-y-0 right-0 w-full max-w-sm bg-background/95 backdrop-blur-xl border-l border-white/10 shadow-2xl md:hidden z-50"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                    <div className="mr-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 p-2">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent">
                      AppVisor
                    </span>
                  </Link>
                  <ModernButton variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </ModernButton>
                </div>

                <nav className="p-6 space-y-4">
                  <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)} icon={<Home className="h-5 w-5" />}>
                    Home
                  </MobileNavLink>

                  {isLoggedIn ? (
                    <>
                      <MobileNavLink
                        href="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        icon={<LayoutDashboard className="h-5 w-5" />}
                      >
                        Dashboard
                      </MobileNavLink>
                      <MobileNavLink
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        icon={<User className="h-5 w-5" />}
                      >
                        Profile
                      </MobileNavLink>
                      <MobileNavLink
                        href="/pricing"
                        onClick={() => setIsMenuOpen(false)}
                        icon={<CreditCard className="h-5 w-5" />}
                      >
                        Pricing
                      </MobileNavLink>
                      <div className="pt-4 mt-4 border-t border-white/10">
                        <ModernButton variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                          <LogOut className="h-5 w-5 mr-3" />
                          Sign Out
                        </ModernButton>
                      </div>
                    </>
                  ) : (
                    <>
                      <MobileNavLink
                        href="/pricing"
                        onClick={() => setIsMenuOpen(false)}
                        icon={<CreditCard className="h-5 w-5" />}
                      >
                        Pricing
                      </MobileNavLink>
                      <div className="pt-4 mt-4 border-t border-white/10">
                        <ModernButton className="w-full justify-start" onClick={() => setIsMenuOpen(false)} asChild>
                          <Link href="/auth">
                            <LogIn className="h-5 w-5 mr-3" />
                            Sign In
                          </Link>
                        </ModernButton>
                      </div>
                    </>
                  )}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

function NavLink({
  href,
  active,
  children,
  icon,
}: { href: string; active: boolean; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-md"
          : "hover:bg-white/10 text-foreground/80 hover:text-foreground"
      }`}
    >
      <span className="mr-2">{icon}</span>
      {children}
    </Link>
  )
}

function MobileNavLink({
  href,
  onClick,
  children,
  icon,
}: { href: string; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-md"
          : "hover:bg-white/10 text-foreground/80 hover:text-foreground"
      }`}
    >
      <span className="mr-3">{icon}</span>
      {children}
    </Link>
  )
}
