import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Container, CircularProgress, Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import axios from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';
import InvoiceNewEditForm from '../invoice-new-edit-form';

export default function InvoiceEditView({ id: propId }) {
  const { id: paramId } = useParams();
  const id = propId || paramId;
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/invoice/${id}`);
      setInvoice(res.data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load invoice details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id, enqueueSnackbar]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Invoice not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Invoice',
            href: paths.dashboard.invoice.root,
          },
          { name: invoice?.invoiceNumber },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceNewEditForm currentInvoice={invoice} />
    </Container>
  );
}

InvoiceEditView.propTypes = {
  id: PropTypes.string,
};
