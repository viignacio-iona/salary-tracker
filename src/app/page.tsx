'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import HelperCard from '@/components/HelperCard'
import AddHelperModal from '@/components/AddHelperModal'
import MonthSelector from '@/components/MonthSelector'
import { Box, Container, Typography, Button, CircularProgress } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import Grid from '@mui/material/Grid'

interface Helper {
  id: string
  name: string
  salaries: Array<{
    id: string
    amount: number
    month: string
    year: number
  }>
  deductions: Array<{
    id: string
    purpose: string
    amount: number
    date: string
    month: string
    year: number
  }>
}

export default function Home() {
  const [helpers, setHelpers] = useState<Helper[]>([])
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [showAddHelper, setShowAddHelper] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  const fetchHelpers = async () => {
    try {
      const response = await fetch('/api/helpers')
      if (!response.ok) {
        if (response.status === 401) {
          router.replace('/login')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setHelpers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching helpers:', error)
      setHelpers([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check authentication by making a request to a protected endpoint
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/helpers')
        if (response.status === 401) {
          router.replace('/login')
          return
        }
        setAuthChecked(true)
        fetchHelpers()
      } catch (error) {
        console.error('Auth check failed:', error)
        router.replace('/login')
      }
    }

    checkAuth()
  }, [router])

  const handleAddHelper = async (name: string) => {
    try {
      const response = await fetch('/api/helpers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      
      if (response.ok) {
        await fetchHelpers()
        setShowAddHelper(false)
      }
    } catch (error) {
      console.error('Error adding helper:', error)
    }
  }

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
  }

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!authChecked) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f5f5f5">
        <Box textAlign="center">
          <CircularProgress color="primary" />
          <Typography mt={2} color="text.secondary">Checking authentication...</Typography>
        </Box>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f5f5f5">
        <Box textAlign="center">
          <CircularProgress color="primary" />
          <Typography mt={2} color="text.secondary">Loading...</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box minHeight="100vh" bgcolor="#f5f5f5">
      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* Header */}
        <Box mb={5}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
              Claver Helpers&apos; Salary Tracker
            </Typography>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ minWidth: 100 }}
            >
              Logout
            </Button>
          </Box>
          <Typography color="text.secondary">
            Manage monthly salaries and deductions for your household helpers
          </Typography>
        </Box>

        {/* Controls */}
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={5}>
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddHelper(true)}
            sx={{ minWidth: 150, fontWeight: 600 }}
          >
            Add Helper
          </Button>
        </Box>

        {/* Helpers Grid */}
        {helpers.length === 0 ? (
          <Box textAlign="center" py={8}>
            <MonetizationOnOutlinedIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" fontWeight={500} color="text.primary" mb={1}>
              No helpers added yet
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Get started by adding your first household helper
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddHelper(true)}
              sx={{ minWidth: 150, fontWeight: 600 }}
            >
              Add Helper
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3} justifyContent="center" sx={{ width: '100%', maxWidth: 900, mx: 'auto', px: { xs: 1, sm: 2 } }}>
            {helpers.map((helper) => (
              <Grid key={helper.id} item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <HelperCard
                  helper={helper}
                  selectedMonth={selectedMonth}
                  onUpdate={fetchHelpers}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Add Helper Modal */}
      <AddHelperModal
        isOpen={showAddHelper}
        onClose={() => setShowAddHelper(false)}
        onAdd={handleAddHelper}
      />
    </Box>
  )
}
