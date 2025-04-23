import { Box } from '@chakra-ui/react'
import { useRef, forwardRef, useImperativeHandle } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import mapboxgl from 'mapbox-gl'
import { useMapStyle } from '../../context/MapStyleContext'
import { useMapInitialization } from '../../hooks/useMapInitialization'
import { useMapMarkers } from '../../hooks/useMapMarkers'
import { useMapRouting } from '../../hooks/useMapRouting'

export interface MapComponentRef {
	drawRoute: (
		start: [number, number],
		end: [number, number],
		waypoints?: [number, number][],
	) => Promise<void>
	flyTo: (center: [number, number], zoom?: number) => void
	addMarker: (coordinates: [number, number], id: string) => void
	clearRouteAndMarkers: () => void
	// Add these methods for map interaction
	getCanvas?: () => HTMLCanvasElement | undefined
	on?: (
		event: string,
		handler: (e: mapboxgl.MapMouseEvent | mapboxgl.MapboxEvent) => void,
	) => void
	off?: (
		event: string,
		handler: (e: mapboxgl.MapMouseEvent | mapboxgl.MapboxEvent) => void,
	) => void
	// Add raw map access
	mapInstance?: mapboxgl.Map | null
}

interface MapComponentProps {
	onMapLoaded?: () => void
}

const MapComponent = forwardRef<MapComponentRef, MapComponentProps>(
	({ onMapLoaded }, ref) => {
		const mapContainer = useRef<HTMLDivElement>(null)
		const { currentStyle } = useMapStyle()

		// Initialize the map
		const mapRef = useMapInitialization(
			mapContainer,
			currentStyle,
			onMapLoaded,
		)

		// Setup markers management
		const { addMarker, clearMarkers } = useMapMarkers(mapRef)

		// Setup routing functionality
		const { drawRoute, flyTo, clearRouteAndMarkers } = useMapRouting(
			mapRef,
			addMarker,
			clearMarkers,
		)

		// Expose methods to parent components
		useImperativeHandle(ref, () => ({
			drawRoute,
			flyTo,
			addMarker,
			clearRouteAndMarkers,
			// Add direct map methods
			getCanvas: () => mapRef.current?.getCanvas(),
			on: (event, handler) => mapRef.current?.on(event, handler),
			off: (event, handler) => mapRef.current?.off(event, handler),
			mapInstance: mapRef.current,
		}))

		return (
			<Box
				ref={mapContainer}
				width="100%"
				height="100%"
				position="absolute"
				top={0}
				left={'656px'}
				right={0}
				bottom={0}
				overflow={'hidden'}
				style={{ scrollbarWidth: 'none' }}
			/>
		)
	},
)

// Add display name to the component
MapComponent.displayName = 'MapComponent'

export default MapComponent
