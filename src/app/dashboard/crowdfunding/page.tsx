import { Suspense } from "react"
import CampaignList from "@/components/crowdfunding/CampaignList"

export const dynamic = "force-dynamic"

export default function CrowdfundingDashboard() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CampaignList />
        </Suspense>
    )
}
