
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import ReactDOM from 'react-dom/client'
import ReactPWAInstallProvider from 'react-pwa-install'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import router from './App'
import { store } from './App/store'
import Cover from './Cover'
import './index.scss'
import theme from './theme'
ReactDOM.createRoot(document.getElementById('root')).render( 
    <ReactPWAInstallProvider>
        <Provider store={store}> 
                <ChakraProvider>
                <ColorModeScript initialColorMode={theme.config.initialColorMode}/>
                    <Cover>
                    <RouterProvider router={router}>
                    </RouterProvider>
                    </Cover>
                </ChakraProvider>   
        </Provider>
    </ReactPWAInstallProvider>
)
