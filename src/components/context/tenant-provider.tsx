"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface TenantContextType {
  currentOrgId: string
  setCurrentOrgId: (orgId: string) => void
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
 * Starts with the default organization from NEXT_PUBLIC_DEFAULT_ORG_ID.
 *
 * When replacing TeamSwitcher with CustomOrganizationSwitcher:
 * - Call setCurrentOrgId() when user switches orgs
 * - All API calls will automatically use the new org
 */
export function TenantProvider({ children }: { children: ReactNode }) {
  const [currentOrgId, setCurrentOrgId] = useState(DEFAULT_ORG_ID)

  return (
    <TenantContext.Provider value={{ currentOrgId, setCurrentOrgId }}>
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
