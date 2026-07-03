import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';

import Iconify from 'src/components/iconify';
import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const STATUS_COLORS = {
  paid: 'success',
  pending: 'warning',
  overdue: 'error',
  draft: 'default',
};

// ----------------------------------------------------------------------

const MOCK_INVOICES = [
  {
    id: 'INV-0048',
    clientName: 'Stark Industries',
    clientEmail: 'tony@stark.com',
    amount: 15400.0,
    dueDate: '08 Jul 2026',
    status: 'paid',
  },
  {
    id: 'INV-0047',
    clientName: 'Wayne Enterprises',
    clientEmail: 'bruce@wayne.com',
    amount: 9800.0,
    dueDate: '06 Jul 2026',
    status: 'pending',
  },
  {
    id: 'INV-0046',
    clientName: 'Acme Corp',
    clientEmail: 'billing@acme.com',
    amount: 3200.0,
    dueDate: '01 Jul 2026',
    status: 'overdue',
  },
  {
    id: 'INV-0045',
    clientName: 'LexCorp',
    clientEmail: 'lex@lexcorp.com',
    amount: 1250.0,
    dueDate: '04 Jul 2026',
    status: 'draft',
  },
];

// ----------------------------------------------------------------------

export default function HomeView() {
  const theme = useTheme();

  // Revenue chart setup
  const chartOptionsRevenue = useChart({
    chart: {
      type: 'area',
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    },
    tooltip: {
      x: { format: 'dd/MM/yy HH:mm' },
    },
  });

  const chartSeriesRevenue = [
    {
      name: 'Invoiced Amount ($)',
      data: [12500, 18400, 14200, 24500, 21000, 32400],
    },
    {
      name: 'Collected Amount ($)',
      data: [9800, 15000, 13800, 21200, 19500, 28100],
    },
  ];

  // Payment method chart setup
  const chartOptionsPayments = useChart({
    labels: ['Credit Card', 'Bank Transfer (ACH)', 'Digital Wallets'],
    stroke: { show: false },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
        },
      },
    },
  });

  const chartSeriesPayments = [65, 25, 10];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${alpha(
          theme.palette.background.default,
          1
        )} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        {/* HERO SECTION */}
        <Stack spacing={4} sx={{ textAlign: 'center', mb: 8, mt: { xs: 4, md: 6 } }}>
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            Introducing InvoiceFlow
          </Typography>

          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.5rem', md: '4rem' },
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            Invoice automation designed for <br />
            <Box
              component="span"
              sx={{
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              modern businesses.
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 720,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.25rem' },
              lineHeight: 1.6,
            }}
          >
            InvoiceFlow is a comprehensive billing platform that simplifies financial workflows,
            automates client follow-ups, handles global payments securely, and provides actionable
            cash flow analytics.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              component={RouterLink}
              href={paths.dashboard.root}
              variant="contained"
              color="primary"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: theme.customShadows.z8,
              }}
            >
              Go to Dashboard
            </Button>
            <Button
              component={RouterLink}
              href={paths.authDemo.classic.register}
              variant="outlined"
              color="inherit"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              Sign Up Free
            </Button>
          </Stack>
        </Stack>

        {/* DASHBOARD PREVIEW SIMULATOR */}
        <Card
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
            boxShadow: theme.customShadows.z24,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            mb: 10,
          }}
        >
          {/* Windows Header Bar */}
          <Box
            sx={{
              py: 2,
              px: 3,
              bgcolor: alpha(theme.palette.grey[500], 0.08),
              display: 'flex',
              alignItems: 'center',
              borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
            }}
          >
            {/* Window Controls */}
            <Stack direction="row" spacing={1} sx={{ mr: 3 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F56' }} />
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27C93F' }} />
            </Stack>
            {/* Title */}
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              InvoiceFlow Admin Dashboard (Preview Mode)
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* KPI STATS ROW */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                {
                  title: 'Total Invoiced',
                  value: '₹1,42,500.00',
                  change: '+12.5% MoM',
                  icon: 'solar:bill-list-bold-duotone',
                  color: 'primary.main',
                  bg: alpha(theme.palette.primary.main, 0.08),
                },
                {
                  title: 'Collected Payments',
                  value: '₹1,18,200.00',
                  change: '83% recovery rate',
                  icon: 'solar:check-circle-bold-duotone',
                  color: 'success.main',
                  bg: alpha(theme.palette.success.main, 0.08),
                },
                {
                  title: 'Outstanding Balance',
                  value: '₹19,300.00',
                  change: '12 active invoices',
                  icon: 'solar:clock-square-bold-duotone',
                  color: 'warning.main',
                  bg: alpha(theme.palette.warning.main, 0.08),
                },
                {
                  title: 'Overdue Amount',
                  value: '₹5,000.00',
                  change: '3 high-priority cases',
                  icon: 'solar:danger-bold-duotone',
                  color: 'error.main',
                  bg: alpha(theme.palette.error.main, 0.08),
                },
              ].map((kpi, idx) => (
                <Grid xs={12} sm={6} md={3} key={idx}>
                  <Card
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                      boxShadow: 'none',
                      bgcolor: alpha(theme.palette.grey[500], 0.02),
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: kpi.bg,
                          color: kpi.color,
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                        }}
                      >
                        <Iconify icon={kpi.icon} width={28} />
                      </Avatar>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {kpi.title}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                          {kpi.value}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: kpi.color,
                            fontWeight: 600,
                          }}
                        >
                          {kpi.change}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* CHARTS ROW */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid xs={12} md={8}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                    boxShadow: 'none',
                    height: 1,
                  }}
                >
                  <CardHeader
                    title="Revenue Trend"
                    subheader="Monthly performance comparison of invoicing vs actual collections"
                    sx={{ p: 0, mb: 3 }}
                  />
                  <Chart
                    dir="ltr"
                    type="area"
                    series={chartSeriesRevenue}
                    options={chartOptionsRevenue}
                    height={320}
                  />
                </Card>
              </Grid>

              <Grid xs={12} md={4}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                    boxShadow: 'none',
                    height: 1,
                  }}
                >
                  <CardHeader
                    title="Payment Methods"
                    subheader="Distribution of transaction sources"
                    sx={{ p: 0, mb: 3 }}
                  />
                  <Box
                    sx={{
                      height: 320,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Chart
                      dir="ltr"
                      type="donut"
                      series={chartSeriesPayments}
                      options={chartOptionsPayments}
                      width="100%"
                      height={280}
                    />
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* RECENT INVOICES & QUICK INFO ROW */}
            <Grid container spacing={3}>
              {/* Invoice List Table */}
              <Grid xs={12} md={8}>
                <Card
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                    boxShadow: 'none',
                  }}
                >
                  <CardHeader
                    title="Recent Invoices"
                    subheader="Real-time operational records"
                    sx={{ mb: 2 }}
                  />
                  <TableContainer>
                    <Table sx={{ minWidth: 500 }}>
                      <TableHead sx={{ bgcolor: alpha(theme.palette.grey[500], 0.04) }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Invoice ID</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {MOCK_INVOICES.map((row) => (
                          <TableRow key={row.id} hover>
                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {row.id}
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.25}>
                                <Typography variant="subtitle2" sx={{ fontSize: '0.875rem' }}>
                                  {row.clientName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                  {row.clientEmail}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>
                              {fCurrency(row.amount)}
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                              {row.dueDate}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.status.toUpperCase()}
                                color={STATUS_COLORS[row.status] || 'default'}
                                size="small"
                                variant="soft"
                                sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>

              {/* Quick Info / Quick Start */}
              <Grid xs={12} md={4}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                    boxShadow: 'none',
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    height: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Quick Operations
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    These features are available on the authenticated admin interface:
                  </Typography>

                  <Stack spacing={2}>
                    <Button
                      component={RouterLink}
                      href={paths.dashboard.root}
                      variant="contained"
                      fullWidth
                      startIcon={<Iconify icon="solar:pen-new-round-bold" />}
                      sx={{ py: 1.2, fontWeight: 700, borderRadius: 1.5 }}
                    >
                      Create New Invoice
                    </Button>
                    <Button
                      component={RouterLink}
                      href={paths.dashboard.root}
                      variant="outlined"
                      fullWidth
                      startIcon={<Iconify icon="solar:users-group-two-round-bold" />}
                      sx={{ py: 1.2, fontWeight: 700, borderRadius: 1.5 }}
                    >
                      Add New Customer
                    </Button>
                    <Button
                      component={RouterLink}
                      href={paths.dashboard.root}
                      variant="outlined"
                      color="inherit"
                      fullWidth
                      startIcon={<Iconify icon="solar:settings-bold" />}
                      sx={{ py: 1.2, fontWeight: 700, borderRadius: 1.5 }}
                    >
                      Configure Gateway
                    </Button>
                  </Stack>

                  <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

                  <Stack spacing={2}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Why Businesses Choose Us
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Iconify
                        icon="solar:check-circle-bold"
                        sx={{ color: 'primary.main', mt: 0.2 }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        98% automated match rate for reconciliations
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Iconify
                        icon="solar:check-circle-bold"
                        sx={{ color: 'primary.main', mt: 0.2 }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Get paid up to 14 days faster with automatic followups
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* STATIC FEATURES SECTION */}
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            fontWeight: 800,
            mb: 6,
          }}
        >
          Everything you need to master billing.
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              title: 'Automated Reminders',
              description:
                'InvoiceFlow tracks invoice due dates and dispatches automatic reminders when payments are late, reducing manual collections drastically.',
              icon: 'solar:bell-bing-bold-duotone',
              color: 'primary.main',
              bg: alpha(theme.palette.primary.main, 0.08),
            },
            {
              title: 'Global Payment Gateways',
              description:
                'Receive money instantly. Seamless integration with Stripe, bank accounts, and localized payment options guarantees frictionless checkout.',
              icon: 'solar:card-send-bold-duotone',
              color: 'info.main',
              bg: alpha(theme.palette.info.main, 0.08),
            },
            {
              title: 'Real-time Tracking & Audits',
              description:
                'Track when a customer opens your invoice, schedules a payment, or files a dispute. Full log histories protect audit compliance.',
              icon: 'solar:graph-bold-duotone',
              color: 'success.main',
              bg: alpha(theme.palette.success.main, 0.08),
            },
          ].map((feature, idx) => (
            <Grid xs={12} md={4} key={idx}>
              <Card
                sx={{
                  p: 4,
                  borderRadius: 2.5,
                  height: 1,
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                  boxShadow: 'none',
                  bgcolor: alpha(theme.palette.grey[500], 0.02),
                  transition: 'box-shadow 0.3s, transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.customShadows.z12,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: feature.bg,
                    color: feature.color,
                    width: 56,
                    height: 56,
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  <Iconify icon={feature.icon} width={32} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
