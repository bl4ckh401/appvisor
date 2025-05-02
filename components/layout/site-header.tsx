"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { GlassButton } from "@/components/ui/glass-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { Menu, X, Home, LayoutDashboard, LogIn, LogOut, User, Sparkles, CreditCard } from "lucide-react"

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }

    checkAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      authListener?.subscription.unsubscribe()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsMenuOpen(false)
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false
    return pathname.startsWith(path)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mr-2 rounded-full bg-primary p-1"
            >
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl font-bold text-glow"
            >
              AppVisor
            </motion.span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink href="/" active={pathname === "/"} icon={<Home className="h-4 w-4 mr-1" />}>
            Home
          </NavLink>

          {isLoggedIn ? (
            <>
              <NavLink
                href="/dashboard"
                active={isActive("/dashboard")}
                icon={<LayoutDashboard className="h-4 w-4 mr-1" />}
              >
                Dashboard
              </NavLink>
              <NavLink href="/profile" active={isActive("/profile")} icon={<User className="h-4 w-4 mr-1" />}>
                Profile
              </NavLink>
              <NavLink href="/pricing" active={isActive("/pricing")} icon={<CreditCard className="h-4 w-4 mr-1" />}>
                Pricing
              </NavLink>
              <GlassButton variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </GlassButton>
            </>
          ) : (
            <>
              <NavLink href="/pricing" active={isActive("/pricing")} icon={<CreditCard className="h-4 w-4 mr-1" />}>
                Pricing
              </NavLink>
              <GlassButton asChild className="glossy-button">
                <Link href="/auth">
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign In
                </Link>
              </GlassButton>
            </>
          )}

          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <ThemeToggle />
          <GlassButton variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </GlassButton>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
            <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-background p-6 shadow-lg glossy-card animate-in slide-in-from-right">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                  <div className="mr-2 rounded-full bg-primary p-1">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold text-glow">AppVisor</span>
                </Link>
                <GlassButton variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </GlassButton>
              </div>

              <nav className="mt-8 flex flex-col space-y-4">
                <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)} icon={<Home className="h-5 w-5 mr-2" />}>
                  Home
                </MobileNavLink>

                {isLoggedIn ? (
                  <>
                    <MobileNavLink
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      icon={<LayoutDashboard className="h-5 w-5 mr-2" />}
                    >
                      Dashboard
                    </MobileNavLink>
                    <MobileNavLink
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      icon={<User className="h-5 w-5 mr-2" />}
                    >
                      Profile
                    </MobileNavLink>
                    <MobileNavLink
                      href="/pricing"
                      onClick={() => setIsMenuOpen(false)}
                      icon={<CreditCard className="h-5 w-5 mr-2" />}
                    >
                      Pricing
                    </MobileNavLink>
                    <div className="pt-4 mt-4 border-t border-border/30">
                      <GlassButton variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                        <LogOut className="h-5 w-5 mr-2" />
                        Sign Out
                      </GlassButton>
                    </div>
                  </>
                ) : (
                  <>
                    <MobileNavLink
                      href="/pricing"
                      onClick={() => setIsMenuOpen(false)}
                      icon={<CreditCard className="h-5 w-5 mr-2" />}
                    >
                      Pricing
                    </MobileNavLink>
                    <div className="pt-4 mt-4 border-t border-border/30">
                      <GlassButton
                        className="w-full justify-start glossy-button"
                        onClick={() => setIsMenuOpen(false)}
                        asChild
                      >
                        <Link href="/auth">
                          <LogIn className="h-5 w-5 mr-2" />
                          Sign In
                        </Link>
                      </GlassButton>
                    </div>
                  </>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function NavLink({ href, active, children, icon }) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        active ? "bg-primary text-primary-foreground glossy-button" : "hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {icon}
      {children}
    </Link>
  )
}

function MobileNavLink({ href, onClick, children, icon }) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
        isActive ? "bg-primary text-primary-foreground glossy-button" : "hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {icon}
      {children}
    </Link>
  )
}
