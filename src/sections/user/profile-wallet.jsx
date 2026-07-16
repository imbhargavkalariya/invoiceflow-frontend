import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import axios from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

// Helper to load Razorpay Checkout script
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function ProfileWallet() {
  const { user } = useMockedUser();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('1000');
  const [recharging, setRecharging] = useState(false);
  
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);

  // Fetch Wallet History
  const fetchWalletHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/wallet/history');
      setTransactions(response.data.transactions || []);
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Failed to fetch wallet history:', error);
      enqueueSnackbar('Failed to load transaction history', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchWalletHistory();
  }, [fetchWalletHistory]);

  const handleQuickAmount = (amount) => {
    setRechargeAmount(String(amount));
  };

  const handleRecharge = async () => {
    const amountVal = parseFloat(rechargeAmount);
    if (Number.isNaN(amountVal) || amountVal < 30) {
      enqueueSnackbar('Minimum recharge amount is ₹30 (30 Credits = 1 Invoice)', { variant: 'error' });
      return;
    }

    if (amountVal > 100000) {
      enqueueSnackbar('Maximum recharge amount is ₹1,00,000 (1,00,000 Credits)', { variant: 'error' });
      return;
    }

    try {
      setRecharging(true);

      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        enqueueSnackbar('Failed to load Razorpay payment gateway SDK', { variant: 'error' });
        setRecharging(false);
        return;
      }

      // 2. Fetch Razorpay key configuration
      const configRes = await axios.get('/api/wallet/config');
      const { keyId } = configRes.data;

      if (!keyId) {
        enqueueSnackbar('Razorpay credentials missing from the backend', { variant: 'error' });
        setRecharging(false);
        return;
      }

      // 3. Create Razorpay order on the backend
      const orderRes = await axios.post('/api/wallet/create-order', { amount: amountVal });
      const orderData = orderRes.data;

      // 4. Open Razorpay Checkout Dialog
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'InvoiceFlow Wallet',
        description: `Add ${amountVal} Credits to Wallet`,
        order_id: orderData.id,
        async handler(response) {
          try {
            setRecharging(true);
            // Verify payment on backend
            await axios.post('/api/wallet/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amountVal,
            });

            enqueueSnackbar('Wallet recharged successfully!', { variant: 'success' });
            
            // Reload page to refresh all layouts and display latest user credits
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (err) {
            console.error('Payment verification failed:', err);
            enqueueSnackbar(err.message || 'Payment verification failed', { variant: 'error' });
            setRecharging(false);
          }
        },
        prefill: {
          name: user?.displayName || '',
          email: user?.email || '',
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss() {
            setRecharging(false);
            enqueueSnackbar('Payment cancelled by user', { variant: 'info' });
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Recharge setup error:', error);
      enqueueSnackbar(error.message || 'Failed to initiate recharge', { variant: 'error' });
      setRecharging(false);
    }
  };

  const renderStats = (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Card 1: Available Balance */}
      <Grid xs={12} sm={4}>
        <Card
          sx={{
            p: 3,
            color: 'white',
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: (theme) => `0px 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
            borderRadius: 2,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' },
          }}
        >
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 'bold', textTransform: 'uppercase' }}>
              Available Balance
            </Typography>
            <Typography variant="h3">{user?.credits ?? 0} Credits</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              Can be used to generate invoices
            </Typography>
          </Stack>
        </Card>
      </Grid>

      {/* Card 2: Total Purchased */}
      <Grid xs={12} sm={4}>
        <Card
          sx={{
            p: 3,
            color: 'white',
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
            boxShadow: (theme) => `0px 8px 16px ${alpha(theme.palette.success.main, 0.24)}`,
            borderRadius: 2,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' },
          }}
        >
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 'bold', textTransform: 'uppercase' }}>
              Total Purchased
            </Typography>
            <Typography variant="h3">{user?.totalCreditsPurchased ?? 0} Credits</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              Total credits loaded so far
            </Typography>
          </Stack>
        </Card>
      </Grid>

      {/* Card 3: Total Used */}
      <Grid xs={12} sm={4}>
        <Card
          sx={{
            p: 3,
            color: 'white',
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
            boxShadow: (theme) => `0px 8px 16px ${alpha(theme.palette.warning.main, 0.24)}`,
            borderRadius: 2,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' },
          }}
        >
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 'bold', textTransform: 'uppercase' }}>
              Total Consumed
            </Typography>
            <Typography variant="h3">{user?.totalCreditsUsed ?? 0} Credits</Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              Total credits spent on invoices
            </Typography>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );

  const renderRechargeForm = (
    <Card sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recharge Wallet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Recharge balance to create new bills. In test mode, ₹1 = 1 Credit. Recharge limits: Min ₹30, Max ₹1,00,000. Each invoice creation consumes 30 credits.
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Enter Amount (INR) *"
          variant="outlined"
          value={rechargeAmount}
          onChange={(e) => setRechargeAmount(e.target.value)}
          type="number"
          fullWidth
          InputProps={{
            startAdornment: (
              <Box component="span" sx={{ mr: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                ₹
              </Box>
            ),
          }}
        />

        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {[500, 1000, 2000, 5000].map((amt) => (
            <Chip
              key={amt}
              label={`+ ₹${amt}`}
              onClick={() => handleQuickAmount(amt)}
              clickable
              color={rechargeAmount === String(amt) ? 'primary' : 'default'}
              variant={rechargeAmount === String(amt) ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>

        <LoadingButton
          variant="contained"
          onClick={handleRecharge}
          loading={recharging}
          startIcon={<Iconify icon="solar:wallet-money-bold" />}
          sx={{ alignSelf: 'flex-start', minWidth: 180 }}
        >
          Purchase Credits
        </LoadingButton>
      </Stack>
    </Card>
  );

  const renderHistory = (
    <Card sx={{ p: 3, borderRadius: 2 }}>
      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab value="transactions" label="Credit Transactions" icon={<Iconify icon="solar:transfer-horizontal-bold" />} iconPosition="start" />
        <Tab value="payments" label="Recharge Payments" icon={<Iconify icon="solar:bill-list-bold" />} iconPosition="start" />
      </Tabs>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && activeTab === 'transactions' && transactions.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 5 }}>
          No credit movements recorded yet.
        </Typography>
      )}

      {!loading && activeTab === 'transactions' && transactions.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Balance After</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Bill/Invoice Number</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx._id} hover>
                  <TableCell sx={{ fontSize: '9.5pt' }}>
                    {new Date(tx.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tx.type}
                      color={tx.type === 'Credit' ? 'success' : 'error'}
                      size="small"
                      variant="soft"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: tx.type === 'Credit' ? 'success.main' : 'error.main' }}>
                    {tx.type === 'Credit' ? `+${tx.amount}` : `-${tx.amount}`}
                  </TableCell>
                  <TableCell align="right">{tx.balanceAfter}</TableCell>
                  <TableCell>{tx.source}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{tx.invoiceNumber || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && activeTab === 'payments' && payments.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 5 }}>
          No recharges made yet.
        </Typography>
      )}

      {!loading && activeTab === 'payments' && payments.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Amount (INR)</TableCell>
                <TableCell align="right">Credits Loaded</TableCell>
                <TableCell>Razorpay Order ID</TableCell>
                <TableCell>Razorpay Payment ID</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((pm) => (
                <TableRow key={pm._id} hover>
                  <TableCell sx={{ fontSize: '9.5pt' }}>
                    {new Date(pm.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    ₹{pm.amount}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    +{pm.creditsAdded} Credits
                  </TableCell>
                  <TableCell>{pm.razorpayOrderId}</TableCell>
                  <TableCell>{pm.razorpayPaymentId}</TableCell>
                  <TableCell>
                    <Chip label={pm.status} color="success" size="small" variant="filled" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );

  return (
    <Box>
      {renderStats}
      {renderRechargeForm}
      {renderHistory}
    </Box>
  );
}
