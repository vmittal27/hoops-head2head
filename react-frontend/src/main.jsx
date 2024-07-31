import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Homepage from './pages/Homepage.jsx'
import './index.css'
import theme from './Theme.jsx'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Homepage />
    },
    {
        path:'/singleplayer',
        element: <App />
    }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>

)
