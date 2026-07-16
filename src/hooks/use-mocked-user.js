import { useAuthContext } from 'src/auth/hooks';
import { _mock } from 'src/_mock';

// ----------------------------------------------------------------------

export function useMockedUser() {
  const { user } = useAuthContext();

  const mockUser = {
    id: '8864c717-587d-472a-929a-8e5f298024da-0',
    displayName: 'Jaydon Frankie',
    email: 'demo@minimals.cc',
    password: 'demo1234',
    photoURL: _mock.image.avatar(24),
    phoneNumber: '+40 777666555',
    country: 'United States',
    address: '90210 Broadway Blvd',
    state: 'California',
    city: 'San Francisco',
    zipCode: '94116',
    about: 'Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.',
    role: 'admin',
    isPublic: true,
  };

  const activeUser = user
    ? {
        ...mockUser,
        ...user,
        displayName: user.displayName || `${user.firstName} ${user.lastName}`,
        role: user.role || 'user',
      }
    : mockUser;

  return { user: activeUser };
}
