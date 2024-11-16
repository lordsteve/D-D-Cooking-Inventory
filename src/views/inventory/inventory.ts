import { GoogleSheetsData, Inventory } from '@const/types';
import el, { html } from '@services/elements';
import { get } from '@services/request';

export default async function about() {
    el.title.textContent = 'Ingredient Inventory';

    const inventoryDiv = el.divs.id('inventory');
    const inventory = await fetchInventory();

    Object.entries(inventory).forEach(([ingredient, quantity]) => {
        inventoryDiv.appendChild(html`
            <p>${ingredient}: ${quantity}</p>
        `);
    });
}

// Fetch party inventory from Google Sheets
export async function fetchInventory() {
    const { SHEET_ID, API_KEY } = await get<{SHEET_ID: string, API_KEY: string}>(`/data/get-inventory`);
    const data = await get<GoogleSheetsData>(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`);
    return parseInventoryData(data.values);
}

// Convert Google Sheets data to inventory object
function parseInventoryData(data: GoogleSheetsData['values']) {
    const inventory: Inventory = {};
    data.slice(1).forEach(row => { // Skip the header row
        const [ingredient, quantity] = row;
        inventory[ingredient.toLowerCase()] = parseInt(quantity, 10);
    });
    return inventory;
}