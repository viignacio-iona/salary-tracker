'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { format, addMonths } from 'date-fns'
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
  bonuses: Array<{
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
  const isInitialLoad = useRef(true)
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
      const helpersData = Array.isArray(data) ? data : []
      setHelpers(helpersData)
      
      // Only check for redirect on the very first load AND when helpers are loaded
      if (isInitialLoad.current && helpersData.length > 0) {
        console.log('Initial load detected with helpers, will check for redirect')
        isInitialLoad.current = false
        setTimeout(() => {
          console.log('Calling checkAndRedirectIfMonthFullyPaid')
          checkAndRedirectIfMonthFullyPaid(helpersData)
        }, 100)
      }
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

  const checkAndRedirectIfMonthFullyPaid = (helpersToCheck = helpers) => {
    console.log('Checking for redirect...', { selectedMonth, helpersCount: helpersToCheck.length })
    
    // Check if all helpers are fully paid for the current month
    const [month, year] = selectedMonth.split('-')
    
    const allHelpersFullyPaid = helpersToCheck.every(helper => {
      // Get salary for this helper and month
      const salary = helper.salaries.find(s => s.month === month && s.year === parseInt(year))
      const salaryAmount = salary?.amount || 0
      
      // Get deductions and bonuses for this helper and month
      const deductions = helper.deductions.filter(d => d.month === month && d.year === parseInt(year))
      const bonuses = helper.bonuses.filter(b => b.month === month && b.year === parseInt(year))
      
      // Calculate totals
      const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0)
      const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0)
      const netPay = salaryAmount + totalBonuses - totalDeductions
      
      // Check if there's a "Fully paid" deduction that covers the net pay
      const fullyPaidDeduction = deductions.find(d => d.purpose === 'Fully paid')
      const isFullyPaid = fullyPaidDeduction && fullyPaidDeduction.amount >= netPay
      
      console.log(`Helper ${helper.name}:`, {
        salaryAmount,
        totalDeductions,
        totalBonuses,
        netPay,
        fullyPaidDeduction: fullyPaidDeduction?.amount,
        isFullyPaid
      })
      
      return isFullyPaid
    })
    
    console.log('All helpers fully paid:', allHelpersFullyPaid)
    
    // If all helpers are fully paid AND there are helpers, move to next month
    if (allHelpersFullyPaid && helpersToCheck.length > 0) {
      const currentDate = new Date(selectedMonth + '-01')
      const nextMonth = addMonths(currentDate, 1)
      const nextMonthString = format(nextMonth, 'yyyy-MM')
      console.log('Redirecting from', selectedMonth, 'to', nextMonthString)
      setSelectedMonth(nextMonthString)
    } else {
      console.log('Not redirecting - no helpers or not all fully paid')
    }
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
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 6 }, px: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box mb={{ xs: 3, sm: 5 }}>
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'flex-start' }} 
            gap={{ xs: 2, sm: 0 }}
            mb={2}
          >
            <Typography 
              variant="h4" 
              fontWeight={700} 
              color="text.primary" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2.125rem' },
                lineHeight: { xs: 1.2, sm: 1.3 }
              }}
            >
              Claver GC Salary Tracker
            </Typography>
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ 
                minWidth: { xs: 'auto', sm: 100 },
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 }
              }}
            >
              Logout
            </Button>
          </Box>
          <Typography 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Manage monthly salaries and deductions for your household helpers
          </Typography>
        </Box>

        {/* Controls */}
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }} 
          gap={{ xs: 2, sm: 2 }} 
          mb={{ xs: 3, sm: 5 }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddHelper(true)}
            sx={{ 
              minWidth: { xs: 'auto', sm: 150 }, 
              fontWeight: 600,
              py: { xs: 1.5, sm: 1.5 }
            }}
          >
            Add Helper
          </Button>
        </Box>

        {/* Helpers Grid */}
        {helpers.length === 0 ? (
          <Box textAlign="center" py={{ xs: 6, sm: 8 }}>
            <MonetizationOnOutlinedIcon sx={{ fontSize: { xs: 48, sm: 60 }, color: 'grey.300', mb: 2 }} />
            <Typography 
              variant="h6" 
              fontWeight={500} 
              color="text.primary" 
              mb={1}
              sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
            >
              No helpers added yet
            </Typography>
            <Typography 
              color="text.secondary" 
              mb={3}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Get started by adding your first household helper
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddHelper(true)}
              sx={{ 
                minWidth: { xs: 'auto', sm: 150 }, 
                fontWeight: 600,
                py: { xs: 1.5, sm: 1.5 }
              }}
            >
              Add Helper
            </Button>
          </Box>
        ) : (
          <Grid 
            container 
            spacing={{ xs: 2, sm: 3 }} 
            justifyContent="center" 
            sx={{ 
              width: '100%', 
              maxWidth: 900, 
              mx: 'auto', 
              px: { xs: 0, sm: 2 } 
            }}
          >
            {helpers.map((helper) => (
              <Grid 
                key={helper.id} 
                item 
                xs={12} 
                md={6} 
                sx={{ display: 'flex', justifyContent: 'center' }}
              >
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
