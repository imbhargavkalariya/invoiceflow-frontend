import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import CustomerEditView from 'src/sections/customer/view/customer-edit-view';

export default function CustomerEditPage() {
  const { id } = useParams();

  return (
    <>
      <Helmet>
        <title>Dashboard: Edit Customer | InvoiceFlow</title>
      </Helmet>

      <CustomerEditView id={id} />
    </>
  );
}
