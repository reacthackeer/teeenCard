import { Box, Heading } from '@chakra-ui/react';
import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  } 
  render() {
    if (this.state.hasError) {
    
      return (
        <Box className='loading__container'>
          <Heading as="h1" size="lg" mb={2}>
            Something went wrong!
          </Heading>
          <p>Sorry, there was an error. Please try again later.</p>
          <Box mt='2'>
            <a href='/profile'>Go Back Profile</a>
          </Box>
        
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
