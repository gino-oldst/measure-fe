// @flow
import React, { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { matchSorter } from 'match-sorter';
import Button from '../../base/Button/Button';
import Badge from '../../base/Badge/Badge';
import Typography from '../../base/Typography/Typography';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDropdown from '../../base/CustomDropdown/CustomDropdown';
import Select from '../../base/Select/Select';
import makeAnimated from 'react-select/animated';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { kFormatter, getTextColor } from '../../../utils/helpers';
import { ALERT_ESCALATION_OPTIONS, ALERT_STATUS_OPTIONS } from '../../../config/constants';
import {
    Table as ReactstrapTable,
    DropdownItem,
    FormGroup,
    Input,
    Label,
    Row,
    Col
} from 'reactstrap';
import { components } from 'react-select';
import filterIcon from '../../../assets/images/ic_filter.svg';
import './table.scss';

import { useTable, useRowSelect, useFilters, useGlobalFilter, usePagination, useSortBy, useAsyncDebounce } from 'react-table';
import { setIsRowSelected, setTablePageSize, setActivePage, setAppliedFilters, resetAppliedFilters, setFilteredRows, setSortedColumn, setAllRowsSelected } from '../../../redux/modules/table';

// Define a default UI for filtering
function GlobalFilter({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter
}) {
    const count = preGlobalFilteredRows.length;
    const [value, setValue] = React.useState(globalFilter);
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined);
    }, 200);

    return (
        <span>
            Search:{' '}
            <input
                value={value || ''}
                onChange={e => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder={`${count} records...`}
                style={{
                    fontSize: '1.1rem',
                    border: '0'
                }}/>
        </span>
    );
}

// Define a default UI for filtering
function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter }
}) {
    const count = preFilteredRows.length;

    return (
        <input
            value={filterValue || ''}
            onChange={e => setFilter(e.target.value || undefined)} // Set undefined to remove the filter entirely
            placeholder={`Search ${count} records...`}/>
    );
}

