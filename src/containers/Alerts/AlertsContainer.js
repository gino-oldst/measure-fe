// @flow
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import AlertsScreen from './AlertsScreen';
import type { Menu } from '../../types';
import { getBehaviours } from '../../api/behaviours';
import { getAlerts, downloadAlertsList, getColumnFilterValues } from '../../api/alerts';
import { getUsers } from '../../api/users';
import {
    DATE_TO_UTC
} from '../../utils/helpers';
import { setBehavioursData } from '../../redux/modules/behaviours';
import { setAlertsData, setAssignees, setColumnFilterValues } from '../../redux/modules/alerts';

type Props = {
    sidebarMenu: Array<Menu>,
    handleCloseModal: Function
}

export default function AlertsContainer({
    userId,
    sidebarMenu,
    handleCloseModal
}: Props): React$Element<any> {
    const history = useHistory();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const { isRowsSelected, selectedRows, appliedFilters } = useSelector(({ table }) => table);
    const { table, selected, dateRange } = useSelector(({ alerts }) => alerts);
    const behaviours = useSelector(({ behaviours }) => behaviours);
    const columnFilterValues = useSelector(({ alerts }) => alerts.columnFilterValues);
    const breadcrumb = [
        {
            label: 'Home',
            path: '/dashboard'
        },
        {
            label: 'Alerts',
            path: '/alerts'
        }
    ];

    useEffect(() => {
        loadAlertsData();
    }, []);

    const viewAlertDetails = async (row) => {
        history.push(`/alert/${row.id}`);
    };

    const loadAlertsData = async () => {
        try {
            await loadBehavioursData();
            await loadUsers();
        } catch (e) {
            console.error(e);
        }

        setLoading(false);
    };

    const loadAlerts = async (page, size, fromDate, toDate, appliedFilters, sort) => {
        setLoading(true);

        await loadBehavioursData();
        await loadUsers();
        await loadColumnFilterValues();
        const alerts = await getAlerts(page, size, fromDate, toDate, appliedFilters, sort);
        const { data, alertIds, totalNoOfRecords, totalPages } = alerts.data;

        dispatch(setAlertsData(data, alertIds, totalNoOfRecords, totalPages));

        setLoading(false);
    };

    const loadColumnFilterValues = async () => {
        if (columnFilterValues) {
            return;
        }

        const { data } = await getColumnFilterValues();
        let dataCopy = data;

        const keys = Object.keys(data);

        keys.forEach(key => {
            dataCopy = {
                ...data,
                [key]: data[key].sort()
            };
        });

        dispatch(setColumnFilterValues(dataCopy));
    };

    const loadUsers = async () => {
        const users = await getUsers();

        const filteredUsers = users.data.data.filter(user => user.userRegistrationType === 'EMAIL');

        dispatch(setAssignees([
            {
                id: 999999,
                fullName: 'Unassigned'
            },
            ...filteredUsers
        ]));
    };

    const loadBehavioursData = async (activePage, pageSize) => {
        const behaviours = await getBehaviours();

        dispatch(setBehavioursData(behaviours.data.data, null, null));
    };

    const handleDownloadAlertsList = async (date) => {
        const payload = {
            alertIds: selectedRows.length > 0 ? selectedRows : table.alertIds,
            dateFrom: `${DATE_TO_UTC(date.start).split('T')[0]}T00:00:00Z`,
            dateTo: `${DATE_TO_UTC(date.end).split('T')[0]}T23:59:59Z`,
            dateRange: `${moment(dateRange.start).format('L')} to ${moment(dateRange.end).format('L')}`,
            filteredApplied: appliedFilters.filter(filter =>
                (filter.id !== 'quantity' && filter.value.length > 0) ||
                (filter.id === 'quantity' && filter.value > 0)
            ).map(filter => `${filter.id}: [${filter.id.toLowerCase() === 'behaviourcode'
                    ? filter.value.map(val => {
                        const match = behaviours.table.data.filter(code => code.id === val)[0];

                        return match ? match.code : val;
                    })
                    : filter.id.toLowerCase() === 'assigneduser'
                        ? filter.value.map(val => selected.assignees.filter(user => (user.id !== 999999 ? user.id : null) === val)[0].fullName)
                        : typeof filter.value === 'object'
                            ? filter.value.map(fil => fil.value)
                            : filter.value}]`).join(',')
        };

        await downloadAlertsList(payload);
    };

    const tableIsFiltered = () => {
        return !!appliedFilters.filter(filter => filter.value.length > 0).length;
    };

    return <AlertsScreen
        loading={loading}
        userId={userId}
        breadcrumb={breadcrumb}
        loadAlerts={loadAlerts}
        tableColumns={table.columns}
        tableData={!table.isFiltered ? table.data : table.filtered}
        tableTotalPages={table.data.totalPages !== null}
        isRowsSelected={isRowsSelected}
        selectedRows={selectedRows}
        assignees={selected.assignees}
        viewAlertDetails={viewAlertDetails}
        handleCloseModal={handleCloseModal}
        sidebarMenu={sidebarMenu}
        tableIsFiltered={tableIsFiltered}
        handleDownloadAlertsList={handleDownloadAlertsList} />;
}
