import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Container,
  TextField,
  Typography,
  Stack,
  Box,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import axios from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';

export default function CustomerCreateView() {
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

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
      await axios.post('/api/customers', formData);
      enqueueSnackbar('Customer added successfully', { variant: 'success' });
      navigate(paths.dashboard.customer.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message || 'Failed to add customer', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

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
        Add a New Customer
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Create a new client database record to auto-populate invoice billing sections
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
              placeholder="Any details to keep in mind about this customer..."
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
                {submitting ? 'Adding...' : 'Save Customer'}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </form>
    </Container>
  );
}
