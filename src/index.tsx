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
import { TeamProvider } from './context/TeamContext'
import Account from './pages/Account'
import DeliveryHistory from './pages/DeliveryHistory'
import { TeamManagement } from './pages/TeamManagement'
import { TeamInvitation } from './pages/TeamInvitation'
import Routes from './pages/RoutesS'
import RoutesManage from './pages/RoutesManage'
import RouteView from './pages/RouteView'
import AddressBook from './pages/AddressBook'

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
				path: 'account',
				element: <Account />,
			},
			{
				path: 'delivery-history',
				element: <DeliveryHistory />,
			},
			{
				path: 'team-management',
				element: <TeamManagement />,
			},
			{
				path: 'team-invitation',
				element: <TeamInvitation />,
			},
			{
				path: 'routes',
				element: <Routes />,
			},
			{
				path: 'routes/manage',
				element: <RoutesManage />,
			},
			{
				path: 'routes/view',
				element: <RouteView />,
			},
			{
				path: 'address-book',
				element: <AddressBook />,
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
				<TeamProvider>
					<RouterProvider router={router} />
				</TeamProvider>
			</AuthProvider>
		</ChakraProvider>
	</React.StrictMode>,
)
