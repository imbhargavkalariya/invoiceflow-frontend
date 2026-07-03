import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useTranslate();

  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: 'Overview',
        items: [
          {
            title: 'Dashboard',
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
          },
        ],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: 'Management',
        items: [
          // INVOICES
          {
            title: 'Invoices',
            path: paths.dashboard.invoice.root,
            icon: ICONS.invoice,
            children: [
              { title: 'List Invoices', path: paths.dashboard.invoice.root },
              { title: 'Create Invoice', path: paths.dashboard.invoice.new },
            ],
          },
          // CUSTOMERS
          {
            title: 'Customers',
            path: paths.dashboard.customer.root,
            icon: ICONS.user,
            children: [
              { title: 'List Customers', path: paths.dashboard.customer.root },
              { title: 'Add Customer', path: paths.dashboard.customer.new },
            ],
          },
          // PRODUCTS
          {
            title: 'Products',
            path: paths.dashboard.product.root,
            icon: ICONS.product,
            children: [
              { title: 'List Products', path: paths.dashboard.product.root },
              { title: 'Add Product', path: paths.dashboard.product.new },
            ],
          },
          // COMPANY PROFILE
          {
            title: 'Company Profile',
            path: paths.dashboard.company,
            icon: ICONS.banking,
          },
        ],
      },
    ],
    []
  );

  return data;
}
