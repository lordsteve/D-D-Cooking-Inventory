import home from '@views/home/home';
import homeTemplate from '@views/home/home.template';
import nav from '@views/nav/nav';
import navTemplate from '@views/nav/nav.template';
import inventory from '@views/inventory/inventory';
import inventoryTemplate from '@views/inventory/inventory.template';
import sidebar from './sidebar/sidebar';
import sidebarTemplate from './sidebar/sidebar.template';

export { default as home } from '@views/home/home';
export { default as homeTemplate } from '@views/home/home.template';
export { default as nav } from '@views/nav/nav';
export { default as navTemplate } from '@views/nav/nav.template';
export { default as inventory } from '@views/inventory/inventory';
export { default as inventoryTemplate } from '@views/inventory/inventory.template';
export { default as sidebar } from './sidebar/sidebar';
export { default as sidebarTemplate } from './sidebar/sidebar.template';

const views = {
    home,
    homeTemplate,
    nav,
    navTemplate,
    inventory,
    inventoryTemplate,
    sidebar,
    sidebarTemplate
};
export default views;