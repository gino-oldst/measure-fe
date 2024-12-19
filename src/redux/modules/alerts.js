// @flow
import moment from 'moment';

const SET_ALERTS_DATA = 'SET_ALERTS_DATA';
const SET_ALERT_SPECIFICS_DATA = 'SET_ALERT_SPECIFICS_DATA';
const SET_SELECTED_ALERT = 'SET_SELECTED_ALERT';
const SET_ASSIGNEES = 'SET_ASSIGNEES';
const SET_COLUMN_FILTER_VALUES = 'SET_COLUMN_FILTER_VALUES';
const REPLACE_ALERT_DETAILS = 'REPLACE_ALERT_DETAILS';
const FILTER_ALERTS_DATA = 'FILTER_ALERTS_DATA';
const SET_LOADING = 'SET_LOADING';
const SET_ALERTS_DATE_RANGE = 'SET_ALERTS_DATE_RANGE';

export function setSelectedAlert(data: Object) {
    return {
        type: SET_SELECTED_ALERT,
        data
    };
}

export function setAlertsData(data: Array, alertIds: Array, totalNoOfRecords: Integer, totalPages: Integer) {
    return {
        type: SET_ALERTS_DATA,
        data,
        alertIds,
        totalNoOfRecords,
        totalPages
    };
}

export function setAlertSpecificsData(data: Object) {
    return {
        type: SET_ALERT_SPECIFICS_DATA,
        data
    };
}

export function setColumnFilterValues(values: object) {
    return {
        type: SET_COLUMN_FILTER_VALUES,
        values
    };
}

export function setAssignees(users: Array) {
    return {
        type: SET_ASSIGNEES,
        users
    };
}

export function replaceAlertDetails(data: Array) {
    return {
        type: REPLACE_ALERT_DETAILS,
        data
    };
}

export function filterAlertsData(
    selectedOption: Integer,
    dateRangeValues: Date
) {
    return {
        type: FILTER_ALERTS_DATA,
        selectedOption,
        dateRangeValues
    };
}

export function setAlertsDateRange(target: String, date: String) {
    return {
        type: SET_ALERTS_DATE_RANGE,
        target,
        date
    };
}

export function setLoading() {
    return {
        type: SET_LOADING
    };
}

const initialState = {
    dateRange: {
        start: moment().subtract(7, 'd'),
        end: moment(),
        activeOption: 2
    },
    columnFilterValues: null,
    table: {
        loading: false,
        isFiltered: false,
        columns: [
            {
                header: 'Alert Type',
                accessor: 'behaviourCode',
                disableFilters: false,
                clickable: true
            },
            {
                header: 'Date',
                accessor: 'alertDate',
                disableFilters: true,
                clickable: false
            },
            {
                header: 'Ticker',
                accessor: 'ticker',
                disableFilters: false,
                clickable: false
            },
            {
                header: 'Quantity',
                accessor: 'quantity',
                disableFilters: true,
                clickable: false
            },
            {
                header: 'Client',
                accessor: 'client',
                disableFilters: false,
                clickable: false
            },
            {
                header: 'Book',
                accessor: 'book',
                disableFilters: false,
                clickable: false
            },
            {
                header: 'Escalation',
                accessor: 'escalation',
                disableFilters: false,
                clickable: false
            },
            {
                header: 'Broker',
                accessor: 'broker',
                disableFilters: false,
                clickable: false
            },
            {
                header: 'Assigned',
                accessor: 'assignedUser',
                disableFilters: false,
                clickable: false
            },
            {
                header: 'Status',
                accessor: 'status',
                disableFilters: false,
                clickable: false
            },
            {
                header: 'Parameter',
                accessor: 'parameterValues',
                disableFilters: true,
                clickable: false
            }
        ],
        data: [],
        alertIds: [],
        filtered: [],
        totalNoOfRecords: null,
        totalPages: null
    },
    selected: {
        data: {},
        assignees: [],
        alertSpecifics: {}
    }
};

export default function alerts(state: Object = initialState, action: Object):
  | any
  | {
    table: {}
  } {
    switch (action.type) {
        case SET_LOADING:
            return {
                ...state,
                table: {
                    ...state.table,
                    loading: true
                }
            };
        case SET_ALERTS_DATA:
            return {
                ...state,
                table: {
                    ...state.table,
                    data: action.data,
                    alertIds: action.alertIds,
                    totalNoOfRecords: action.totalNoOfRecords,
                    totalPages: action.totalPages,
                    loading: false
                }
            };
        case SET_SELECTED_ALERT:
            return {
                ...state,
                selected: {
                    ...state.selected,
                    data: action.data
                }
            };
        case SET_ALERT_SPECIFICS_DATA:
            return {
                ...state,
                selected: {
                    ...state.selected,
                    alertSpecifics: action.data
                }
            };
        case SET_ASSIGNEES:
            return {
                ...state,
                selected: {
                    ...state.selected,
                    assignees: action.users.filter(user => user.fullName.toLowerCase() !== 'admin' || user.username.toLowerCase() !== 'admin')
                }
            };
        case SET_COLUMN_FILTER_VALUES:
            return {
                ...state,
                columnFilterValues: action.values
            };

        case REPLACE_ALERT_DETAILS:
            return {
                ...state,
                selected: {
                    ...state.selected,
                    data: action.data
                }
            };

        case FILTER_ALERTS_DATA: {
            let filteredData = state.table.data;
            const { start, end } = action.dateRangeValues;

            if (action.selectedOption === 1) {
                filteredData = filteredData.filter(data => moment.utc(data.dateCreated).format('DD MM YYYY') === moment.utc().format('DD MM YYYY'));
            } else if (action.selectedOption === 2) {
                filteredData = filteredData.filter(data => moment(data.dateCreated).isBetween(moment.utc().subtract(7, 'd'), moment.utc()));
            } else if (action.selectedOption === 3) {
                filteredData = filteredData.filter(data => moment.utc(data.dateCreated).isBetween(moment.utc(start), moment.utc(end)));
            }

            return {
                ...state,
                table: {
                    ...state.table,
                    isFiltered: action.selectedOption > 0,
                    filtered: action.selectedOption > 0 ? filteredData : []
                }
            };
        }

        case SET_ALERTS_DATE_RANGE:
            return {
                ...state,
                dateRange: {
                    ...state.dateRange,
                    [action.target]: action.date
                }
            };

        default:
            return state;
    }
}
