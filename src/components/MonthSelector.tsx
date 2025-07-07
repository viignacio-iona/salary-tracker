'use client'

import { useState } from 'react'
import { Box, IconButton, Menu, MenuItem, Typography, Button } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { format, subMonths, addMonths } from 'date-fns'

interface MonthSelectorProps {
  selectedMonth: string
  onMonthChange: (month: string) => void
}

export default function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const currentDate = new Date(selectedMonth + '-01')
  const displayText = format(currentDate, 'MMMM yyyy')

  const handlePreviousMonth = () => {
    const previousMonth = subMonths(currentDate, 1)
    onMonthChange(format(previousMonth, 'yyyy-MM'))
  }

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentDate, 1)
    onMonthChange(format(nextMonth, 'yyyy-MM'))
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleMonthSelect = (month: string) => {
    onMonthChange(month)
    setAnchorEl(null)
  }

  // Generate recent months for quick selection
  const recentMonths = []
  const today = new Date()
  for (let i = 0; i < 12; i++) {
    const month = subMonths(today, i)
    recentMonths.push({
      value: format(month, 'yyyy-MM'),
      label: format(month, 'MMMM yyyy'),
    })
  }

  return (
    <>
      {/* Mobile layout: xs only */}
      <Box
        bgcolor="white"
        borderRadius={2}
        boxShadow={1}
        sx={{
          minHeight: 48,
          px: 0,
          position: 'relative',
          display: { xs: 'block', sm: 'none' },
          width: '100%',
        }}
      >
        <IconButton
          onClick={handlePreviousMonth}
          color="primary"
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            p: 1.5,
            minWidth: 48,
            minHeight: 48,
            zIndex: 2,
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Button
          startIcon={<CalendarMonthIcon />}
          onClick={handleMenuOpen}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.primary',
            px: 1.5,
            py: 1.5,
            fontSize: '0.875rem',
            minHeight: 48,
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          {displayText}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              maxHeight: 300,
              minWidth: 200,
            },
          }}
        >
          <Box px={1.5} pt={1} pb={0.5}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              mb={1}
              sx={{ fontSize: '0.75rem' }}
            >
              Recent Months
            </Typography>
          </Box>
          {recentMonths.map((month) => (
            <MenuItem
              key={month.value}
              selected={month.value === selectedMonth}
              onClick={() => handleMonthSelect(month.value)}
              sx={{
                py: 1.5,
                fontSize: '0.875rem',
              }}
            >
              {month.label}
            </MenuItem>
          ))}
        </Menu>
        <IconButton
          onClick={handleNextMonth}
          color="primary"
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            p: 1.5,
            minWidth: 48,
            minHeight: 48,
            zIndex: 2,
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
      {/* Desktop layout: sm and up only */}
      <Box
        bgcolor="white"
        borderRadius={2}
        boxShadow={1}
        sx={{
          minHeight: 40,
          px: 1,
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          minWidth: 0,
          maxWidth: 'none',
        }}
      >
        <IconButton
          onClick={handlePreviousMonth}
          color="primary"
          sx={{
            p: 1,
            minWidth: 40,
            minHeight: 40,
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Button
          startIcon={<CalendarMonthIcon />}
          onClick={handleMenuOpen}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.primary',
            px: 2,
            py: 1,
            fontSize: '1rem',
            minHeight: 40,
            mx: 1,
          }}
        >
          {displayText}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              maxHeight: 400,
              minWidth: 250,
            },
          }}
        >
          <Box px={2} pt={1} pb={0.5}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              mb={1}
              sx={{ fontSize: '0.875rem' }}
            >
              Recent Months
            </Typography>
          </Box>
          {recentMonths.map((month) => (
            <MenuItem
              key={month.value}
              selected={month.value === selectedMonth}
              onClick={() => handleMonthSelect(month.value)}
              sx={{
                py: 1,
                fontSize: '1rem',
              }}
            >
              {month.label}
            </MenuItem>
          ))}
        </Menu>
        <IconButton
          onClick={handleNextMonth}
          color="primary"
          sx={{
            p: 1,
            minWidth: 40,
            minHeight: 40,
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </>
  )
} 