function fuzzyTextFilterFn(rows, id, filterValue) {
    return matchSorter(rows, filterValue, { keys: [row => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = val => !val;

// This is a custom filter UI for selecting
// a unique option from a list
function SelectColumnFilter({
    column: { Header, filterValue, setFilter, preFilteredRows, id }
}) {
    const dispatch = useDispatch();
    const [selectFilter, setSelectFilter] = useState([]);
    const [searchFilter, setSearchFilter] = useState('');
    const [isCheckAll, setIsCheckAll] = useState(false);
    const { selected, columnFilterValues } = useSelector(({ alerts }) => alerts);
    const { table } = useSelector(({ behaviours }) => behaviours);
    const { appliedFilters, filtersReset } = useSelector(({ table }) => table);

    const header = Header.toLowerCase();
    const columnFiltersWithCheckbox = ['behaviourCode', 'escalation', 'assignedUser', 'status'];
    const columnFiltersSearcheable = ['book', 'client', 'broker'];
    const columnFiltersWithSearchbox = ['isin', 'summary'];
    const rootPath = window.location.pathname.split('/')[1];

    if (rootPath === 'alerts') {
        columnFiltersSearcheable.push('ticker');
        columnFiltersWithSearchbox.pop();
    } else {
        columnFiltersWithSearchbox.push('ticker');
        columnFiltersSearcheable.pop();
    }

    useEffect(() => {
        setFilter(selectFilter);
    }, [selectFilter]);

    useEffect(() => {
        if (filtersReset) {
            setFilter([]);
            setSearchFilter('');
            setIsCheckAll(false);
            setSelectFilter([]);
        }
    }, [filtersReset]);

    const handleFilterChange = (e, value) => {
        const isChecked = e.target.checked;

        if (isChecked) {
            setSelectFilter([...selectFilter, value]);
        } else {
            setSelectFilter([...selectFilter.filter(val => val !== value)]);
        }

        dispatch(setAppliedFilters(id, value, isChecked, columnFiltersWithCheckbox.includes(id)));
    };

    const handleResetFilter = () => {
        setFilter([]);
        setSelectFilter([]);
        setSearchFilter('');
        setIsCheckAll(false);
        dispatch(resetAppliedFilters(id));
    };

    const handleSelectFilterChange = selected => {
        dispatch(setActivePage(0));
        dispatch(setAppliedFilters(id, selected, true, columnFiltersWithCheckbox.includes(id)));
    };

    const handleSearch = value => {
        dispatch(setAppliedFilters(id, value, true, columnFiltersWithCheckbox.includes(id)));

        setSearchFilter(value);
    };

    const handleSelectAll = () => {
        setIsCheckAll(!isCheckAll);
        setSelectFilter(table.data.map((alert) => {
            dispatch(setAppliedFilters(id, alert.id, true, columnFiltersWithCheckbox.includes(id)));

            return alert.id;
        }));

        if (isCheckAll) {
            setSelectFilter([]);

            table.data.map((alert) => dispatch(setAppliedFilters(id, alert.id, false, columnFiltersWithCheckbox.includes(id))));
        }
    };

    const columnIsFiltered = () => {
        const hasFilterOn = appliedFilters.filter(filter => filter.id === id && filter.value.length > 0);

        if (hasFilterOn.length > 0) return <FontAwesomeIcon className='table__filter-icon-active cursor-pointer' icon='filter' />;

        return <img className='table__filter-icon cursor-pointer' src={filterIcon} alt='talbe-filter-icon' />;
    };

    const Option = props => {
        return (
            <div className='d-flex'>
                <components.Option {...props}>
                    <input
                        type='checkbox'
                        checked={props.isSelected}
                        style={{ verticalAlign: 'middle' }}
                        onChange={() => null}/>{' '}
                    <label style={{ fontSize: '14px', verticalAlign: 'top' }}>{props.label}</label>
                </components.Option>
            </div>
        );
    };

    const allOption = {
        label: 'Select all',
        value: '*'
    };

    const ValueContainer = ({ children, ...props }) => {
        const currentValues = props.getValue();
        let toBeRendered = children;

        if (currentValues.some(val => val.value === allOption.value)) {
            toBeRendered = [[children[0][0]], children[1]];
        }

        return (
            <components.ValueContainer {...props}>
                {toBeRendered}
            </components.ValueContainer>
        );
    };

    const MultiValue = props => {
        let labelToBeDisplayed = `${props.data.label} `;

        if (props.data.value === allOption.value) {
            labelToBeDisplayed = 'All is selected';
        }

        return (
            <components.MultiValue {...props}>
                <span>{labelToBeDisplayed}</span>
            </components.MultiValue>
        );
    };

    const animatedComponents = makeAnimated();

    const getColumnFilterOptions = () => {
        switch (id) {
            case 'ticker':
                return columnFilterValues.tickers.map(value => ({ name: value, label: value, value: value }));
            case 'client':
                return columnFilterValues.clients.map(value => ({ name: value, label: value, value: value }));
            case 'book':
                return columnFilterValues.books.map(value => ({ name: value, label: value, value: value }));
            case 'behaviourCode':
                return columnFilterValues.behaviours.map(value => ({ name: value.internalCode, label: value.internalCode, value: value.id }));
            case 'broker':
                return columnFilterValues.brokers.map(value => ({ name: value, label: value, value: value }));
            case 'isin': // todo
                return [];
            case 'summary':
                return [];
            default:
                return columnFilterValues[id].map(value => ({ name: value, label: value, value: value }));
        }
    };

    const renderFilterWithSearcheableDropdown = () => {
        return columnFiltersSearcheable.includes(id) &&
            <DropdownItem header={true}>
                <Select
                    options={!columnFilterValues ? [] : getColumnFilterOptions()}
                    name='search'
                    placeholder={'Search...'}
                    isMulti={true}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    components={{
                        Option,
                        MultiValue,
                        ValueContainer,
                        animatedComponents
                    }}
                    onChange={handleSelectFilterChange}
                    allowSelectAll={true}
                    value={appliedFilters.filter(filter => filter.id === id)[0].value} />
            </DropdownItem>;
    };

    const renderFilterWithSearchbar = () => {
        return columnFiltersWithSearchbox.includes(id) &&
        <DropdownItem header={true}>
            <Input type='text' name='search' placeholder='Search...'
                bsSize='md' value={searchFilter} onChange={e => handleSearch(e.target.value)} />
        </DropdownItem>;
    };

    const renderFilterWithCheckboxColumns = () => {
        let options = [];

        switch (header) {
            case 'alert type':
                options = table.data.map(alertType => ({
                    label: alertType.code,
                    inputComponent: <Input type='checkbox' checked={selectFilter.includes(alertType.id) || appliedFilters.filter(filter => filter.id === 'behaviourCode' && filter.value.includes(alertType.id)).length}
                        onChange={e => handleFilterChange(e, alertType.id)}/>
                }));
                break;
            case 'escalation':
                options = Object.keys(ALERT_ESCALATION_OPTIONS).map(escalationOpt => ({
                    label: escalationOpt,
                    inputComponent: <Input type='checkbox' checked={selectFilter.includes(escalationOpt.toUpperCase()) || appliedFilters.filter(filter => filter.id === 'escalation' && filter.value.includes(escalationOpt)).length}
                        onChange={e => handleFilterChange(e, escalationOpt.toUpperCase())}/>
                }));
                break;
            case 'assigned':
                options = selected.assignees.map(assignee => ({
                    label: assignee.fullName,
                    inputComponent: <Input type='checkbox' checked={selectFilter.includes(assignee.id !== 999999 ? assignee.id : null) || appliedFilters.filter(filter => filter.id === 'assignedUser' && filter.value.includes(assignee.id)).length}
                        onChange={e => handleFilterChange(e, assignee.id !== 999999 ? assignee.id : null)}/>
                }));
                break;
            case 'status':
                options = Object.keys(ALERT_STATUS_OPTIONS).map(statusOpt => ({
                    label: statusOpt,
                    inputComponent: <Input type='checkbox' checked={selectFilter.includes(statusOpt.toUpperCase()) || appliedFilters.filter(filter => filter.id === 'status' && filter.value.includes(statusOpt)).length}
                        onChange={e => handleFilterChange(e, statusOpt.toUpperCase())}/>
                }));
                break;
            default:
                break;
        }

        if (header === 'alert type') {
            return <>
                <FormGroup key={'select_all'} check={true}>
                    <Label check={true}>
                        <Input type='checkbox' checked={isCheckAll}
                            onChange={handleSelectAll}/>
                        Select all
                    </Label>
                </FormGroup>
                {options.map((opt, idx) => (
                    <FormGroup key={opt.label} check={true}>
                        <Label check={true}>
                            {opt.inputComponent}
                            {opt.label}
                        </Label>
                    </FormGroup>
                ))}
            </>;
        }

        return options.map((opt, idx) => (
            <FormGroup key={opt.label} check={true}>
                <Label check={true}>
                    {opt.inputComponent}
                    {opt.label}
                </Label>
            </FormGroup>
        ));
    };

    // Render a multi-select box
    return (
        <CustomDropdown tag='span'
            toggle={columnIsFiltered()}>
            <DropdownItem header={true} className='text-center'>
                <img src={filterIcon} alt='talbe-filter-icon' />
            </DropdownItem>
            <DropdownItem divider={true} />
            {renderFilterWithSearcheableDropdown()}
            {renderFilterWithSearchbar()}
            <div className='table__filter-options overflow-auto'>
                {renderFilterWithCheckboxColumns()}
            </div>
            <DropdownItem divider={true} />
            <Button label={<><Typography weight='light' variant='size-14'>Reset</Typography></>}
                className='table__filter-reset-button float-right mr-2' onClick={() => handleResetFilter()}/>
        </CustomDropdown>
    );
}

// For row selection
const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
        const defaultRef = React.useRef();
        const dispatch = useDispatch();
        const resolvedRef = ref || defaultRef;

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate;
            rest.title.toLowerCase() === 'toggle all rows selected' && dispatch(setAllRowsSelected(rest.checked));
        }, [resolvedRef, indeterminate, rest.checked]);

        return (
            <>
                <input type='checkbox' ref={resolvedRef} {...rest} />
            </>
        );
    }
);

