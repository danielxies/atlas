'use client'

import RequireProfileCompletion from '../components/shared/RequireProfileCompletion'

export default function OpportunitiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireProfileCompletion>
      {children}
    </RequireProfileCompletion>
  )
} 