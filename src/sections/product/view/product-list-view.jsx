import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Tooltip,
  TableBody,
  Container,
  IconButton,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TextField,
  InputAdornment,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import axios from 'src/utils/axios';
import { useSnackbar } from 'src/components/snackbar';

export default function ProductListView() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Delete Dialog state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load products', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleEdit = (id) => {
    navigate(paths.dashboard.product.edit(id));
  };

  const handleDeleteOpen = (id) => {
    setDeleteId(id);
    setDeleteConfirm(true);
  };

  const handleDeleteClose = () => {
    setDeleteId(null);
    setDeleteConfirm(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/products/${deleteId}`);
      enqueueSnackbar('Product deleted successfully', { variant: 'success' });
      setProducts((prev) => prev.filter((p) => p._id !== deleteId));
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to delete product', { variant: 'error' });
    } finally {
      handleDeleteClose();
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.hsn && product.hsn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderTableBody = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
            <CircularProgress />
          </TableCell>
        </TableRow>
      );
    }
    if (filteredProducts.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No products found
            </Typography>
          </TableCell>
        </TableRow>
      );
    }
    return filteredProducts.map((product) => (
      <TableRow key={product._id} hover>
        <TableCell>
          <Typography variant="subtitle2" color="text.primary">
            {product.name}
          </Typography>
        </TableCell>
        <TableCell>{product.hsn || '-'}</TableCell>
        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.description || '-'}
        </TableCell>
        <TableCell>
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.price)}
        </TableCell>
        <TableCell>{product.gstRate}%</TableCell>
        <TableCell align="right">
          <Tooltip title="Edit" placement="top">
            <IconButton onClick={() => handleEdit(product._id)} color="primary">
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" placement="top">
            <IconButton onClick={() => handleDeleteOpen(product._id)} color="error">
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Container maxWidth="lg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage HSN codes, unit prices, and GST rates for invoice billing items
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => navigate(paths.dashboard.product.new)}
          sx={{ borderRadius: 1.5 }}
        >
          Add Product
        </Button>
      </div>

      <Card sx={{ borderRadius: 2 }}>
        <div style={{ padding: 20 }}>
          <TextField
            fullWidth
            placeholder="Search products by name, HSN, or description..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 480 }}
          />
        </div>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'background.neutral' }}>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>HSN Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Price (INR)</TableCell>
                <TableCell>GST Rate</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this product? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