// Our table component
function Table({
    loading,
    columns,
    data,
    tablePagination,
    totalNoOfRecords,
    activePage,
    selectableRows,
    globalFilter,
    pagination,
    sortable,
    fetching
}) {
    const [isAsc, setIsAsc] = useState(true);
    const [sortBy, setSortBy] = useState('id');

    const filterTypes = useMemo(
        () => ({
            fuzzyText: fuzzyTextFilterFn,
            text: (rows, id, filterValue) => {
                return rows.filter(row => {
                    const rowValue = row.values[id];

                    return rowValue !== undefined
                        ? String(rowValue)
                            .toLowerCase()
                            .startsWith(String(filterValue).toLowerCase())
                        : true;
                });
            }
        }),
        []
    );

    const defaultColumn = useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter
        }),
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        state,
        visibleColumns,
        preGlobalFilteredRows,
        setGlobalFilter,
        page,
        pageCount,
        gotoPage,
        previousPage,
        setPageSize,
        state: { pageSize }
    } = useTable(
        {
            columns,
            data,
            defaultColumn,
            filterTypes
        },
        useFilters,
        useGlobalFilter,
        useSortBy,
        usePagination,
        useRowSelect,
        hooks => { // push column for the checkbox
            selectableRows && hooks.visibleColumns.push(columns => [
                {
                    id: 'selection',
                    Header: ({ getToggleAllRowsSelectedProps }) => (
                        <div>
                            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                        </div>
                    ),
                    Cell: ({ row }) => (
                        <div>
                            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                        </div>
                    )
                },
                ...columns
            ]);
        }
    );

    useEffect(() => {
        // dispatch(setAppliedFilters(state.filters));
        dispatch(setFilteredRows(page.map(p => p.original.id)));
    }, [state.filters]);

    const dispatch = useDispatch();
    const maxPage = 3; // max page for pagination button

    const selectedRows = rows.filter(row => row.isSelected === true);

    useEffect(() => {
        dispatch(setIsRowSelected(selectedRows.length, [...selectedRows.map(row => { return row.original.id; })]));
    }, [selectedRows.length]);

    // set pageSize to redux that triggers alerts list api call
    useEffect(() => {
        dispatch(setTablePageSize(pageSize));
    }, [pageSize]);

    const setTableActivePage = page => {
        dispatch(setActivePage(page));
    };

    const handleSort = (key) => {
        setTableActivePage(0);

        if (key === sortBy) {
            setIsAsc(!isAsc);
            dispatch(setSortedColumn(key, !isAsc ? 'ASC' : 'DESC'));
        } else {
            setSortBy(key);
            setIsAsc(true);
            dispatch(setSortedColumn(key, 'ASC'));
        }
    };

    const renderSortControl = (key) =>
        sortBy === key
            ? isAsc ? ' 🔼' : ' 🔽'
            : <FontAwesomeIcon icon='sort' size='sm' className='table__sort-icon' />;

    return (
        <>
            <ReactstrapTable responsive={true} {...getTableProps()}>
                <thead>
                    {globalFilter &&
                        <tr>
                            <th
                                colSpan={visibleColumns.length}
                                style={{
                                    textAlign: 'left'
                                }}>
                                <GlobalFilter
                                    preGlobalFilteredRows={preGlobalFilteredRows}
                                    globalFilter={state.globalFilter}
                                    setGlobalFilter={setGlobalFilter}/>
                            </th>
                        </tr>
                    }
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>
                                    <span onClick={() => column.id !== 'selection' && handleSort(column.id)} className='cursor-pointer'>
                                        {column.render('Header')}
                                        {column.id !== 'selection' && renderSortControl(column.id)}
                                    </span>
                                    {column.canFilter ? column.render('Filter') : null}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {!page.length || loading
                        ? <tr>
                            <td className='text-muted text-center' colSpan={12}>
                                {loading ? 'Fetching data...' : 'No data found'}
                            </td>
                        </tr>
                        : page.map((row, i) => {
                            prepareRow(row);

                            return (
                                <tr {...row.getRowProps()} className={`${row.isSelected ? 'selected-row' : ''}`}>
                                    {row.cells.map(cell => {
                                        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                                    })}
                                </tr>
                            );
                        })
                    }
                </tbody>
            </ReactstrapTable>
            {pagination &&
                <Row className='mt-5 align-items-center'>
                    <Col md={12} lg={3} className='mr-auto'>
                        <div className='pagination-pagesize'>
                            <span>Showing {((activePage + 1) * pageSize + 1) - pageSize}-{(activePage + 1) * pageSize > totalNoOfRecords ? totalNoOfRecords : (activePage + 1) * pageSize} of {totalNoOfRecords} items</span>
                            <Input type='select'
                                className='mt-2'
                                value={pageSize}
                                disabled={fetching}
                                onChange={e => {
                                    setPageSize(Number(e.target.value));
                                    setTableActivePage(0);
                                }}>
                                {[10, 25, 50, 100].map(pageSize => (
                                    <option key={pageSize} value={pageSize}>
                                        Show {pageSize}
                                    </option>
                                ))}
                            </Input>
                        </div>
                    </Col>
                    <Col md={12} lg={6}>
                        <div className='pagination d-flex justify-content-center'>
                            <span className={`cursor-pointer pagination-navigate
                                ${activePage === 0 || fetching ? 'text-muted' : ''}`}
                            onClick={() => {
                                gotoPage(0);
                                setTableActivePage(0);
                            }}>
                                First
                            </span>
                            <span className={`cursor-pointer pagination-navigate
                            ${activePage === 0 || fetching ? 'text-muted' : ''}`}
                            onClick={() => {
                                previousPage();
                                if (activePage !== 0 && !fetching) setTableActivePage(activePage - 1);
                            }}>
                                Prev
                            </span>
                            {Array.from(Array(tablePagination), (_, i) => {
                                const dynamicPageIndex = activePage > maxPage ? activePage - 2 + i : i + 1;

                                return i <= maxPage && <span key={i}
                                    className={`cursor-pointer ${activePage + 1 === dynamicPageIndex ? 'active' : ''} ${fetching ? 'text-muted' : ''}`}
                                    onClick={() => {
                                        gotoPage(dynamicPageIndex - 1);
                                        if (!fetching) setTableActivePage(dynamicPageIndex - 1);
                                    }}>
                                    {dynamicPageIndex}
                                </span>;
                            })}
                            <span className={`cursor-pointer pagination-navigate
                            ${activePage + 1 === tablePagination || tablePagination === 0 || fetching ? 'text-muted' : ''}`}
                            onClick={() => {
                                if (activePage + 1 !== tablePagination && tablePagination > 0 && !fetching) setTableActivePage(activePage + 1);
                            }}>
                                Next
                            </span>
                            <span className={`cursor-pointer pagination-navigate
                            ${activePage + 1 === tablePagination || tablePagination === 0 || fetching ? 'text-muted' : ''}`}
                            onClick={() => {
                                gotoPage(pageCount - 1);
                                if (activePage + 1 !== tablePagination && tablePagination > 0 && !fetching) setTableActivePage(tablePagination - 1);
                            }}>
                                Last
                            </span>
                        </div>
                    </Col>
                    <Col md={12} lg={3} className='ml-auto'>
                        <div className='pagination-goto-page  d-flex align-items-center'>
                        Go to page:
                            <Input
                                type='number'
                                size='md'
                                min='0'
                                value={activePage + 1}
                                defaultValue={activePage + 1}
                                style={{ width: '80px' }}
                                disabled={fetching || (activePage + 1) === tablePagination}
                                className='ml-2'
                                onChange={e => {
                                    const page = e.target.value ? Number(e.target.value) - 1 : 0;

                                    setTableActivePage(page);
                                    gotoPage(page);
                                }} />
                        </div>
                    </Col>
                </Row>
            }
        </>
    );
}

