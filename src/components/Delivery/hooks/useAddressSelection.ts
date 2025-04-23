import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { MapComponentRef } from '../../Map/MapComponent'
import mapboxgl from 'mapbox-gl'

export interface Address {
	text: string
	place_name: string
	center: [number, number] // [longitude, latitude]
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
	const toast = useToast()

	// Draw route whenever selected addresses change
	useEffect(() => {
		if (
			mapLoaded &&
			mapRef.current &&
			selectedAddresses[0] &&
			selectedAddresses[1]
		) {
			setRouteError(null)
			const origin = selectedAddresses[0].center
			const destination = selectedAddresses[1].center

			// Get intermediate waypoints if there are any
			const waypoints: [number, number][] = []
			for (let i = 2; i < stops.length; i++) {
				if (selectedAddresses[i]) {
					waypoints.push(selectedAddresses[i].center)
				}
			}

			// Draw route with Mapbox Directions API
			try {
				mapRef.current
					.drawRoute(origin, destination, waypoints)
					.catch((err) => {
						console.error('Error drawing route:', err)
						setRouteError(
							'Could not calculate route. Please try different addresses.',
						)
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
			}
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
		setStops([...stops, stops.length + 1])
	}

	const removeStop = (index: number) => {
		const newStops = stops.filter((_, i) => i !== index)
		setStops(newStops)

		// Also remove the selected address for this stop
		const newSelectedAddresses = { ...selectedAddresses }

		// First delete the address at the removed index
		delete newSelectedAddresses[index]

		// Then reindex all addresses with higher indices
		for (let i = index + 1; i < stops.length; i++) {
			if (newSelectedAddresses[i]) {
				newSelectedAddresses[i - 1] = newSelectedAddresses[i]
				delete newSelectedAddresses[i]
			}
		}

		setSelectedAddresses(newSelectedAddresses)
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
						// When drawing a single marker, use the same point for start and end
						// But pass the correct marker number (1 for origin, 2 for destination)
						if (index === 0) {
							// Origin - use marker 1
							mapRef.current.clearRouteAndMarkers()
							mapRef.current.addMarker(address.center, '1')
						} else if (index === 1) {
							// Destination - use marker 2
							mapRef.current.clearRouteAndMarkers()
							mapRef.current.addMarker(address.center, '2')
						} else {
							// Waypoint - use the index+1 as the marker number
							mapRef.current.clearRouteAndMarkers()
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
					if (updatedAddresses[0] && updatedAddresses[1]) {
						const origin = updatedAddresses[0].center
						const destination = updatedAddresses[1].center

						// Get intermediate waypoints if there are any
						const waypoints: [number, number][] = []
						for (let i = 2; i < stops.length; i++) {
							if (updatedAddresses[i]) {
								waypoints.push(updatedAddresses[i].center)
							}
						}

						// Draw the route
						mapRef.current
							.drawRoute(origin, destination, waypoints)
							.catch((err) =>
								console.error('Error drawing route:', err),
							)
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
		addStop,
		removeStop,
		resetForm,
		handleAddressSelect,
		enableMapPickingMode,
		cancelMapPickingMode,
	}
}
