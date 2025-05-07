import { useEffect, useState } from 'react'
import {
	Box,
	Heading,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Spinner,
	Center,
	Text,
	Button,
	Badge,
	useToast,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

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

const RoutesManage = () => {
	const { currentUser } = useAuth()
	const [routes, setRoutes] = useState<Route[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'
	const navigate = useNavigate()
	const toast = useToast()

	useEffect(() => {
		const fetchRoutes = async () => {
			if (!currentUser) return
			try {
				setIsLoading(true)
				const token = await currentUser.getIdToken()
				const response = await fetch(`${BASE_URL}/api/routes`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				})
				if (!response.ok) throw new Error('Failed to fetch routes')
				const data = await response.json()
				setRoutes(Array.isArray(data) ? data : data.routes || [])
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'Unknown error')
				toast({
					title: 'Error',
					description: 'Failed to fetch routes',
					status: 'error',
					duration: 5000,
					isClosable: true,
				})
			} finally {
				setIsLoading(false)
			}
		}
		fetchRoutes()
	}, [currentUser, toast])

	const handleViewRoute = (route: Route) => {
		// Navigate to route details page with route data
		navigate('/routes/view', { state: { route } })
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString()
	}

	return (
		<Box p={6}>
			<Heading size="lg" mb={6} color="orange.500">
				Manage Routes
			</Heading>
			{isLoading ? (
				<Center py={10}>
					<Spinner size="xl" color="orange.500" />
				</Center>
			) : error ? (
				<Center py={10}>
					<Text color="red.500">{error}</Text>
				</Center>
			) : routes.length === 0 ? (
				<Text>No routes found.</Text>
			) : (
				<Box overflowX="auto">
					<Table variant="simple">
						<Thead>
							<Tr>
								<Th>Type</Th>
								<Th>Stops</Th>
								<Th>Distance</Th>
								<Th>Estimated Time</Th>
								<Th>Driver</Th>
								<Th>Status</Th>
								<Th>Created</Th>
								<Th>Actions</Th>
							</Tr>
						</Thead>
						<Tbody>
							{routes.map((route, index) => (
								<Tr key={index}>
									<Td>{route.type}</Td>
									<Td>{route.stops.length}</Td>
									<Td>
										{route.optimizedRoute.distanceDisplay}{' '}
										km
									</Td>
									<Td>
										{Math.round(
											route.optimizedRoute.estimatedTime /
												60,
										)}{' '}
										min
									</Td>
									<Td>
										{route.driver.name}
										{route.driver.autoAssigned && (
											<Badge ml={2} colorScheme="blue">
												Auto
											</Badge>
										)}
									</Td>
									<Td>
										<Badge
											colorScheme={
												route.status === 'completed'
													? 'green'
													: route.status ===
														  'in_progress'
														? 'blue'
														: 'yellow'
											}
										>
											{route.status}
										</Badge>
									</Td>
									<Td>{formatDate(route.createdAt)}</Td>
									<Td>
										<Button
											size="sm"
											colorScheme="orange"
											variant="outline"
											onClick={() =>
												handleViewRoute(route)
											}
										>
											View
										</Button>
									</Td>
								</Tr>
							))}
						</Tbody>
					</Table>
				</Box>
			)}
		</Box>
	)
}

export default RoutesManage
