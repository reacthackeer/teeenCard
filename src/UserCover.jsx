import LoadingComponent from './Components/Loading/Loading';
import useUserAuth from './hooks/useUserAuth';

const UserCover = ({children}) => { 
    let userAuth = useUserAuth();   
    let content = null;
    if(!userAuth){
        content = <LoadingComponent/>
    }
    if(userAuth){
        content = children
    }
    return content;
};

export default UserCover;