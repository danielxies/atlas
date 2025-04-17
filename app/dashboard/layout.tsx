'use client'

import RequireProfileCompletion from '../components/shared/RequireProfileCompletion'

export default function DashboardLayout({
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