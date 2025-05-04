import { FunctionComponent, ReactElement, useRef, useState } from 'react'

import { Box } from '@chakra-ui/react'
import { MapComponent } from '../components/Map'
import { SideNavbar } from '../components/SideNavbar'
import { DeliveryStepper } from '../components/Delivery'
import { MapComponentRef } from '../components/Map/MapComponent'

export const Home: FunctionComponent = (): ReactElement => {
	const mapRef = useRef<MapComponentRef>(null)
	const [mapLoaded, setMapLoaded] = useState(false)

	return (
		<Box
			height={'100vh'}
			width={'100vw'}
			overflow={'hidden'}
			position={'relative'}
			style={{ scrollbarWidth: 'none' }}
		>
			{/* Map as background */}
			<MapComponent ref={mapRef} onMapLoaded={() => setMapLoaded(true)} />

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

				{/* Delivery Stepper - positioned next to the SideNavbar */}
				<Box
					position={'absolute'}
					left={'64px'}
					top={0}
					pointerEvents={'auto'}
					zIndex={900}
					height={'100%'}
				>
					<DeliveryStepper mapRef={mapRef} mapLoaded={mapLoaded} />
				</Box>

				{/* Team Invitation Alert - for logged in users */}
			</Box>
		</Box>
	)
}
