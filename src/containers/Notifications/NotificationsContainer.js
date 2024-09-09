// @flow
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import onClickOutside from 'react-onclickoutside';
import NotificationsScreen from './NotificationsScreen';
import { getNotifications } from '../../api/notifications';
import { setNotifications } from '../../redux/modules/notifications';
import { setLoggingOut } from '../../redux/modules/authentication';

function NotificationsContainer(): React$Element<any> {
    const dispatch = useDispatch();
    const { data } = useSelector(({ notifications }) => notifications);
    const { profileData: { userId } } = useSelector(({ authentication }) => authentication);
    const [isNotifMenuOpen, setNotifMenuOpen] = useState(false);

    const toggleDropdown = (menuOpen) => setNotifMenuOpen(menuOpen);

    NotificationsContainer.handleClickOutside = () => setNotifMenuOpen(false);

    useEffect(() => {
        loadNotifications();

        const intervalId = setInterval(() => loadNotifications(), 5000);

        return () => clearInterval(intervalId);
    }, []);

    let isLoading = false;

    const loadNotifications = async () => {
        if (isLoading) return;
        isLoading = true;

        try {
            const notifications = await getNotifications(userId);

            dispatch(setNotifications(userId, notifications.data.data));
        } catch (e) {
            if (e.status === 403) {
                localStorage.clear();
                dispatch(setLoggingOut());
                window.location.href = '/login';
            }
        } finally {
            isLoading = false;
        }
    };

    return <NotificationsScreen today={data.today} yesterday={data.yesterday} toggleDropdown={toggleDropdown}
        isNotifMenuOpen={isNotifMenuOpen} loadNotifications={loadNotifications} />;
}

const clickOutsideConfig = {
    handleClickOutside: () => NotificationsContainer.handleClickOutside
};

export default onClickOutside(NotificationsContainer, clickOutsideConfig);
