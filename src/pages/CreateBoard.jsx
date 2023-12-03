// src/components/CreateBoardForm.js
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  useToast
} from '@chakra-ui/react';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uid } from 'uid';
import { useAddSingleBoardMutation } from '../App/features/board/api';
const CreateBoardForm = () => {
  const [provideBoardInfo, {data, isLoading, isSuccess, isError, error}] = useAddSingleBoardMutation();
  const userId = useSelector((state)=> state?.auth?.auth?.userId);
  const [debounceLoading, setDebounceLoading] = useState(false);
  const currency = useSelector((state)=> state.home.currency);
  
  const [formData, setFormData] = useState({
    name: '',
    join: '',
    board: '',
    chaal:  '',
    blind: '',
    increase: false,
    compare: true,
    type: 'public',
    isSchedule: false,
    startTime: '',
    balanceType: 'demo',
    maxBlindHit: '',
    maxChaalHit: '',
    minBlindHit: '',
    minChaalHit: '',
    maxPlayer: '',
    currency: currency.name
  });

  
  const toast = useToast();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDebounceLoading(()=> false);
    formData.adminId = userId;
    formData.roomId = uid(11);
    let { name,  join,  board,  chaal, maxBlindHit, minBlindHit, maxChaalHit, minChaalHit,  blind,  increase,  compare,  type,  isSchedule,  startTime, balanceType, adminId, roomId, maxPlayer} = formData;
    
    if(name && join && board && chaal && blind  && type && balanceType && adminId && roomId && maxPlayer && maxBlindHit && maxChaalHit && minBlindHit && minChaalHit){
        if((increase === true || increase === false) && (compare === true || compare === false) && (isSchedule === true || isSchedule === false)){
            if(Number(maxPlayer) > 17 || Number(maxPlayer) < 2){
              toast({
                title: 'Min 2 player and maximum 17 player allowed!',
                duration: 4000,
                status: 'warning',
                isClosable: true
              })
            }else{
              if(Number(maxBlindHit) > Number(minBlindHit)){
                if(Number(maxChaalHit) > Number(minChaalHit)){
                  formData.maxPlayer = Number(maxPlayer);
                  formData.maxBlindHit = Number(maxBlindHit);
                  formData.minBlindHit = Number(minBlindHit);
                  formData.maxChaalHit = Number(maxChaalHit);
                  formData.minChaalHit = Number(minChaalHit);
                  if(isSchedule && startTime){
                    provideBoardInfo(formData)
                  }else{
                    formData.isSchedule = false;
                    formData.startTime = 'empty'
                    provideBoardInfo(formData)
                  }
                }else{
                  toast({
                    title: 'MAX CHAAL HIT must be grater than MIN CHAAL HIT',
                    duration: 4000,
                    status: 'warning',
                    isClosable: true
                  })
                }
              }else{
                toast({
                  title: 'MAX BLIND HIT must be grater than MIN BLIND HIT',
                  duration: 4000,
                  status: 'warning',
                  isClosable: true
                })
              }
            }
        }else{
          toast({
            title: 'Invalid request!',
            duration: 4000,
            status: 'warning',
            isClosable: true
          })
        }
    }else{
      toast({
        title: 'Invalid request!',
        duration: 4000,
        status: 'warning',
        isClosable: true
      })
    }
  };

  const handleDebounceFunc = _.debounce(handleSubmit, 1000);
  const handleDebounceSubmit = (e) => {
    e.preventDefault();
    setDebounceLoading(()=> true);
    handleDebounceFunc(e);
  }
  const navigate = useNavigate();
  useEffect(()=>{  
    if(!isLoading && isSuccess && !isError){
      if(data && data?.id > 0){ 
        
        setFormData({
          name: '',
          join: '',
          board: '',
          chaal:  '',
          blind: '',
          increase: false,
          compare: true,
          type: 'public',
          isSchedule: false,
          startTime: '',
          balanceType: 'demo',
          maxBlindHit: '',
          maxChaalHit: '',
          minBlindHit: '',
          minChaalHit: '',
          maxPlayer: '',
        })
        localStorage.setItem('room__id', data.roomId);
        navigate('/boards');
        toast({
          title: "Successfully board created",
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
  return (
    
      <Box p={4}>
        <form onSubmit={handleDebounceSubmit}>
          <FormControl>
            <FormLabel>Board Name</FormLabel>
            <Input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder='Enter your board name'
              required
            />
          </FormControl>

          <FormControl mt='2'>
            <FormLabel>Required to join ({currency.name.toUpperCase()})</FormLabel>
            <Input
              type="number"
              name="join"
              value={formData.join}
              onChange={handleChange}
              placeholder='Enter required to join'
              required
            />
          </FormControl>

          <FormControl mt='2'>
            <FormLabel>How much ({currency.name.toUpperCase()}) will be board</FormLabel>
            <Input
              type="number"
              name="board"
              value={formData.board}
              onChange={handleChange}
              placeholder='Enter board charge'
              required
            />
          </FormControl>

          <FormControl mt='2'>
            <FormLabel>How much ({currency.name.toUpperCase()}) will be blind hit</FormLabel>
            <Input
              type="number"
              name="blind"
              value={formData.blind}
              onChange={handleChange}
              placeholder='Enter blind hit charge'
              required
            />
          </FormControl> 

          <FormControl mt='2'>
            <FormLabel>How much ({currency.name.toUpperCase()}) will be seen/chaal hit</FormLabel>
            <Input
              type="number"
              name="chaal"
              value={formData.chaal}
              onChange={handleChange}
              placeholder='Enter chaal hit charge'
              required
            />
          </FormControl>

          <FormControl mt='2'>
            <FormLabel>Max Player</FormLabel>
            <Input
              type="number"
              name="maxPlayer"
              value={formData.maxPlayer}
              onChange={handleChange}
              placeholder='Enter player limit'
              required 
            />
          </FormControl>

          <FormControl mt='2'>
            <FormLabel>Max Blind Hit</FormLabel>
            <Input
              type="number"
              name="maxBlindHit"
              value={formData.maxBlindHit}
              onChange={handleChange}
              placeholder='Enter max blind hit limit'
              required
            />
          </FormControl>

          <FormControl mt='2'>
            <FormLabel>Min Blind Hit</FormLabel>
            <Input
              type="number"
              name="minBlindHit"
              value={formData.minBlindHit}
              onChange={handleChange}
              placeholder='Enter min blind hit limit'
              required
            />
          </FormControl>

          <FormControl mt='2'>
            <FormLabel>Max Chaal Hit</FormLabel>
            <Input
              type="number"
              name="maxChaalHit"
              value={formData.maxChaalHit}
              onChange={handleChange}
              placeholder='Enter max chaal hit limit'
              required
            />
          </FormControl>
          
          <FormControl mt='2'>
            <FormLabel>Min Chaal Hit</FormLabel>
            <Input
              type="number"
              name="minChaalHit"
              value={formData.minChaalHit}
              onChange={handleChange}
              placeholder='Enter min chaal hit limit'
              required
            />
          </FormControl>
          
          <HStack mt='2'>

            <FormControl>
              <FormLabel>Hit Increasable</FormLabel>
              <Checkbox
                name="increase"
                isChecked={formData.increase}
                onChange={handleChange} 
              />
            </FormControl>

            <FormControl>
              <FormLabel>Board Comparable</FormLabel>
              <Checkbox
                name="compare"
                isChecked={formData.compare}
                onChange={handleChange}
              />
            </FormControl> 

          </HStack>
          
          <FormControl mt='2'>
            <FormLabel>Balance Type</FormLabel>
            <Select name="balanceType" value={formData.balanceType} onChange={handleChange} required>
              <option value="demo">Demo balance</option>
              <option value="real">Real balance</option>
              <option value="offline">Offline Balance</option>
            </Select>
          </FormControl>

          <FormControl mt='2'>
            <FormLabel>Board Type</FormLabel>
            <Select name="type" value={formData.type} onChange={handleChange} required>
              <option value="private">Private</option>
              <option value="public">Public</option>
            </Select>
          </FormControl>

          <FormControl mt='2'>
            <FormLabel>Is Schedule</FormLabel>
            <Checkbox
              name="isSchedule"
              isChecked={formData.isSchedule}
              onChange={handleChange} 
            />
          </FormControl>

          {formData.isSchedule && (
            <FormControl mt='2'>
              <FormLabel>Start Time</FormLabel>
              <Input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </FormControl>
          )}

          <Button 
            mt={4} 
            colorScheme="teal" 
            type="submit"
            isLoading={debounceLoading || isLoading}
          >
            Create Board
          </Button>
        </form>
      </Box> 
  );
};

export default CreateBoardForm;