/* Custom filter function */
function multiSelectFilter(rows, columnIds, filterValue) {
    // Filters only if filters are selected
    return filterValue.length === 0 ? rows : rows.filter((row) => filterValue.includes(String(row.original[columnIds])));
}

type Props = {
    loading?: boolean,
    children?: string | React.Node,
    className?: string,
    tableData: Array,
    tableColumns: Array,
    tablePagination: number,
    totalNoOfRecords: number,
    activePage: number,
    selectableRows: boolean,
    globalFilter: boolean,
    pagination: boolean,
    sortable: boolean,
    fetching: boolean,
    viewDetails: Function,
}

export default function ReactTable({
    loading,
    children,
    className = '',
    tableData,
    tableColumns,
    tablePagination,
    totalNoOfRecords,
    activePage,
    selectableRows = false,
    globalFilter = false,
    pagination = false,
    sortable = false,
    fetching,
    viewDetails
}: Props): React$Element<any> {
    const columns = useMemo(
        () => tableColumns.map(column => {
            const rootPath = window.location.pathname.split('/')[1];

            return {
                Header: column.header,
                accessor: column.accessor,
                disableFilters: column.disableFilters,
                Filter: SelectColumnFilter,
                filter: multiSelectFilter,
                Cell: e => column.accessor === 'alertDate'
                    ? <span>{moment(e.value).format('DD/MM/YY')}</span>
                    : <span className={`${column.clickable
                        ? 'color-link-text cursor-pointer'
                        : ''}`} onClick={() => rootPath === 'alerts' && column.accessor === 'behaviourCode'
                        ? viewDetails(e.cell.row.original)
                        : rootPath === 'behaviours' && column.accessor === 'internalCode'
                            ? viewDetails(e.cell.row)
                            : column.accessor === 'name'
                                ? viewDetails(e.cell.row.original)
                                : null}>{column.accessor === 'quantity'
                            ? kFormatter(e.cell.row.original.quantity)
                            : column.accessor === 'client'
                                ? e.cell.row.original.behaviourCode !== 'HIGH_ORDER_COUNT_MUFP' ? e.cell.row.original.client : 'MUFP Total'
                                : column.accessor === 'escalation'
                                    ? <span className='font-weight-bold'>{getTextColor(e.value)}</span>
                                    : column.accessor === 'status'
                                        ? <Badge status={e.value} />
                                        : column.accessor === 'parameterValues'
                                            ? e.value.split(',').map(val => <div>{val.replace(':', ': ')}</div>)
                                            : e.value}</span>,
                sortType: column.accessor === 'date'
                    ? (a, b, c, d) => {
                        a = new Date(a.values.date).getTime();
                        b = new Date(b.values.date).getTime();

                        return b > a ? -1 : 1;
                    }
                    : 'alphanumeric'
            };
        }),
        []
    );

    return (
        <div className={`w-100 ${className}`}>
            <Table
                loading={loading}
                columns={columns}
                data={tableData}
                tablePagination={tablePagination}
                totalNoOfRecords={totalNoOfRecords}
                activePage={activePage}
                selectableRows={selectableRows}
                globalFilter={globalFilter}
                pagination={pagination}
                sortable={sortable}
                fetching={fetching} />
        </div>
    );
}
