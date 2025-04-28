import { ColorModeScript } from '@chakra-ui/react'
import * as React from 'react'
import { Root, createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Router } from '@remix-run/router'
import { ChakraProvider } from '@chakra-ui/react'
import theme from './theme'

import { Layout } from './Layout'
import { RouterError } from './pages/RouterError'
import { Home } from './pages/Home'
import { ZustandExample } from './pages/ZustandExample'
import { NotFound } from './pages/NotFound'
import { MapPage } from './pages/MapPage'
import { DeliveryTest } from './pages/DeliveryTest'
import { AuthProvider } from './context/AuthContext'

const router: Router = createBrowserRouter([
	{
		path: '/',
		element: <Layout />,
		errorElement: <RouterError />,
		children: [
			{
				index: true,
				element: <Home />,
			},
			{
				path: 'zustand-example',
				element: <ZustandExample />,
			},
			{
				path: 'map',
				element: <MapPage />,
			},
			{
				path: 'delivery',
				element: <DeliveryTest />,
			},
			{
				path: '*',
				element: <NotFound />,
			},
		],
	},
])

const container = document.getElementById('root') as HTMLElement
if (!container) throw new Error('Failed to find the root element')
const root: Root = createRoot(container)

root.render(
	<React.StrictMode>
		<ChakraProvider theme={theme}>
			<ColorModeScript />
			<AuthProvider>
				<RouterProvider router={router} />
			</AuthProvider>
		</ChakraProvider>
	</React.StrictMode>,
)
