// @flow
const SET_IS_ROW_SELECTED = 'SET_IS_ROW_SELECTED';
const SET_APPLIED_FILTERS = 'SET_APPLIED_FILTERS';
const RESET_APPLIED_FILTERS = 'RESET_APPLIED_FILTERS';
const SET_FILTERED_ROWS = 'SET_FILTERED_ROWS';
const SET_SORTED_COLUMN = 'SET_SORTED_COLUMN';
const SET_PAGE_SIZE = 'SET_PAGE_SIZE';
const SET_ACTIVE_PAGE = 'SET_ACTIVE_PAGE';
const SET_ALL_ROWS_SELECTED = 'SET_ALL_ROWS_SELECTED';
const RESET_STATE = 'RESET_STATE';

export function setIsRowSelected(
    count: Integer,
    selectedRows: Array
) {
    return {
        type: SET_IS_ROW_SELECTED,
        count,
        selectedRows
    };
}

export function setAppliedFilters(
    id: String,
    value: String,
    isChecked: Boolean,
    isArray: Boolean): {id: Array, value: String, isChecked: Boolean, isArray: Boolean} {
    return {
        type: SET_APPLIED_FILTERS,
        id,
        value,
        isChecked,
        isArray
    };
}

export function setSortedColumn(column: String, sortType: String): { column: String, sortType: String } {
    return {
        type: SET_SORTED_COLUMN,
        column,
        sortType
    };
}

export function resetAppliedFilters(id: String): { id: String } {
    return {
        type: RESET_APPLIED_FILTERS,
        id
    };
}

export function setFilteredRows(data: Array): {data: Array} {
    return {
        type: SET_FILTERED_ROWS,
        data
    };
}

export function setTablePageSize(pageSize: String) {
    return {
        type: SET_PAGE_SIZE,
        pageSize
    };
}

export function setActivePage(activePage: String) {
    return {
        type: SET_ACTIVE_PAGE,
        activePage
    };
}

export function resetTableState() {
    return {
        type: RESET_STATE
    };
}

export function setAllRowsSelected(selected: boolean) {
    return {
        type: SET_ALL_ROWS_SELECTED,
        selected
    };
}

const initialState = {
    isRowsSelected: false,
    areRowsSelectedAll: false,
    selectedRows: [],
    filteredRows: [],
    filtersReset: false,
    appliedFilters: [
        {
            id: 'behaviourCode',
            value: []
        },
        {
            id: 'broker',
            value: []
        },
        {
            id: 'ticker',
            value: []
        },
        {
            id: 'book',
            value: []
        },
        {
            id: 'client',
            value: []
        },
        {
            id: 'escalation',
            value: []
        },
        {
            id: 'assignedUser',
            value: []
        },
        {
            id: 'broker',
            value: []
        },
        {
            id: 'status',
            value: []
        },
        {
            id: 'isin',
            value: []
        },
        {
            id: 'summary',
            value: []
        }
    ],
    sort: {
        column: '',
        sort: ''
    },
    pageSize: 10,
    activePage: 0
};

export default function table(state: Object = initialState, action: Object) {
    switch (action.type) {
        case SET_IS_ROW_SELECTED:
            return {
                ...state,
                isRowsSelected: action.count,
                selectedRows: action.selectedRows
            };
        case SET_SORTED_COLUMN:
            return {
                ...state,
                sort: {
                    column: action.column,
                    type: action.sortType
                }
            };

        case SET_APPLIED_FILTERS: {
            const toUpdateIndex = state.appliedFilters.findIndex(param => param.id === action.id);

            const newData = [...state.appliedFilters];

            const value = action.isArray
                ? [
                    ...newData[toUpdateIndex].value,
                    action.value
                ]
                : action.value !== ''
                    ? Array.isArray(action.value)
                        ? action.value
                        : [action.value]
                    : [];

            if (action.isChecked) {
                newData[toUpdateIndex] = {
                    id: action.id,
                    value
                };
            } else {
                newData[toUpdateIndex] = {
                    id: action.id,
                    value: newData[toUpdateIndex].value.filter(val => val !== action.value)
                };
            }

            return {
                ...state,
                appliedFilters: newData,
                filtersReset: false
            };
        }

        case RESET_APPLIED_FILTERS: {
            const toUpdateIndex = state.appliedFilters.findIndex(param => param.id === action.id);

            const newData = [...state.appliedFilters];

            newData[toUpdateIndex] = {
                id: action.id,
                value: []
            };

            return {
                ...state,
                appliedFilters: newData
            };
        }

        case SET_FILTERED_ROWS:
            return {
                ...state,
                filteredRows: action.data
            };
        case SET_PAGE_SIZE:
            return {
                ...state,
                pageSize: action.pageSize
            };
        case SET_ACTIVE_PAGE:
            return {
                ...state,
                activePage: action.activePage
            };
        case SET_ALL_ROWS_SELECTED:
            return {
                ...state,
                areRowsSelectedAll: action.selected
            };
        case RESET_STATE:
            return {
                ...initialState,
                filtersReset: true
            };
        default:
            return state;
    }
}
