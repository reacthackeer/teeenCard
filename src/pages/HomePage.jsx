import { Box, Button, Input, Text, useColorMode } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { nihonUtils } from './NihonUtils';
const HomePage = () => {
    const { colorMode, toggleColorMode } = useColorMode()
    const [viewProperty, setViewProperty] = useState('');
    const [lessonType, setLessonType] = useState('');
    const [lesson, setLesson] = useState('');
    const [startLesson, setStartLesson] = useState('');
    const [apply, setApply] = useState(false);
    const [endLesson, setEndLesson] = useState('');
    const [viewData, setViewData] = useState([]);
    const [showLesson, setShowLesson] = useState(false);
    const [showSerial, setShowSerial] = useState(false);
    const [singleDetails, setSingleDetails] = useState();
    const [openDetails, setOpenDetails] = useState(false);
    const handleResetFunction = () => {
        setViewProperty('');
        setLessonType('');
        setStartLesson('');
        setEndLesson('');
        setLesson('');
        setViewData([]);
        setApply(false);
    };

    const handleApply = () => {
        if(viewProperty && lessonType){
            if(lessonType === 'all'){
                setViewData(nihonUtils.getAllSerialData())
            }else if(lessonType === 'allRandom'){
                setViewData(nihonUtils.getAllRandomDatabase())
            }else if(lessonType === 'single'){
                setViewData(nihonUtils.getSingleLessonData(lesson))
            }else if(lessonType === 'singleRandom'){
                setViewData(nihonUtils.getSingleLessonRandomData(lesson))
            }else if(lessonType === 'range'){
                setViewData(nihonUtils.getRangeLessonData(startLesson, endLesson))
            }else if(lessonType === 'rangeRandom'){
                setViewData(nihonUtils.getRangeLessonRandomData(startLesson, endLesson))
            }
            setApply(true);
        }else{
            alert('Please select view property and lesson type')
        }
    } 

    const handleOpenDetails = (info) => {
        setSingleDetails(info);
        setOpenDetails(true);
    }

    const handleClosePopup = () => {
        setSingleDetails('');
        setOpenDetails(false);
    }
    return (
        <React.Fragment>
        <div>
            {
                !apply &&             <Box>
                <Box  padding={'4'} display={'flex'} justifyContent={'center'} alignItems={'center'} flexWrap={'wrap'} gap={'3'}>
                <Button variant={'solid'} size={'xs'} colorScheme={viewProperty === 'Kanji' ? "teal" : 'facebook' } onClick={()=> setViewProperty('Kanji')} ml='1'>Kanji</Button> 
                <Button variant={'solid'} size={'xs'} colorScheme={viewProperty === 'Vocabulary' ? "teal" : 'facebook' } onClick={()=> setViewProperty('Vocabulary')} ml='1'>Vocabulary</Button> 
                <Button variant={'solid'} size={'xs'} colorScheme={viewProperty === 'Meaning' ? "teal" : 'facebook' } onClick={()=> setViewProperty('Meaning')} ml='1'>Meaning</Button>
                <Button variant={'solid'} size={'xs'} colorScheme={viewProperty === 'bengaliMeaning' ? "teal" : 'facebook' } onClick={()=> setViewProperty('bengaliMeaning')} ml='1'>Bengali Meaning</Button>
                </Box>
                <Box  padding={'4'} gap={'3'} display={'flex'} justifyContent={'center'} alignItems={'center'} flexWrap={'wrap'}>
                <Button variant={'solid'} size={'xs'} colorScheme={showLesson  ? "teal" : 'facebook' } onClick={()=> setShowLesson(!showLesson)} ml='1'>Show Lesson</Button> 
                <Button variant={'solid'} size={'xs'} colorScheme={showSerial  ? "teal" : 'facebook' } onClick={()=> setShowSerial(!showSerial)} ml='1'>Show Serial</Button>  
                </Box>
            <Box  padding={'4'}   display={'flex'} justifyContent={'center'} alignItems={'center'} flexWrap={'wrap'} gap={'3'}>
                <Button variant={'solid'} size={'xs'} colorScheme={lessonType === 'all' ? "teal" : 'facebook' } onClick={()=> setLessonType('all')} ml='1'>All Lesson</Button> 
                <Button variant={'solid'} size={'xs'} colorScheme={lessonType === 'allRandom' ? "teal" : 'facebook' } onClick={()=> setLessonType('allRandom')} ml='1'>All Random Lesson</Button> 
                <Button variant={'solid'} size={'xs'} colorScheme={lessonType === 'single' ? "teal" : 'facebook' } onClick={()=> setLessonType('single')} ml='1'>Single Lesson</Button> 
                <Button variant={'solid'} size={'xs'} colorScheme={lessonType === 'singleRandom' ? "teal" : 'facebook' } onClick={()=> setLessonType('singleRandom')} ml='1'>Single Random Lesson</Button>  
                <Button variant={'solid'} size={'xs'} colorScheme={lessonType === 'range' ? "teal" : 'facebook' } onClick={()=> setLessonType('range')} ml='1'>Range Lesson</Button> 
                <Button variant={'solid'} size={'xs'} colorScheme={lessonType === 'rangeRandom' ? "teal" : 'facebook' } onClick={()=> setLessonType('rangeRandom')} ml='1'>Range Random Lesson</Button> 
            </Box>
            {
                lessonType === 'single' || lessonType === 'singleRandom' ?             <Box>
                <Text>Lesson Number</Text>
                <Input placeholder='Enter Lesson Number' onChange={({target:{value}})=> setLesson(()=> Number(value))} type='number'></Input>
            </Box> : ''
            }            {
                lessonType === 'range' || lessonType === 'rangeRandom' ?             <Box>
                <Text>Start Lesson Number</Text>
                <Input placeholder='Enter Start Lesson Number' onChange={({target:{value}})=> setStartLesson(()=> Number(value))} type='number'></Input>
                <Text>End Lesson Number</Text>
                <Input placeholder='Enter End Lesson Number' onChange={({target:{value}})=> setEndLesson(()=> Number(value))} type='number'></Input>
            </Box> : ''
            }
            <Box padding={'4'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <Button onClick={toggleColorMode}>{colorMode === 'light' ? 'Dark' : 'Light'}</Button>
                <Button mx='3' colorScheme='orange' onClick={handleResetFunction}>Reset</Button>
                <Button colorScheme='teal' onClick={handleApply}>Apply {viewData.length}</Button>
            </Box>
            <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}
             textAlign={'center'} gap={'2'} mt='3'>
                <Text>Develop by</Text>
                <Link target='_blank' to='https://facebook.com/dearvayu'>Md Sohidul Islam</Link>
            </Box>
        </Box>
            }
            {
                apply && <Box className='view__area__main__container'>
                    <Box className='RESET__AREA'>
                        <Button onClick={handleResetFunction}>Reset</Button>
                    </Box>
                    <Box className='data__view__main__container'>
                        {
                            viewData.map((info, index)=> <Box className='single__vocabulary__box' key={index}>
                                {showLesson && <Text>Lesson: {info.lesson} </Text>}
                                {showSerial && <Text>Serial: {info.No} </Text>}
                                <Text>{info[viewProperty]} </Text>
                                <Button size={'xs'}  onClick={()=> handleOpenDetails(index)} my='2'>Details</Button>
                                {
                                    singleDetails === index && openDetails ?                              <Box className='single__details__view__container'>
                                    <Box className='view__box__single__item'>
                                        <Text>Vocabulary: {info.Vocabulary}</Text>
                                        <Text>Meaning: {info.Meaning}</Text>
                                        <Text>Kanji: {info.Kanji}</Text>
                                        <Text>Bangla Meaning: {info.bengaliMeaning}</Text>
                                        <Text>Lesson: {info.lesson}</Text>
                                        <Text>Serial: {info.No}</Text>
                                        <Button mt='5' onClick={handleClosePopup}>Close</Button>
                                    </Box>
                                </Box> : ''
                                }
                            </Box>)
                        }
                    </Box>

                </Box>
            }
        </div> 
        
    </React.Fragment>
    );
};

export default HomePage;
