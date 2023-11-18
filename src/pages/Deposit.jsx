import { Box, Heading, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React, { useState } from 'react';

import DepositByCoupon from '../Components/Deposit/DepositByCoupon';
import DepositByWallet from '../Components/Deposit/DepositByWallet';

const DepositPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (index) => {
    setSelectedTab(index);
  };

  return (
    <Box mx="auto">
      <Heading mb={6} mt='8' textAlign="center">Deposit Funds</Heading>
      <Tabs onChange={handleTabChange} isFitted variant="enclosed-colored">
      <TabList mb="1rem">
        <Tab _selected={{ color: 'white', bg: 'blue.500' }}>WALLET</Tab>
        <Tab _selected={{ color: 'white', bg: 'blue.500' }}>COUPON</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <DepositByWallet/>
        </TabPanel>
        <TabPanel>  
          <DepositByCoupon/>
        </TabPanel>
      </TabPanels>
    </Tabs>
      
    </Box>
  );
};

export default DepositPage;
