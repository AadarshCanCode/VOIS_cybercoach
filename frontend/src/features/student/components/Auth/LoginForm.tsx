import React, { useState, useEffect } from "react"
import { useAuth } from "@context/AuthContext"
import { Link } from "react-router-dom"
import { SEO } from "@components/SEO/SEO"
import { Button } from "@components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card"
import {
  Field,
  FieldGroup,
} from "@components/ui/field"

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = () => {
  const role = 'student' as const;
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { loginWithGoogle } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorDescription = params.get('error_description')
    const errorMsg = params.get('error')
    if (errorDescription || errorMsg) {
      setError(errorDescription || errorMsg || 'Authentication failed')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError('')
      await loginWithGoogle(role)
    } catch (err) {
      setError('Google login failed')
      setIsLoading(false)
    }
  }

  return (
    <>
      <SEO
        title="Login"
        description="Access your Cybercoach terminal. Sign in to continue your cybersecurity training and operations."
      />
      <div className="dark bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link to="/" className="flex items-center gap-2 self-center font-medium group transition-all hover:scale-105 mb-2">
            <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md group-hover:scale-110 transition-transform">
              <img src="/cybercoach-logo.png" alt="Cybercoach" className="size-8" />
            </div>
            <div className="text-left">
              <div className="text-xl font-black tracking-tighter text-white uppercase">Cyber <span className="text-[#00FF88]">Coach</span></div>
            </div>
          </Link>

          <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
            <CardHeader className="text-center space-y-1">
              <CardTitle className="text-2xl font-bold text-white">Welcome back</CardTitle>
              <CardDescription className="text-zinc-400">
                Access your terminal with Google
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-500 text-xs font-mono uppercase tracking-widest text-center">{error}</p>
                </div>
              )}

              <FieldGroup className="gap-6">
                <Field>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full bg-zinc-950 border-zinc-800 text-white hover:bg-zinc-900 hover:text-white h-12 text-md font-medium"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 size-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                    </svg>
                    Continue with Google
                  </Button>
                </Field>


              </FieldGroup>
            </CardContent>
          </Card>
          <p className="px-6 text-center text-xs text-zinc-500">
            By clicking continue, you agree to our <Link to="/terms" className="underline underline-offset-4">Terms of Service</Link>{" "}
            and <Link to="/privacy" className="underline underline-offset-4">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </>
  )
}