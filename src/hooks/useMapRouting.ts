import { useCallback } from 'react'
import mapboxgl from 'mapbox-gl'

// Set Mapbox token if not already set
if (!mapboxgl.accessToken) {
	mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY || ''
}

// Validate coordinates to ensure they're in the correct range
const validateCoordinates = (coords: [number, number]): [number, number] => {
	// Ensure longitude is between -180 and 180
	let [lng, lat] = coords

	// Normalize longitude to -180 to 180 range
	lng = ((lng + 540) % 360) - 180

	// Clamp latitude to -90 to 90 range
	lat = Math.max(-90, Math.min(90, lat))

	return [lng, lat]
}

export function useMapRouting(
	mapRef: React.RefObject<mapboxgl.Map | null>,
	addMarker: (coordinates: [number, number], id: string) => void,
	clearMarkers: () => void,
) {
	// Clear route from the map
	const clearRoute = useCallback(() => {
		if (!mapRef.current) return

		if (mapRef.current.getLayer('route')) {
			mapRef.current.removeLayer('route')
		}

		if (mapRef.current.getSource('route')) {
			mapRef.current.removeSource('route')
		}
	}, [mapRef])

	// Clear both route and markers
	const clearRouteAndMarkers = useCallback(() => {
		clearMarkers()
		clearRoute()
	}, [clearMarkers, clearRoute])

	// Fly to a specific location on the map
	const flyTo = useCallback(
		(center: [number, number], zoom?: number) => {
			if (mapRef.current) {
				const validCenter = validateCoordinates(center)
				mapRef.current.flyTo({
					center: validCenter,
					zoom: zoom || 12,
					essential: true,
				})
			}
		},
		[mapRef],
	)

	// Draw a route between points
	const drawRoute = useCallback(
		async (
			start: [number, number],
			end: [number, number],
			waypoints: [number, number][] = [],
		): Promise<void> => {
			if (!mapRef.current)
				return Promise.reject(new Error('Map not initialized'))

			try {
				// Clear previous markers and route
				clearRouteAndMarkers()

				// Validate coordinates
				const validStart = validateCoordinates(start)
				const validEnd = validateCoordinates(end)
				const validWaypoints = waypoints.map((wp) =>
					validateCoordinates(wp),
				)

				// Add markers for start and end points
				addMarker(validStart, 'origin')
				addMarker(validEnd, 'destination')

				// Add markers for waypoints if any
				validWaypoints.forEach((point, index) => {
					addMarker(point, `waypoint-${index}`)
				})

				// Build the coordinates string for the API
				const coordinates = [validStart, ...validWaypoints, validEnd]
					.map((coord) => `${coord[0]},${coord[1]}`)
					.join(';')

				// Construct the API request URL
				const query = await fetch(
					`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
					{ method: 'GET' },
				)

				const json = await query.json()
				if (json.code === 'InvalidInput' || json.code === 'NoRoute') {
					console.error('Routing error:', json.message)
					return Promise.reject(
						new Error(json.message || 'Error calculating route'),
					)
				}

				if (json.routes && json.routes.length > 0) {
					const route = json.routes[0]
					const geometry = route.geometry

					// Zoom to fit the route
					const bounds = new mapboxgl.LngLatBounds()
					geometry.coordinates.forEach((coord: [number, number]) => {
						bounds.extend(coord)
					})

					mapRef.current.fitBounds(bounds, {
						padding: 80,
						duration: 1000,
					})

					// Add the route to the map
					if (mapRef.current.getSource('route')) {
						;(
							mapRef.current.getSource(
								'route',
							) as mapboxgl.GeoJSONSource
						).setData({
							type: 'Feature',
							properties: {},
							geometry,
						})
					} else {
						mapRef.current.addSource('route', {
							type: 'geojson',
							data: {
								type: 'Feature',
								properties: {},
								geometry,
							},
						})

						mapRef.current.addLayer({
							id: 'route',
							type: 'line',
							source: 'route',
							layout: {
								'line-join': 'round',
								'line-cap': 'round',
							},
							paint: {
								'line-color': '#F75708',
								'line-width': 5,
								'line-opacity': 0.8,
							},
						})
					}

					return Promise.resolve()
				} else {
					return Promise.reject(new Error('No route found'))
				}
			} catch (error) {
				console.error('Error drawing route:', error)
				return Promise.reject(error)
			}
		},
		[mapRef, addMarker, clearRouteAndMarkers],
	)

	return {
		drawRoute,
		flyTo,
		clearRoute,
		clearRouteAndMarkers,
	}
}
