import el, { html } from '@services/elements';
import sheetSvc from '@services/googleSheetsSvc';
import { get } from '@services/request';

export default async function inv() {
    el.title.textContent = 'Ingredient Inventory';
    const drumstick = el.imgs?.id('drumstick');

    const inventoryDiv = el.divs?.id('inventory');
    const inventory = await get('/data/get-inventory');
    drumstick?.remove();

    Object.entries(inventory).forEach(([ingredient, quantity]) => {
        inventoryDiv?.appendChild(html`
            <p><span style="font-weight:700;">${ingredient}</span>: ${quantity}</p>
        `);
    });
}