/* eslint-disable @typescript-eslint/no-unused-vars */
import { FunctionComponent, useState, useEffect } from 'react'
import {
	VStack,
	Heading,
	Button,
	Text,
	Box,
	Divider,
	useToast,
	Icon,
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
	AccordionIcon,
} from '@chakra-ui/react'
import { FiDownload, FiSend } from 'react-icons/fi'
import { useRouteStore } from '../../store/routeStore'
import { useAuth } from '../../context/AuthContext'

interface FinalizeStepProps {
	onBack: () => void
}

export const FinalizeStep: FunctionComponent<FinalizeStepProps> = ({
	onBack,
}) => {
	const toast = useToast()
	const { currentRoute, addRoute } = useRouteStore()
	const [isDispatching, setIsDispatching] = useState(false)
	const { currentUser } = useAuth()
	const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'

	// Log final route information when component mounts or route changes
	useEffect(() => {
		if (currentRoute) {
			console.log('Final Route Information:', {
				type: currentRoute.type,
				stops: currentRoute.stops,
				optimizedRoute: currentRoute.optimizedRoute,
				driver: {
					id: currentRoute.driver.id,
					name: getAssignedDriver(),
					autoAssigned: currentRoute.driver.autoAssigned,
				},
				status: currentRoute.status,
			})
		}
	}, [currentRoute])

	const handleDispatch = async () => {
		if (!currentRoute || !currentUser) {
			toast({
				title: 'No route to dispatch',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
			return
		}

		setIsDispatching(true)
		try {
			const token = await currentUser.getIdToken()
			// Remove id from the route data since MongoDB will generate it
			const { id: _, ...routeDataWithoutId } = currentRoute

			// Transform route type to match backend enum
			const routeType =
				currentRoute.type === 'Single Stop'
					? 'Single Stop'
					: 'Multi Stop'

			// Transform route data to match backend schema
			const routeData = {
				...routeDataWithoutId,
				type: routeType,
				firebaseUid: currentUser.uid,
				// Ensure stops have required fields
				stops: currentRoute.stops.map((stop) => ({
					name: stop.name,
					address: stop.address,
					phoneNumber: stop.phoneNumber || '', // Ensure required field
					deliveryNotes: stop.deliveryNotes || '',
					center: stop.center,
				})),
				// Ensure optimized route has required structure
				optimizedRoute: {
					sequence: currentRoute.optimizedRoute.sequence || [],
					estimatedTime:
						currentRoute.optimizedRoute.estimatedTime || 0,
					fuelCost: currentRoute.optimizedRoute.fuelCost || 0,
					distance: currentRoute.optimizedRoute.distance || 0,
					distanceDisplay:
						currentRoute.optimizedRoute.distanceDisplay || '0',
				},
				// Ensure driver has required structure
				driver: {
					name: getAssignedDriver().split(' (')[0] || 'Not assigned',
					autoAssigned: currentRoute.driver.autoAssigned || false,
				},
			}

			console.log('Dispatching Route:', routeData)

			// Create the route in the backend
			const response = await fetch(`${BASE_URL}/api/routes`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(routeData),
			})

			if (!response.ok) {
				throw new Error('Failed to save route')
			}

			const savedRoute = await response.json()

			// Update local store with the saved route
			addRoute(savedRoute)

			toast({
				title: 'Route dispatched successfully',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})
		} catch (error) {
			console.error('Error dispatching route:', error)
			toast({
				title: 'Error dispatching route',
				description:
					error instanceof Error
						? error.message
						: 'Failed to dispatch route',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
		} finally {
			setIsDispatching(false)
		}
	}

	const handleExportPDF = () => {
		if (!currentRoute) {
			toast({
				title: 'No route to export',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
			return
		}

		// Log export data
		console.log('Exporting Route Data:', {
			...currentRoute,
			driverDetails: getAssignedDriver(),
		})

		// In a real app, this would generate and download a PDF
		toast({
			title: 'Exporting PDF',
			description: 'Your route summary will be downloaded shortly',
			status: 'info',
			duration: 3000,
			isClosable: true,
		})
	}

	const getAssignedDriver = () => {
		if (!currentRoute?.driver.id) return 'Not assigned'
		const driver = [
			{ id: '1', name: 'John Doe', vehicle: 'Van - XYZ123' },
			{ id: '2', name: 'Jane Smith', vehicle: 'Truck - ABC789' },
			{ id: '3', name: 'Mike Johnson', vehicle: 'Van - DEF456' },
		].find((d) => d.id === currentRoute.driver.id)
		return driver ? `${driver.name} (${driver.vehicle})` : 'Unknown driver'
	}

	if (!currentRoute) {
		return (
			<VStack spacing={4} align="stretch">
				<Heading size="md" color="orange.500">
					No Active Route
				</Heading>
				<Text color="gray.600">
					There is no active route to finalize.
				</Text>
				<Button onClick={onBack} colorScheme="gray">
					Go Back
				</Button>
			</VStack>
		)
	}

	return (
		<VStack spacing={6} align="stretch">
			<Heading size="md" color="orange.500">
				Route Summary
			</Heading>

			<Box borderWidth={1} p={4} borderRadius="md">
				<VStack align="stretch" spacing={4}>
					<Box>
						<Text fontWeight="bold" color="gray.700">
							Route Type
						</Text>
						<Text color="blue.600">{currentRoute.type}</Text>
					</Box>

					<Box>
						<Text fontWeight="bold" color="gray.700">
							Number of Stops
						</Text>
						<Text color="blue.600">
							{currentRoute.stops.length}
						</Text>
					</Box>

					<Box>
						<Text fontWeight="bold" color="gray.700">
							Estimated Time
						</Text>
						<Text color="blue.600">
							{currentRoute.optimizedRoute.estimatedTime} minutes
						</Text>
					</Box>

					<Box>
						<Text fontWeight="bold" color="gray.700">
							Estimated Fuel Cost
						</Text>
						<Text color="green.600">
							${currentRoute.optimizedRoute.fuelCost}
						</Text>
					</Box>

					<Box>
						<Text fontWeight="bold" color="gray.700">
							Assigned Driver
						</Text>
						<Text color="blue.600">{getAssignedDriver()}</Text>
					</Box>
				</VStack>
			</Box>

			<Divider />

			<Box>
				<Heading size="md" color="orange.500" mb={4}>
					Stop Details
				</Heading>
				<Accordion allowMultiple>
					{currentRoute.stops.map((stop, index) => (
						<AccordionItem key={index}>
							<h2>
								<AccordionButton
									_hover={{
										backgroundColor: 'orange.50',
									}}
								>
									<Box flex="1" textAlign="left">
										<Text
											fontWeight="bold"
											color="gray.700"
										>
											Stop {index + 1}: {stop.name}
										</Text>
									</Box>
									<AccordionIcon color="orange.500" />
								</AccordionButton>
							</h2>
							<AccordionPanel pb={4}>
								<VStack align="stretch" spacing={2}>
									<Box>
										<Text
											fontWeight="bold"
											color="gray.700"
										>
											Address
										</Text>
										<Text color="blue.600">
											{stop.address}
										</Text>
									</Box>
									<Box>
										<Text
											fontWeight="bold"
											color="gray.700"
										>
											Phone Number
										</Text>
										<Text color="blue.600">
											{stop.phoneNumber}
										</Text>
									</Box>
									{stop.deliveryNotes && (
										<Box>
											<Text
												fontWeight="bold"
												color="gray.700"
											>
												Delivery Notes
											</Text>
											<Text color="blue.600">
												{stop.deliveryNotes}
											</Text>
										</Box>
									)}
								</VStack>
							</AccordionPanel>
						</AccordionItem>
					))}
				</Accordion>
			</Box>

			<Divider />

			<VStack spacing={4}>
				<Button
					leftIcon={<Icon as={FiSend} />}
					colorScheme="orange"
					width="full"
					onClick={handleDispatch}
					isLoading={isDispatching}
					loadingText="Dispatching..."
				>
					Dispatch Route
				</Button>

				<Button
					leftIcon={<Icon as={FiDownload} />}
					variant="outline"
					width="full"
					onClick={handleExportPDF}
					colorScheme="orange"
				>
					Export as PDF
				</Button>

				<Button onClick={onBack} width="full">
					Back
				</Button>
			</VStack>
		</VStack>
	)
}
