import { Box, Button, Heading } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { uid } from 'uid';
import { useGetAllBoardQuery } from '../App/features/board/api';
import { newBoardUpdate, updateBoardInitiated } from '../App/features/board/boardSlice';
import SingleBoard from '../Components/Board/SingleBoard';
import LoadingComponent from '../Components/Loading/Loading';

const Boards = () => { 
    const dispatch = useDispatch();
    const navigate = useNavigate(); 
    const {boards, initiated, pages} = useSelector((state)=> state.board);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewBoard, setViewBoard] = useState('all');
    let pagesArray = uid(pages).split('');  

    const handleNextButton = () => {
        setCurrentPage((prevState)=> prevState+1)
    }
    const {data, isLoading, isError, isSuccess, error} = useGetAllBoardQuery(currentPage);
    useEffect(()=>{  
        if(!isLoading && !isError && isSuccess && data && data?.boards?.length > 0 && !initiated){
            dispatch(newBoardUpdate(data));
        }
        if(!isLoading && !isError && isSuccess && data && data?.boards?.length === 0){
            dispatch(updateBoardInitiated())
        }
    },[data, isLoading, isError, isSuccess, error])
    
    const handleClickAllButton = () => {
        if(viewBoard === 'all'){
            navigate('/profile')
        }else{
            setViewBoard(()=> 'all');
        }
    }
    // decide what to  render
    let content = null;
    
    
    if(boards && !initiated && boards.length ===0 ){
        content = <LoadingComponent/>
    }

    if(boards && initiated && boards.length ===0 ){
        content = <div className='loading__container'>
                        <Heading fontSize={'large'}>No Board Founded!</Heading>
                        <Heading mt='1' fontSize={'medium'}>But you can create your board</Heading> 
                        <Button size={'sm'} mt='3' onClick={()=> navigate('/create-board')}>Create Board</Button>
                    </div>
    }

    const handleFilterMyViewBoard = () => {
        if(viewBoard === 'all'){
            return boards;
        }else{
            return boards.filter((info)=> info.balanceType.toLowerCase() === viewBoard);
        }
    }
    
    if(boards && initiated && boards?.length > 0){
        content =(
        <Box> 
            <Box display={'grid'} gridTemplateColumns={'auto auto auto auto'} gridGap={'2'}>
                <Button 
                    colorScheme={`${viewBoard === 'all' ? 'whatsapp' : 'gray'}`}
                    onClick={handleClickAllButton}
                >All</Button>
                <Button 
                    colorScheme={`${viewBoard === 'real' ? 'whatsapp' : 'gray'}`}
                    onClick={()=> setViewBoard(()=> 'real')}
                >Real</Button>
                <Button 
                    colorScheme={`${viewBoard === 'demo' ? 'whatsapp' : 'gray'}`}
                    onClick={()=> setViewBoard(()=> 'demo')}
                >Demo</Button>
                <Button 
                    colorScheme={`${viewBoard === 'offline' ? 'whatsapp' : 'gray'}`}
                    onClick={()=> setViewBoard(()=> 'offline')}
                >Offline</Button>
            
            </Box> 
            <Box py='3'>
                {
                    handleFilterMyViewBoard().map((info, index)=> <SingleBoard key={index} info={info}/>)
                }
            </Box>
            {
                pages > 1 && <Box display={'flex'} gap={'2'} justifyContent={'center'} alignItems={'center'} py='3'>
                <Button
                    colorScheme={`${viewBoard === 'all' ? 'whatsapp' : 'gray'}`} 
                    size={'sm'}
                    onClick={()=> setCurrentPage((prevState)=> prevState-1)}
                    isDisabled={currentPage === 1}
                    isLoading={isLoading}
                >Prev</Button> 
                {
                    pagesArray.map((info, index)=> {
                        return(
                            <Button 
                                key={index}
                                colorScheme={`${viewBoard === 'offline' ? 'messenger' : 'gray'}`}
                                onClick={()=> setCurrentPage(()=> index+1)}
                                size={'sm'}
                                isLoading={isLoading} 
                                isDisabled={index+1 === currentPage}
                            >{index+1}</Button> 
                        )
                    })
                }
                <Button 
                    colorScheme={`${viewBoard === 'offline' ? 'messenger' : 'whatsapp'}`}
                    onClick={handleNextButton}
                    size={'sm'}
                    isLoading={isLoading}
                    isDisabled={pages === currentPage}
                >Next</Button> 
            </Box>
            }
            <Box textAlign={'center'}>
                <Link to='/create-board'>Create Your Board</Link>
            </Box> 
        </Box>
        )
    }
    return content;
};

export default Boards;