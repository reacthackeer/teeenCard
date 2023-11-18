import { Box, Button, Center, HStack, Heading, Stack, Text, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetSingleUserReferralIncomeQuery } from '../App/features/transaction/copyApi';
import LoadingComponent from '../Components/Loading/Loading';

const TransactionPage = () => {
  
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const openModal = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };


  const closeModal = () => {
    setSelectedTransaction(null);
    setIsModalOpen(false);
  };

  const filterTransactions = (type) => {
    setFilter(type);
  };
  
  const userId = useSelector((state)=> state?.auth?.auth?.userId);
  
 
  const {data, isLoading, isError, isSuccess,originalArgs} = useGetSingleUserReferralIncomeQuery({userId, page: currentPage},{refetchOnMountOrArgChange: true});

  const filteredTransactions = () => {
    let result = [];
    if(transactions.length > 0){
      if(filter === 'all'){
        result = transactions
      }else{
        result = transactions.filter(transaction => transaction.balanceType.toLowerCase() === filter);
      }
    }
    return result;
  };

  
  useEffect(()=>{
    if(isSuccess && !isError && !isLoading){
      if(data && data?.transactions?.length > 0){  
        if(transactions.length === 0 && currentPage === 1){
          setCurrentPage(()=> data?.currentPage);
          setPages(()=> data?.pages);
          setTransactions(()=> data?.transactions);
        }else{
          if(data.currentPage === currentPage){
            setCurrentPage(()=> data?.currentPage);
            setPages(()=> data?.pages);
            setTransactions(()=> data?.transactions);
          }
        }
      }
    }
  },[data, isSuccess, isError, isLoading, currentPage])
  // decide what ot render
  let content = null;
  if(!isSuccess && !isError && isLoading){
    content =  <LoadingComponent/>
  }
  if(!isSuccess && !isLoading && isError){
    content = <div className='loading__container'>
                  <h1>Internal server error!</h1>
                  <Button onClick={()=> navigate('/profile')}>Go Back Profile</Button>
              </div>
  }
  if(isSuccess && !isError && !isLoading){
    if(data && data?.transactions?.length > 0){ 
      content = (
        <Box p={2}>
          <Center>
            <Stack direction="row" spacing={4} mb={4}>
              <Button 
                onClick={() => filterTransactions('all')}
                colorScheme={filter === 'all' ? 'whatsapp' : 'gray'}
              >All</Button>
              <Button 
                onClick={() => filterTransactions('demo')}
                colorScheme={filter === 'demo' ? 'whatsapp' : 'gray'}
              >Demo</Button>
              <Button 
                onClick={() => filterTransactions('real')}
                colorScheme={filter === 'real' ? 'whatsapp' : 'gray'}
              >Real</Button>
              <Button 
                onClick={() => filterTransactions('offline')}
                colorScheme={filter === 'offline' ? 'whatsapp' : 'gray'}
              >Offline</Button>
            </Stack>
          </Center>
          <VStack align="stretch">
          {filteredTransactions().map((transaction, index) => (
            <HStack key={index} justify="space-between" className='transaction__item__hover'>
              <VStack align="stretch">
                <Text>{new Date(transaction.created_at).toLocaleString()}</Text>
                <Text>{transaction.typeName}</Text>
              </VStack>
              <VStack align="stretch">
                  <Text>{transaction.isIn} ({transaction.balanceType})</Text>
                  <Text>{transaction.amount}</Text> 
              </VStack>
              </HStack>
          ))}
        </VStack>  
        {
          pages && pages > 1 && 
          <HStack 
            mt='2'
            justifyContent={'center'}
          >
              <Button
                isDisabled={currentPage === 1}
                onClick={()=> setCurrentPage((prevPage)=> prevPage-1)}
              >Prev</Button>
              <Button>{pages} of {currentPage}</Button> 
              <Button
                isDisabled={currentPage === pages}
                onClick={()=> setCurrentPage((prevPage)=> prevPage+1)}
              >Next</Button>
          </HStack>
        }
      </Box>
      )
    }else{
      content = <div className='loading__container'>
                    <Heading fontSize={'large'}>No transaction found!</Heading>
                    
                    <Button size={'sm'} mt='3' onClick={()=> navigate('/profile')}>Go Back Profile</Button>
                </div>
    }
  }
  
  return content;
};

export default TransactionPage;
