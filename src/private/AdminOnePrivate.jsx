import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminOnePrivate = ({children}) => {
    const authState = useSelector((state)=> state.auth);
    let content = null;

    if(authState && authState?.isLoggedIn && authState?.isFilled && authState?.token && Number(authState?.auth?.role) <= 1){
        content = children;
    }else{
        content = <Navigate to='/profile' replace/>
    }
    if(!authState?.isLoggedIn || !authState?.isFilled){
        content = <Navigate to='/login' replace/>
    }
    return content;
};

export default AdminOnePrivate;