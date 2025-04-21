import { FunctionComponent, ReactElement } from 'react'

import { Box } from '@chakra-ui/react'
import { MapComponent } from '../components/Map'
import { SideNavbar } from '../components/SideNavbar'

export const Home: FunctionComponent = (): ReactElement => {
	return (
		<Box
			height={'100vh'}
			width={'100vw'}
			overflow={'hidden'}
			position={'relative'}
			style={{ scrollbarWidth: 'none' }}
		>
			{/* Map as background */}
			<MapComponent />

			{/* Content layer above the map */}
			<Box
				position={'absolute'}
				top={0}
				left={0}
				right={0}
				bottom={0}
				pointerEvents={'none'}
				zIndex={10}
			>
				{/* Side navbar */}
				<Box
					position={'absolute'}
					left={0}
					bottom={0}
					pointerEvents={'auto'}
					zIndex={1000}
					height={'100%'}
				>
					<SideNavbar />
				</Box>
			</Box>
		</Box>
	)
}
