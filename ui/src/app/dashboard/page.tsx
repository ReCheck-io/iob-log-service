"use client"

import { Building2, ChevronLeft, ChevronRight, Coins, Eye, LogOut, Search, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import TokenizationModal from "@/components/TokenizationModal"
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui"
import { sampleBuildings, type Building } from "@/data/buildings"

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "tokenized" | "not-tokenized">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [tokenizeModalOpen, setTokenizeModalOpen] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [tokenizationStep, setTokenizationStep] = useState<"configure" | "deploying" | "success">("configure")
  const itemsPerPage = 10
  const router = useRouter()

  const filteredBuildings = sampleBuildings.filter((building) => {
    const matchesSearch =
      building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      statusFilter === "all" ||
      (statusFilter === "tokenized" && building.isTokenized) ||
      (statusFilter === "not-tokenized" && !building.isTokenized)

    return matchesSearch && matchesFilter
  })

  const handleTokenizeBuilding = (buildingId: string) => {
    const building = sampleBuildings.find((b) => b.uuid === buildingId)
    if (building) {
      setSelectedBuilding(building)
      setTokenizeModalOpen(true)
      setTokenizationStep("configure")
    }
  }

  const handleViewTokens = (buildingId: string) => {
    router.push(`/dashboard/token/${buildingId}`)
  }

  const handleRowDoubleClick = (building: Building) => {
    if (building.isTokenized) {
      handleViewTokens(building.uuid)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const totalPages = Math.ceil(filteredBuildings.length / itemsPerPage)
  const paginatedBuildings = filteredBuildings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalBuildings = sampleBuildings.length
  const tokenizedBuildings = sampleBuildings.filter((b) => b.isTokenized).length
  const totalTokenValue = sampleBuildings.filter((b) => b.isTokenized).reduce((sum, b) => sum + (b.totalSupply || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-slate-900">Building Tokenization</h1>
              <p className="text-sm text-slate-600">Internet of Building Tokenization hub</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/")}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBuildings}</div>
                <p className="text-xs text-muted-foreground">Properties in portfolio</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokenized Assets</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tokenizedBuildings}</div>
                <p className="text-xs text-muted-foreground">
                  {((tokenizedBuildings / totalBuildings) * 100).toFixed(1)}% of portfolio
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Token Supply</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTokenValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Tokens across all assets</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-heading font-semibold text-slate-900">Buildings Portfolio</h2>
              <p className="text-sm text-slate-600">Manage your real estate assets and tokenization</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">Property Listings</h3>
                  <p className="text-sm text-slate-600">
                    {filteredBuildings.length} of {totalBuildings} buildings
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search buildings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Buildings</SelectItem>
                      <SelectItem value="tokenized">Tokenized Only</SelectItem>
                      <SelectItem value="not-tokenized">Not Tokenized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Building</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Token Info</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBuildings.map((building) => (
                    <TableRow
                      key={building.uuid}
                      className="cursor-pointer hover:bg-slate-50"
                      onDoubleClick={() => handleRowDoubleClick(building)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{building.name}</div>
                          <div className="text-xs text-slate-400 mt-1">{building.uuid}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {building.isTokenized ? (
                          <Badge className="bg-indigo-100 text-indigo-800">
                            <Coins className="h-3 w-3 mr-1" />
                            Tokenized
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Not Tokenized</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(building.createdAt)}</div>
                        <div className="text-xs text-slate-500">{building.createdBy}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{building.version}</Badge>
                      </TableCell>
                      <TableCell>
                        {building.isTokenized ? (
                          <div>
                            <div className="text-sm font-medium">{building.tokenSymbol}</div>
                            <div className="text-xs text-slate-500">
                              {building.totalSupply?.toLocaleString()} tokens
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {building.isTokenized ? (
                          <Button variant="outline" size="sm" onClick={() => handleViewTokens(building.uuid)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Token
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => handleTokenizeBuilding(building.uuid)}>
                            <Coins className="h-4 w-4 mr-2" />
                            Tokenize
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="p-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredBuildings.length)} of {filteredBuildings.length}{" "}
                    buildings
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <TokenizationModal
        open={tokenizeModalOpen}
        onOpenChange={setTokenizeModalOpen}
        building={selectedBuilding}
        step={tokenizationStep}
        onStepChange={setTokenizationStep}
      />
    </div>
  )
}
