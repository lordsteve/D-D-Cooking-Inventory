import { GoogleSheetsData, Inventory } from "@const/types";
import { get } from "./request";

export default class GoogleSheetsService {
    static data: GoogleSheetsData | null = null;
    // Fetch party inventory from Google Sheets
    static async fetchInventory() {
        if (!this.data) {
            const { SHEET_ID, API_KEY } = await get<{SHEET_ID: string, API_KEY: string}>(`/data/get-inventory`);
            this.data = await get<GoogleSheetsData>(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`);
        }
        return this.parseInventoryData(this.data.values);
    }

    // Convert Google Sheets data to inventory object
    private static parseInventoryData(data: GoogleSheetsData['values']) {
        const inventory: Inventory = {};
        data.slice(1).forEach(row => { // Skip the header row
            const [ingredient, quantity] = row;
            inventory[ingredient.toLowerCase()] = parseInt(quantity, 10);
        });
        return inventory;
    }
}