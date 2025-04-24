import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { MapComponentRef } from '../../Map/MapComponent'
import mapboxgl from 'mapbox-gl'

export interface Address {
	text: string
	place_name: string
	center: [number, number] // [longitude, latitude]
}

// Add an interface for the route result
interface RouteResult {
	distance: number
	distanceDisplay: string
}

export function useAddressSelection(
	mapRef: React.RefObject<MapComponentRef>,
	mapLoaded: boolean,
) {
	const [stops, setStops] = useState<number[]>([1, 2]) // Start with origin and destination
	const [selectedAddresses, setSelectedAddresses] = useState<
		Record<number, Address>
	>({})
	const [routeError, setRouteError] = useState<string | null>(null)
	const [isMapPickingMode, setIsMapPickingMode] = useState<boolean>(false)
	const [activeAddressIndex, setActiveAddressIndex] = useState<number | null>(
		null,
	)
	const [routeDistance, setRouteDistance] = useState<{
		meters: number
		displayValue: string
	}>({ meters: 0, displayValue: '0' })
	const toast = useToast()

	// Draw route whenever selected addresses change
	useEffect(() => {
		// Only attempt to draw a route if we have origin and destination addresses
		if (
			mapLoaded &&
			mapRef.current &&
			selectedAddresses[0] &&
			selectedAddresses[stops.length - 1]
		) {
			setRouteError(null)
			const origin = selectedAddresses[0].center
			const destination = selectedAddresses[stops.length - 1].center

			// Get intermediate waypoints if there are any
			const waypoints: [number, number][] = []
			for (let i = 1; i < stops.length - 1; i++) {
				if (selectedAddresses[i]) {
					waypoints.push(selectedAddresses[i].center)
				}
			}

			// Draw route with Mapbox Directions API
			try {
				mapRef.current
					.drawRoute(origin, destination, waypoints)
					.then((result: RouteResult | void) => {
						// Update distance if route was drawn successfully
						if (
							result &&
							typeof result === 'object' &&
							'distance' in result
						) {
							setRouteDistance({
								meters: result.distance,
								displayValue: `${result.distanceDisplay} mi`,
							})
						}
					})
					.catch((err) => {
						console.error('Error drawing route:', err)
						setRouteError(
							'Could not calculate route. Please try different addresses.',
						)
						// Reset distance when there's an error
						setRouteDistance({ meters: 0, displayValue: '0' })
						toast({
							title: 'Route Error',
							description:
								'Could not calculate a route between these addresses. Please try different locations.',
							status: 'error',
							duration: 5000,
							isClosable: true,
						})
					})
			} catch (error) {
				console.error('Error drawing route:', error)
				setRouteError(
					'Could not calculate route. Please try different addresses.',
				)
				// Reset distance when there's an error
				setRouteDistance({ meters: 0, displayValue: '0' })
			}
		} else {
			// Reset distance when we don't have enough addresses
			setRouteDistance({ meters: 0, displayValue: '0' })
		}
	}, [selectedAddresses, mapLoaded, stops, toast, mapRef])

	// Setup map click event for location picking
	useEffect(() => {
		if (!mapRef.current || !mapLoaded) return

		// Function to handle click on map that works with mapboxgl.MapMouseEvent
		const handleMapClick = async (e: mapboxgl.MapMouseEvent) => {
			if (isMapPickingMode && activeAddressIndex !== null && e.lngLat) {
				// Get clicked coordinates
				const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat]

				// Show loading toast
				const loadingToastId = toast({
					title: 'Getting address...',
					description: 'Looking up the address at this location',
					status: 'loading',
					duration: null,
					isClosable: false,
				})

				try {
					// Use Mapbox Reverse Geocoding API to get address from coordinates
					const accessToken =
						'pk.eyJ1IjoiYmNucHJvMjAiLCJhIjoiY205cmVvZXhrMXB6dTJqb2I4cHFxN2xnbiJ9.HOKvHjSyBLNkwiaiEoFnBg' // Using the same token from useAddressSearch
					const response = await fetch(
						`https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat[0]},${lngLat[1]}.json?access_token=${accessToken}&types=address`,
					)

					const data = await response.json()
					let pickedAddress: Address

					if (data.features && data.features.length > 0) {
						// Use the first and most relevant result
						const feature = data.features[0]
						pickedAddress = {
							text: feature.text || 'Selected Location',
							place_name:
								feature.place_name ||
								`Location at ${lngLat[0].toFixed(5)}, ${lngLat[1].toFixed(5)}`,
							center: lngLat,
						}
					} else {
						// Fallback if no address found
						pickedAddress = {
							text: 'Selected Location',
							place_name: `Location at ${lngLat[0].toFixed(5)}, ${lngLat[1].toFixed(5)}`,
							center: lngLat,
						}
					}

					// Close loading toast
					toast.close(loadingToastId)

					// Update the selected address
					handleAddressSelect(activeAddressIndex, pickedAddress)

					// Exit map picking mode
					setIsMapPickingMode(false)
					setActiveAddressIndex(null)

					// Reset cursor
					const canvas = mapRef.current?.getCanvas?.()
					if (canvas) {
						canvas.style.cursor = ''
					}

					// Show success toast
					toast({
						title: 'Location selected',
						description: 'Address has been set from the map',
						status: 'success',
						duration: 2000,
						isClosable: true,
					})
				} catch (error) {
					// Close loading toast
					toast.close(loadingToastId)

					console.error(
						'Error getting address from coordinates:',
						error,
					)

					// Create a basic address object with just the coordinates as fallback
					const pickedAddress: Address = {
						text: 'Selected Location',
						place_name: `Location at ${lngLat[0].toFixed(5)}, ${lngLat[1].toFixed(5)}`,
						center: lngLat,
					}

					// Update the selected address
					handleAddressSelect(activeAddressIndex, pickedAddress)

					// Exit map picking mode
					setIsMapPickingMode(false)
					setActiveAddressIndex(null)

					// Reset cursor
					const canvas = mapRef.current?.getCanvas?.()
					if (canvas) {
						canvas.style.cursor = ''
					}

					// Show error toast
					toast({
						title: 'Address lookup failed',
						description: 'Using coordinates instead',
						status: 'warning',
						duration: 3000,
						isClosable: true,
					})
				}
			}
		}

		// Add click listener if we're in picking mode
		if (isMapPickingMode && mapRef.current.on) {
			// Cast to the correct type expected by mapboxgl event handlers
			mapRef.current.on(
				'click',
				handleMapClick as unknown as (
					e: mapboxgl.MapMouseEvent | mapboxgl.MapboxEvent,
				) => void,
			)

			// Set the cursor to crosshair
			const canvas = mapRef.current?.getCanvas?.()
			if (canvas) {
				canvas.style.cursor = 'crosshair'
			}

			return () => {
				if (mapRef.current && mapRef.current.off) {
					mapRef.current.off(
						'click',
						handleMapClick as unknown as (
							e: mapboxgl.MapMouseEvent | mapboxgl.MapboxEvent,
						) => void,
					)

					// Reset cursor
					const canvas = mapRef.current?.getCanvas?.()
					if (canvas) {
						canvas.style.cursor = ''
					}
				}
			}
		}
	}, [isMapPickingMode, activeAddressIndex, mapLoaded, mapRef, toast])

	const addStop = () => {
		// Simply add a new stop and don't move any addresses
		setStops([...stops, stops.length + 1])
	}

	const removeStop = (index: number) => {
		// Can't remove origin or destination if there are only 2 stops
		if (stops.length <= 2) return

		// Store current addresses before modification
		const oldAddresses = { ...selectedAddresses }
		const lastIndex = stops.length - 1

		// Special handling for removing the destination
		if (index === lastIndex) {
			// If removing the last stop (destination), we need to make the previous stop the new destination
			// Remove the stop from the array
			const newStops = stops.filter((_, i) => i !== index)
			setStops(newStops)

			// No need to reindex if removing the last element
			setSelectedAddresses(oldAddresses)

			return
		}

		// Special handling for intermediate stops
		if (index > 0 && index < lastIndex) {
			const newStops = stops.filter((_, i) => i !== index)
			setStops(newStops)

			// Create new addresses object
			const newSelectedAddresses: Record<number, Address> = {}

			// Keep origin address
			if (oldAddresses[0]) {
				newSelectedAddresses[0] = oldAddresses[0]
			}

			// Keep destination address at the new last position
			if (oldAddresses[lastIndex]) {
				newSelectedAddresses[newStops.length - 1] =
					oldAddresses[lastIndex]
			}

			// Shift intermediate addresses to fill the gap
			for (let i = 1; i < index; i++) {
				if (oldAddresses[i]) {
					newSelectedAddresses[i] = oldAddresses[i]
				}
			}

			// Shift addresses after the removed index
			for (let i = index + 1; i < lastIndex; i++) {
				if (oldAddresses[i]) {
					newSelectedAddresses[i - 1] = oldAddresses[i]
				}
			}

			setSelectedAddresses(newSelectedAddresses)
			return
		}

		// Handle removing the origin (index === 0)
		if (index === 0) {
			const newStops = stops.filter((_, i) => i !== index)
			setStops(newStops)

			// Create new addresses object
			const newSelectedAddresses: Record<number, Address> = {}

			// New origin is the old stop 1
			if (oldAddresses[1]) {
				newSelectedAddresses[0] = oldAddresses[1]
			}

			// Keep destination address at the new last position
			if (oldAddresses[lastIndex]) {
				newSelectedAddresses[newStops.length - 1] =
					oldAddresses[lastIndex]
			}

			// Shift intermediate addresses
			for (let i = 2; i < lastIndex; i++) {
				if (oldAddresses[i]) {
					newSelectedAddresses[i - 1] = oldAddresses[i]
				}
			}

			setSelectedAddresses(newSelectedAddresses)
		}
	}

	const resetForm = () => {
		setStops([1, 2])
		setSelectedAddresses({})
		setIsMapPickingMode(false)
		setActiveAddressIndex(null)
	}

	const handleAddressSelect = (index: number, address: Address | null) => {
		const updatedAddresses = {
			...selectedAddresses,
		}

		if (address === null) {
			// Remove the address when it's null
			delete updatedAddresses[index]
		} else {
			// Add or update the address
			updatedAddresses[index] = address

			// Add marker and fly to the selected location
			if (mapRef.current && mapLoaded) {
				// Fly to the selected location
				mapRef.current.flyTo(address.center, 12)

				// If we only have one address selected, we need to add a marker manually
				// When there are both origin and destination, the drawRoute function will handle markers
				const isOnlyAddress = Object.keys(updatedAddresses).length === 1
				if (
					isOnlyAddress &&
					mapRef.current &&
					typeof mapRef.current.drawRoute === 'function'
				) {
					try {
						// Clear previous markers
						mapRef.current.clearRouteAndMarkers()

						// When drawing a single marker, determine appropriate marker id
						if (index === 0) {
							// Origin - always use marker 1
							mapRef.current.addMarker(address.center, 'origin')
						} else if (index === stops.length - 1) {
							// Final stop (destination) - mark as destination with proper number
							mapRef.current.addMarker(
								address.center,
								`destination-${stops.length}`,
							)
						} else {
							// Intermediate stop - use the index+1 as the marker number
							mapRef.current.addMarker(
								address.center,
								`${index + 1}`,
							)
						}
					} catch (error) {
						console.error('Error displaying marker:', error)
					}
				} else if (Object.keys(updatedAddresses).length > 1) {
					// If we have multiple addresses, try to draw a complete route
					// Check if we have both origin and destination
					if (
						updatedAddresses[0] &&
						updatedAddresses[stops.length - 1]
					) {
						const origin = updatedAddresses[0].center
						const destination =
							updatedAddresses[stops.length - 1].center

						// Get intermediate waypoints if there are any
						const waypoints: [number, number][] = []
						for (let i = 1; i < stops.length - 1; i++) {
							if (updatedAddresses[i]) {
								waypoints.push(updatedAddresses[i].center)
							}
						}

						// Create a Map for storing marker numbers
						const markerNumbers = new Map<string, string>()
						markerNumbers.set(
							'destination',
							stops.length.toString(),
						)

						// Draw the route with explicit destination number
						mapRef.current
							.drawRoute(origin, destination, waypoints)
							.catch((err) =>
								console.error('Error drawing route:', err),
							)
					}
				}

				// If we have either origin or destination, but not both, just draw markers
				else {
					try {
						// Clear previous routes and markers
						mapRef.current.clearRouteAndMarkers()

						// Add markers for all available addresses
						Object.entries(updatedAddresses).forEach(
							([key, addr]) => {
								const keyNum = parseInt(key)
								if (keyNum === 0) {
									mapRef.current?.addMarker(
										addr.center,
										'origin',
									)
								} else if (keyNum === stops.length - 1) {
									// Use the new destination-X format
									mapRef.current?.addMarker(
										addr.center,
										`destination-${stops.length}`,
									)
								} else {
									mapRef.current?.addMarker(
										addr.center,
										`${keyNum + 1}`,
									)
								}
							},
						)
					} catch (error) {
						console.error('Error displaying markers:', error)
					}
				}
			}
		}

		setSelectedAddresses(updatedAddresses)
	}

	// Enable map picking mode
	const enableMapPickingMode = (index: number) => {
		setIsMapPickingMode(true)
		setActiveAddressIndex(index)

		// Show instruction toast
		toast({
			title: 'Pick location from map',
			description: 'Click anywhere on the map to select a location',
			status: 'info',
			duration: 3000,
			isClosable: true,
		})
	}

	// Cancel map picking mode
	const cancelMapPickingMode = () => {
		setIsMapPickingMode(false)
		setActiveAddressIndex(null)

		// Reset cursor
		const canvas = mapRef.current?.getCanvas?.()
		if (canvas) {
			canvas.style.cursor = ''
		}
	}

	return {
		stops,
		selectedAddresses,
		routeError,
		isMapPickingMode,
		activeAddressIndex,
		routeDistance,
		addStop,
		removeStop,
		resetForm,
		handleAddressSelect,
		enableMapPickingMode,
		cancelMapPickingMode,
	}
}
