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
  MenuItem,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import axios from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';

const GST_RATES = [0, 5, 12, 18, 28];

export default function ProductCreateView() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: '',
    hsn: '',
    description: '',
    price: '',
    gstRate: 18,
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
      tempErrors.name = 'Product name is required';
    }
    if (formData.price === '' || Number.isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      tempErrors.price = 'Enter a valid unit price';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await axios.post('/api/products', {
        ...formData,
        price: Number(formData.price),
        gstRate: Number(formData.gstRate),
      });
      enqueueSnackbar('Product added successfully', { variant: 'success' });
      navigate(paths.dashboard.product.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message || 'Failed to add product', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button
          onClick={() => navigate(paths.dashboard.product.root)}
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          sx={{ color: 'text.secondary' }}
        >
          Back to list
        </Button>
      </Stack>

      <Typography variant="h4" sx={{ mb: 1 }}>
        Add a New Product
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Create a billing item catalog entry for quick selections in invoices
      </Typography>

      <form onSubmit={handleSubmit}>
        <Card sx={{ p: 4, borderRadius: 2 }}>
          <Stack spacing={3}>
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', sm: '1.2fr 0.8fr 1fr' }}
              gap={3}
            >
              <TextField
                name="name"
                label="Product Name *"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
              />

              <TextField
                name="hsn"
                label="HSN Code"
                placeholder="e.g. 998311"
                value={formData.hsn}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                name="price"
                label="Unit Price (INR) *"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={!!errors.price}
                helperText={errors.price}
                fullWidth
              />
            </Box>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr' }} gap={3}>
              <TextField
                name="gstRate"
                select
                label="GST Rate (%) *"
                value={formData.gstRate}
                onChange={handleChange}
                fullWidth
              >
                {GST_RATES.map((rate) => (
                  <MenuItem key={rate} value={rate}>
                    {rate}%
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              name="description"
              label="Product Description"
              multiline
              rows={4}
              placeholder="Provide a detailed description of the billing item or services..."
              value={formData.description}
              onChange={handleChange}
              fullWidth
            />

            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate(paths.dashboard.product.root)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Save Product'}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </form>
    </Container>
  );
}
