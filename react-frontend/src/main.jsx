import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Homepage from './pages/Homepage.jsx'
import './index.css'
import { ChakraProvider } from '@chakra-ui/react'

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
    <ChakraProvider>
        <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>,
)
