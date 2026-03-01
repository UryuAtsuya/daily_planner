"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

interface AdSlotProps {
  slot: string
  className?: string
  format?: "auto" | "rectangle" | "horizontal" | "vertical"
  fullWidthResponsive?: boolean
}

const isAdsEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === "true"
const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

function formatToDataFormat(format: AdSlotProps["format"]) {
  if (!format || format === "auto") return "auto"
  if (format === "rectangle") return "rectangle"
  if (format === "horizontal") return "horizontal"
  return "vertical"
}

export function AdSlot({
  slot,
  className,
  format = "auto",
  fullWidthResponsive = true,
}: AdSlotProps) {
  useEffect(() => {
    if (!isAdsEnabled) return
    if (!adClient || !slot) return

    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (error) {
      console.error("AdSense slot render failed", error)
    }
  }, [slot])

  if (!isAdsEnabled || !adClient) {
    return (
      <div
        className={className}
        aria-label="広告プレースホルダー"
        data-ad-slot={slot}
      >
        <div className="rounded-xl border border-dashed ui-border px-4 py-5 text-center text-xs font-body ui-text-muted">
          Ad Placeholder ({slot})
        </div>
      </div>
    )
  }

  return (
    <div className={className} data-ad-slot={slot}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format={formatToDataFormat(format)}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  )
}
