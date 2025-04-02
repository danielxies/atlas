'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser, UserButton } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'

// Define types
type ResearchOpportunity = {
  id: string
  title: string
  professor: string
  department: string
  researchAreas: string[]
  description: string
  requirements: string[]
  datePosted: string
  deadline: string
  image: string
}

type Professor = {
  profile_link: string
  name: string
  email: string
  department: string
  research_areas: string[]
  preferred_majors: string[]
  research_description: string
  currently_looking_for: string
  cs_subdomain: string
}

// Similarity function for filtering (unchanged)
function calculateSimilarity(searchText: string, professor: Professor): number {
  const searchLower = searchText.toLowerCase().trim()
  if (!searchLower) return 0

  const searchTerms = searchLower.split(' ').filter(term => term.length >= 2)
  if (searchTerms.length === 0) return 0

  let score = 0
  for (const term of searchTerms) {
    if (professor.name.toLowerCase().includes(term)) score += 5
    if (professor.department.toLowerCase().includes(term)) score += 4
    if (professor.email.toLowerCase().includes(term)) score += 4
    if (professor.research_areas.some(area => area.toLowerCase().includes(term))) score += 3
    if (professor.preferred_majors.some(major => major.toLowerCase().includes(term))) score += 3
    if (professor.research_description.toLowerCase().includes(term)) score += 2
    if (professor.cs_subdomain.toLowerCase().includes(term)) score += 2
    if (professor.currently_looking_for.toLowerCase().includes(term)) score += 1
  }
  if (professor.name.toLowerCase() === searchLower) score += 3
  if (professor.department.toLowerCase() === searchLower) score += 2
  if (professor.email.toLowerCase() === searchLower) score += 2
  if (professor.research_areas.some(area => area.toLowerCase() === searchLower)) score += 2
  if (professor.preferred_majors.some(major => major.toLowerCase() === searchLower)) score += 2

  console.log(`Professor: ${professor.name}, Score: ${score}`)
  return score
}

