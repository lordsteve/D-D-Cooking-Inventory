import { GoogleSheetsService, Log } from "services";

export default class InventoryController {
    static async getInventory() {
        return GoogleSheetsService.fetchInventory().then((inventory) => {
            return {
                response: JSON.stringify(inventory),
                header: 'text/plain',
                status: 200
            };
        }).catch((error) => {
            Log.write(error);
            return {
                response: JSON.stringify(error),
                header: 'text/plain',
                status: 500
            }
        });
    }
}