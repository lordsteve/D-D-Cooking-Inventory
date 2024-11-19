import GoogleSheetsData from "../types/GoogleSheetsData";
import Inventory from "../types/Inventory";

export default class GoogleSheetsService {
    static SHEET_ID = process.env.SHEET_ID
    static API_KEY = process.env.API_KEY
    // Fetch party inventory from Google Sheets
    static async fetchInventory() {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.SHEET_ID}/values/Sheet1?key=${this.API_KEY}`;
        const response = await fetch(url);
        const data = await response.json() as GoogleSheetsData;

        return this.parseInventoryData(data.values);
    }

    // Convert Google Sheets data to inventory object
    private static parseInventoryData(data: GoogleSheetsData['values']) {
        if (!data) {
            console.error('No data found in Google Sheets');
            return {};
        }
        const inventory: Inventory = {};
        data.slice(1).forEach(row => { // Skip the header row
            const [ingredient, quantity] = row;
            inventory[ingredient.toLowerCase()] = parseInt(quantity, 10);
        });
        return inventory;
    }
}