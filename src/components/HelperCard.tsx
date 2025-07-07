'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Minus, Download, Plus, Edit, Trash2 } from 'lucide-react'
import AddDeductionModal from './AddDeductionModal'
import AddBonusModal from './AddBonusModal'
import { Card, CardContent, CardActions, Typography, Button, IconButton, TextField, Divider, List, ListItem, ListItemText, ListItemSecondaryAction, Box, Chip, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import DownloadIcon from '@mui/icons-material/Download'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import React from 'react'

interface InvalidMonth {
  id: string
  helperId: string
  month: string
  year: number
  reason?: string | null
}

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

interface HelperCardProps {
  helper: Helper
  selectedMonth: string
  onUpdate: () => void
}

export default function HelperCard({ helper, selectedMonth, onUpdate }: HelperCardProps) {
  const [salary, setSalary] = useState<number>(0)
  const [isEditingSalary, setIsEditingSalary] = useState(false)
  const [showAddDeduction, setShowAddDeduction] = useState(false)
  const [showAddBonus, setShowAddBonus] = useState(false)
  const [monthDeductions, setMonthDeductions] = useState<Helper['deductions']>([])
  const [monthBonuses, setMonthBonuses] = useState<Helper['bonuses']>([])
  const [isPaying, setIsPaying] = useState(false)
  const [invalidMonth, setInvalidMonth] = useState<InvalidMonth | null>(null)
  const [showInvalidDialog, setShowInvalidDialog] = useState(false)
  const [invalidReason, setInvalidReason] = useState('')
  const [loadingInvalid, setLoadingInvalid] = useState(false)

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

    // Find bonuses for selected month
    const bonuses = helper.bonuses.filter(
      b => b.month === month && b.year === parseInt(year)
    )
    setMonthBonuses(bonuses)

    // Fetch invalid month for this helper and month
    const fetchInvalidMonth = async () => {
      setLoadingInvalid(true)
      try {
        const res = await fetch(`/api/invalid-months?helperId=${helper.id}`)
        if (res.ok) {
          const data = await res.json()
          const found = data.find((m: InvalidMonth) => m.month === month && m.year === parseInt(year))
          setInvalidMonth(found || null)
        } else {
          setInvalidMonth(null)
        }
      } catch {
        setInvalidMonth(null)
      } finally {
        setLoadingInvalid(false)
      }
    }
    fetchInvalidMonth()
  }, [helper.id, month, year, onUpdate])

  const totalDeductions = monthDeductions.reduce((sum, d) => sum + d.amount, 0)
  const totalBonuses = monthBonuses.reduce((sum, b) => sum + b.amount, 0)
  const netPay = salary + totalBonuses - totalDeductions

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

  const handleAddBonus = async (purpose: string, amount: number, date: string) => {
    try {
      const response = await fetch('/api/bonuses', {
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
        setShowAddBonus(false)
        onUpdate()
      }
    } catch (error) {
      console.error('Error adding bonus:', error)
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

  const handleMarkInvalid = async () => {
    setLoadingInvalid(true)
    try {
      const res = await fetch('/api/invalid-months', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          helperId: helper.id,
          month,
          year: parseInt(year),
          reason: invalidReason,
        }),
      })
      if (res.ok) {
        setShowInvalidDialog(false)
        setInvalidReason('')
        onUpdate()
      }
    } finally {
      setLoadingInvalid(false)
    }
  }

  const handleUnmarkInvalid = async () => {
    setLoadingInvalid(true)
    try {
      const res = await fetch(`/api/invalid-months?helperId=${helper.id}&month=${month}&year=${year}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        onUpdate()
      }
    } finally {
      setLoadingInvalid(false)
    }
  }

  return (
    <Card elevation={2} sx={{ 
      borderRadius: 3, 
      minWidth: { xs: '100%', sm: 390 }, 
      maxWidth: 600, 
      width: '100%' 
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Invalid Month Banner */}
        {invalidMonth && (
          <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
            <strong>This month is marked as invalid.</strong>
            {invalidMonth.reason && (
              <><br />Reason: {invalidMonth.reason}</>
            )}
          </Alert>
        )}
        {/* Header */}
        <Box 
          display="flex" 
          flexDirection={{ xs: 'row', sm: 'row' }}
          alignItems={{ xs: 'center', sm: 'center' }} 
          justifyContent="space-between" 
          gap={{ xs: 1, sm: 0 }}
          mb={2}
        >
          <Typography 
            variant="h6" 
            fontWeight={700}
            sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
          >
            {helper.name}
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', justifyContent: { xs: 'flex-end', sm: 'flex-end' } }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              sx={{ 
                fontWeight: 600,
                minWidth: { xs: 'auto', sm: 'auto' },
                px: { xs: 1.5, sm: 2 }
              }}
            >
              Export
            </Button>
          </Box>
        </Box>
        {/* Salary Section */}
        <Box mb={3}>
          <Box 
            display="flex" 
            flexDirection="row"
            alignItems="center"
            gap={1}
            mb={1}
          >
            <Typography 
              variant="subtitle1" 
              fontWeight={500}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Monthly Salary
            </Typography>
            {!isEditingSalary && (
              <IconButton color="primary" onClick={() => setIsEditingSalary(true)} size="small" sx={{ ml: 0 }}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          {isEditingSalary ? (
            <Box 
              display="flex" 
              flexDirection={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }} 
              gap={{ xs: 1, sm: 1 }}
            >
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
              <Box 
                display="flex" 
                gap={1}
                sx={{ flexDirection: { xs: 'row', sm: 'row' } }}
              >
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => handleSalaryUpdate(isNaN(salary) ? 0 : salary)}
                  sx={{ flex: { xs: 1, sm: 'auto' } }}
                >
                  Save
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  onClick={() => setIsEditingSalary(false)}
                  sx={{ flex: { xs: 1, sm: 'auto' } }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography 
              variant="h5" 
              color="success.main" 
              fontWeight={700}
              sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}
            >
              ₱{salary.toFixed(2)}
            </Typography>
          )}
        </Box>

        {/* Deductions Section */}
        <Box mb={3}>
          <Box 
            display="flex" 
            flexDirection={{ xs: 'row', sm: 'row' }}
            alignItems={{ xs: 'center', sm: 'center' }} 
            justifyContent="space-between" 
            gap={{ xs: 1, sm: 0 }}
            mb={1}
          >
            <Typography 
              variant="subtitle1" 
              fontWeight={500}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Deductions
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', justifyContent: { xs: 'flex-end', sm: 'flex-end' } }}>
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<AddIcon />}
                onClick={() => setShowAddDeduction(true)}
                sx={{ 
                  fontWeight: 600,
                  minWidth: { xs: 'auto', sm: 'auto' },
                  px: { xs: 1.5, sm: 2 }
                }}
              >
                Add
              </Button>
            </Box>
          </Box>
          {monthDeductions.length === 0 ? (
            <Typography 
              color="text.secondary" 
              fontSize={14}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              No deductions for this month
            </Typography>
          ) : (
            <List dense disablePadding>
              {monthDeductions.map((deduction, idx) => (
                <React.Fragment key={deduction.id}>
                  <ListItem sx={{ pl: 0, pr: 0 }} disableGutters>
                    <Box
                      display="flex"
                      flexDirection="row"
                      alignItems="flex-start"
                      width="100%"
                      gap={1}
                    >
                      {/* Amount+Icon and Date (always column) */}
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="flex-start"
                        minWidth={90}
                        sx={{ mr: { sm: 1 } }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <RemoveCircleOutlineIcon fontSize="small" color="error" />
                          <Typography
                            color="error.main"
                            fontWeight={600}
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          >
                            ₱{deduction.amount.toFixed(2)}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mt: 0.5 }}
                        >
                          {format(new Date(deduction.date), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      {/* Purpose (center) */}
                      <Box flex={1} display="flex" alignItems="center" justifyContent="flex-start">
                        <Chip
                          label={deduction.purpose}
                          size="small"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        />
                      </Box>
                      {/* Delete Icon (right) */}
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
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
                <Typography 
                  fontWeight={600}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  Total Deductions:
                </Typography>
                <Typography 
                  color="error.main" 
                  fontWeight={700}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  <RemoveCircleOutlineIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />₱{totalDeductions.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Bonuses Section */}
        <Box mb={3}>
          <Box 
            display="flex" 
            flexDirection={{ xs: 'row', sm: 'row' }}
            alignItems={{ xs: 'center', sm: 'center' }} 
            justifyContent="space-between" 
            gap={{ xs: 1, sm: 0 }}
            mb={1}
          >
            <Typography 
              variant="subtitle1" 
              fontWeight={500}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Bonuses
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', justifyContent: { xs: 'flex-end', sm: 'flex-end' } }}>
              <Button
                variant="outlined"
                size="small"
                color="success"
                startIcon={<AddIcon />}
                onClick={() => setShowAddBonus(true)}
                sx={{ 
                  fontWeight: 600,
                  minWidth: { xs: 'auto', sm: 'auto' },
                  px: { xs: 1.5, sm: 2 }
                }}
              >
                Add
              </Button>
            </Box>
          </Box>
          {monthBonuses.length === 0 ? (
            <Typography 
              color="text.secondary" 
              fontSize={14}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              No bonuses for this month
            </Typography>
          ) : (
            <List dense disablePadding>
              {monthBonuses.map((bonus, idx) => (
                <React.Fragment key={bonus.id}>
                  <ListItem sx={{ pl: 0, pr: 0 }} disableGutters>
                    <Box
                      display="flex"
                      flexDirection="row"
                      alignItems="flex-start"
                      width="100%"
                      gap={1}
                    >
                      {/* Amount+Icon and Date (always column) */}
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="flex-start"
                        minWidth={90}
                        sx={{ mr: { sm: 1 } }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <AddCircleOutlineIcon fontSize="small" color="success" />
                          <Typography
                            color="success.main"
                            fontWeight={600}
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          >
                            ₱{bonus.amount.toFixed(2)}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mt: 0.5 }}
                        >
                          {format(new Date(bonus.date), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      {/* Purpose (center) */}
                      <Box flex={1} display="flex" alignItems="center" justifyContent="flex-start">
                        <Chip
                          label={bonus.purpose}
                          size="small"
                          color="success"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        />
                      </Box>
                      {/* Delete Icon (right) */}
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        <IconButton
                          edge="end"
                          aria-label="delete bonus"
                          color="error"
                          onClick={async () => {
                            if (window.confirm('Delete this bonus?')) {
                              await fetch(`/api/bonuses?id=${bonus.id}`, { method: 'DELETE' })
                              onUpdate()
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                  {idx < monthBonuses.length - 1 && <Divider component="li" sx={{ my: 0.5 }} />}
                </React.Fragment>
              ))}
            </List>
          )}
          {monthBonuses.length > 0 && (
            <Box mt={2} pt={2} borderTop={1} borderColor="grey.200">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography 
                  fontWeight={600}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  Total Bonuses:
                </Typography>
                <Typography 
                  color="success.main" 
                  fontWeight={700}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  <AddCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />₱{totalBonuses.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Net Pay Section */}
        <Divider sx={{ my: 2 }} />
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography 
            variant="subtitle1" 
            fontWeight={600}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Net Pay:
          </Typography>
          <Typography 
            variant="h5" 
            fontWeight={700} 
            color={netPay >= 0 ? 'success.main' : 'error.main'}
            sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}
          >
            ₱{netPay.toFixed(2)}
          </Typography>
        </Box>
        <Button
          fullWidth
          variant={isFullyPaid ? 'contained' : 'outlined'}
          color={isFullyPaid ? 'success' : 'primary'}
          onClick={handleMarkPaid}
          disabled={netPay <= 0 || isFullyPaid || isPaying}
          sx={{ 
            fontWeight: 700, 
            py: { xs: 1.5, sm: 1.2 }, 
            mb: 1,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {isFullyPaid ? 'Fully Paid' : isPaying ? 'Marking...' : 'Paid'}
        </Button>
        {/* Mark/Unmark Invalid Button (moved below Paid button) */}
        <Box mb={2}>
          {invalidMonth ? (
            <Button
              variant="contained"
              color="warning"
              onClick={handleUnmarkInvalid}
              disabled={loadingInvalid}
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
              fullWidth
            >
              Unmark as Invalid
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="warning"
              onClick={() => setShowInvalidDialog(true)}
              disabled={loadingInvalid}
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
              fullWidth
            >
              Mark as Invalid
            </Button>
          )}
        </Box>
        {/* Reason Dialog */}
        <Dialog open={showInvalidDialog} onClose={() => setShowInvalidDialog(false)}>
          <DialogTitle>Mark Month as Invalid</DialogTitle>
          <form onSubmit={e => { e.preventDefault(); handleMarkInvalid(); }}>
            <DialogContent sx={{ px: { xs: 3, sm: 4 }, pt: 3, pb: 2 }}>
              <Stack spacing={2}>
                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Optionally specify a reason for marking this month as invalid (e.g., not started, on leave):
                </Typography>
                <TextField
                  label="Reason"
                  value={invalidReason}
                  onChange={e => setInvalidReason(e.target.value)}
                  fullWidth
                  autoFocus
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: { xs: 3, sm: 4 }, pb: 3, pt: 2 }}>
              <Button onClick={() => setShowInvalidDialog(false)} color="inherit">Cancel</Button>
              <Button type="submit" variant="contained" color="warning" disabled={loadingInvalid}>Mark as Invalid</Button>
            </DialogActions>
          </form>
        </Dialog>
      </CardContent>
      <AddDeductionModal
        isOpen={showAddDeduction}
        onClose={() => setShowAddDeduction(false)}
        onAdd={handleAddDeduction}
      />
      <AddBonusModal
        isOpen={showAddBonus}
        onClose={() => setShowAddBonus(false)}
        onAdd={handleAddBonus}
      />
    </Card>
  )
} 