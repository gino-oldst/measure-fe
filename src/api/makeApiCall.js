import axios from 'axios';
import { config } from '../config/constants';
import { getAuthToken } from '../utils/Auth';

export const api = axios.create({
    baseURL: config.apiUrl,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 1000 * 60
});

/**
 * Serialize javascript object for sending to api
 * @param {Object} data
 * @returns {String}
 */
export function serialize(data: Object) {
    return Object.keys(data).map((keyName) => {
        return `${encodeURIComponent(keyName)}=${data[keyName] ? encodeURIComponent(data[keyName]) : ''}`;
    }).join('&');
}

/**
 * Method for making ajax calls to the site's api
 * @param {String} endpoint - the endpoint url
 * @param {String} method api methid POST | GET | DELETE
 * @param {Object|String} [data] - key:value pairs of the data to be sent to server
 * @param {String} contentType - header contentType of request
 * @returns {Promise}
 */
export default async function makeApiCall(
    endpoint: string,
    method: string,
    data: Object = null
) {
    const accessToken = await getAuthToken();

    const request = {
        method,
        url: endpoint,
        data: data ? (endpoint.includes('oauth') ? serialize(data) : data) : ''
    };

    if (endpoint.includes('oauth')) {
        request.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${config.adminApplAuthHeader}`
        };
    } else if (endpoint.includes('generate-token')) {
        request.headers = {};
    } else if (endpoint.includes('download')) {
        fetch(`${config.apiUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: endpoint.includes('download-list') ? JSON.stringify(data) : null
        })
            .then(response => {
                response.blob().then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');

                    a.href = url;
                    a.download = `${endpoint.includes('alerts-record') ? 'alert-record' : endpoint.includes('download-list') ? 'alert-list' : 'dashboard'}.xlsx`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
            })
            .catch(err => console.error(err));

        return;
    } else {
        request.headers = {
            Authorization: `Bearer ${accessToken}`
        };
    }

    try {
        const response = await api(request);

        return response;
    } catch (err) {
        if (err.response) {
            const errData = {};

            errData.status = err.response.status;
            errData.message = err.response.message;

            throw errData;
        } else {
            const errDataNetwork = {};

            errDataNetwork.status = 503;
            errDataNetwork.message = 'Network Unreachable';
            throw errDataNetwork;
        }
    }
}

/**
 * Method for making ajax calls to the site's api
 * @param {String} apiUrl - the api url
 * @param {String} endpoint - the endpoint url
 * @param {Object|string} [data] - key:value pairs of the data to be sent to server
 * @returns {Promise}
 */
export async function makeExternalRequest(apiUrl, endpoint, data = null) {
    const url = `${apiUrl}${endpoint}${data ? `?${serialize(data)}` : ''}`;
    const response = await fetch(url);

    if (response.ok) {
        const data = await response.json();

        return data;
    } else {
        const error = new Error(response.statusText);

        error.response = response;
        throw error;
    }
}
