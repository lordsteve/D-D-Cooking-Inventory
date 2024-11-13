import CookieJar from "./cookieJar";
import request from "./request";
import StorageBox from "./storageBox";

export { default as CookieJar } from "./cookieJar";
export { default as request } from "./request";
export { default as StorageBox } from "./storageBox";

const services = {
    CookieJar,
    request,
    StorageBox
};
export default services;