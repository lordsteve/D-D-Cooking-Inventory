import Database from "./database/index";
import Log from "./log";
import GoogleSheetsService from "./googleSheetsService";

export { default as Database } from "./database/index";
export { default as Log } from "./log";
export { default as GoogleSheetsService } from "./googleSheetsService";

const Services = {
    Database,
    Log,
    GoogleSheetsService
};
export default Services;