'use client'

import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface AddHelperModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (name: string) => void
}

export default function AddHelperModal({ isOpen, onClose, onAdd }: AddHelperModalProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name.trim())
    setName('')
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
        <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Add Helper</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent 
          dividers 
          sx={{ 
            px: { xs: 2, sm: 3 }, 
            pt: { xs: 2, sm: 3 }, 
            pb: { xs: 1.5, sm: 2 } 
          }}
        >
          <TextField
            label="Helper Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter helper's name"
            fullWidth
            required
            autoFocus
            margin="dense"
            size="small"
          />
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: { xs: 2, sm: 3 }, 
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
            sx={{ 
              flex: { xs: 1, sm: 'auto' },
              py: { xs: 1.5, sm: 1 }
            }}
          >
            Add Helper
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
} 