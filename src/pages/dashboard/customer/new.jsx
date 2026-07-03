import { Helmet } from 'react-helmet-async';
import CustomerCreateView from 'src/sections/customer/view/customer-create-view';

export default function CustomerCreatePage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: New Customer | InvoiceFlow</title>
      </Helmet>

      <CustomerCreateView />
    </>
  );
}
