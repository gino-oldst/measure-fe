import React from 'react';

const Login = React.lazy(() => import('../containers/Login/LoginContainer'));
const NotFound = React.lazy(() => import('../containers/NotFound/NotFoundContainer'));
const Dashboard = React.lazy(() => import('../containers/Dashboard/DashboardContainer'));
const Alerts = React.lazy(() => import('../containers/Alerts/AlertsContainer'));
const Behaviours = React.lazy(() => import('../containers/Behaviours/BehavioursContainer'));
const AlertDetail = React.lazy(() => import('../containers/AlertDetail/AlertDetailContainer'));
const BehaviourDetail = React.lazy(() => import('../containers/BehaviourDetail/BehaviourDetailContainer'));
const RestrictedList = React.lazy(() => import('../containers/RestrictedList/RestrictedListContainer'));
// ROUTE IMPORT CODE GENERATOR INDICATOR DO NOT DELETE

const routes = [{
    // mostly this will be the landing page
    path: '/',
    exact: true,
    name: 'Login',
    component: Login
}, {
    path: '/login',
    name: 'Login',
    component: Login
}, {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    authedRoute: true
}, {
    path: '/alerts',
    name: 'Alerts',
    component: Alerts,
    authedRoute: true
}, {
    path: '/behaviours',
    name: 'Behaviours',
    component: Behaviours,
    authedRoute: true
}, {
    path: '/alert/:id',
    name: 'AlertDetail',
    component: AlertDetail,
    authedRoute: true
}, {
    path: '/behaviour/:id',
    name: 'BehaviourDetail',
    component: BehaviourDetail,
    authedRoute: true
}, {
    path: '/restricted_list',
    name: 'RestrictedList',
    component: RestrictedList,
    authedRoute: true
}, // ROUTE ENTRY CODE GENERATOR INDICATOR DO NOT DELETE
{
    path: '*',
    name: NotFound,
    component: NotFound
}];

export default routes;
