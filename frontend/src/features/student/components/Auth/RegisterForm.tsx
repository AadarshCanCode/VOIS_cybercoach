import React, { useState } from "react"
import { Mail, ArrowRight } from "lucide-react"
import { useAuth } from "@context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
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
  FieldLabel,
  FieldDescription,
} from "@components/ui/field"
import { Input } from "@components/ui/input"

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess
}) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      await register(email, password, name, 'student')
      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      if (msg.includes('Success!') || msg.includes('check your email')) {
        setIsEmailSent(true)
        setError('')
      } else {
        setError(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="dark bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-md flex-col gap-6 text-center">
          <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20">
                <Mail className="h-8 w-8 text-[#00FF88]" />
              </div>
              <CardTitle className="text-xl uppercase tracking-tighter text-white">Check Your Email</CardTitle>
              <CardDescription className="text-zinc-400">
                We've sent a verification link to <span className="text-white font-bold">{email}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-400 leading-relaxed">
                Please click the link in the email to activate your account.
              </p>
              <Link to="/login" className="block">
                <Button className="w-full bg-white text-black hover:bg-zinc-200">
                  Return to Login
                </Button>
              </Link>
              <p className="text-zinc-500 text-[10px] uppercase font-mono">
                Didn't get the email? Check your spam folder.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Sign Up"
        description="Join the elite cybersecurity training platform. Create your account to start hands-on labs and assessments."
      />
      <div className="dark bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-md flex-col gap-6">
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
              <CardTitle className="text-2xl font-bold text-white">Create an account</CardTitle>
              <CardDescription className="text-zinc-400">
                Enter your details to register as a student
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-500 text-xs font-mono uppercase tracking-widest text-center">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <FieldGroup className="gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="name" className="text-white">Full Name</FieldLabel>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                        className="bg-zinc-950 border-zinc-800 text-white focus:ring-0 focus:border-zinc-700"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="email" className="text-white">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="bg-zinc-950 border-zinc-800 text-white focus:ring-0 focus:border-zinc-700"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="password" className="text-white">Password</FieldLabel>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="bg-zinc-950 border-zinc-800 text-white focus:ring-0 focus:border-zinc-700"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirmPassword" className="text-white">Confirm</FieldLabel>
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        className="bg-zinc-950 border-zinc-800 text-white focus:ring-0 focus:border-zinc-700"
                      />
                    </Field>
                  </div>
                  <Field>
                    <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200" disabled={isLoading}>
                      {isLoading ? 'Signing up...' : (
                        <span className="flex items-center justify-center gap-2">
                          Sign Up <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                    <FieldDescription className="text-center text-zinc-400">
                      Already have an account? <Link to="/login" className="text-white underline underline-offset-4">Login</Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center text-xs text-zinc-500">
            By clicking continue, you agree to our <Link to="/terms" className="underline underline-offset-4">Terms of Service</Link>{" "}
            and <Link to="/privacy" className="underline underline-offset-4">Privacy Policy</Link>.
          </FieldDescription>
        </div>
      </div>
    </>
  )
}