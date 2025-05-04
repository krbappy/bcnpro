import { FunctionComponent, ReactElement } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, Flex } from '@chakra-ui/react'
import { MapStyleProvider } from './context/MapStyleContext'

export const Layout: FunctionComponent = (): ReactElement => {
	return (
		<Box overflow={'hidden'} style={{ scrollbarWidth: 'none' }}>
			{/* <NavBar /> */}

			{/* An <Outlet> renders whatever child route is currently active,
			so you can think about this as a placeholder for the child routes
			we defined in index.tsx */}
			<MapStyleProvider>
				<Flex overflow={'hidden'} h="100vh">
					<Box flex="1" overflow="auto">
						<Outlet />
					</Box>
				</Flex>
			</MapStyleProvider>

			{/* <Footer /> */}
		</Box>
	)
}
