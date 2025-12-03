"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useOrganization } from '@clerk/nextjs'

interface TenantContextType {
  currentOrgId: string
  setCurrentOrgId: (orgId: string) => void
  isInitialized: boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

// Default organization from environment
const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID

if (!DEFAULT_ORG_ID) {
  throw new Error('NEXT_PUBLIC_DEFAULT_ORG_ID environment variable is not set')
}

/**
 * TenantProvider
 *
 * Manages which organization's data is currently being viewed in the UI.
 * Syncs with Clerk's active organization on initial load.
 *
 * Usage:
 * - Call setCurrentOrgId() when user switches orgs via OrganizationSwitcher
 * - All API calls will automatically use the correct org via useTenant() hook
 */
export function TenantProvider({ children }: { children: ReactNode }) {
  const { organization, isLoaded } = useOrganization()
  const [currentOrgId, setCurrentOrgId] = useState(DEFAULT_ORG_ID)
  const [isInitialized, setIsInitialized] = useState(false)

  // Sync with Clerk's organization on initial load
  useEffect(() => {
    if (isLoaded && !isInitialized) {
      if (organization?.id) {
        setCurrentOrgId(organization.id)
      }
      setIsInitialized(true)
    }
  }, [isLoaded, organization, isInitialized])

  return (
    <TenantContext.Provider value={{ currentOrgId, setCurrentOrgId, isInitialized }}>
      {children}
    </TenantContext.Provider>
  )
}

/**
 * useTenant Hook
 *
 * Access the currently viewing organization's ID.
 * Use this in API calls to ensure data is fetched for the correct org.
 *
 * @returns {currentOrgId, setCurrentOrgId}
 */
export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider')
  }
  return context
}
