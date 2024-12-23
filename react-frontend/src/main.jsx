import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import SinglePlayer from './pages/SinglePlayer.jsx'
import Homepage from './pages/Homepage.jsx'
import MultiPlayer from './pages/Multiplayer.jsx'
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import './css/index.css'
import { extendTheme } from '@chakra-ui/react'
import '@fontsource/calistoga/400.css'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Homepage />
    },
    {
        path:'/singleplayer',
        element: <SinglePlayer />
    },
    {
        path:'/multiplayer',
        element: <MultiPlayer />
    },
    {
        path: '/multiplayer/:roomIdUrl',
        element: <MultiPlayer />
    }
])


const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const theme = extendTheme({ 
    config,
    fonts: {
      heading: `'Caslistoga', sans-serif`,
    },
    styles: {
      global: (props) => ({
        body: {
          bg: props.colorMode === 'light' ? "#ebe9e4" : "#1A202B"
        },
      }),
    },
 });

ReactDOM.createRoot(document.getElementById('root')).render(
  <ChakraProvider theme={theme}>
    <RouterProvider router={router} />
  </ChakraProvider>

)
