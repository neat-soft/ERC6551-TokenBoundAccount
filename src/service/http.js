import axios from "axios";
import { API_URL } from "const";
import SnackbarUtils from "utils/SnackbarUtils";
class Http {
    constructor() {
        const service = axios.create({
            baseURL: API_URL,
            headers: {
                common: {
                    Accept: "application/json",
                },
            },
            timeout: 60000 // timeout 60S
        });
        service.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error?.response?.data?.message) {
                    SnackbarUtils.error(error?.response?.data?.message);
                } else {
                    SnackbarUtils.error("Something went wrong in sever call");
                }
                return error;
            }
        );
        this.service = service;

        const fetch = axios.create({
            baseURL: API_URL,
            headers: {
                common: {
                    Accept: "application/json",
                },
            },
        });
        fetch.interceptors.response.use(
            (response) => response?.data,
            (error) => Promise.reject(error?.response.data)
        );
        this.fetch = fetch;
    }
    get(path) {
        return this.service.get(path);
    }
    post(path, payload) {
        return this.service.post(path, payload);
    }
    put(path, payload) {
        return this.service.put(path, payload);
    }
    delete(path, payload) {
        return this.service.delete(path, payload);
    }
}
export default new Http();
