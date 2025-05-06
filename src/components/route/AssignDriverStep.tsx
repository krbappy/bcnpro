import { FunctionComponent, useState } from 'react'
import {
	VStack,
	Heading,
	Button,
	Text,
	Box,
	HStack,
	Radio,
	RadioGroup,
	Avatar,
	useToast,
} from '@chakra-ui/react'
import { useRouteStore } from '../../store/routeStore'

interface AssignDriverStepProps {
	onNext: () => void
	onBack: () => void
}

// Mock drivers data - in a real app, this would come from your backend
const mockDrivers = [
	{ id: '1', name: 'John Doe', vehicle: 'Van - XYZ123', rating: 4.8 },
	{ id: '2', name: 'Jane Smith', vehicle: 'Truck - ABC789', rating: 4.9 },
	{ id: '3', name: 'Mike Johnson', vehicle: 'Van - DEF456', rating: 4.7 },
]

export const AssignDriverStep: FunctionComponent<AssignDriverStepProps> = ({
	onNext,
	onBack,
}) => {
	const toast = useToast()
	const { currentRoute, setCurrentRoute } = useRouteStore()
	const [assignmentType, setAssignmentType] = useState<'auto' | 'manual'>(
		'auto',
	)
	const [selectedDriver, setSelectedDriver] = useState<string>('')

	const handleAssignmentTypeChange = (value: 'auto' | 'manual') => {
		setAssignmentType(value)
		if (value === 'auto') {
			// Simulate auto-assignment
			const randomDriver =
				mockDrivers[Math.floor(Math.random() * mockDrivers.length)]
			setSelectedDriver(randomDriver.id)
			if (currentRoute) {
				setCurrentRoute({
					...currentRoute,
					driver: {
						id: randomDriver.id,
						autoAssigned: true,
					},
				})
			}
		} else {
			setSelectedDriver('')
			if (currentRoute) {
				setCurrentRoute({
					...currentRoute,
					driver: {
						autoAssigned: false,
					},
				})
			}
		}
	}

	const handleDriverSelect = (driverId: string) => {
		setSelectedDriver(driverId)
		if (currentRoute) {
			setCurrentRoute({
				...currentRoute,
				driver: {
					id: driverId,
					autoAssigned: false,
				},
			})
		}
	}

	const handleNext = () => {
		if (!currentRoute?.driver.id) {
			toast({
				title: 'No driver assigned',
				description: 'Please assign a driver to continue',
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
				Assign Driver
			</Heading>

			<RadioGroup
				value={assignmentType}
				onChange={(value) =>
					handleAssignmentTypeChange(value as 'auto' | 'manual')
				}
			>
				<VStack spacing={4} align="stretch">
					<Box
						p={4}
						borderWidth={1}
						borderRadius="md"
						borderColor={
							assignmentType === 'auto'
								? 'orange.500'
								: 'gray.200'
						}
						_hover={{ borderColor: 'orange.300' }}
					>
						<Radio
							value="auto"
							colorScheme="orange"
							borderWidth={2}
							borderColor="gray.800"
						>
							<Text fontWeight="medium" color="gray.600">
								Auto-Assign
							</Text>
							<Text fontSize="sm" color="gray.600">
								System will assign the best available driver
								based on location and vehicle type
							</Text>
						</Radio>
					</Box>

					<Box
						p={4}
						borderWidth={1}
						borderRadius="md"
						borderColor={
							assignmentType === 'manual'
								? 'orange.500'
								: 'gray.200'
						}
						_hover={{ borderColor: 'orange.300' }}
					>
						<Radio
							value="manual"
							colorScheme="orange"
							borderWidth={2}
							borderColor="gray.800"
						>
							<Text fontWeight="medium" color="gray.600">
								Manual Selection
							</Text>
							<Text fontSize="sm" color="gray.600">
								Choose a specific driver from the available list
							</Text>
						</Radio>
					</Box>
				</VStack>
			</RadioGroup>

			{assignmentType === 'manual' && (
				<VStack spacing={4} align="stretch">
					{mockDrivers.map((driver) => (
						<Box
							key={driver.id}
							p={4}
							borderWidth={1}
							borderRadius="md"
							borderColor={
								selectedDriver === driver.id
									? 'orange.500'
									: 'gray.200'
							}
							_hover={{ borderColor: 'orange.300' }}
							cursor="pointer"
							onClick={() => handleDriverSelect(driver.id)}
						>
							<HStack spacing={4}>
								<Avatar name={driver.name} size="sm" />
								<Box flex={1}>
									<Text fontWeight="medium" color="gray.600">
										{driver.name}
									</Text>
									<Text fontSize="sm" color="gray.600">
										{driver.vehicle}
									</Text>
								</Box>
								<Text fontSize="sm" color="orange.500">
									★ {driver.rating}
								</Text>
							</HStack>
						</Box>
					))}
				</VStack>
			)}

			<HStack justify="space-between" pt={4}>
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
