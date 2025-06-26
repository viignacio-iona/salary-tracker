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
    <Box display="flex" alignItems="center" bgcolor="white" borderRadius={2} boxShadow={1} px={1}>
      <IconButton onClick={handlePreviousMonth} color="primary">
        <ChevronLeftIcon />
      </IconButton>
      <Button
        startIcon={<CalendarMonthIcon />}
        onClick={handleMenuOpen}
        sx={{ textTransform: 'none', fontWeight: 600, color: 'text.primary', px: 2 }}
      >
        {displayText}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <Box px={2} pt={1} pb={0.5}>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Recent Months
          </Typography>
        </Box>
        {recentMonths.map((month) => (
          <MenuItem
            key={month.value}
            selected={month.value === selectedMonth}
            onClick={() => handleMonthSelect(month.value)}
          >
            {month.label}
          </MenuItem>
        ))}
      </Menu>
      <IconButton onClick={handleNextMonth} color="primary">
        <ChevronRightIcon />
      </IconButton>
    </Box>
  )
} 