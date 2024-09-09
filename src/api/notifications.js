import makeApiCall from '../api/makeApiCall';

const GET_NOTIFICATIONS = '/measure/notifications/list?page=0&pageSize=10';
const UPDATE_NOTIFICATION = '/measure/notifications';

export async function getNotifications(userId) {
    return await makeApiCall(GET_NOTIFICATIONS, 'POST', { userId: userId });
}

export async function updateNotification(data: Object) {
    return await makeApiCall(UPDATE_NOTIFICATION, 'PUT', data);
}
