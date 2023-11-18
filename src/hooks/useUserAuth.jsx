import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useReEnterUserMutation } from '../App/features/auth/api';
import { userLoggedIn, userLoggedOut } from '../App/features/auth/authSlice';

const useUserAuth = () => {
    const [authCheck, setAuthCheck] = useState(false);
    const dispatch = useDispatch(); 
    const [provideToken,{data, isLoading, isError, isSuccess, error}] = useReEnterUserMutation();
    useEffect(()=>{
        let authInfo = localStorage.getItem('token') || '';
        if(authInfo){
            provideToken({token: authInfo.replace(/"/g,'')}); 
        }else{
            dispatch(userLoggedOut({
                isLoggedIn: false, 
                isFilled: false,
                auth: {},
                token: ''
            })) 
                setAuthCheck(()=> true);
        }
    },[dispatch,setAuthCheck])
    
    useEffect(()=>{  
        if(!isLoading && isError && !isSuccess){ 
            localStorage.removeItem('token'); 
            setAuthCheck(()=> true); 
        }
        if(!isLoading && !isError && isSuccess){
            if(data && data?.id){
                let token = localStorage.getItem('token').replace(/"/g,'')
                dispatch(
                    userLoggedIn({
                        auth: data,
                        isFilled: true,
                        isLoggedIn: true,
                        token: token
                    })
                )
                setTimeout(() => {
                    setAuthCheck(()=> true);
                }, 500);
            }else{ 
                setAuthCheck(()=> true); 
            }
        }
    },[data, isLoading, isError, isSuccess, error])
    return authCheck;
};

export default useUserAuth;