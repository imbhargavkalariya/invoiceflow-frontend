import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useMockedUser } from 'src/hooks/use-mocked-user';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

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
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
            border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.12)}`,
          }}
        >
          <Avatar src={user?.photoURL} alt={user?.displayName} sx={{ width: 40, height: 40 }}>
            {(user?.displayName || user?.firstName || 'U').charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap sx={{ color: 'text.primary' }}>
              {user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`}
            </Typography>

            <Typography variant="body2" noWrap sx={{ color: 'text.disabled', typography: 'caption' }}>
              {user?.email}
            </Typography>
          </Box>

          <IconButton color="error" onClick={confirmLogout.onTrue} sx={{ p: 0.75 }}>
            <Iconify icon="solar:power-bold" width={20} />
          </IconButton>
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
