import { FunctionComponent, useState } from 'react'
import {
	VStack,
	Heading,
	Button,
	Text,
	Box,
	HStack,
	List,
	ListItem,
	IconButton,
	Flex,
	Divider,
	useToast,
} from '@chakra-ui/react'
import { FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { useRouteStore, Stop } from '../../store/routeStore'
import mapboxgl from 'mapbox-gl'

interface OptimizeRouteStepProps {
	onNext: () => void
	onBack: () => void
}

export const OptimizeRouteStep: FunctionComponent<OptimizeRouteStepProps> = ({
	onNext,
	onBack,
}) => {
	const toast = useToast()
	const { currentRoute, setCurrentRoute } = useRouteStore()
	const [isOptimizing, setIsOptimizing] = useState(false)

	const calculateRouteDistance = async (stops: Stop[]) => {
		if (stops.length < 2) return null

		try {
			// Build the coordinates string for the API
			const coordinates = stops
				.map((stop) => `${stop.center[0]},${stop.center[1]}`)
				.join(';')

			// Construct the API request URL
			const query = await fetch(
				`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
				{ method: 'GET' },
			)

			const json = await query.json()
			if (json.code === 'InvalidInput' || json.code === 'NoRoute') {
				throw new Error(json.message || 'Error calculating route')
			}

			if (json.routes && json.routes.length > 0) {
				const route = json.routes[0]
				// Get the total distance in meters
				const distanceInMeters = route.distance || 0
				// Get the total duration in seconds
				const durationInSeconds = route.duration || 0
				// Convert to miles with 1 decimal place
				const distanceInMiles = (
					distanceInMeters * 0.000621371
				).toFixed(1)
				// Convert duration to minutes
				const durationInMinutes = Math.round(durationInSeconds / 60)

				return {
					distance: distanceInMeters,
					distanceDisplay: distanceInMiles,
					duration: durationInSeconds,
					durationDisplay: durationInMinutes,
				}
			}
			return null
		} catch (error) {
			console.error('Error calculating route distance:', error)
			return null
		}
	}

	const handleOptimize = async () => {
		setIsOptimizing(true)
		try {
			if (currentRoute) {
				const optimizedSequence = [
					...Array(currentRoute.stops.length),
				].map((_, i) => i)

				// Calculate route distance and duration
				const routeInfo = await calculateRouteDistance(
					currentRoute.stops,
				)

				// Calculate fuel cost based on distance
				const distanceInMiles = routeInfo?.distance
					? routeInfo.distance * 0.000621371
					: 0
				const fuelCost = Math.round((distanceInMiles / 20) * 3.5) // Cost based on 20 mpg and $3.50/gallon

				setCurrentRoute({
					...currentRoute,
					optimizedRoute: {
						sequence: optimizedSequence,
						estimatedTime: routeInfo?.durationDisplay || 0,
						fuelCost: fuelCost,
						distance: routeInfo?.distance || 0,
						distanceDisplay: routeInfo?.distanceDisplay || '0',
					},
				})
			}
		} catch (error) {
			toast({
				title: 'Optimization Error',
				description: 'Failed to calculate route distances',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
		} finally {
			setIsOptimizing(false)
		}
	}

	const moveStop = async (fromIndex: number, direction: 'up' | 'down') => {
		if (!currentRoute) return

		const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
		if (toIndex < 0 || toIndex >= currentRoute.stops.length) return

		const newStops = [...currentRoute.stops]
		const [movedStop] = newStops.splice(fromIndex, 1)
		newStops.splice(toIndex, 0, movedStop)

		// Calculate new route distance after reordering
		const routeInfo = await calculateRouteDistance(newStops)

		setCurrentRoute({
			...currentRoute,
			stops: newStops,
			optimizedRoute: {
				sequence: [...Array(newStops.length)].map((_, i) => i),
				estimatedTime: currentRoute.optimizedRoute.estimatedTime,
				fuelCost: currentRoute.optimizedRoute.fuelCost,
				distance: routeInfo?.distance || 0,
				distanceDisplay: routeInfo?.distanceDisplay || '0',
			},
		})
	}

	const handleNext = () => {
		if (!currentRoute?.optimizedRoute.sequence.length) {
			toast({
				title: 'Route not optimized',
				description: 'Please optimize the route first',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
			return
		}
		onNext()
	}

	return (
		<VStack spacing={6} align="stretch">
			<Heading size="md" color="gray.600">
				Optimize Route
			</Heading>

			<Button
				colorScheme="orange"
				onClick={handleOptimize}
				isLoading={isOptimizing}
				loadingText="Optimizing..."
			>
				Use Route Optimizer
			</Button>

			<Box borderWidth={1} borderRadius="md" p={4}>
				<List spacing={3}>
					{currentRoute?.stops.map((stop, index) => (
						<ListItem key={index}>
							<Flex align="center" justify="space-between">
								<Box flex={1}>
									<Text fontWeight="medium" color="gray.600">
										{stop.name}
									</Text>
									<Text fontSize="sm" color="gray.600">
										{stop.address}
									</Text>
								</Box>
								<HStack>
									<IconButton
										icon={<FiArrowUp />}
										aria-label="Move up"
										size="sm"
										colorScheme="gray.500"
										borderWidth={2}
										borderColor="gray.600"
										isDisabled={index === 0}
										onClick={() => moveStop(index, 'up')}
									/>
									<IconButton
										icon={<FiArrowDown />}
										aria-label="Move down"
										size="sm"
										isDisabled={
											index ===
											(currentRoute?.stops.length || 0) -
												1
										}
										onClick={() => moveStop(index, 'down')}
									/>
								</HStack>
							</Flex>
						</ListItem>
					))}
				</List>
			</Box>

			{currentRoute &&
				currentRoute.optimizedRoute &&
				currentRoute.optimizedRoute.sequence.length > 0 && (
					<Box borderWidth={1} borderRadius="md" p={4} bg="orange.50">
						<Text fontWeight="medium" mb={2} color="gray.600">
							Route Summary
						</Text>
						<Text fontSize="sm" color="gray.600">
							Total Distance:{' '}
							{currentRoute.optimizedRoute.distanceDisplay} miles
						</Text>
						<Text fontSize="sm" color="gray.600">
							Estimated Time:{' '}
							{currentRoute.optimizedRoute.estimatedTime} minutes
						</Text>
						<Text fontSize="sm" color="gray.600">
							Estimated Fuel Cost: $
							{currentRoute.optimizedRoute.fuelCost}
						</Text>
					</Box>
				)}

			<Divider />

			<HStack justify="space-between">
				<Button
					colorScheme="gray.500"
					variant={'solid'}
					onClick={onBack}
				>
					Back
				</Button>
				<Button colorScheme="orange" onClick={handleNext}>
					Next
				</Button>
			</HStack>
		</VStack>
	)
}
