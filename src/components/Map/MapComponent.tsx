import { Box } from '@chakra-ui/react'
import mapboxgl from 'mapbox-gl'
import { useEffect, useRef } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import { defaultMapConfig, styleNameToMapboxStyle } from './mapStyles'
import { useMapStyle } from '../../context/MapStyleContext'

// Set your Mapbox token from environment variables
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY || ''

const MapComponent = () => {
	const mapContainer = useRef<HTMLDivElement>(null)
	const map = useRef<mapboxgl.Map | null>(null)
	const { currentStyle } = useMapStyle()

	useEffect(() => {
		if (map.current) return // Initialize map only once

		if (mapContainer.current) {
			map.current = new mapboxgl.Map({
				container: mapContainer.current,
				style: styleNameToMapboxStyle(currentStyle),
				center: defaultMapConfig.center,
				zoom: defaultMapConfig.zoom,
				minZoom: defaultMapConfig.minZoom,
				maxZoom: defaultMapConfig.maxZoom,
			})

			// Add navigation controls
			map.current.addControl(
				new mapboxgl.NavigationControl(),
				'top-right',
			)
		}

		return () => {
			if (map.current) {
				map.current.remove()
				map.current = null
			}
		}
	}, [])

	// Update map style when style changes
	useEffect(() => {
		if (map.current) {
			map.current.setStyle(styleNameToMapboxStyle(currentStyle))
		}
	}, [currentStyle])

	return (
		<Box
			ref={mapContainer}
			width="100%"
			height="100%"
			position="absolute"
			top={0}
			left={0}
			right={0}
			bottom={0}
			overflow={'hidden'}
			style={{ scrollbarWidth: 'none' }}
		/>
	)
}

export default MapComponent
