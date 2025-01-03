import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

export function MaxTabsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}
        fullWidth 
        maxWidth="xs"
        sx={{
        '& .MuiDialog-paper': {
            height: '200px', // Set custom height
        },
        }} >
      <DialogTitle>Maximum Tabs Reached</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You can only open up to 7 tabs.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
