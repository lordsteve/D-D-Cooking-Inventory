import el from '@services/elements';
import { getHtml, initLoader } from '@services/request';
import views from '@views';

initLoader();

el.body.appendChild(views.navTemplate);
views.nav();
switch (location.pathname) {
    case '/':
        el.body.appendChild(views.homeTemplate(
            ``
        ));
        views.home();
    break;
    case '/inventory':
        el.body.appendChild(views.inventoryTemplate);
        views.inventory();
    default:
        getHtml(location.pathname)
            .then((page) => {
                if (page instanceof HTMLElement){
                    el.body.appendChild(page);
                } else if (page instanceof NodeList) {
                    page.forEach((element) => {
                        el.body.appendChild(element);
                    });
                }

                if (el.nav.nextElementSibling === null) {
                    el.body.appendChild(views.homeTemplate('404', 'Page Not Found'));
                    views.home();
                }
            });
    break;
}