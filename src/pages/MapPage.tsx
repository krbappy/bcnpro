import { Box } from '@chakra-ui/react'
import { FunctionComponent, ReactElement } from 'react'
import { MapComponent } from '../components/Map'

export const MapPage: FunctionComponent = (): ReactElement => {
	return (
		<Box position="relative" overflow={'hidden'} width="100%" height="100%">
			<MapComponent />
		</Box>
	)
}
