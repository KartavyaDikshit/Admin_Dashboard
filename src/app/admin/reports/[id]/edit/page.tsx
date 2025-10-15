'use client'

import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import ReportForm from '@/components/reports/ReportForm'
import { toast } from 'react-hot-toast'
import { Report, ReportTranslation, TranslationStatus } from '@prisma/client' // Import Report and ReportTranslation

export default function EditReportPage({ params }) {
  const { id } = React.use(params)
  const [initialData, setInitialData] = useState<Report | null>(null) // Use Report type
  const [loading, setLoading] = useState(true)
  const [targetLocale, setTargetLocale] = useState('es') // Default for translation trigger
  const [isTranslating, setIsTranslating] = useState(false)

  // New states for viewing/editing translations
  const [viewLocale, setViewLocale] = useState<string>('') // Selected locale for viewing
  const [translatedData, setTranslatedData] = useState<ReportTranslation | null>(null) // Use ReportTranslation type
  const [loadingTranslatedData, setLoadingTranslatedData] = useState(false)
  const [isSavingTranslatedData, setIsSavingTranslatedData] = useState(false)

  // Fetch original report data
  useEffect(() => {
    const fetchReport = async () => {
      console.log('Fetching report...');
      try {
        const response = await fetch(`/api/reports/${id}`)
        console.log('Report API response:', response);
        const data = await response.json()
        console.log('Report API data:', data);
        if (response.ok) {
          setInitialData(data.report)
        } else {
          toast.error(data.error || 'Failed to fetch report')
        }
      } catch (error) {
        console.error('Error during report fetch:', error);
        toast.error('An error occurred while fetching report.')
      } finally {
        console.log('Finished report fetch. Setting loading to false.');
        setLoading(false)
      }
    }

    if (id) {
      fetchReport()
    }
  }, [id])

  // Fetch translated data when viewLocale changes
  useEffect(() => {
    const fetchTranslatedReport = async () => {
      if (!id || !viewLocale) {
        setTranslatedData(null)
        return
      }
      setLoadingTranslatedData(true)
      try {
        const response = await fetch(`/api/reports/${id}/translations/${viewLocale}`)
        const data = await response.json()
        if (response.ok) {
          setTranslatedData(data.translation)
        } else if (response.status === 404) {
          setTranslatedData(null) // No translation found for this locale
          toast('No translation found for this locale. You can generate one.')
        } else {
          toast.error(data.error || `Failed to fetch ${viewLocale} translation.`) 
        }
      } catch (error) {
        toast.error(`An error occurred while fetching ${viewLocale} translation.`) 
      } finally {
        setLoadingTranslatedData(false)
      }
    }

    fetchTranslatedReport()
  }, [id, viewLocale])


  const handleTranslate = async () => {
    if (!targetLocale) {
      toast.error('Please select a target locale.')
      return
    }
    setIsTranslating(true)
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: 'REPORT',
          contentId: id,
          targetLocale,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Translation job started for ${targetLocale}. Job ID: ${data.job.id}`)
        // After generating, automatically switch to view this locale
        setViewLocale(targetLocale);
      } else {
        toast.error(data.error || 'Failed to start translation job.')
      }
    } catch (error) {
      console.error('Error initiating translation:', error)
      toast.error('An error occurred while initiating translation.')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSaveTranslatedData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!translatedData || !viewLocale) return;

    setIsSavingTranslatedData(true);
    try {
      const response = await fetch(`/api/reports/${id}/translations/${viewLocale}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: translatedData.title,
          description: translatedData.description,
          summary: translatedData.summary,
          marketAnalysis: translatedData.marketAnalysis,
          competitiveAnalysis: translatedData.competitiveAnalysis,
          trendsAnalysis: translatedData.trendsAnalysis,
          strategicDevelopments: translatedData.strategicDevelopments,
          keyPlayers: translatedData.keyPlayers,
          metaTitle: translatedData.metaTitle,
          metaDescription: translatedData.metaDescription,
          status: translatedData.status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Translation for ${viewLocale} saved successfully!`);
        setTranslatedData(data.translation); // Update with fresh data from server
      } else {
        toast.error(data.error || `Failed to save ${viewLocale} translation.`);
      }
    } catch (error) {
      console.error('Error saving translated data:', error);
      toast.error('An error occurred while saving translated data.');
    } finally {
      setIsSavingTranslatedData(false);
    }
  };


  console.log('Current loading state before render:', loading);
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!initialData) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-black">Report Not Found</h2>
          <p className="mt-2 text-black">The report you are looking for does not exist.</p>
        </div>
      </AdminLayout>
    )
  }

  const availableLocales = ['en', 'de', 'fr', 'it', 'ja', 'ko', 'es']; // All 7 languages

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-black">Edit Report</h1>

        {/* Translation Trigger Section */}
        <div className="mb-6 p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-3 text-black">Generate AI Translation</h2>
          <div className="flex items-center space-x-3">
            <select
              value={targetLocale}
              onChange={(e) => setTargetLocale(e.target.value)}
              className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              disabled={isTranslating}
            >
              <option value="">Select Locale</option>
              {availableLocales.map(locale => (
                <option key={locale} value={locale}>{locale.toUpperCase()}</option>
              ))}
            </select>
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !targetLocale}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranslating ? 'Generating...' : 'Generate Translation'}
            </button>
          </div>
          {isTranslating && <p className="mt-2 text-sm text-black">AI translation in progress. This may take a moment.</p>}
        </div>

        {/* View Translations Section */}
        <div className="mb-6 p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-3 text-black">View Translations</h2>
          <div className="flex items-center space-x-3 mb-4">
            <select
              value={viewLocale}
              onChange={(e) => setViewLocale(e.target.value)}
              className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              disabled={loadingTranslatedData}
            >
              <option value="">Select Locale to View</option>
              {availableLocales.map(locale => (
                <option key={locale} value={locale}>{locale.toUpperCase()}</option>
              ))}
            </select>
            {loadingTranslatedData && <p className="text-sm text-black">Loading translation...</p>}
          </div>

          {viewLocale && !loadingTranslatedData && (translatedData ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Market Research Summary</h3>
                <div className="p-4 border rounded-md bg-gray-50 text-black">{translatedData.summary}</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Market Dynamics</h3>
                <div className="p-4 border rounded-md bg-gray-50 text-black">{translatedData.marketAnalysis}</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Regional Insights</h3>
                <div className="p-4 border rounded-md bg-gray-50 text-black">{translatedData.trendsAnalysis}</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Market Players</h3>
                <div className="p-4 border rounded-md bg-gray-50 text-black">
                  {translatedData.keyPlayers && translatedData.keyPlayers.length > 0 ? (
                    <ul>
                      {translatedData.keyPlayers.map((player, index) => (
                        <li key={index}>{player}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No key players found.</p>
                  )}
                  {translatedData.strategicDevelopments && (
                    <p className="mt-2">{translatedData.strategicDevelopments}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-black">No translation found for {viewLocale.toUpperCase()}. Generate one using the section above.</p>
          ))}
        </div>

        {/* Original Report Form */}
        {initialData && (
          <ReportForm reportId={id} initialData={initialData} />
        )}
      </div>
    </AdminLayout>
  )
}
