import { Helmet } from 'react-helmet-async';
import CustomerListView from 'src/sections/customer/view/customer-list-view';

export default function CustomerListPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Customer List | InvoiceFlow</title>
      </Helmet>

      <CustomerListView />
    </>
  );
}
