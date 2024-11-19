import { GoogleSheetsService } from "services";

export default class InventoryController {
    static async getInventory() {
        return GoogleSheetsService.fetchInventory().then((inventory) => {
            return {
                response: JSON.stringify(inventory),
                header: 'text/plain',
                status: 200
            };
        }).catch((err) => {
            return {
                response: err,
                header: 'text/plain',
                status: 500
            }
        });
    }
}