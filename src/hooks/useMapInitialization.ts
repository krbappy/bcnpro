import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import {
	defaultMapConfig,
	styleNameToMapboxStyle,
} from '../components/Map/mapStyles'

// Set your Mapbox token from environment variables
if (!mapboxgl.accessToken) {
	mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY || ''
}

export function useMapInitialization(
	mapContainerRef: React.RefObject<HTMLDivElement>,
	currentStyle: string,
	onMapLoaded?: () => void,
) {
	const mapRef = useRef<mapboxgl.Map | null>(null)

	// Initialize map
	useEffect(() => {
		if (mapRef.current) return // Initialize map only once

		if (mapContainerRef.current) {
			mapRef.current = new mapboxgl.Map({
				container: mapContainerRef.current,
				style: styleNameToMapboxStyle(currentStyle),
				center: defaultMapConfig.center,
				zoom: defaultMapConfig.zoom,
				minZoom: defaultMapConfig.minZoom,
				maxZoom: defaultMapConfig.maxZoom,
			})

			// Add navigation controls
			mapRef.current.addControl(
				new mapboxgl.NavigationControl(),
				'top-right',
			)

			// Call onMapLoaded callback when map is loaded
			mapRef.current.on('load', () => {
				if (onMapLoaded) {
					onMapLoaded()
				}
			})
		}

		return () => {
			if (mapRef.current) {
				mapRef.current.remove()
				mapRef.current = null
			}
		}
	}, [onMapLoaded, mapContainerRef, currentStyle])

	// Update map style when style changes
	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setStyle(styleNameToMapboxStyle(currentStyle))
		}
	}, [currentStyle])

	return mapRef
}
