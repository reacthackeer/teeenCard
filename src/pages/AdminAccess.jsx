import { Box, Button, FormControl, FormLabel, HStack, Heading, Input, useToast } from '@chakra-ui/react';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useActiveSingleAccountMutation, useDeleteSingleUserMutation, useDisabledSingleAccountMutation, useGetAllAdminQuery, useUpdateDesignationMutation } from '../App/features/auth/api';
import { updateUserAuthInfo } from '../App/features/auth/authSlice';
const AdminAccess = () => {
  const [role, setRole] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState(''); 
  const adminId = useSelector((state)=> state.auth.auth.userId);
  const [debounceLoading, setDebounceLoading] = useState(false);
  const dispatch = useDispatch();
  const toast = useToast();
  const [provideCouponInfo, {data, isLoading, isError, isSuccess, error}] = useUpdateDesignationMutation();
  const handleSubmit = (event) => {
    event.preventDefault();
    setDebounceLoading(()=> false);
    if(email && role  && designation && adminId){
        let postData = {
            adminId,
            email,
            role,
            designation
        }  
        provideCouponInfo(postData);
    }else{
      toast({
        title: 'Invalid Request',
        duration: 4000,
        isClosable: true,
        status: 'warning'
      })
    }
  }; 
  useEffect(()=>{  
    // console.log({data, isError, isSuccess});
    if(!isLoading && isSuccess && !isError){
      if(data && data?.id > 0){ 
        if(adminId === data?.userId){
            dispatch(
                updateUserAuthInfo({auth: data})
            )
        }
        setDesignation('');
        setEmail('');
        setRole('');  
        toast({
          title: "Successfully coupon added!",
          duration: 4000,
          isClosable: true,
          status: 'success'
        })
      }else{
        toast({
          title: error?.data?.error?.message || "Internal server error!",
          duration: 4000,
          isClosable: true,
          status: 'error'
        })
      }
    }
    if(!isLoading && isError && !isSuccess){
      toast({
        title: error?.data?.error?.message || "Internal server error!",
        duration: 4000,
        isClosable: true,
        status: 'error'
      })
    }
  },[data, isLoading, isSuccess, isError, error])
  
  const {data: adminData, isSuccess: adminIsSuccess} = useGetAllAdminQuery();
  const [provideUserId,{isLoading: deleteIsLoading}] = useDeleteSingleUserMutation();
  const [provideDisabledId, {isLoading: disableIsLoading}] = useDisabledSingleAccountMutation();
  const [provideActiveId, {isLoading: activeIsLoading}] = useActiveSingleAccountMutation();
  const [activeDebounceLoading, setActiveDebounceLoading] = useState(false);
  const [disabledDebounceLoading, setDisabledDebounceLoading] = useState(false);
  const [deleteDebounceLoading, setDeleteDebounceLoading] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [disableId, setDisableId] = useState('');

  
  const adminDebounceAccess = _.debounce(handleSubmit,1000);
  const handleSubmitFirst = (e) => {
    e.preventDefault();
    setDebounceLoading(()=> true);
    adminDebounceAccess(e);
  }

  const handleDisabledSingleAccountSecond = (id) => {
      setDisabledDebounceLoading(()=> false);
      provideDisabledId({id});
  }

  const handleActiveSingleAccountSecond = (id) => {
      setActiveDebounceLoading(()=> false);
      provideActiveId({id});
  }

  const handleDeleteSingleUserSecond = (id) => {
      setDeleteDebounceLoading(()=> false);
      provideUserId({id});
  }

  const blockUserDebounce = _.debounce(handleDisabledSingleAccountSecond,1000);
  const activeUserDebounce = _.debounce(handleActiveSingleAccountSecond,1000);
  const deleteUserDebounce = _.debounce(handleDeleteSingleUserSecond,1000);

  const handleDisabledSingleAccount = (id) => {
    let result = window.confirm('Are you sure to disabled this admin?');
    if(result && id){ 
      setDisableId(()=> id);
      setDisabledDebounceLoading(()=> true);
      blockUserDebounce(id);
    }
  }

  const handleActiveSingleAccount = (id) => {
    let result = window.confirm('Are you sure to active this admin?');
    if(result && id){
      setActiveId(()=>id);
      setActiveDebounceLoading(()=> true);
      activeUserDebounce(id);
    }
  }

  const handleDeleteSingleUser = (id) => {
    let result = window.confirm('Are you sure to delete this admin?');
    if(result && id){ 
      setDeleteId(()=>id);
      setDeleteDebounceLoading(()=> true);
      deleteUserDebounce(id);
    }
  }

  return (
    <React.Fragment>
      <Box p={2} bg="white">
        <Heading size={'lg'} textAlign={'center'} mt='4' mb='6'>
            Admin control panel
        </Heading>
        <form onSubmit={handleSubmitFirst}> 
          <FormControl mb={3}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Enter user email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Role</FormLabel>
            <Input
              type="number"
              placeholder="Enter role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Designation</FormLabel>
            <Input
              type="text"
              placeholder="Enter designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              required
            />
          </FormControl> 
          <Button 
            type="submit" 
            colorScheme="blue"
            isLoading={isLoading || debounceLoading}
          >
            Update
          </Button>
        </form>
      </Box>
    {
      adminIsSuccess && adminData && adminData?.length > 0 &&
      <Box p={4} bg="white">
        <Heading size={'lg'} textAlign={'center'} mt='4' mb='6'>
            Previous Admin
        </Heading>
        <Box>
          {
            adminData.map((info, index)=> {
              return(
                <Box key={index}>
                    <HStack mb='1'>
                        <Button>{info.role}</Button>
                        <Button>{info.designation}</Button>
                        <Button>{info.email}</Button>
                    </HStack>
                    <HStack mb='3'>
                        <Button>{info.userId}</Button>
                        <Button
                          onClick={()=> handleDeleteSingleUser(info.id)}
                          isLoading={deleteId === info.id && deleteIsLoading || deleteId === info.id && deleteDebounceLoading}
                        >DELETE</Button>
                        {info.isJail==='false' ? 
                          <Button 
                            onClick={()=> handleDisabledSingleAccount(info.id)}
                            isLoading={disableIsLoading && disableId === info.id || disabledDebounceLoading && disableId === info.id}
                          >BLOCK</Button> 
                            : 
                          <Button 
                            onClick={()=> handleActiveSingleAccount(info.id)}
                            isLoading={activeId === info.id && activeIsLoading || activeId === info.id && activeDebounceLoading}
                          >FREE</Button>
                        }
                        
                    </HStack>
                </Box>
              )
            })
          }
        </Box>
      </Box>
    }
    </React.Fragment>
  );
};

export default AdminAccess;
