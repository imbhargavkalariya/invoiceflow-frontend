import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

import { HOST_API } from 'src/config-global';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

const STATUS_OPTIONS = ['draft', 'pending', 'paid', 'cancelled'];
const TAX_RATES = [0, 5, 9, 12, 18, 28];

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

export default function InvoiceNewEditForm({ currentInvoice }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Async data states
  const [customers, setCustomers] = useState([]);
  const [dbProducts, setDbProducts] = useState([]);
  const [company, setCompany] = useState(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [status, setStatus] = useState('draft');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [deliverables, setDeliverables] = useState([]);
  const [customSections, setCustomSections] = useState([]);
  const [items, setItems] = useState([
    {
      description: '',
      hsn: '',
      quantity: 1,
      unitPrice: 0,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 0,
      discountRate: 0,
    },
  ]);

  // Load backend dependencies
  useEffect(() => {
    const loadDependencies = async () => {
      try {
        setLoadingInit(true);
        const [custRes, prodRes, compRes] = await Promise.all([
          axios.get('/api/customers'),
          axios.get('/api/products'),
          axios.get('/api/company'),
        ]);

        setCustomers(custRes.data);
        setDbProducts(prodRes.data);
        setCompany(compRes.data);

        // Prefill form if editing
        if (currentInvoice) {
          setSelectedCustomerId(currentInvoice.customer?.customerId || '');
          setInvoiceDate(new Date(currentInvoice.invoiceDate).toISOString().split('T')[0]);
          setDueDate(new Date(currentInvoice.dueDate).toISOString().split('T')[0]);
          setStatus(currentInvoice.status);
          setNotes(currentInvoice.notes || '');
          setTerms(currentInvoice.terms || '');
          setDeliverables(currentInvoice.deliverables || []);
          setCustomSections(getNormalizedCustomSections(currentInvoice));
          setItems(
            currentInvoice.products.map((p) => ({
              description: p.description,
              hsn: p.hsn,
              quantity: p.quantity,
              unitPrice: p.unitPrice,
              cgstRate: p.cgstRate || 0,
              sgstRate: p.sgstRate || 0,
              igstRate: p.igstRate || 0,
              discountRate: p.discountRate || 0,
            }))
          );
        } else if (compRes.data) {
          setCustomSections(compRes.data.customSections || []);
        }
      } catch (error) {
        console.error('Failed to load invoice deps:', error);
        enqueueSnackbar('Failed to load customers/products list. Please create them first.', { variant: 'warning' });
      } finally {
        setLoadingInit(false);
      }
    };

    loadDependencies();
  }, [currentInvoice, enqueueSnackbar]);

  // Handle selected customer details
  const activeCustomer = useMemo(
    () => customers.find((c) => c._id === selectedCustomerId) || null,
    [customers, selectedCustomerId]
  );

  // Handle adding product row
  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        description: '',
        hsn: '',
        quantity: 1,
        unitPrice: 0,
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 0,
        discountRate: 0,
      },
    ]);
  };

  // Handle deleting row
  const handleDeleteRow = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle duplicating row
  const handleDuplicateRow = (index) => {
    const target = items[index];
    setItems((prev) => [
      ...prev,
      { ...target },
    ]);
  };

  // Handle items table cell change
  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        return { ...item, [field]: value };
      })
    );
  };

  // Handle DB product selection to prefill row
  const handleSelectProduct = (index, productId) => {
    const prod = dbProducts.find((p) => p._id === productId);
    if (prod) {
      setItems((prev) =>
        prev.map((item, idx) => {
          if (idx !== index) return item;
          const rate = prod.gstRate !== undefined ? prod.gstRate : 18;
          return {
            ...item,
            description: prod.name,
            hsn: prod.hsn,
            unitPrice: prod.price,
            cgstRate: rate / 2,
            sgstRate: rate / 2,
            igstRate: 0,
          };
        })
      );
    }
  };



  // Math Calculations (instant live sync)
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const computedItems = items.map((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const disc = Number(item.discountRate) || 0;
      const cgst = Number(item.cgstRate) || 0;
      const sgst = Number(item.sgstRate) || 0;
      const igst = Number(item.igstRate) || 0;

      const baseAmount = qty * price;
      const discAmount = baseAmount * (disc / 100);
      const taxable = baseAmount - discAmount;

      const cgstVal = taxable * (cgst / 100);
      const sgstVal = taxable * (sgst / 100);
      const igstVal = taxable * (igst / 100);

      const finalAmount = taxable + cgstVal + sgstVal + igstVal;

      subtotal += taxable;
      totalDiscount += discAmount;
      totalCgst += cgstVal;
      totalSgst += sgstVal;
      totalIgst += igstVal;

      return {
        ...item,
        amount: Number(finalAmount.toFixed(2)),
      };
    });

    const rawGrandTotal = subtotal + totalCgst + totalSgst + totalIgst;
    const grandTotal = Math.round(rawGrandTotal);
    const roundOff = Number((grandTotal - rawGrandTotal).toFixed(2));

    return {
      items: computedItems,
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(totalDiscount.toFixed(2)),
      cgst: Number(totalCgst.toFixed(2)),
      sgst: Number(totalSgst.toFixed(2)),
      igst: Number(totalIgst.toFixed(2)),
      grandTotal,
      roundOff,
    };
  }, [items]);

  // Submit invoice to backend
  const handleSubmitForm = async () => {
    if (!selectedCustomerId) {
      enqueueSnackbar('Please select a customer first', { variant: 'error' });
      return;
    }

    const payload = {
      invoiceDate,
      dueDate,
      customerId: selectedCustomerId,
      currency: 'INR',
      status,
      notes,
      terms,
      deliverables,
      customSections,
      products: items,
    };

    try {
      setSubmitting(true);
      if (currentInvoice) {
        await axios.put(`/api/invoice/${currentInvoice._id}`, payload);
        enqueueSnackbar('Invoice updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/invoice', payload);
        enqueueSnackbar('Invoice created successfully', { variant: 'success' });
      }
      navigate(paths.dashboard.invoice.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message || 'Failed to save invoice', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInit) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* LEFT FORM PANEL */}
      <Grid item xs={12} md={7}>
        <Stack spacing={3}>
          {/* Section 1: Customer & Meta Info */}
          <Card sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Invoice Details
            </Typography>

            <Stack spacing={3}>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                <TextField
                  select
                  label="Select Customer *"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="">-- Select Customer --</MenuItem>
                  {customers.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Invoice Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  fullWidth
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt.toUpperCase()}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                <TextField
                  type="date"
                  label="Invoice Date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />

                <TextField
                  type="date"
                  label="Due Date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
            </Stack>
          </Card>

          {/* Section 2: Products Table */}
          <Card sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Line Items
            </Typography>

            <Stack spacing={3}>
              {items.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    position: 'relative',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color="primary">
                      Item #{index + 1}
                    </Typography>

                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => handleDuplicateRow(index)}>
                        <Iconify icon="solar:copy-bold" width={16} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteRow(index)} disabled={items.length === 1}>
                        <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Stack spacing={2}>
                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                      <TextField
                        select
                        label="Quick Catalog Load"
                        value=""
                        onChange={(e) => handleSelectProduct(index, e.target.value)}
                        fullWidth
                      >
                        <MenuItem value="">-- Select Product --</MenuItem>
                        {dbProducts.map((p) => (
                          <MenuItem key={p._id} value={p._id}>
                            {p.name} - ({p.price} INR)
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        label="HSN Code"
                        value={item.hsn}
                        onChange={(e) => handleItemChange(index, 'hsn', e.target.value)}
                        fullWidth
                      />
                    </Box>

                    <TextField
                      label="Item Name / Description *"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      fullWidth
                    />

                    <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr', sm: '1fr 1fr 1fr' }} gap={2}>
                      <TextField
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        fullWidth
                      />

                      <TextField
                        label="Unit Price"
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                        fullWidth
                      />

                      <TextField
                        label="Discount (%)"
                        type="number"
                        value={item.discountRate}
                        onChange={(e) => handleItemChange(index, 'discountRate', Number(e.target.value))}
                        fullWidth
                      />
                    </Box>

                    <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr 1fr', sm: '1fr 1fr 1fr' }} gap={2}>
                      <TextField
                        select
                        label="CGST (%)"
                        value={item.cgstRate}
                        onChange={(e) => handleItemChange(index, 'cgstRate', Number(e.target.value))}
                        fullWidth
                      >
                        {TAX_RATES.map((r) => (
                          <MenuItem key={r} value={r}>
                            {r}%
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        select
                        label="SGST (%)"
                        value={item.sgstRate}
                        onChange={(e) => handleItemChange(index, 'sgstRate', Number(e.target.value))}
                        fullWidth
                      >
                        {TAX_RATES.map((r) => (
                          <MenuItem key={r} value={r}>
                            {r}%
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        select
                        label="IGST (%)"
                        value={item.igstRate}
                        onChange={(e) => handleItemChange(index, 'igstRate', Number(e.target.value))}
                        fullWidth
                      >
                        {TAX_RATES.map((r) => (
                          <MenuItem key={r} value={r}>
                            {r}%
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Stack>
                </Box>
              ))}

              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                onClick={handleAddRow}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add Row
              </Button>
            </Stack>
          </Card>

          {/* Notes, Terms & Deliverables are now fully static and fetched from your Company settings */}

          {/* Actions */}
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" color="inherit" onClick={() => navigate(paths.dashboard.invoice.root)}>
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              loading={submitting}
              onClick={handleSubmitForm}
              sx={{ minWidth: 150 }}
            >
              {currentInvoice ? 'Save Changes' : 'Create Invoice'}
            </LoadingButton>
          </Stack>
        </Stack>
      </Grid>

      {/* RIGHT LIVE PREVIEW PANEL */}
      <Grid item xs={12} md={5}>
        <Stack spacing={2} sx={{ position: 'sticky', top: 80 }}>
          <Typography variant="h6">Live Invoice Preview</Typography>

          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: '#fff',
              color: '#334155',
              boxShadow: 4,
              border: '1px solid',
              borderColor: 'divider',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 160px)',
            }}
          >
            {/* Embedded Canva Style Layout Rendering */}
            <div style={{ fontFamily: 'sans-serif', fontSize: '9pt', color: '#334155' }}>
              
              {/* Header */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Box>
                  {company?.logo ? (
                    <img
                      src={company.logo.startsWith('http') ? company.logo : `${HOST_API}${company.logo}`}
                      alt="Logo"
                      style={{ maxHeight: 35, maxWidth: 100, objectFit: 'contain' }}
                    />
                  ) : (
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a', textTransform: 'uppercase' }}>
                      {company?.name || 'Company Name'}
                    </Typography>
                  )}
                </Box>
                <Box textAlign="right">
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a', textTransform: 'uppercase', m: 0 }}>
                    INVOICE
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                    {currentInvoice?.invoiceNumber || 'INV-YYYY-XXXXX'}
                  </Typography>
                </Box>
              </Box>

              {/* Addresses details */}
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} sx={{ borderBottom: '1px solid #e2e8f0', pb: 1, mb: 1 }}>
                <div>
                  <Typography fontSize="8pt" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>FROM</Typography>
                  <Typography fontWeight={700} fontSize="8.5pt">{company?.name || 'My Business'}</Typography>
                  <Typography fontSize="8pt" sx={{ whiteSpace: 'pre-line' }}>{company?.address}</Typography>
                  {company?.gstNumber && <Typography fontSize="8pt">GSTIN: {company.gstNumber}</Typography>}
                </div>
                <div>
                  <Typography fontSize="8pt" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>TO</Typography>
                  <Typography fontWeight={700} fontSize="8.5pt">{activeCustomer?.name || 'Customer Name'}</Typography>
                  {activeCustomer?.company && <Typography fontSize="8pt">{activeCustomer.company}</Typography>}
                  <Typography fontSize="8pt" sx={{ whiteSpace: 'pre-line' }}>{activeCustomer?.address || '-'}</Typography>
                  {activeCustomer?.gst && <Typography fontSize="8pt">GSTIN: {activeCustomer.gst}</Typography>}
                </div>
              </Box>

              {/* Dates Row */}
              <Box display="flex" justifyContent="space-between" sx={{ mb: 2, fontSize: '8.5pt' }}>
                <div><strong>Invoice Date:</strong> {invoiceDate}</div>
                <div><strong>Due Date:</strong> {dueDate}</div>
                <div><strong>Status:</strong> <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: (status === 'paid' && '#22c55e') || (status === 'pending' && '#eab308') || '#ef4444' }}>{status}</span></div>
              </Box>

              {/* Table */}
              <Box sx={{ mb: 2 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
                  <thead>
                    <tr style={{ borderTop: '1px solid #0f172a', borderBottom: '2px solid #0f172a', color: '#0f172a' }}>
                      <th style={{ padding: '6px 4px', textAlign: 'left', fontWeight: 700 }}>Description</th>
                      <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 700 }}>HSN</th>
                      <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 700 }}>Qty</th>
                      <th style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700 }}>Price</th>
                      <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 700 }}>Taxes</th>
                      <th style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700 }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totals.items.map((it, i) => {
                      const taxArr = [];
                      if (it.cgstRate) taxArr.push(`C:${it.cgstRate}%`);
                      if (it.sgstRate) taxArr.push(`S:${it.sgstRate}%`);
                      if (it.igstRate) taxArr.push(`I:${it.igstRate}%`);
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px 4px' }}>{it.description || 'Description'}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'center' }}>{it.hsn || '-'}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'center' }}>{it.quantity}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'right' }}>{it.unitPrice}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'center' }}>{taxArr.join(', ') || '0%'}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}>{it.amount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>

              {/* Totals Section */}
              <Box display="grid" gridTemplateColumns="1.2fr 0.8fr" gap={2} sx={{ mb: 2 }}>
                <div>
                  {company?.bankDetails?.bankName && (
                    <Box sx={{ border: '1px dashed #e2e8f0', p: 1, borderRadius: 1, backgroundColor: '#f8fafc', fontSize: '7.5pt' }}>
                      <Typography fontSize="8pt" fontWeight={700} sx={{ borderBottom: '1px solid #e2e8f0', pb: 0.5, mb: 0.5 }}>
                        Payment Details
                      </Typography>
                      <strong>A/C Holder:</strong> {company.bankDetails.accountName}<br/>
                      <strong>Bank:</strong> {company.bankDetails.bankName}<br/>
                      <strong>A/C No:</strong> {company.bankDetails.accountNumber}<br/>
                      <strong>IFSC:</strong> {company.bankDetails.ifsc}<br/>
                      {company.bankDetails.upiQr && <><strong>UPI ID:</strong> {company.bankDetails.upiQr}</>}
                    </Box>
                  )}
                </div>

                <div>
                  <table style={{ width: '100%', fontSize: '8pt' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: 2 }}>Subtotal:</td>
                        <td style={{ padding: 2, textAlign: 'right' }}>{totals.subtotal}</td>
                      </tr>
                      {totals.discount > 0 && (
                        <tr>
                          <td style={{ padding: 2 }}>Discount:</td>
                          <td style={{ padding: 2, textAlign: 'right' }}>-{totals.discount}</td>
                        </tr>
                      )}
                      {totals.cgst > 0 && (
                        <tr>
                          <td style={{ padding: 2 }}>CGST:</td>
                          <td style={{ padding: 2, textAlign: 'right' }}>{totals.cgst}</td>
                        </tr>
                      )}
                      {totals.sgst > 0 && (
                        <tr>
                          <td style={{ padding: 2 }}>SGST:</td>
                          <td style={{ padding: 2, textAlign: 'right' }}>{totals.sgst}</td>
                        </tr>
                      )}
                      {totals.igst > 0 && (
                        <tr>
                          <td style={{ padding: 2 }}>IGST:</td>
                          <td style={{ padding: 2, textAlign: 'right' }}>{totals.igst}</td>
                        </tr>
                      )}
                      {totals.roundOff !== 0 && (
                        <tr>
                          <td style={{ padding: 2 }}>Round Off:</td>
                          <td style={{ padding: 2, textAlign: 'right' }}>{totals.roundOff}</td>
                        </tr>
                      )}
                      <tr style={{ borderTop: '1px solid #0f172a', borderBottom: '1px solid #0f172a', fontWeight: 'bold' }}>
                        <td style={{ padding: 4 }}>Total:</td>
                        <td style={{ padding: 4, textAlign: 'right' }}>{totals.grandTotal} INR</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Box>

              {/* Notes & Signatures */}
              <Box display="grid" gridTemplateColumns="1.2fr 0.8fr" gap={2} sx={{ borderTop: '1px solid #e2e8f0', pt: 1 }}>
                <div style={{ fontSize: '7.5pt' }}>
                  {customSections.filter(sec => sec.content && sec.content.length > 0).map((sec, idx) => (
                    <Box key={idx} sx={{ mt: idx === 0 ? 0 : 1.5 }}>
                      <strong>{sec.title}</strong>
                      <ul style={{ margin: '2px 0 0 0', paddingLeft: 12, color: '#64748b', fontSize: '7pt', lineHeight: 1.4 }}>
                        {sec.content.map((bullet, bulletIdx) => (
                          <li key={bulletIdx} style={{ marginBottom: 1 }}>{bullet}</li>
                        ))}
                      </ul>
                    </Box>
                  ))}
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                  {company?.signature && (
                    <img
                      src={company.signature.startsWith('http') ? company.signature : `${HOST_API}${company.signature}`}
                      alt="Signature"
                      style={{ maxHeight: 30, maxWidth: 80, objectFit: 'contain', marginBottom: 2 }}
                    />
                  )}
                  <div style={{ borderTop: '1px solid #334155', width: 100, fontSize: '7.5pt', textAlign: 'center', paddingTop: 2 }}>
                    Authorized Sign
                  </div>
                </div>
              </Box>

            </div>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
}

InvoiceNewEditForm.propTypes = {
  currentInvoice: PropTypes.object,
};
