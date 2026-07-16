import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useMockedUser } from 'src/hooks/use-mocked-user';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export default function NavUpgrade() {
  const { user: authUser, logout } = useAuthContext();
  const { user: mockUser } = useMockedUser();

  const user = authUser || mockUser;

  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const confirmLogout = useBoolean();

  const handleLogout = async () => {
    try {
      await logout();
      confirmLogout.onFalse();
      router.replace('/');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  return (
    <>
      <Stack
        sx={{
          px: 2,
          py: 3,
          textAlign: 'center',
        }}
      >
        <Stack
          alignItems="center"
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
            border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user?.photoURL}
              alt={user?.displayName}
              sx={{ width: 56, height: 56 }}
            >
              {(user?.displayName || user?.firstName || 'U')
                .charAt(0)
                .toUpperCase()}
            </Avatar>

            <Label
              color="success"
              variant="filled"
              sx={{
                top: -6,
                px: 0.5,
                left: 46,
                height: 20,
                position: 'absolute',
                borderBottomLeftRadius: 2,
              }}
            >
              Active
            </Label>
          </Box>

          <Stack spacing={0.5} sx={{ mt: 2, mb: 2, width: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {user?.displayName ||
                `${user?.firstName || ''} ${user?.lastName || ''}`}
            </Typography>

            <Typography
              variant="body2"
              noWrap
              sx={{ color: 'text.disabled' }}
            >
              {user?.email}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ width: 1 }}
          >
            <Button
              fullWidth
              variant="contained"
              color="inherit"
              onClick={() => router.push(paths.dashboard.user.profile)}
            >
              Profile
            </Button>

            <IconButton
              color="error"
              onClick={confirmLogout.onTrue}
              sx={{
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1.5,
              }}
            >
              <Iconify icon="solar:power-bold" width={20} />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>

      <ConfirmDialog
        open={confirmLogout.value}
        onClose={confirmLogout.onFalse}
        title="Logout"
        content="Are you sure you want to log out?"
        action={
          <Button variant="contained" color="error" onClick={handleLogout}>
            Logout
          </Button>
        }
      />
    </>
  );
}