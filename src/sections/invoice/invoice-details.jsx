import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Dialog,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

import { HOST_API } from 'src/config-global';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

const getNormalizedCustomSections = (invoiceOrCompany) => {
  if (!invoiceOrCompany) return [];
  if (invoiceOrCompany.customSections && invoiceOrCompany.customSections.length > 0) {
    return invoiceOrCompany.customSections;
  }
  const sections = [];
  if (invoiceOrCompany.notes) {
    sections.push({
      title: 'Notes',
      content: [invoiceOrCompany.notes],
    });
  }
  if (invoiceOrCompany.deliverables && invoiceOrCompany.deliverables.length > 0) {
    sections.push({
      title: 'Deliverables Included',
      content: invoiceOrCompany.deliverables,
    });
  }
  if (invoiceOrCompany.terms) {
    const termItems = invoiceOrCompany.terms
      .split(/<br\s*\/?>|\n/gi)
      .map((t) => t.replace(/<\/?[^>]+(>|$)/g, '').trim())
      .filter(Boolean);
    sections.push({
      title: 'Terms & Conditions',
      content: termItems.length > 0 ? termItems : [invoiceOrCompany.terms],
    });
  }
  return sections;
};

export default function InvoiceDetails({ invoice }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { refresh } = useAuthContext();

  const [status, setStatus] = useState(invoice.status);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Status handler
  const handleStatusChange = async (newStatus) => {
    try {
      setSubmitting(true);
      await axios.put(`/api/invoice/${invoice._id}`, { status: newStatus });
      setStatus(newStatus);
      enqueueSnackbar(`Status updated to ${newStatus.toUpperCase()}`, { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Duplicate Invoice
  const handleDuplicate = async () => {
    try {
      setSubmitting(true);
      await axios.post(`/api/invoice/${invoice._id}/duplicate`);
      await refresh();
      enqueueSnackbar('Invoice duplicated successfully', { variant: 'success' });
      navigate(paths.dashboard.invoice.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to duplicate invoice', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Invoice
  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await axios.delete(`/api/invoice/${invoice._id}`);
      enqueueSnackbar('Invoice deleted successfully', { variant: 'success' });
      navigate(paths.dashboard.invoice.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to delete invoice', { variant: 'error' });
    } finally {
      setSubmitting(false);
      setDeleteConfirm(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (invoice.pdfPath) {
      window.open(`${HOST_API}${invoice.pdfPath}`, '_blank');
    } else {
      try {
        enqueueSnackbar('Generating PDF, please wait...', { variant: 'info' });
        const res = await axios.post(`/api/invoice/${invoice._id}/pdf`);
        window.open(`${HOST_API}${res.data.pdfPath}`, '_blank');
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Failed to generate PDF', { variant: 'error' });
      }
    }
  };

  // Print PDF (Uses browser printer on PDF source)
  const handlePrintPdf = () => {
    if (invoice.pdfPath) {
      const printWindow = window.open(`${HOST_API}${invoice.pdfPath}`, '_blank');
      printWindow.focus();
      printWindow.print();
    } else {
      handleDownloadPdf();
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

  return (
    <>
      {/* TOOLBAR */}
      <Stack
        spacing={2}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate(paths.dashboard.invoice.root)}
          >
            Back
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={() => navigate(paths.dashboard.invoice.edit(invoice._id))}
          >
            Edit
          </Button>

          <Button
            variant="outlined"
            color="info"
            startIcon={<Iconify icon="solar:copy-bold" />}
            onClick={handleDuplicate}
            disabled={submitting}
          >
            Duplicate
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => setDeleteConfirm(true)}
            disabled={submitting}
          >
            Delete
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Quick status actions */}
          <TextField
            select
            size="small"
            label="Mark Status"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={submitting}
            sx={{ width: 140 }}
          >
            {['draft', 'pending', 'paid', 'cancelled'].map((st) => (
              <MenuItem key={st} value={st}>
                {st.toUpperCase()}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            color="success"
            startIcon={<Iconify icon="solar:printer-minimalistic-bold" />}
            onClick={handlePrintPdf}
          >
            Print
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="eva:cloud-download-fill" />}
            onClick={handleDownloadPdf}
          >
            Download PDF
          </Button>
        </Stack>
      </Stack>

      {/* A4 PRINT VIEW LAYOUT */}
      <Card
        sx={{
          p: 6,
          borderRadius: 2,
          maxWidth: '850px',
          margin: '0 auto',
          backgroundColor: '#fff',
          color: '#334155',
          boxShadow: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <div style={{ fontFamily: 'sans-serif', fontSize: '10pt', color: '#334155' }}>
          
          {/* Header row */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
            <Box>
              {invoice.company?.logo ? (
                <img
                  src={invoice.company.logo.startsWith('http') ? invoice.company.logo : `${HOST_API}${invoice.company.logo}`}
                  alt="Company Logo"
                  style={{ maxHeight: 60, maxWidth: 180, objectFit: 'contain' }}
                />
              ) : (
                <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a', textTransform: 'uppercase' }}>
                  {invoice.company?.name}
                </Typography>
              )}
            </Box>
            <Box textAlign="right">
              <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', textTransform: 'uppercase', m: 0, letterSpacing: 1 }}>
                INVOICE
              </Typography>
              <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                {invoice.invoiceNumber}
              </Typography>
            </Box>
          </Box>

          {/* Addresses row */}
          <Grid container spacing={4} sx={{ borderBottom: '2px solid #e2e8f0', pb: 3, mb: 3 }}>
            <Grid xs={12} sm={6}>
              <Typography fontSize="8.5pt" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', mb: 1 }}>
                FROM
              </Typography>
              <Typography fontWeight={700} fontSize="11pt" color="text.primary">
                {invoice.company?.name}
              </Typography>
              <Typography fontSize="9.5pt" sx={{ whiteSpace: 'pre-line', mt: 0.5 }}>
                {invoice.company?.address}
              </Typography>
              {invoice.company?.gstNumber && <Typography fontSize="9.5pt" sx={{ mt: 0.5 }}><strong>GSTIN:</strong> {invoice.company.gstNumber}</Typography>}
              {invoice.company?.pan && <Typography fontSize="9.5pt"><strong>PAN:</strong> {invoice.company.pan}</Typography>}
              <Typography fontSize="9.5pt"><strong>Email:</strong> {invoice.company?.email} | <strong>Phone:</strong> {invoice.company?.phone}</Typography>
            </Grid>

            <Grid xs={12} sm={6}>
              <Typography fontSize="8.5pt" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', mb: 1 }}>
                TO
              </Typography>
              <Typography fontWeight={700} fontSize="11pt" color="text.primary">
                {invoice.customer?.name}
              </Typography>
              {invoice.customer?.company && (
                <Typography fontSize="9.5pt" fontWeight={600}>
                  {invoice.customer.company}
                </Typography>
              )}
              <Typography fontSize="9.5pt" sx={{ whiteSpace: 'pre-line', mt: 0.5 }}>
                {invoice.customer?.address}
              </Typography>
              {invoice.customer?.gst && <Typography fontSize="9.5pt" sx={{ mt: 0.5 }}><strong>GSTIN:</strong> {invoice.customer.gst}</Typography>}
              <Typography fontSize="9.5pt"><strong>Email:</strong> {invoice.customer?.email} | <strong>Phone:</strong> {invoice.customer?.phone}</Typography>
            </Grid>
          </Grid>

          {/* Dates metadata block */}
          <Box display="flex" justifyContent="space-between" sx={{ mb: 3, fontSize: '10pt' }}>
            <div>
              <strong>Invoice Date:</strong> {formatDate(invoice.invoiceDate)}
            </div>
            <div>
              <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
            </div>
            <div>
              <strong>Status:</strong>{' '}
              <span
                style={{
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  color:
                    (status === 'paid' && '#22c55e') ||
                    (status === 'pending' && '#eab308') ||
                    (status === 'cancelled' && '#ef4444') ||
                    '#64748b',
                }}
              >
                {status}
              </span>
            </div>
          </Box>

          {/* Products Items table */}
          <Box sx={{ mb: 4 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
              <thead>
                <tr style={{ borderTop: '1px solid #0f172a', borderBottom: '2px solid #0f172a', color: '#0f172a' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700 }}>Description</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>HSN</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>Qty</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Unit Price</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>Taxes</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.products.map((item, index) => {
                  const taxes = [];
                  if (item.cgstRate) taxes.push(`CGST ${item.cgstRate}%`);
                  if (item.sgstRate) taxes.push(`SGST ${item.sgstRate}%`);
                  if (item.igstRate) taxes.push(`IGST ${item.igstRate}%`);

                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <strong>{item.description}</strong>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{item.hsn || '-'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '8.5pt' }}>
                        {taxes.length > 0 ? taxes.join(', ') : '0%'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>

          {/* Aggregates block */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid xs={12} sm={7}>
              {/* Bank Account info */}
              {invoice.company?.bankDetails?.bankName && (
                <Box
                  sx={{
                    border: '1px dashed #cbd5e1',
                    p: 2,
                    borderRadius: 1.5,
                    backgroundColor: '#f8fafc',
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ borderBottom: '1px solid #e2e8f0', pb: 1, mb: 1, fontWeight: 700 }}>
                    Payment Details
                  </Typography>
                  <Grid container spacing={1} sx={{ fontSize: '9pt' }}>
                    <Grid xs={8}>
                      <strong>Account Name:</strong> {invoice.company.bankDetails.accountName}<br />
                      <strong>Bank Name:</strong> {invoice.company.bankDetails.bankName}<br />
                      <strong>Account No:</strong> {invoice.company.bankDetails.accountNumber}<br />
                      <strong>IFSC Code:</strong> {invoice.company.bankDetails.ifsc}
                    </Grid>
                    <Grid xs={4} display="flex" justifyContent="center" alignItems="center">
                      {invoice.company.bankDetails.upiQr && (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                            `upi://pay?pa=${invoice.company.bankDetails.upiQr}&pn=${encodeURIComponent(
                              invoice.company.name
                            )}&am=${invoice.grandTotal}&cu=INR`
                          )}`}
                          style={{ width: 80, height: 80, border: '1px solid #cbd5e1', padding: 2, backgroundColor: '#fff' }}
                          alt="Scan to Pay QR"
                        />
                      )}
                    </Grid>
                  </Grid>
                </Box>
              )}

            </Grid>

            {/* Aggregates calculations */}
            <Grid xs={12} sm={5}>
              <table style={{ width: '100%', fontSize: '9.5pt', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 0' }}>Subtotal (Taxable):</td>
                    <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatCurrency(invoice.subtotal)}</td>
                  </tr>
                  {invoice.discount > 0 && (
                    <tr>
                      <td style={{ padding: '4px 0', color: '#ef4444' }}>Discount:</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', color: '#ef4444' }}>
                        -{formatCurrency(invoice.discount)}
                      </td>
                    </tr>
                  )}
                  {invoice.cgst > 0 && (
                    <tr>
                      <td style={{ padding: '4px 0' }}>CGST:</td>
                      <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatCurrency(invoice.cgst)}</td>
                    </tr>
                  )}
                  {invoice.sgst > 0 && (
                    <tr>
                      <td style={{ padding: '4px 0' }}>SGST:</td>
                      <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatCurrency(invoice.sgst)}</td>
                    </tr>
                  )}
                  {invoice.igst > 0 && (
                    <tr>
                      <td style={{ padding: '4px 0' }}>IGST:</td>
                      <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatCurrency(invoice.igst)}</td>
                    </tr>
                  )}
                  {invoice.roundOff !== 0 && (
                    <tr>
                      <td style={{ padding: '4px 0' }}>Round Off:</td>
                      <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatCurrency(invoice.roundOff)}</td>
                    </tr>
                  )}
                  <tr style={{ borderTop: '2px solid #0f172a', borderBottom: '2px solid #0f172a', fontWeight: 'bold', fontSize: '11pt' }}>
                    <td style={{ padding: '8px 0', color: '#0f172a' }}>Grand Total:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', color: '#0f172a' }}>
                      {formatCurrency(invoice.grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Grid>
          </Grid>

          {/* Custom Sections (Note, Terms, Deliverables, etc.) */}
          <Box sx={{ mt: 3 }}>
            {getNormalizedCustomSections(invoice).filter(sec => sec.content && sec.content.length > 0).map((sec, idx) => (
              <Box key={idx} sx={{ mt: 2, pageBreakInside: 'avoid' }}>
                <Typography variant="subtitle2" sx={{ borderBottom: '1px solid #e2e8f0', pb: 0.5, mb: 1, fontWeight: 700, textTransform: 'uppercase', color: 'text.primary', fontSize: '9pt' }}>
                  {sec.title}
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: '9pt', color: '#64748b', lineHeight: 1.6 }}>
                  {sec.content.map((bullet, bulletIdx) => (
                    <li key={bulletIdx} style={{ marginBottom: 4 }}>{bullet}</li>
                  ))}
                </ul>
              </Box>
            ))}
          </Box>

          {/* Signature bottom footer */}
          <Box display="flex" justifyContent="flex-end" alignItems="flex-end" sx={{ borderTop: '1px solid #e2e8f0', pt: 2, mt: 4, pageBreakInside: 'avoid' }}>
            <div style={{ textAlign: 'right' }}>
              {invoice.company?.signature && (
                <img
                  src={invoice.company.signature.startsWith('http') ? invoice.company.signature : `${HOST_API}${invoice.company.signature}`}
                  alt="Authorized Signature"
                  style={{ maxHeight: 50, maxWidth: 120, objectFit: 'contain', marginBottom: 4 }}
                />
              )}
              <div style={{ borderTop: '1px solid #334155', width: 140, fontSize: '9pt', fontWeight: 600, textAlign: 'center', paddingTop: 4 }}>
                AUTHORIZED SIGN
              </div>
            </div>
          </Box>

          {/* Bottom contacts row */}
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{ borderTop: '1px solid #e2e8f0', pt: 1.5, mt: 4, fontSize: '8.5pt', color: '#94a3b8' }}
          >
            {invoice.company?.website && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Iconify icon="solar:global-bold" width={16} sx={{ mr: 0.5 }} />
                <span>{invoice.company.website}</span>
              </Box>
            )}
            {invoice.company?.phone && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Iconify icon="solar:phone-bold" width={16} sx={{ mr: 0.5 }} />
                <span>{invoice.company.phone}</span>
              </Box>
            )}
            {invoice.company?.email && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Iconify icon="solar:letter-bold" width={16} sx={{ mr: 0.5 }} />
                <span>{invoice.company.email}</span>
              </Box>
            )}
          </Box>

        </div>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this invoice? This will also remove the PDF file.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={submitting}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

InvoiceDetails.propTypes = {
  invoice: PropTypes.object.isRequired,
};
