import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Grid,
  Card,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  IconButton,
} from '@mui/material';
import Chart from 'react-apexcharts';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { paths } from 'src/routes/paths';
import axios from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
import { useAuthContext } from 'src/auth/hooks';

export default function OverviewAppView() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    cards: {
      totalRevenue: 0,
      totalInvoices: 0,
      paidCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    },
    latestInvoices: [],
    recentCustomers: [],
    chartData: [],
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dashboard');
      setData(response.data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load dashboard metrics', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Currency formatter
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  // Date formatter
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });

  // Apex chart options for monthly revenue
  const chartOptions = {
    chart: {
      id: 'revenue-chart',
      toolbar: { show: false },
      fontFamily: theme.typography.fontFamily,
    },
    colors: [theme.palette.primary.main],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '40%',
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.chartData.map((d) => d.month),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => `₹${val}`,
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
    },
    tooltip: {
      y: {
        formatter: (val) => `₹${val}`,
      },
    },
  };

  const chartSeries = [
    {
      name: 'Revenue (INR)',
      data: data.chartData.map((d) => d.revenue),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Welcome Back, {user?.displayName} 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here&apos;s an overview of your business revenue and invoice flows.
          </Typography>
        </div>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => navigate(paths.dashboard.invoice.new)}
          sx={{ borderRadius: 1.5 }}
        >
          New Invoice
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* STATS WIDGETS */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', mr: 2 }}>
              <Iconify icon="solar:chat-round-money-bold" />
            </Avatar>
            <div>
              <Typography variant="body2" color="text.secondary" noWrap>
                Total Revenue
              </Typography>
              <Typography variant="h5">{formatCurrency(data.cards.totalRevenue)}</Typography>
            </div>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'info.lighter', color: 'info.main', mr: 2 }}>
              <Iconify icon="solar:bill-list-bold" />
            </Avatar>
            <div>
              <Typography variant="body2" color="text.secondary" noWrap>
                Total Invoices
              </Typography>
              <Typography variant="h5">{data.cards.totalInvoices}</Typography>
            </div>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', mr: 2 }}>
              <Iconify icon="solar:file-check-bold" />
            </Avatar>
            <div>
              <Typography variant="body2" color="text.secondary" noWrap>
                Paid Invoices
              </Typography>
              <Typography variant="h5" color="success.main">
                {data.cards.paidCount}
              </Typography>
            </div>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main', mr: 2 }}>
              <Iconify icon="solar:sort-by-time-bold" />
            </Avatar>
            <div>
              <Typography variant="body2" color="text.secondary" noWrap>
                Pending Invoices
              </Typography>
              <Typography variant="h5" color="warning.main">
                {data.cards.pendingCount}
              </Typography>
            </div>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'error.lighter', color: 'error.main', mr: 2 }}>
              <Iconify icon="solar:bell-bing-bold" />
            </Avatar>
            <div>
              <Typography variant="body2" color="text.secondary" noWrap>
                Cancelled
              </Typography>
              <Typography variant="h5" color="error.main">
                {data.cards.cancelledCount}
              </Typography>
            </div>
          </Card>
        </Grid>

        {/* CHART: Monthly Revenue */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Monthly Revenue Breakdown ({new Date().getFullYear()})
            </Typography>
            <Chart options={chartOptions} series={chartSeries} type="bar" height={320} />
          </Card>
        </Grid>

        {/* RECENT CUSTOMERS */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Recent Customers</Typography>
              <Button size="small" onClick={() => navigate(paths.dashboard.customer.root)}>
                View All
              </Button>
            </Stack>

            {data.recentCustomers.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>No customers added yet</Box>
            ) : (
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {data.recentCustomers.map((customer, idx) => (
                  <div key={customer._id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <Avatar sx={{ mr: 2 }}>{customer.name[0]}</Avatar>
                      <ListItemText
                        primary={customer.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {customer.company || 'Individual Client'}
                            </Typography>
                            {customer.email ? ` — ${customer.email}` : ''}
                          </>
                        }
                      />
                    </ListItem>
                    {idx < data.recentCustomers.length - 1 && <Divider component="li" />}
                  </div>
                ))}
              </List>
            )}
          </Card>
        </Grid>

        {/* LATEST INVOICES TABLE */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 3 }}>
              <Typography variant="h6">Latest Invoices</Typography>
              <Button size="small" onClick={() => navigate(paths.dashboard.invoice.root)}>
                View All Invoices
              </Button>
            </Stack>

            <TableContainer sx={{ overflow: 'unset' }}>
              <Table>
                <TableHead sx={{ backgroundColor: 'background.neutral' }}>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.latestInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        No invoices generated yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.latestInvoices.map((inv) => (
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
                          <Typography variant="subtitle2">{inv.customer.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {inv.customer.company || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
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
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
