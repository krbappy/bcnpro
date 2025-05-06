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
} from '@chakra-ui/react'
import { FiDownload, FiSend } from 'react-icons/fi'
import { useRouteStore } from '../../store/routeStore'

interface FinalizeStepProps {
	onBack: () => void
}

export const FinalizeStep: FunctionComponent<FinalizeStepProps> = ({
	onBack,
}) => {
	const toast = useToast()
	const { currentRoute, addRoute } = useRouteStore()
	const [isDispatching, setIsDispatching] = useState(false)

	// Log final route information when component mounts or route changes
	useEffect(() => {
		if (currentRoute) {
			console.log('Final Route Information:', {
				id: currentRoute.id,
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

	const handleDispatch = () => {
		if (!currentRoute) {
			toast({
				title: 'No route to dispatch',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
			return
		}

		setIsDispatching(true)
		// Simulate API call to dispatch route
		setTimeout(() => {
			const dispatchedRoute = {
				...currentRoute,
				status: 'dispatched' as const,
			}

			// Log the final dispatched route
			console.log('Dispatching Route:', dispatchedRoute)

			addRoute(dispatchedRoute)
			// setCurrentRoute(null)

			toast({
				title: 'Route dispatched successfully',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})
			setIsDispatching(false)
		}, 1500)
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

			<VStack spacing={4}>
				<Button
					leftIcon={<Icon as={FiSend} />}
					colorScheme="orange"
					width="full"
					onClick={handleDispatch}
					isLoading={isDispatching}
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
