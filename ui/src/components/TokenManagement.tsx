"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Send, Plus, TrendingUp, Copy, AlertCircle, Coins } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

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

interface TokenHolder {
  address: string
  balance: number
  percentage: number
  lastActivity: string
}

interface Transaction {
  id: string
  type: "transfer" | "mint" | "burn"
  from?: string
  to?: string
  amount: number
  timestamp: string
  fee: number
  status: "completed" | "pending" | "failed"
}

const sampleTokenHolders: TokenHolder[] = [
  {
    address: "2vxsx-fae",
    balance: 250000,
    percentage: 25.0,
    lastActivity: "2024-12-10T14:30:00Z",
  },
  {
    address: "rdmx6-jaaaa",
    balance: 200000,
    percentage: 20.0,
    lastActivity: "2024-12-09T09:15:00Z",
  },
  {
    address: "rrkah-fqaaa",
    balance: 150000,
    percentage: 15.0,
    lastActivity: "2024-12-08T16:45:00Z",
  },
  {
    address: "ryjl3-tyaaa",
    balance: 100000,
    percentage: 10.0,
    lastActivity: "2024-12-07T11:20:00Z",
  },
  {
    address: "renrk-eyaaa",
    balance: 75000,
    percentage: 7.5,
    lastActivity: "2024-12-06T13:10:00Z",
  },
]

const sampleTransactions: Transaction[] = [
  {
    id: "tx-001",
    type: "transfer",
    from: "2vxsx-fae",
    to: "rdmx6-jaaaa",
    amount: 50000,
    timestamp: "2024-12-10T14:30:00Z",
    fee: 0.001,
    status: "completed",
  },
  {
    id: "tx-002",
    type: "mint",
    to: "2vxsx-fae",
    amount: 100000,
    timestamp: "2024-12-09T10:15:00Z",
    fee: 0.002,
    status: "completed",
  },
  {
    id: "tx-003",
    type: "transfer",
    from: "rrkah-fqaaa",
    to: "ryjl3-tyaaa",
    amount: 25000,
    timestamp: "2024-12-08T16:45:00Z",
    fee: 0.001,
    status: "completed",
  },
  {
    id: "tx-004",
    type: "burn",
    from: "renrk-eyaaa",
    amount: 10000,
    timestamp: "2024-12-07T09:30:00Z",
    fee: 0.001,
    status: "completed",
  },
]

interface TokenManagementProps {
  building: Building
}

