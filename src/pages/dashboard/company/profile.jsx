import { Helmet } from 'react-helmet-async';
import CompanyProfileView from 'src/sections/company/view/company-profile-view';

export default function CompanyProfilePage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Company Profile | InvoiceFlow</title>
      </Helmet>

      <CompanyProfileView />
    </>
  );
}
