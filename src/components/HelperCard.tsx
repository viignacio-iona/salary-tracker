'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Minus, Download, Plus, Edit, Trash2 } from 'lucide-react'
import AddDeductionModal from './AddDeductionModal'
import { Card, CardContent, CardActions, Typography, Button, IconButton, TextField, Divider, List, ListItem, ListItemText, ListItemSecondaryAction, Box, Chip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import DownloadIcon from '@mui/icons-material/Download'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import React from 'react'

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

interface HelperCardProps {
  helper: Helper
  selectedMonth: string
  onUpdate: () => void
}

export default function HelperCard({ helper, selectedMonth, onUpdate }: HelperCardProps) {
  const [salary, setSalary] = useState<number>(0)
  const [isEditingSalary, setIsEditingSalary] = useState(false)
  const [showAddDeduction, setShowAddDeduction] = useState(false)
  const [monthDeductions, setMonthDeductions] = useState<Helper['deductions']>([])
  const [isPaying, setIsPaying] = useState(false)

  const [month, year] = selectedMonth.split('-')

  useEffect(() => {
    // Find salary for selected month
    const monthSalary = helper.salaries.find(
      s => s.month === month && s.year === parseInt(year)
    )
    setSalary(monthSalary?.amount ?? 6000)

    // Find deductions for selected month
    const deductions = helper.deductions.filter(
      d => d.month === month && d.year === parseInt(year)
    )
    setMonthDeductions(deductions)
  }, [helper, selectedMonth, month, year])

  const totalDeductions = monthDeductions.reduce((sum, d) => sum + d.amount, 0)
  const netPay = salary - totalDeductions

  // Check if "Fully paid" deduction exists for this month
  const isFullyPaid = monthDeductions.some(d => d.purpose === 'Fully paid')

  const handleSalaryUpdate = async (newSalary: number) => {
    try {
      const response = await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          helperId: helper.id,
          amount: newSalary,
          month,
          year: parseInt(year),
        }),
      })

      if (response.ok) {
        setSalary(newSalary)
        setIsEditingSalary(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating salary:', error)
    }
  }

  const handleAddDeduction = async (purpose: string, amount: number, date: string) => {
    try {
      const response = await fetch('/api/deductions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          helperId: helper.id,
          purpose,
          amount,
          date,
          month,
          year: parseInt(year),
        }),
      })

      if (response.ok) {
        setShowAddDeduction(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Error adding deduction:', error)
    }
  }

  const handleExportCSV = () => {
    const url = `/api/export?helperId=${helper.id}&month=${month}&year=${year}`
    window.open(url, '_blank')
  }

  const handleMarkPaid = async () => {
    if (netPay <= 0 || isFullyPaid) return
    setIsPaying(true)
    try {
      const response = await fetch('/api/deductions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          helperId: helper.id,
          purpose: 'Fully paid',
          amount: netPay,
          date: format(new Date(), 'yyyy-MM-dd'),
          month,
          year: parseInt(year),
        }),
      })
      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error marking as paid:', error)
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <Card elevation={2} sx={{ borderRadius: 3, minWidth: 390, maxWidth: 600, width: '100%' }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={700}>{helper.name}</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            sx={{ fontWeight: 600 }}
          >
            Export
          </Button>
        </Box>

        {/* Salary Section */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle1" fontWeight={500}>Monthly Salary</Typography>
            {!isEditingSalary && (
              <IconButton color="primary" onClick={() => setIsEditingSalary(true)}>
                <EditIcon />
              </IconButton>
            )}
          </Box>
          {isEditingSalary ? (
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                type="number"
                value={salary === 0 ? '' : salary}
                onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                onFocus={e => { if (salary === 0) setSalary(NaN); }}
                size="small"
                variant="outlined"
                placeholder="0"
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ flex: 1 }}
              />
              <Button variant="contained" color="primary" onClick={() => handleSalaryUpdate(isNaN(salary) ? 0 : salary)}>
                Save
              </Button>
              <Button variant="outlined" color="inherit" onClick={() => setIsEditingSalary(false)}>
                Cancel
              </Button>
            </Box>
          ) : (
            <Typography variant="h5" color="success.main" fontWeight={700}>
              ₱{salary.toFixed(2)}
            </Typography>
          )}
        </Box>

        {/* Deductions Section */}
        <Box mb={3}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle1" fontWeight={500}>Deductions</Typography>
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<AddIcon />}
              onClick={() => setShowAddDeduction(true)}
              sx={{ fontWeight: 600 }}
            >
              Add
            </Button>
          </Box>
          {monthDeductions.length === 0 ? (
            <Typography color="text.secondary" fontSize={14}>No deductions for this month</Typography>
          ) : (
            <List dense disablePadding>
              {monthDeductions.map((deduction, idx) => (
                <React.Fragment key={deduction.id}>
                  <ListItem sx={{ pl: 0, pr: 0 }} disableGutters>
                    <Box display="flex" alignItems="center" width="100%">
                      {/* Left: Amount and Date */}
                      <Box flex={0.75} display="flex" flexDirection="column" alignItems="flex-start" justifyContent="center" pr={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <RemoveCircleOutlineIcon fontSize="small" color="error" />
                          <Typography color="error.main" fontWeight={600}>
                            ₱{deduction.amount.toFixed(2)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(deduction.date), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      {/* Center: Purpose (now left-aligned) */}
                      <Box flex={0.8} display="flex" alignItems="center" justifyContent="flex-start">
                        <Chip label={deduction.purpose} size="small" />
                      </Box>
                      {/* Right: Delete Icon */}
                      <Box flex={0} display="flex" alignItems="center" justifyContent="center">
                        <IconButton
                          edge="end"
                          aria-label="delete deduction"
                          color="error"
                          onClick={async () => {
                            if (window.confirm('Delete this deduction?')) {
                              await fetch(`/api/deductions?id=${deduction.id}`, { method: 'DELETE' })
                              onUpdate()
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                  {idx < monthDeductions.length - 1 && <Divider component="li" sx={{ my: 0.5 }} />}
                </React.Fragment>
              ))}
            </List>
          )}
          {monthDeductions.length > 0 && (
            <Box mt={2} pt={2} borderTop={1} borderColor="grey.200">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography fontWeight={600}>Total Deductions:</Typography>
                <Typography color="error.main" fontWeight={700}>
                  <RemoveCircleOutlineIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />₱{totalDeductions.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Net Pay Section */}
        <Divider sx={{ my: 2 }} />
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="subtitle1" fontWeight={600}>Net Pay:</Typography>
          <Typography variant="h5" fontWeight={700} color={netPay >= 0 ? 'success.main' : 'error.main'}>
            ₱{netPay.toFixed(2)}
          </Typography>
        </Box>
        <Button
          fullWidth
          variant={isFullyPaid ? 'contained' : 'outlined'}
          color={isFullyPaid ? 'success' : 'primary'}
          onClick={handleMarkPaid}
          disabled={netPay <= 0 || isFullyPaid || isPaying}
          sx={{ fontWeight: 700, py: 1.2, mb: 1 }}
        >
          {isFullyPaid ? 'Fully Paid' : isPaying ? 'Marking...' : 'Paid'}
        </Button>
      </CardContent>
      <AddDeductionModal
        isOpen={showAddDeduction}
        onClose={() => setShowAddDeduction(false)}
        onAdd={handleAddDeduction}
      />
    </Card>
  )
} 