import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Tooltip,
  TableBody,
  Container,
  IconButton,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TextField,
  InputAdornment,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import axios from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';

export default function CustomerListView() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Delete Dialog state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load customers', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleEdit = (id) => {
    navigate(paths.dashboard.customer.edit(id));
  };

  const handleDeleteOpen = (id) => {
    setDeleteId(id);
    setDeleteConfirm(true);
  };

  const handleDeleteClose = () => {
    setDeleteId(null);
    setDeleteConfirm(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/customers/${deleteId}`);
      enqueueSnackbar('Customer deleted successfully', { variant: 'success' });
      setCustomers((prev) => prev.filter((cust) => cust._id !== deleteId));
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to delete customer', { variant: 'error' });
    } finally {
      handleDeleteClose();
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.company && customer.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderTableBody = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
            <CircularProgress />
          </TableCell>
        </TableRow>
      );
    }
    if (filteredCustomers.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No customers found
            </Typography>
          </TableCell>
        </TableRow>
      );
    }
    return filteredCustomers.map((customer) => (
      <TableRow key={customer._id} hover>
        <TableCell>
          <Typography variant="subtitle2" color="text.primary">
            {customer.name}
          </Typography>
        </TableCell>
        <TableCell>{customer.company || '-'}</TableCell>
        <TableCell>{customer.gst || '-'}</TableCell>
        <TableCell>{customer.email || '-'}</TableCell>
        <TableCell>{customer.phone || '-'}</TableCell>
        <TableCell align="right">
          <Tooltip title="Edit" placement="top">
            <IconButton onClick={() => handleEdit(customer._id)} color="primary">
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" placement="top">
            <IconButton onClick={() => handleDeleteOpen(customer._id)} color="error">
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Container maxWidth="lg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Customers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your client accounts and details
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => navigate(paths.dashboard.customer.new)}
          sx={{ borderRadius: 1.5 }}
        >
          Add Customer
        </Button>
      </div>

      <Card sx={{ borderRadius: 2 }}>
        <div style={{ padding: 20 }}>
          <TextField
            fullWidth
            placeholder="Search customers by name, company, or email..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 480 }}
          />
        </div>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'background.neutral' }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>GSTIN</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this customer? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
