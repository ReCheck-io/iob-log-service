"use client"

import { Building2, Key, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"

export default function AuthPage() {
  const [authStep, setAuthStep] = useState<"mtls" | "icp" | "authenticated">("mtls")
  const [mtlsAuthenticated, setMtlsAuthenticated] = useState(false)
  const [icpAuthenticated, setIcpAuthenticated] = useState(false)
  const router = useRouter()

  const handleMtlsLogin = async () => {
    // TODO: Implement mTLS authentication with browser certificates
    // The browser will automatically present client certificates for mTLS handshake
    try {
      console.log("Validating browser-loaded client certificate...")
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log("mTLS authentication successful")
      setMtlsAuthenticated(true)
      setAuthStep("icp")
    } catch (error) {
      console.error("mTLS authentication failed:", error)
    }
  }

  const handleIcpLogin = async () => {
    // TODO: Implement ICP Identity authentication
    console.log("ICP Identity authentication initiated")
    setIcpAuthenticated(true)
    setAuthStep("authenticated")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-cyan-600" />
            <h1 className="text-2xl font-heading font-bold text-slate-900">IoB &mdash; RE-Tokenize</h1>
          </div>
          <p className="text-slate-600 font-sans">Your Internet of Buildings Tokenization Hub</p>
        </div>

        {/* Authentication Steps */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${mtlsAuthenticated ? "bg-cyan-600 text-white" : "bg-slate-200 text-slate-600"
                }`}
            >
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Certificate</span>
          </div>
          <div className="w-8 h-px bg-slate-300" />
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${icpAuthenticated ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                }`}
            >
              <Key className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">ICP Identity</span>
          </div>
        </div>

        {/* mTLS Authentication */}
        {authStep === "mtls" && (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Secure Access</CardTitle>
              <CardDescription>
                Authenticate with your browser-loaded mTLS certificate to access the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border">
                  <Shield className="h-5 w-5 text-cyan-600" />
                  <div>
                    <p className="font-medium text-sm">Client Certificate Status</p>
                    <p className="text-xs text-slate-600">Browser will automatically present your loaded certificate</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>• Ensure your client certificate is installed in your browser</p>
                  <p>• The browser will prompt for certificate selection if multiple are available</p>
                  <p>• Certificate validation happens automatically during the TLS handshake</p>
                </div>
              </div>

              <Button onClick={handleMtlsLogin} className="w-full bg-cyan-600 hover:bg-cyan-700">
                <Shield className="h-4 w-4 mr-2" />
                Authenticate with Browser Certificate
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ICP Identity Authentication */}
        {authStep === "icp" && (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">ICP Identity</CardTitle>
              <CardDescription>Connect your Internet Computer identity to manage tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    mTLS Verified
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  Platform access granted. Now connect your ICP identity for blockchain operations.
                </p>
              </div>
              <Button onClick={handleIcpLogin} className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Key className="h-4 w-4 mr-2" />
                Connect ICP Identity
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
