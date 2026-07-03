import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Card,
  Button,
  Container,
  TextField,
  Typography,
  Stack,
  Box,
  CircularProgress,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import axios from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';

export default function CustomerEditView({ id }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    gst: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/customers');
      // Find the specific customer since we don't have a direct /customers/:id endpoint,
      // or if we do, use it. In backend we supported GET /api/customers, but wait!
      // In customerController we only had getCustomers, createCustomer, updateCustomer, deleteCustomer.
      // So fetching all and filtering is extremely simple and robust!
      const currentCustomer = response.data.find((cust) => cust._id === id);
      
      if (currentCustomer) {
        setFormData({
          name: currentCustomer.name || '',
          company: currentCustomer.company || '',
          gst: currentCustomer.gst || '',
          email: currentCustomer.email || '',
          phone: currentCustomer.phone || '',
          address: currentCustomer.address || '',
          notes: currentCustomer.notes || '',
        });
      } else {
        enqueueSnackbar('Customer not found', { variant: 'error' });
        navigate(paths.dashboard.customer.root);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load customer details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id, navigate, enqueueSnackbar]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = 'Customer name is required';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Enter a valid email address';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await axios.put(`/api/customers/${id}`, formData);
      enqueueSnackbar('Customer details updated', { variant: 'success' });
      navigate(paths.dashboard.customer.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message || 'Failed to update customer', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button
          onClick={() => navigate(paths.dashboard.customer.root)}
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          sx={{ color: 'text.secondary' }}
        >
          Back to list
        </Button>
      </Stack>

      <Typography variant="h4" sx={{ mb: 1 }}>
        Edit Customer Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Update this customer record in your database
      </Typography>

      <form onSubmit={handleSubmit}>
        <Card sx={{ p: 4, borderRadius: 2 }}>
          <Stack spacing={3}>
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
              gap={3}
            >
              <TextField
                name="name"
                label="Customer Name *"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
              />

              <TextField
                name="company"
                label="Company Name"
                value={formData.company}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                name="gst"
                label="GSTIN"
                placeholder="e.g. 22AAAAA0000A1Z5"
                value={formData.gst}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
              />

              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
              />
            </Box>

            <TextField
              name="address"
              label="Billing Address"
              multiline
              rows={3}
              value={formData.address}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              name="notes"
              label="Internal Customer Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              fullWidth
            />

            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate(paths.dashboard.customer.root)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Save Changes'}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </form>
    </Container>
  );
}

CustomerEditView.propTypes = {
  id: PropTypes.string.isRequired,
};
