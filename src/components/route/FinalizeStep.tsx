import { FunctionComponent, useState } from 'react'
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
import { FiDownload, FiSend, FiSave } from 'react-icons/fi'
import { useRouteStore } from '../../store/routeStore'

interface FinalizeStepProps {
	onBack: () => void
}

export const FinalizeStep: FunctionComponent<FinalizeStepProps> = ({
	onBack,
}) => {
	const toast = useToast()
	const { currentRoute, setCurrentRoute, addRoute } = useRouteStore()
	const [isDispatching, setIsDispatching] = useState(false)

	const handleDispatch = () => {
		setIsDispatching(true)
		// Simulate API call to dispatch route
		setTimeout(() => {
			if (currentRoute) {
				const dispatchedRoute = {
					...currentRoute,
					status: 'dispatched' as const,
				}
				addRoute(dispatchedRoute)
				setCurrentRoute(null)
				toast({
					title: 'Route dispatched successfully',
					status: 'success',
					duration: 3000,
					isClosable: true,
				})
			}
			setIsDispatching(false)
		}, 1500)
	}

	const handleExportPDF = () => {
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

	return (
		<VStack spacing={6} align="stretch">
			<Heading size="md" color="gray.800">
				Review & Dispatch
			</Heading>

			<Box borderWidth={1} borderRadius="md" p={4}>
				<VStack spacing={4} align="stretch">
					<Box>
						<Text fontWeight="medium" color="gray.600">
							Route Type
						</Text>
						<Text color="gray.700">{currentRoute?.type}</Text>
					</Box>

					<Divider />

					<Box>
						<Text fontWeight="medium" color="gray.600">
							Stops ({currentRoute?.stops.length})
						</Text>
						<VStack spacing={2} align="stretch" mt={2}>
							{currentRoute?.stops.map((stop, index) => (
								<Box
									key={index}
									p={2}
									bg="gray.50"
									borderRadius="md"
								>
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
								</Box>
							))}
						</VStack>
					</Box>

					<Divider />

					<Box>
						<Text fontWeight="medium" color="gray.600">
							Route Details
						</Text>
						<Text color="gray.700">
							Estimated Time:{' '}
							{currentRoute?.optimizedRoute.estimatedTime} minutes
						</Text>
						<Text color="gray.700">
							Estimated Fuel Cost: $
							{currentRoute?.optimizedRoute.fuelCost}
						</Text>
					</Box>

					<Divider />

					<Box>
						<Text fontWeight="medium" color="gray.600">
							Assigned Driver
						</Text>
						<Text color="gray.700">{getAssignedDriver()}</Text>
					</Box>
				</VStack>
			</Box>

			<VStack spacing={4}>
				<Button
					leftIcon={<Icon as={FiDownload} />}
					variant="outline"
					colorScheme="orange"
					width="full"
					onClick={handleExportPDF}
				>
					Export as PDF
				</Button>

				<Button
					leftIcon={<Icon as={FiSend} />}
					colorScheme="orange"
					width="full"
					onClick={handleDispatch}
					isLoading={isDispatching}
					loadingText="Dispatching..."
				>
					Send to Driver
				</Button>

				<Button
					leftIcon={<Icon as={FiSave} />}
					variant="ghost"
					width="full"
					onClick={() => {
						if (currentRoute) {
							addRoute(currentRoute)
							toast({
								title: 'Route saved to history',
								status: 'success',
								duration: 3000,
								isClosable: true,
							})
						}
					}}
				>
					Save to Route History
				</Button>
			</VStack>

			<Divider />

			<Button variant="ghost" onClick={onBack}>
				Back
			</Button>
		</VStack>
	)
}
