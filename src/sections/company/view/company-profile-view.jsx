import { useRef, useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Stack,
  Button,
  Divider,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';

import axios from 'src/utils/axios';

import { HOST_API } from 'src/config-global';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

export default function CompanyProfileView() {
  const { enqueueSnackbar } = useSnackbar();
  const logoInputRef = useRef(null);
  const sigInputRef = useRef(null);

  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    gstNumber: '',
    pan: '',
    email: '',
    phone: '',
    website: '',
    bankDetails: {
      accountName: '',
      bankName: '',
      ifsc: '',
      accountNumber: '',
      upiQr: '', // UPI ID
    },
    customSections: [],
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  
  const [sigFile, setSigFile] = useState(null);
  const [sigPreview, setSigPreview] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCompany = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/company');
      const {data} = response;

      setFormData({
        name: data.name || '',
        address: data.address || '',
        gstNumber: data.gstNumber || '',
        pan: data.pan || '',
        email: data.email || '',
        phone: data.phone || '',
        website: data.website || '',
        bankDetails: {
          accountName: data.bankDetails?.accountName || '',
          bankName: data.bankDetails?.bankName || '',
          ifsc: data.bankDetails?.ifsc || '',
          accountNumber: data.bankDetails?.accountNumber || '',
          upiQr: data.bankDetails?.upiQr || '',
        },
        customSections: data.customSections || [],
      });

      if (data.logo) {
        setLogoPreview(data.logo.startsWith('http') ? data.logo : `${HOST_API}${data.logo}`);
      }
      if (data.signature) {
        setSigPreview(data.signature.startsWith('http') ? data.signature : `${HOST_API}${data.signature}`);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load company profile', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith('bank.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSigChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSigFile(file);
      setSigPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    if (!formData.name.trim()) {
      enqueueSnackbar('Company name is required', { variant: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('address', formData.address);
      submitData.append('gstNumber', formData.gstNumber);
      submitData.append('pan', formData.pan);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('website', formData.website);
      submitData.append('bankDetails', JSON.stringify(formData.bankDetails));
      submitData.append('customSections', JSON.stringify(formData.customSections));
      
      if (logoFile) {
        submitData.append('logo', logoFile);
      }
      if (sigFile) {
        submitData.append('signature', sigFile);
      }

      const response = await axios.put('/api/company', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      enqueueSnackbar('Company profile updated successfully', { variant: 'success' });
      
      // Update with server paths and data
      setFormData({
        name: response.data.name || '',
        address: response.data.address || '',
        gstNumber: response.data.gstNumber || '',
        pan: response.data.pan || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        website: response.data.website || '',
        bankDetails: {
          accountName: response.data.bankDetails?.accountName || '',
          bankName: response.data.bankDetails?.bankName || '',
          ifsc: response.data.bankDetails?.ifsc || '',
          accountNumber: response.data.bankDetails?.accountNumber || '',
          upiQr: response.data.bankDetails?.upiQr || '',
        },
        customSections: response.data.customSections || [],
      });

      if (response.data.logo) {
        setLogoPreview(response.data.logo.startsWith('http') ? response.data.logo : `${HOST_API}${response.data.logo}`);
      }
      if (response.data.signature) {
        setSigPreview(response.data.signature.startsWith('http') ? response.data.signature : `${HOST_API}${response.data.signature}`);
      }
      setLogoFile(null);
      setSigFile(null);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update company profile', { variant: 'error' });
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
      <div style={{ marginBottom: 24 }}>
        <Typography variant="h4" gutterBottom>
          Company Profile
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your business credentials, contact info, bank details, logo, digital signature, and static invoice sections
        </Typography>
      </div>

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: 4,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tab
          value="general"
          label="General & Branding"
          icon={<Iconify icon="solar:user-id-bold" width={20} />}
          iconPosition="start"
        />
        <Tab
          value="sections"
          label="Invoice Sections (Static)"
          icon={<Iconify icon="solar:document-bold" width={20} />}
          iconPosition="start"
        />
      </Tabs>

      {currentTab === 'general' && (
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {/* Section 1: Files */}
            <Card sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Branding & Signature
              </Typography>
              
              <Box
                display="grid"
                gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
                gap={4}
              >
                {/* Logo upload */}
                <Stack alignItems="center" spacing={2} sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1.5 }}>
                  <Typography variant="subtitle2">Company Logo</Typography>
                  
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Box sx={{ height: 80, display: 'flex', alignItems: 'center', color: 'text.disabled' }}>
                      <Iconify icon="solar:gallery-bold" width={48} />
                    </Box>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    ref={logoInputRef}
                    onChange={handleLogoChange}
                    style={{ display: 'none' }}
                  />
                  
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => logoInputRef.current.click()}
                    startIcon={<Iconify icon="solar:upload-bold" />}
                  >
                    Upload Logo
                  </Button>
                </Stack>

                {/* Signature upload */}
                <Stack alignItems="center" spacing={2} sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1.5 }}>
                  <Typography variant="subtitle2">Digital Signature</Typography>
                  
                  {sigPreview ? (
                    <img src={sigPreview} alt="Signature Preview" style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Box sx={{ height: 80, display: 'flex', alignItems: 'center', color: 'text.disabled' }}>
                      <Iconify icon="solar:pen-bold" width={48} />
                    </Box>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    ref={sigInputRef}
                    onChange={handleSigChange}
                    style={{ display: 'none' }}
                  />
                  
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => sigInputRef.current.click()}
                    startIcon={<Iconify icon="solar:upload-bold" />}
                  >
                    Upload Signature
                  </Button>
                </Stack>
              </Box>
            </Card>

            {/* Section 2: General Business Details */}
            <Card sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                General Information
              </Typography>

              <Stack spacing={3}>
                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
                  gap={3}
                >
                  <TextField
                    name="name"
                    label="Company Name *"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    name="website"
                    label="Website URL"
                    value={formData.website}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    name="gstNumber"
                    label="GSTIN Number"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    name="pan"
                    label="PAN"
                    value={formData.pan}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    name="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={handleChange}
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
                  label="Registered Business Address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                />
              </Stack>
            </Card>

            {/* Section 3: Bank Details */}
            <Card sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Bank Account & UPI Details
              </Typography>

              <Stack spacing={3}>
                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
                  gap={3}
                >
                  <TextField
                    name="bank.accountName"
                    label="Account Holder Name"
                    value={formData.bankDetails.accountName}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    name="bank.bankName"
                    label="Bank Name"
                    value={formData.bankDetails.bankName}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    name="bank.accountNumber"
                    label="Account Number"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleChange}
                    fullWidth
                  />

                  <TextField
                    name="bank.ifsc"
                    label="IFSC Code"
                    value={formData.bankDetails.ifsc}
                    onChange={handleChange}
                    fullWidth
                  />
                </Box>

                <Divider />

                <TextField
                  name="bank.upiQr"
                  label="UPI ID for scan-to-pay QR code (e.g. businessname@okaxis)"
                  placeholder="upiId@bank"
                  value={formData.bankDetails.upiQr}
                  onChange={handleChange}
                  fullWidth
                  helperText="Generates a dynamic pay QR code automatically on invoices"
                />
              </Stack>
            </Card>

            {/* Form Actions */}
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
                sx={{ minWidth: 150 }}
              >
                {submitting ? 'Saving...' : 'Save Profile'}
              </Button>
            </Stack>
          </Stack>
        </form>
      )}

      {currentTab === 'sections' && (
        <Stack spacing={4}>
          {formData.customSections.map((sec, secIdx) => (
            <Card key={secIdx} sx={{ p: 4, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <TextField
                  label="Section Title"
                  variant="outlined"
                  size="small"
                  value={sec.title}
                  onChange={(e) => {
                    const updated = formData.customSections.map((s, idx) => 
                      idx === secIdx ? { ...s, title: e.target.value } : s
                    );
                    setFormData((prev) => ({ ...prev, customSections: updated }));
                  }}
                  sx={{ width: '60%' }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  onClick={() => {
                    const updated = formData.customSections.filter((_, idx) => idx !== secIdx);
                    setFormData((prev) => ({ ...prev, customSections: updated }));
                  }}
                >
                  Delete Section
                </Button>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>
                Bullet Points
              </Typography>

              <Stack spacing={2} sx={{ mb: 3 }}>
                {sec.content.map((bullet, bulletIdx) => (
                  <Stack key={bulletIdx} direction="row" spacing={2} alignItems="center">
                    <Typography color="text.secondary" variant="body1">
                      •
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      placeholder="Enter details..."
                      value={bullet}
                      onChange={(e) => {
                        const updated = formData.customSections.map((s, idx) => {
                          if (idx !== secIdx) return s;
                          const newContent = s.content.map((b, bIdx) => 
                            bIdx === bulletIdx ? e.target.value : b
                          );
                          return { ...s, content: newContent };
                        });
                        setFormData((prev) => ({ ...prev, customSections: updated }));
                      }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => {
                        const updated = formData.customSections.map((s, idx) => {
                          if (idx !== secIdx) return s;
                          return {
                            ...s,
                            content: s.content.filter((_, idx2) => idx2 !== bulletIdx),
                          };
                        });
                        setFormData((prev) => ({ ...prev, customSections: updated }));
                      }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>

              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                onClick={() => {
                  const updated = formData.customSections.map((s, idx) => 
                    idx === secIdx ? { ...s, content: [...s.content, ''] } : s
                  );
                  setFormData((prev) => ({ ...prev, customSections: updated }));
                }}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add Bullet Point
              </Button>
            </Card>
          ))}

          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                customSections: [
                  ...prev.customSections,
                  { title: 'NEW SECTION', content: [''] },
                ],
              }));
            }}
            sx={{ alignSelf: 'flex-start' }}
          >
            Add New Section
          </Button>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              size="large"
              disabled={submitting}
              onClick={handleSubmit}
              sx={{ minWidth: 150 }}
            >
              {submitting ? 'Saving...' : 'Save Profile'}
            </Button>
          </Stack>
        </Stack>
      )}
    </Container>
  );
}
