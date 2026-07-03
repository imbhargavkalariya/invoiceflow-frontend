import { Helmet } from 'react-helmet-async';
import JwtForgotPasswordView from 'src/sections/auth/jwt/jwt-forgot-password-view';

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title>Jwt: Forgot Password | InvoiceFlow</title>
      </Helmet>

      <JwtForgotPasswordView />
    </>
  );
}
