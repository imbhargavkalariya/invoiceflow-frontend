import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Link,
  Stack,
  Button,
  TextField,
  Typography,
  Container,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';

export default function JwtForgotPasswordView() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');

    try {
      setSubmitting(true);
      // In a real application, we would call an API, e.g. axios.post('/api/auth/forgot-password', { email });
      // Since it's a bonus/boilerplate page, we simulate success
      await new Promise((resolve) => setTimeout(resolve, 1500));
      enqueueSnackbar('Password reset email sent!', { variant: 'success' });
      navigate(paths.auth.jwt.login);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to send reset link', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 12, display: 'flex', minHeight: '100vh', alignItems: 'center' }}>
      <Stack spacing={4} sx={{ width: 1 }}>
        <Stack spacing={1}>
          <Typography variant="h3">Forgot Password?</Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your email and we&apos;ll send you a link to reset your password.
          </Typography>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              error={!!error}
              helperText={error}
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              fullWidth
            >
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Stack>
        </form>

        <Link
          component={RouterLink}
          to={paths.auth.jwt.login}
          color="inherit"
          variant="subtitle2"
          sx={{
            mx: 'auto',
            alignItems: 'center',
            display: 'inline-flex',
          }}
        >
          <Iconify icon="eva:arrow-back-fill" width={16} sx={{ mr: 0.5 }} />
          Back to Login
        </Link>
      </Stack>
    </Container>
  );
}
