import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const UserPrivate = ({children}) => {
    const authState = useSelector((state)=> state.auth);
    let content = null;
    if(!authState?.isLoggedIn || !authState?.isFilled){
        content = <Navigate to='/login' replace/>
    }
    if(authState && authState?.isLoggedIn && authState?.isFilled && authState?.token && Number(authState?.auth?.role) <= 6){
        content = children;
    }

    return content;
};

export default UserPrivate;