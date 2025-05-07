import { useLocation, useNavigate } from 'react-router-dom'
import {
	Box,
	Container,
	Heading,
	VStack,
	HStack,
	Text,
	Badge,
	Button,
	Card,
	CardBody,
	Divider,
	Grid,
	GridItem,
	useToast,
} from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'

interface Stop {
	name: string
	address: string
	phoneNumber: string
	deliveryNotes: string
	center: [number, number]
}

interface OptimizedRoute {
	sequence: number[]
	estimatedTime: number
	fuelCost: number
	distance: number
	distanceDisplay: string
}

interface Driver {
	name: string
	autoAssigned: boolean
}

interface Route {
	type: string
	stops: Stop[]
	optimizedRoute: OptimizedRoute
	driver: Driver
	status: string
	createdAt: string
	updatedAt: string
}

const RouteView = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const toast = useToast()
	const route = location.state?.route as Route

	if (!route) {
		toast({
			title: 'Error',
			description: 'Route not found',
			status: 'error',
			duration: 5000,
			isClosable: true,
		})
		navigate('/routes/manage')
		return null
	}

	return (
		<Container maxW="container.xl" py={8}>
			<VStack spacing={6} align="stretch">
				<HStack justify="space-between">
					<Button
						leftIcon={<FiArrowLeft />}
						variant="ghost"
						onClick={() => navigate('/routes/manage')}
					>
						Back to Routes
					</Button>
					<Badge
						colorScheme={
							route.status === 'completed'
								? 'green'
								: route.status === 'in_progress'
									? 'blue'
									: 'yellow'
						}
						fontSize="md"
						px={3}
						py={1}
					>
						{route.status}
					</Badge>
				</HStack>

				<Heading size="lg" color="orange.500">
					Route Details
				</Heading>

				<Grid templateColumns="repeat(2, 1fr)" gap={6}>
					<GridItem>
						<Card>
							<CardBody>
								<VStack align="stretch" spacing={4}>
									<Heading size="md">
										Route Information
									</Heading>
									<Divider />
									<HStack justify="space-between">
										<Text fontWeight="bold">Type:</Text>
										<Text>{route.type}</Text>
									</HStack>
									<HStack justify="space-between">
										<Text fontWeight="bold">Distance:</Text>
										<Text>
											{
												route.optimizedRoute
													.distanceDisplay
											}{' '}
											km
										</Text>
									</HStack>
									<HStack justify="space-between">
										<Text fontWeight="bold">
											Estimated Time:
										</Text>
										<Text>
											{Math.round(
												route.optimizedRoute
													.estimatedTime / 60,
											)}{' '}
											min
										</Text>
									</HStack>
									<HStack justify="space-between">
										<Text fontWeight="bold">
											Fuel Cost:
										</Text>
										<Text>
											${route.optimizedRoute.fuelCost}
										</Text>
									</HStack>
									<HStack justify="space-between">
										<Text fontWeight="bold">Driver:</Text>
										<HStack>
											<Text>{route.driver.name}</Text>
											{route.driver.autoAssigned && (
												<Badge colorScheme="blue">
													Auto
												</Badge>
											)}
										</HStack>
									</HStack>
								</VStack>
							</CardBody>
						</Card>
					</GridItem>

					<GridItem>
						<Card>
							<CardBody>
								<VStack align="stretch" spacing={4}>
									<Heading size="md">Stops</Heading>
									<Divider />
									{route.stops.map((stop, index) => (
										<Box
											key={index}
											p={3}
											borderWidth={1}
											borderRadius="md"
										>
											<VStack align="stretch" spacing={2}>
												<Text fontWeight="bold">
													Stop {index + 1}
												</Text>
												<Text>Name: {stop.name}</Text>
												<Text>
													Address: {stop.address}
												</Text>
												<Text>
													Phone: {stop.phoneNumber}
												</Text>
												{stop.deliveryNotes && (
													<Text>
														Notes:{' '}
														{stop.deliveryNotes}
													</Text>
												)}
											</VStack>
										</Box>
									))}
								</VStack>
							</CardBody>
						</Card>
					</GridItem>
				</Grid>
			</VStack>
		</Container>
	)
}

export default RouteView
