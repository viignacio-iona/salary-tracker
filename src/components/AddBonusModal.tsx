'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton, Stack, FormControlLabel, Checkbox } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface AddBonusModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (purpose: string, amount: number, date: string, given: boolean) => void
}

export default function AddBonusModal({ isOpen, onClose, onAdd }: AddBonusModalProps) {
  const [purpose, setPurpose] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [given, setGiven] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!purpose.trim() || !amount || !date) return
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return
    onAdd(purpose.trim(), numAmount, date, given)
    setPurpose('')
    setAmount('')
    setDate('')
    setGiven(false)
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          mx: { xs: 2, sm: 'auto' },
          width: { xs: 'calc(100% - 32px)', sm: 'auto' }
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          pr: { xs: 1, sm: 1 },
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 }
        }}
      >
        <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Add Addition</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent 
          dividers 
          sx={{ 
            px: { xs: 2, sm: 4 }, 
            pt: { xs: 2, sm: 3 }, 
            pb: { xs: 1.5, sm: 2 } 
          }}
        >
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            <TextField
              label="Purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Performance bonus, Holiday pay, Overtime pay"
              fullWidth
              required
              margin="dense"
              size="small"
            />
            <TextField
              label="Amount"
              type="number"
              value={amount === '0' ? '' : amount}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={e => { if (amount === '0') setAmount(''); }}
              placeholder="0.00"
              fullWidth
              required
              margin="dense"
              inputProps={{ min: 0.01, step: 0.01 }}
              size="small"
            />
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              required
              margin="dense"
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <FormControlLabel
              control={<Checkbox checked={given} onChange={e => setGiven(e.target.checked)} color="primary" />}
              label="Already Given"
              sx={{ mt: 1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: { xs: 2, sm: 4 }, 
            pb: { xs: 2, sm: 3 }, 
            pt: { xs: 1.5, sm: 2 },
            gap: { xs: 1, sm: 1 }
          }}
        >
          <Button 
            onClick={onClose} 
            color="inherit" 
            variant="outlined"
            sx={{ 
              flex: { xs: 1, sm: 'auto' },
              py: { xs: 1.5, sm: 1 }
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="success"
            sx={{ 
              flex: { xs: 1, sm: 'auto' },
              py: { xs: 1.5, sm: 1 }
            }}
          >
            Add Addition
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
} 