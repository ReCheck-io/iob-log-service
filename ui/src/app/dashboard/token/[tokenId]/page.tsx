import TokenManagement from "@/components/TokenManagement"
import { sampleBuildings } from "@/data/buildings"

interface TokenPageProps {
  params: Promise<{ tokenId: string }>
}

export default async function TokenPage({ params }: TokenPageProps) {
  const { tokenId } = await params

  const building = sampleBuildings.find((b) => b.uuid === tokenId)

  if (!building) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Building Not Found</h1>
          <p className="text-slate-600">The requested building could not be found.</p>
        </div>
      </div>
    )
  }

  return <TokenManagement building={building} />
}
