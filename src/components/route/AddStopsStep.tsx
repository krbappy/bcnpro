import { FunctionComponent, useState, useEffect } from 'react'
import {
	VStack,
	Heading,
	Button,
	Text,
	Box,
	FormControl,
	FormLabel,
	Input,
	Textarea,
	HStack,
	useToast,
	IconButton,
} from '@chakra-ui/react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { useRouteStore, Stop } from '../../store/routeStore'
import mapboxgl from 'mapbox-gl'

interface AddStopsStepProps {
	onNext: () => void
	onBack: () => void
}

export const AddStopsStep: FunctionComponent<AddStopsStepProps> = ({
	onNext,
	onBack,
}) => {
	const toast = useToast()
	const { currentRoute, setCurrentRoute } = useRouteStore()
	const [newStop, setNewStop] = useState<Stop>({
		name: '',
		address: '',
		phoneNumber: '',
		deliveryNotes: '',
		center: [0, 0], // Initialize with default coordinates
	})
	const [isGeocoding, setIsGeocoding] = useState(false)

	// Initialize form with existing data when component mounts
	useEffect(() => {
		if (!currentRoute) {
			// If no current route exists, go back to route type selection
			toast({
				title: 'No route selected',
				description: 'Please select a route type first',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
			onBack()
		}
	}, [currentRoute, onBack, toast])

	const geocodeAddress = async (
		address: string,
	): Promise<[number, number] | null> => {
		try {
			const response = await fetch(
				`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
					address,
				)}.json?access_token=${mapboxgl.accessToken}&types=address,place,postcode&limit=1`,
			)
			const data = await response.json()

			if (data.features && data.features.length > 0) {
				const [lng, lat] = data.features[0].center
				return [lng, lat]
			}
			return null
		} catch (error) {
			console.error('Error geocoding address:', error)
			return null
		}
	}

	const handleAddStop = async () => {
		if (!newStop.name || !newStop.address) {
			toast({
				title: 'Required fields missing',
				description: 'Please fill in at least the name and address',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
			return
		}

		setIsGeocoding(true)
		try {
			// Get coordinates for the address
			const coordinates = await geocodeAddress(newStop.address)

			if (!coordinates) {
				toast({
					title: 'Address not found',
					description:
						'Could not find coordinates for this address. Please check the address and try again.',
					status: 'error',
					duration: 3000,
					isClosable: true,
				})
				return
			}

			if (currentRoute) {
				const updatedRoute = {
					...currentRoute,
					stops: [
						...currentRoute.stops,
						{ ...newStop, center: coordinates },
					],
				}

				// Save to store
				setCurrentRoute(updatedRoute)

				// Reset form
				setNewStop({
					name: '',
					address: '',
					phoneNumber: '',
					deliveryNotes: '',
					center: [0, 0],
				})

				// Show success message
				toast({
					title: 'Stop added',
					description: `Added ${newStop.name} to the route`,
					status: 'success',
					duration: 2000,
					isClosable: true,
				})
			}
		} catch (error) {
			toast({
				title: 'Error adding stop',
				description: 'Failed to process the address. Please try again.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
		} finally {
			setIsGeocoding(false)
		}
	}

	const handleRemoveStop = (index: number) => {
		if (currentRoute) {
			const newStops = [...currentRoute.stops]
			const removedStop = newStops[index]
			newStops.splice(index, 1)

			const updatedRoute = {
				...currentRoute,
				stops: newStops,
			}

			// Save to store
			setCurrentRoute(updatedRoute)

			// Show confirmation
			toast({
				title: 'Stop removed',
				description: `Removed ${removedStop.name} from the route`,
				status: 'info',
				duration: 2000,
				isClosable: true,
			})
		}
	}

	const handleNext = () => {
		if (!currentRoute?.stops.length) {
			toast({
				title: 'No stops added',
				description: 'Please add at least one stop',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
			return
		}

		// For single stop routes, ensure there are exactly 2 stops (start and end)
		if (
			currentRoute.type === 'Single Stop' &&
			currentRoute.stops.length !== 2
		) {
			toast({
				title: 'Invalid number of stops',
				description:
					'Single stop routes must have exactly 2 stops (start and end locations)',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
			return
		}

		// For multiple stops routes, ensure there are at least 3 stops
		if (
			currentRoute.type === 'Multiple Stops' &&
			currentRoute.stops.length < 3
		) {
			toast({
				title: 'More stops needed',
				description: 'Multiple stops routes require at least 3 stops',
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
				Add Stops
			</Heading>

			{/* Existing Stops */}
			{currentRoute?.stops.map((stop, index) => (
				<Box
					key={index}
					p={4}
					borderWidth={1}
					borderRadius="md"
					borderColor="gray.200"
				>
					<HStack justify="space-between" align="start">
						<VStack align="stretch" flex={1}>
							<Text fontWeight="medium" color="gray.700">
								{stop.name}
							</Text>
							<Text fontSize="sm" color="gray.600">
								{stop.address}
							</Text>
							{stop.phoneNumber && (
								<Text fontSize="sm" color="gray.600">
									📞 {stop.phoneNumber}
								</Text>
							)}
							{stop.deliveryNotes && (
								<Text fontSize="sm" color="gray.600">
									📝 {stop.deliveryNotes}
								</Text>
							)}
						</VStack>
						<IconButton
							icon={<FiTrash2 />}
							aria-label="Remove stop"
							variant="ghost"
							colorScheme="red"
							size="sm"
							onClick={() => handleRemoveStop(index)}
						/>
					</HStack>
				</Box>
			))}

			{/* Add New Stop Form */}
			<Box borderWidth={1} borderRadius="md" p={4}>
				<VStack spacing={4}>
					<FormControl isRequired>
						<FormLabel color="gray.600">Stop Name</FormLabel>
						<Input
							value={newStop.name}
							onChange={(e) =>
								setNewStop({ ...newStop, name: e.target.value })
							}
							placeholder="Enter stop name"
							color="gray.700"
							_placeholder={{ color: 'gray.400' }}
							borderColor="gray.300"
							_hover={{ borderColor: 'gray.400' }}
							_focus={{ borderColor: 'orange.500' }}
						/>
					</FormControl>

					<FormControl isRequired>
						<FormLabel color="gray.600">Address</FormLabel>
						<Input
							value={newStop.address}
							onChange={(e) =>
								setNewStop({
									...newStop,
									address: e.target.value,
								})
							}
							placeholder="Enter address"
							color="gray.700"
							_placeholder={{ color: 'gray.400' }}
							borderColor="gray.300"
							_hover={{ borderColor: 'gray.400' }}
							_focus={{ borderColor: 'orange.500' }}
						/>
					</FormControl>

					<FormControl>
						<FormLabel color="gray.600">Phone Number</FormLabel>
						<Input
							value={newStop.phoneNumber}
							onChange={(e) =>
								setNewStop({
									...newStop,
									phoneNumber: e.target.value,
								})
							}
							placeholder="Enter phone number"
							color="gray.700"
							_placeholder={{ color: 'gray.400' }}
							borderColor="gray.300"
							_hover={{ borderColor: 'gray.400' }}
							_focus={{ borderColor: 'orange.500' }}
						/>
					</FormControl>

					<FormControl>
						<FormLabel color="gray.600">Delivery Notes</FormLabel>
						<Textarea
							value={newStop.deliveryNotes}
							onChange={(e) =>
								setNewStop({
									...newStop,
									deliveryNotes: e.target.value,
								})
							}
							placeholder="Enter any delivery instructions or notes"
							color="gray.700"
							_placeholder={{ color: 'gray.400' }}
							borderColor="gray.300"
							_hover={{ borderColor: 'gray.400' }}
							_focus={{ borderColor: 'orange.500' }}
						/>
					</FormControl>

					<Button
						leftIcon={<FiPlus />}
						colorScheme="orange"
						onClick={handleAddStop}
						alignSelf="flex-end"
						isLoading={isGeocoding}
						loadingText="Processing address..."
					>
						Add Stop
					</Button>
				</VStack>
			</Box>

			<HStack justify="space-between" pt={4}>
				<Button onClick={onBack} colorScheme="gray.500">
					Back
				</Button>
				<Button
					colorScheme="orange"
					onClick={handleNext}
					isDisabled={!currentRoute?.stops.length}
				>
					Next
				</Button>
			</HStack>
		</VStack>
	)
}
