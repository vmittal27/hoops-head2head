import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import SinglePlayer from './pages/SinglePlayer.jsx'
import Homepage from './pages/Homepage.jsx'
import Lobby from './pages/Lobby.jsx'
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import './css/index.css'
import { extendTheme } from '@chakra-ui/react'

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
        path: '/lobby',
        element: <Lobby />
    }
])


const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

const theme = extendTheme({ config })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>

)
