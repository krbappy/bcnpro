import { useRef } from 'react'
import mapboxgl from 'mapbox-gl'

export function useMapMarkers(mapRef: React.RefObject<mapboxgl.Map | null>) {
	const markersRef = useRef<mapboxgl.Marker[]>([])

	// Add a marker to the map
	const addMarker = (coordinates: [number, number], id: string) => {
		if (!mapRef.current) return

		const el = document.createElement('div')
		el.className = 'marker'
		el.style.width = '30px'
		el.style.height = '30px'
		el.style.borderRadius = '50%'
		el.style.display = 'flex'
		el.style.justifyContent = 'center'
		el.style.alignItems = 'center'
		el.style.color = 'white'
		el.style.fontWeight = 'bold'
		el.style.fontSize = '14px'
		el.style.fontFamily = 'Arial, sans-serif'

		// Set the background color based on marker type
		// First marker (origin) and last marker (destination) should be orange
		// All intermediate stops should be gray
		if (id === 'origin' || id === '1' || id.startsWith('destination')) {
			el.style.backgroundColor = '#F75708' // Orange for first and last markers
		} else {
			el.style.backgroundColor = '#6B7280' // Gray for intermediate stops
		}
		el.style.border = '2px solid white'
		el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)'

		// Use the id directly to determine the marker number
		if (id === 'origin' || id === '1') {
			el.textContent = '1'
		} else if (id.startsWith('destination')) {
			// Check if destination includes a number (e.g., "destination-3")
			const parts = id.split('-')
			if (parts.length > 1 && !isNaN(parseInt(parts[1]))) {
				el.textContent = parts[1]
			} else {
				// Default to 2 if no number provided
				el.textContent = '2'
			}
		} else if (id.startsWith('waypoint')) {
			// Extract the waypoint number from the id (e.g., "waypoint-0" -> "3")
			const waypointIndex = parseInt(id.split('-')[1], 10) + 3
			el.textContent = waypointIndex.toString()
		} else if (!isNaN(parseInt(id))) {
			// If the id is a number string, use it directly
			el.textContent = id
		}

		const marker = new mapboxgl.Marker(el)
			.setLngLat(coordinates)
			.addTo(mapRef.current)

		markersRef.current.push(marker)
	}

	// Clear all markers from the map
	const clearMarkers = () => {
		markersRef.current.forEach((marker) => marker.remove())
		markersRef.current = []
	}

	return {
		markers: markersRef,
		addMarker,
		clearMarkers,
	}
}
