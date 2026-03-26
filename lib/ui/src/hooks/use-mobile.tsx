import * as React from "react"

const PHONE_BREAKPOINT = 640
const TABLET_BREAKPOINT = 768
const DESKTOP_BREAKPOINT = 1024
const MOBILE_BREAKPOINT = TABLET_BREAKPOINT

type DeviceType = "phone" | "tablet" | "desktop"
type Orientation = "portrait" | "landscape"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = React.useState<DeviceType>("desktop")

  React.useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < PHONE_BREAKPOINT) setDeviceType("phone")
      else if (w < DESKTOP_BREAKPOINT) setDeviceType("tablet")
      else setDeviceType("desktop")
    }
    update()
    const mqlPhone = window.matchMedia(`(max-width: ${PHONE_BREAKPOINT - 1}px)`)
    const mqlDesktop = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`)
    mqlPhone.addEventListener("change", update)
    mqlDesktop.addEventListener("change", update)
    return () => {
      mqlPhone.removeEventListener("change", update)
      mqlDesktop.removeEventListener("change", update)
    }
  }, [])

  return deviceType
}

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = React.useState<Orientation>("portrait")

  React.useEffect(() => {
    const update = () => {
      setOrientation(window.innerWidth > window.innerHeight ? "landscape" : "portrait")
    }
    update()
    const mql = window.matchMedia("(orientation: portrait)")
    mql.addEventListener("change", update)
    return () => mql.removeEventListener("change", update)
  }, [])

  return orientation
}

export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReduced(mql.matches)
    const onChange = () => setPrefersReduced(mql.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return prefersReduced
}

export function useSafeArea() {
  return {
    top: "env(safe-area-inset-top, 0px)",
    right: "env(safe-area-inset-right, 0px)",
    bottom: "env(safe-area-inset-bottom, 0px)",
    left: "env(safe-area-inset-left, 0px)",
  }
}
