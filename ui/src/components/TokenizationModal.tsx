"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Coins, AlertCircle, CheckCircle, Eye } from "lucide-react"

interface Building {
  uuid: string
  name: string
  description: string
  createdAt: string
  createdBy: string
  abbreviation: string
  version: string
  isTokenized: boolean
  tokenSymbol?: string
  totalSupply?: number
}

interface TokenizationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  building: Building | null
  step: "configure" | "deploying" | "success"
  onStepChange: (step: "configure" | "deploying" | "success") => void
}

export default function TokenizationModal({
  open,
  onOpenChange,
  building,
  step,
  onStepChange,
}: TokenizationModalProps) {
  const [tokenConfig, setTokenConfig] = useState({
    tokenName: "",
    tokenSymbol: "",
    totalSupply: "",
    decimals: "8",
    description: "",
    initialPrice: "1.00",
    transferFee: "0.001",
  })

  useState(() => {
    if (building) {
      setTokenConfig({
        tokenName: `${building.name} Token`,
        tokenSymbol: `${building.abbreviation}-${building.uuid.slice(-3).toUpperCase()}`,
        totalSupply: "1000000",
        decimals: "8",
        description: `Tokenized ownership of ${building.name}. ${building.description}`,
        initialPrice: "1.00",
        transferFee: "0.001",
      })
    }
  })

  const handleTokenize = async () => {
    onStepChange("deploying")

    // TODO: Implement actual tokenization
    console.log("Tokenizing building with config:", tokenConfig)

    setTimeout(() => {
      onStepChange("success")
    }, 3000)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      onStepChange("configure")
    }, 200)
  }

  if (!building) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Coins className="h-5 w-5 text-indigo-600" />
            Tokenize Building
          </DialogTitle>
          <DialogDescription>
            Create ICRC-2 tokens for {building.name} on the Internet Computer Protocol
          </DialogDescription>
        </DialogHeader>

        {step === "configure" && (
          <div className="space-y-6">
            {/* Building Information */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-heading font-semibold mb-2">Building Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Name:</span>
                  <div className="font-medium">{building.name}</div>
                </div>
                <div>
                  <span className="text-slate-600">Abbreviation:</span>
                  <div className="font-medium">{building.abbreviation}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-600">Description:</span>
                  <div className="font-medium">{building.description}</div>
                </div>
                <div>
                  <span className="text-slate-600">Version:</span>
                  <div className="font-medium">{building.version}</div>
                </div>
                <div>
                  <span className="text-slate-600">Created:</span>
                  <div className="font-medium">{new Date(building.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Token Configuration */}
            <div className="space-y-4">
              <h3 className="font-heading font-semibold">Token Configuration</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenName">Token Name</Label>
                  <Input
                    id="tokenName"
                    value={tokenConfig.tokenName}
                    onChange={(e) => setTokenConfig((prev) => ({ ...prev, tokenName: e.target.value }))}
                    placeholder="e.g., Manhattan Plaza Token"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tokenSymbol">Token Symbol</Label>
                  <Input
                    id="tokenSymbol"
                    value={tokenConfig.tokenSymbol}
                    onChange={(e) => setTokenConfig((prev) => ({ ...prev, tokenSymbol: e.target.value }))}
                    placeholder="e.g., MPT-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalSupply">Total Supply</Label>
                  <Input
                    id="totalSupply"
                    type="number"
                    value={tokenConfig.totalSupply}
                    onChange={(e) => setTokenConfig((prev) => ({ ...prev, totalSupply: e.target.value }))}
                    placeholder="1000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="decimals">Decimals</Label>
                  <Input
                    id="decimals"
                    type="number"
                    value={tokenConfig.decimals}
                    onChange={(e) => setTokenConfig((prev) => ({ ...prev, decimals: e.target.value }))}
                    placeholder="8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Token Description</Label>
                <Textarea
                  id="description"
                  value={tokenConfig.description}
                  onChange={(e) => setTokenConfig((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the tokenized asset..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialPrice">Initial Price (USD)</Label>
                  <Input
                    id="initialPrice"
                    type="number"
                    step="0.01"
                    value={tokenConfig.initialPrice}
                    onChange={(e) => setTokenConfig((prev) => ({ ...prev, initialPrice: e.target.value }))}
                    placeholder="1.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transferFee">Transfer Fee (ICP)</Label>
                  <Input
                    id="transferFee"
                    type="number"
                    step="0.001"
                    value={tokenConfig.transferFee}
                    onChange={(e) => setTokenConfig((prev) => ({ ...prev, transferFee: e.target.value }))}
                    placeholder="0.001"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Cost Breakdown */}
            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-heading font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Deployment Costs
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Ledger Canister Deployment:</span>
                  <span className="font-medium">~0.5 ICP</span>
                </div>
                <div className="flex justify-between">
                  <span>Initial Cycles:</span>
                  <span className="font-medium">~0.2 ICP</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total Estimated Cost:</span>
                  <span className="font-bold">~0.7 ICP</span>
                </div>
              </div>
              <p className="text-xs text-amber-700 mt-2">
                Costs are paid by the platform. Users only pay transaction fees.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleTokenize} className="bg-indigo-600 hover:bg-indigo-700">
                <Coins className="h-4 w-4 mr-2" />
                Deploy Token
              </Button>
            </div>
          </div>
        )}

        {step === "deploying" && (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg mb-2">Deploying Token Contract</h3>
              <p className="text-slate-600">Creating ICRC-2 ledger canister on Internet Computer Protocol...</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Validating token configuration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Deploying ledger canister</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span>Initializing token supply</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="h-4 w-4 rounded-full border-2 border-slate-300"></div>
                  <span>Registering in building registry</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg mb-2">Token Successfully Deployed!</h3>
              <p className="text-slate-600">Your building has been tokenized and is now available for trading.</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-left">
              <h4 className="font-medium mb-2">Token Details:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Token Symbol:</span>
                  <span className="font-medium">{tokenConfig.tokenSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Supply:</span>
                  <span className="font-medium">{Number.parseInt(tokenConfig.totalSupply).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Canister ID:</span>
                  <span className="font-mono text-xs">rdmx6-jaaaa-aaaah-qcaiq-cai</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Eye className="h-4 w-4 mr-2" />
                View Token Details
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