// Opportunity Modal component (unchanged)
const OpportunityModal = ({
  opportunity,
  isOpen,
  onClose,
  onApply,
}: {
  opportunity: ResearchOpportunity | null
  isOpen: boolean
  onClose: () => void
  onApply: () => void
}) => {
  if (!isOpen || !opportunity) return null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
              {opportunity.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-1">Project Details</h3>
                <p className="text-gray-700">{opportunity.description}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-1">Requirements</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {opportunity.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-blue-700 mb-1">Research Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.researchAreas.map((area, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700 mb-3">Faculty Information</h3>
              <div className="mb-3">
                <p className="text-sm text-gray-500">Professor</p>
                <p className="font-medium">{opportunity.professor}</p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{opportunity.department}</p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-500">Date Posted</p>
                <p className="font-medium">{new Date(opportunity.datePosted).toLocaleDateString()}</p>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-500">Application Deadline</p>
                <p className="font-medium">{new Date(opportunity.deadline).toLocaleDateString()}</p>
              </div>
              <button
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition mt-4"
                onClick={onApply}
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Opportunity Card component
const OpportunityCard = ({
  opportunity,
  onClick,
}: {
  opportunity: ResearchOpportunity
  onClick: () => void
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="h-48 relative">
        <Image
          src={opportunity.image}
          alt={opportunity.title}
          fill
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{opportunity.title}</h3>
        <p className="text-blue-700 font-medium mb-1">{opportunity.professor}</p>
        <p className="text-gray-600 mb-3">{opportunity.department}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {opportunity.researchAreas.slice(0, 2).map((area, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {area}
            </span>
          ))}
          {opportunity.researchAreas.length > 2 && (
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              +{opportunity.researchAreas.length - 2} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
          </span>
          <button onClick={onClick} className="text-blue-600 hover:text-blue-800 font-medium transition">
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

// Professor Card component
const ProfessorCard = ({
  professor,
  onClick,
}: {
  professor: Professor
  onClick: () => void
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{professor.name}</h3>
        <p className="text-blue-700 font-medium mb-3">{professor.department}</p>

        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Research Areas</h4>
          <div className="flex flex-wrap gap-1">
            {professor.research_areas.slice(0, 3).map((area, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {area.replace(/[[\]']+/g, '')}
              </span>
            ))}
            {professor.research_areas.length > 3 && (
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                +{professor.research_areas.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Research Focus</h4>
          <p className="text-gray-600 text-sm line-clamp-3 min-h-[4em]">
            {professor.research_description || 'No description available'}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4">
          {professor.currently_looking_for && (
            <span className="text-sm text-gray-500">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Looking for Researchers</h4>
              {professor.currently_looking_for || 'No description available'}
            </span>
          )}
          <button onClick={onClick} className="text-blue-600 hover:text-blue-800 font-medium transition flex items-center gap-1">
            View Details
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Professor Modal component
const ProfessorModal = ({
  professor,
  isOpen,
  onClose,
  onApply,
}: {
  professor: Professor | null
  isOpen: boolean
  onClose: () => void
  onApply: () => void
}) => {
  if (!isOpen || !professor) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-blue-700 mb-1">{professor.name}</h2>
              <p className="text-sm text-gray-900">{professor.department}</p>
              <a
                href={professor.profile_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-flex items-center gap-1"
              >
                View Full Profile
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-blue-700 mb-2">Research Description</h3>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {professor.research_description || 'No description available'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-blue-700 mb-2">Research Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {professor.research_areas.map((area, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {area.replace(/[[\]']+/g, '')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
              <div>
                <div className="space-y-2">
                  <div>
                    <p className="text-lg font-bold text-blue-700 mb-3">Email</p>
                    <a href={`mailto:${professor.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                      {professor.email || 'Not available'}
                    </a>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-700 mb-3">CS Subdomain</p>
                    <p className="text-sm text-gray-900">
                      {professor.cs_subdomain || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-blue-700 mb-3">Preferred Majors</h3>
                <div className="flex flex-wrap gap-2">
                  {professor.preferred_majors && professor.preferred_majors.length > 0 ? (
                    professor.preferred_majors.map((major, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {major.replace(/[[\]']+/g, '')}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No preferred majors specified</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-blue-700 mb-3">Looking For Researchers</h3>
                <p className="text-sm text-gray-900">
                  {professor.currently_looking_for || 'Not specified'}
                </p>
              </div>

              <button
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition font-medium"
                onClick={onApply}
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResearchOpportunities() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()

  // Declare all hooks unconditionally
  const [professors, setProfessors] = useState<Professor[]>([])
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Define departments unconditionally
  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Biology', label: 'Biology' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Mathematics', label: 'Mathematics' },
  ]

  // Redirect if not signed in (after auth loads)
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login')
    }
  }, [isLoaded, isSignedIn, router])

  // Fetch professors data
  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        setIsDataLoading(true)
        const response = await fetch('/api/professors')
        if (!response.ok) throw new Error('Failed to fetch data')
        const data = await response.json()
        setProfessors(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsDataLoading(false)
      }
    }
    fetchProfessors()
  }, [])

  // Filter professors based on search and department
  useEffect(() => {
    let filtered = [...professors]
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(
        prof =>
          prof.department.trim().toLowerCase() === selectedDepartment.trim().toLowerCase()
      )
    }
    if (searchQuery.trim()) {
      filtered = filtered
        .map(prof => ({
          professor: prof,
          score: calculateSimilarity(searchQuery, prof),
        }))
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
        .map(result => result.professor)
    }
    const uniqueResults = Array.from(
      new Map(filtered.map(prof => [prof.profile_link, prof])).values()
    )
    setFilteredProfessors(uniqueResults)
  }, [professors, searchQuery, selectedDepartment])

  // Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }
  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department)
  }
  const openModal = (professor: Professor) => {
    setSelectedProfessor(professor)
    setIsModalOpen(true)
  }
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProfessor(null)
  }
  const handleApply = async () => {
    if (!selectedProfessor) return

    try {
      const { error } = await supabase.from('applications').insert({
        user_id: user?.id,
        professor_id: selectedProfessor.profile_link,
        applied_at: new Date().toISOString(),
        status: 'pending',
      })
      if (error) throw error
      alert('Application submitted successfully!')
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Failed to submit application')
    }
  }

  // Render loading indicator if either auth or data is not ready
  if (!isLoaded || !isSignedIn || isDataLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image
              src="/icon.png"
              alt="Research Hub Logo"
              width={36}
              height={36}
              className="cursor-pointer"
              onClick={() => router.push('/')}
            />
            <h2 className="text-xl font-bold text-blue-800">ResearchConnect</h2>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            <Link href="/opportunities" className="text-blue-600 font-medium transition">
              Opportunities
            </Link>
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 transition">
                  Login
                </Link>
                <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Opportunities</h1>
          <p className="text-gray-600">
            Discover and apply to exciting research projects across various disciplines
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 flex gap-4 items-start">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, research area, or department..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black h-[42px]"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 cursor-pointer h-[42px]"
            >
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {(searchQuery || selectedDepartment !== 'all') && (
          <p className="mt-2 text-sm text-black">
            Showing {filteredProfessors.length} unique results
          </p>
        )}

        {isDataLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfessors.map((professor) => (
                <ProfessorCard key={professor.profile_link} professor={professor} onClick={() => openModal(professor)} />
              ))}
            </div>
            {(searchQuery || selectedDepartment !== 'all') && filteredProfessors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {selectedDepartment !== 'all'
                    ? `No results found for ${departments.find((d) => d.value === selectedDepartment)?.label}. Try a different department or search terms.`
                    : 'No matching results found. Try different search terms.'}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Professor Modal */}
      <ProfessorModal professor={selectedProfessor} isOpen={isModalOpen} onClose={closeModal} onApply={handleApply} />
    </div>
  )
}
