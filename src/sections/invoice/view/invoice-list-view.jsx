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
  Tabs,
  Tab,
  MenuItem,
  Stack,
  Divider,
} from '@mui/material';
import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

import { useAuthContext } from 'src/auth/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import InvoiceAnalytic from '../invoice-analytic';

const STATUS_TABS = ['all', 'paid', 'pending', 'cancelled', 'draft'];
const TIMEFRAME_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export default function InvoiceListView() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { refresh } = useAuthContext();

  // Data states
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeframeFilter, setTimeframeFilter] = useState('all');

  // Dashboard cards stats state
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    paidCount: 0,
    pendingCount: 0,
    cancelledCount: 0,
  });

  // Delete Dialog state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Fetch invoices with filter params
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/invoice', {
        params: {
          search: searchQuery,
          status: statusFilter,
          timeframe: timeframeFilter,
        },
      });
      setInvoices(res.data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load invoices list', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, timeframeFilter, enqueueSnackbar]);

  // Fetch aggregate counts from dashboard API
  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get('/api/dashboard');
      setStats(res.data.cards);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleStatusTabChange = (event, newValue) => {
    setStatusFilter(newValue);
  };

  const handleTimeframeChange = (event) => {
    setTimeframeFilter(event.target.value);
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
      await axios.delete(`/api/invoice/${deleteId}`);
      enqueueSnackbar('Invoice deleted successfully', { variant: 'success' });
      setInvoices((prev) => prev.filter((inv) => inv._id !== deleteId));
      fetchStats();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to delete invoice', { variant: 'error' });
    } finally {
      handleDeleteClose();
    }
  };

  const handleDuplicate = async (id) => {
    try {
      enqueueSnackbar('Duplicating invoice...', { variant: 'info' });
      await axios.post(`/api/invoice/${id}/duplicate`);
      await refresh();
      enqueueSnackbar('Invoice duplicated successfully', { variant: 'success' });
      fetchInvoices();
      fetchStats();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to duplicate invoice', { variant: 'error' });
    }
  };

  // Helper date formatter
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  // Helper currency formatter
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(val);

  // Helper render for Table Body to avoid nested ternaries
  const renderTableBody = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
            <CircularProgress />
          </TableCell>
        </TableRow>
      );
    }

    if (invoices.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No invoices found
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return invoices.map((inv) => (
      <TableRow key={inv._id} hover>
        <TableCell>
          <Typography
            variant="subtitle2"
            color="primary"
            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => navigate(paths.dashboard.invoice.details(inv._id))}
          >
            {inv.invoiceNumber}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="subtitle2" color="text.primary">
            {inv.customer?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {inv.customer?.company || '-'}
          </Typography>
        </TableCell>

        <TableCell>{formatDate(inv.invoiceDate)}</TableCell>

        <TableCell>{formatDate(inv.dueDate)}</TableCell>

        <TableCell fontWeight={600}>{formatCurrency(inv.grandTotal)}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (inv.status === 'paid' && 'success') ||
              (inv.status === 'pending' && 'warning') ||
              (inv.status === 'cancelled' && 'error') ||
              'default'
            }
          >
            {inv.status.toUpperCase()}
          </Label>
        </TableCell>

        <TableCell align="right">
          <Tooltip title="View Details" placement="top">
            <IconButton onClick={() => navigate(paths.dashboard.invoice.details(inv._id))} color="info">
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit" placement="top">
            <IconButton onClick={() => navigate(paths.dashboard.invoice.edit(inv._id))} color="primary">
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Duplicate" placement="top">
            <IconButton onClick={() => handleDuplicate(inv._id)} color="secondary">
              <Iconify icon="solar:copy-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete" placement="top">
            <IconButton onClick={() => handleDeleteOpen(inv._id)} color="error">
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Container maxWidth="lg">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Invoices
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate, print, and track client billing invoices
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => navigate(paths.dashboard.invoice.new)}
          sx={{ borderRadius: 1.5 }}
        >
          New Invoice
        </Button>
      </div>

      {/* Analytics Cards Row */}
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          sx={{ py: 2 }}
        >
          <InvoiceAnalytic
            title="Total"
            total={stats.totalInvoices}
            percent={100}
            price={stats.totalRevenue}
            icon="solar:bill-list-bold-duotone"
            color="info.main"
          />
          <InvoiceAnalytic
            title="Paid"
            total={stats.paidCount}
            percent={stats.totalInvoices ? (stats.paidCount / stats.totalInvoices) * 100 : 0}
            price={stats.totalRevenue}
            icon="solar:file-check-bold-duotone"
            color="success.main"
          />
          <InvoiceAnalytic
            title="Pending"
            total={stats.pendingCount}
            percent={stats.totalInvoices ? (stats.pendingCount / stats.totalInvoices) * 100 : 0}
            price={0}
            icon="solar:sort-by-time-bold-duotone"
            color="warning.main"
          />
          <InvoiceAnalytic
            title="Cancelled"
            total={stats.cancelledCount}
            percent={stats.totalInvoices ? (stats.cancelledCount / stats.totalInvoices) * 100 : 0}
            price={0}
            icon="solar:bell-bing-bold-duotone"
            color="error.main"
          />
        </Stack>
      </Card>

      {/* List Card */}
      <Card sx={{ borderRadius: 2 }}>
        {/* Status Filter Tabs */}
        <Tabs
          value={statusFilter}
          onChange={handleStatusTabChange}
          sx={{
            px: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {STATUS_TABS.map((tab) => (
            <Tab
              key={tab}
              value={tab}
              label={tab.toUpperCase()}
              iconPosition="end"
            />
          ))}
        </Tabs>

        {/* Toolbar: Search & Timeframe */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ p: 2.5 }}
          justifyContent="space-between"
        >
          <TextField
            placeholder="Search invoice #, customer name, or GSTIN..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: 1, sm: 380 } }}
          />

          <TextField
            select
            label="Timeframe"
            value={timeframeFilter}
            onChange={handleTimeframeChange}
            sx={{ width: { xs: 1, sm: 180 } }}
          >
            {TIMEFRAME_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Table Container */}
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'background.neutral' }}>
              <TableRow>
                <TableCell>Invoice Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Invoice Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteConfirm} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this invoice? This will remove the invoice record and PDF file.
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
