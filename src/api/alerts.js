import makeApiCall from '../api/makeApiCall';

const GET_ALERTS = '/measure/alerts/list';
const GET_ALERT = '/measure/alerts';
const UPDATE_ALERT = '/measure/alerts';
const BULK_UPDATE_ALERT = '/measure/alerts/bulk-edit';
const DOWNLOAD_ALERTS_LIST = '/measure/alerts/download-list';
const DOWNLOAD_ALERTS_RECORD = '/measure/alerts/download-alerts-record';
const COLUMN_FILTER_VALUES = '/measure/alerts/column-values';

export async function getAlerts(
    page: String,
    size: String,
    dateFrom: String,
    dateTo: String,
    filters: Array,
    sort: Object
) {
    const relevantFilters = filters.filter(item => item.value.length > 0);

    const filterBody = {
        alertDateFromRange: dateFrom,
        alertDateToRange: dateTo
    };

    relevantFilters.map(body => {
        let key = '';
        let value = body.value;

        switch (body.id.toLowerCase()) {
            case 'behaviourcode':
                key = 'behaviourIdList';
                break;
            case 'escalation':
                key = 'escalationList';
                break;
            case 'assigneduser':
                key = 'assignedUserIdList';
                break;
            case 'status':
                key = 'statusList';
                break;
            case 'ticker':
                key = 'tickers';
                value = value.map(val => val.value);
                break;
            case 'client':
                key = 'clients';
                value = value.map(val => val.value);
                break;
            case 'book':
                key = 'books';
                value = value.map(val => val.value);
                break;
            case 'broker':
                key = 'brokers';
                value = value.map(val => val.value);
                break;
            default:
                key = body.id;
                value = body.value;
                break;
        }

        filterBody[key] = value;

        return null;
    });

    let sortColumn = sort.column;

    if (sort.column === 'assignedUser') sortColumn = 'assignedUserId';

    const withSorting = () => sort && sort.column !== '' && sort.type !== '' ? `&sort=${sortColumn},${sort.type}` : '';

    console.log(filterBody);

    return await makeApiCall(`${GET_ALERTS}?page=${page}&size=${size}${withSorting()}`, 'POST', filterBody);
}

export async function getAlert(id: String) {
    return await makeApiCall(`${GET_ALERT}/${id}`, 'GET');
}

export async function updateAlert(data: Object) {
    return await makeApiCall(UPDATE_ALERT, 'PUT', data);
}

export async function bulkUpdateAlert(data: Array) {
    return await makeApiCall(BULK_UPDATE_ALERT, 'POST', data);
}

export async function downloadAlertsList(data: Object) {
    return await makeApiCall(DOWNLOAD_ALERTS_LIST, 'POST', data);
}

export async function downloadAlertsRecord(id: String) {
    return await makeApiCall(`${DOWNLOAD_ALERTS_RECORD}/${id}`, 'POST', {});
}

export async function getColumnFilterValues() {
    return await makeApiCall(`${COLUMN_FILTER_VALUES}`, 'POST', {});
}