export default function TokenManagement({ building }: TokenManagementProps) {
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [mintModalOpen, setMintModalOpen] = useState(false)
  const [transferAmount, setTransferAmount] = useState("")
  const [transferTo, setTransferTo] = useState("")
  const [mintAmount, setMintAmount] = useState("")
  const [activeTab, setActiveTab] = useState("building")
  const router = useRouter()

  const handleTransfer = async () => {
    // TODO: Implement token transfer
    // POST /api/buildings/{buildingId}/tokens/transfer
    // { to: transferTo, amount: parseFloat(transferAmount) }
    console.log("Transferring tokens:", { to: transferTo, amount: transferAmount })
    setTransferModalOpen(false)
    setTransferAmount("")
    setTransferTo("")
  }

  const handleMint = async () => {
    // TODO: Implement token minting
    // POST /api/buildings/{buildingId}/tokens/mint
    // { amount: parseFloat(mintAmount) }
    console.log("Minting tokens:", { amount: mintAmount })
    setMintModalOpen(false)
    setMintAmount("")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const currentPrice = 2.4 // USD per token
  const marketCap = (building.totalSupply || 0) * currentPrice
  const circulatingSupply = building.totalSupply || 0

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-indigo-600" />
              <div>
                <h1 className="text-xl font-heading font-bold">{building.tokenSymbol}</h1>
                <p className="text-sm text-slate-600">{building.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setTransferModalOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Transfer
            </Button>
            <Button onClick={() => setMintModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Mint
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Token Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Current Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading font-bold">${currentPrice}</div>
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.4% (24h)
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Market Cap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading font-bold">${(marketCap / 1000000).toFixed(1)}M</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Supply</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading font-bold">{building.totalSupply?.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Holders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading font-bold">{sampleTokenHolders.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="border-b border-slate-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("building")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "building"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Building Details
                </button>
                <button
                  onClick={() => setActiveTab("holders")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "holders"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Token Holders
                </button>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "transactions"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Transactions
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "analytics"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Analytics
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "building" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-heading font-semibold mb-4">Building Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700">Building Name</label>
                          <p className="text-slate-900 font-medium">{building.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Description</label>
                          <p className="text-slate-600">{building.description}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Abbreviation</label>
                          <p className="text-slate-900">{building.abbreviation}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700">Building UUID</label>
                          <p className="text-slate-900 font-mono text-sm">{building.uuid}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Created Date</label>
                          <p className="text-slate-900">{formatDate(building.createdAt)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Created By</label>
                          <p className="text-slate-900">{building.createdBy}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700">Version</label>
                          <Badge variant="outline">{building.version}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "holders" && (
                <>
                  <h3 className="text-lg font-heading font-semibold mb-4">Token Holders</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Address</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Last Activity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleTokenHolders.map((holder, index) => (
                        <TableRow key={holder.address}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{holder.address}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(holder.address)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{holder.balance.toLocaleString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full"
                                  style={{ width: `${holder.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm">{holder.percentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-600">
                              {new Date(holder.lastActivity).toLocaleDateString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}

              {activeTab === "transactions" && (
                <>
                  <h3 className="text-lg font-heading font-semibold mb-4">Recent Transactions</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>From/To</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <Badge
                              variant={
                                tx.type === "mint" ? "default" : tx.type === "burn" ? "destructive" : "secondary"
                              }
                            >
                              {tx.type.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {tx.from && (
                                <div className="text-xs text-slate-500">
                                  From: <span className="font-mono">{tx.from}</span>
                                </div>
                              )}
                              {tx.to && (
                                <div className="text-xs text-slate-500">
                                  To: <span className="font-mono">{tx.to}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{tx.amount.toLocaleString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{tx.fee} ICP</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                tx.status === "completed"
                                  ? "default"
                                  : tx.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-600">{new Date(tx.timestamp).toLocaleDateString()}</div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}

              {activeTab === "analytics" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-heading font-semibold mb-4">Token Distribution</h3>
                    <div className="space-y-4">
                      {sampleTokenHolders.slice(0, 5).map((holder, index) => (
                        <div key={holder.address} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-600" />
                            <span className="text-sm font-mono">{holder.address}</span>
                          </div>
                          <span className="text-sm font-medium">{holder.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-heading font-semibold mb-4">Token Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Circulating Supply:</span>
                        <span className="font-medium">{circulatingSupply.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Transactions:</span>
                        <span className="font-medium">{sampleTransactions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Average Transaction:</span>
                        <span className="font-medium">
                          {Math.round(
                            sampleTransactions.reduce((sum, tx) => sum + tx.amount, 0) / sampleTransactions.length,
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Canister ID:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">rdmx6-jaaaa-aaaah-qcaiq-cai</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard("rdmx6-jaaaa-aaaah-qcaiq-cai")}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Transfer Modal */}
      <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Transfer Tokens</DialogTitle>
            <DialogDescription>Send {building.tokenSymbol} tokens to another address</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transferTo">Recipient Address</Label>
              <Input
                id="transferTo"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="Enter ICP address..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transferAmount">Amount</Label>
              <Input
                id="transferAmount"
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Enter amount..."
              />
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-sm">
              <div className="flex justify-between">
                <span>Transfer Fee:</span>
                <span>0.001 ICP</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setTransferModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleTransfer} className="bg-indigo-600 hover:bg-indigo-700">
                Transfer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mint Modal */}
      <Dialog open={mintModalOpen} onOpenChange={setMintModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Mint Tokens</DialogTitle>
            <DialogDescription>Create new {building.tokenSymbol} tokens</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mintAmount">Amount to Mint</Label>
              <Input
                id="mintAmount"
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="Enter amount..."
              />
            </div>
            <div className="bg-amber-50 p-3 rounded-lg text-sm">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="font-medium">Minting Notice</span>
              </div>
              <p className="text-amber-700">
                Minting new tokens will increase the total supply and may affect token value.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setMintModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleMint} className="bg-indigo-600 hover:bg-indigo-700">
                Mint Tokens
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
