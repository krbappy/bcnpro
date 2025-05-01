import { useState, useEffect } from 'react'
import {
	Box,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Input,
	Select,
	Text,
	Container,
	InputGroup,
	InputLeftElement,
	Flex,
	Heading,
	Card,
	CardBody,
	Spinner,
	Center,
	useToast,
	Code,
	Button,
} from '@chakra-ui/react'
import { FiSearch, FiCalendar, FiRefreshCw } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

// Updated interface to handle potential API response format differences
interface Booking {
	id: string
	pickupAddress?: string
	deliveryAddress?: string
	status?: string
	date?: string
	isPaid?: boolean
	amount?: number
	recipientName?: string
	// Additional possible fields
	pickup_address?: string
	delivery_address?: string
	recipient_name?: string
	is_paid?: boolean
	created_at?: string
	updated_at?: string
	[key: string]: any // Allow any other fields
}

const DeliveryHistory = () => {
	const [bookings, setBookings] = useState<Booking[]>([])
	const [rawData, setRawData] = useState<any>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [dateFilter, setDateFilter] = useState('')
	const [statusFilter, setStatusFilter] = useState('')
	const [paymentFilter, setPaymentFilter] = useState('')
	const [showDebug, setShowDebug] = useState(false)
	const { currentUser } = useAuth()
	const toast = useToast()

	const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'

	useEffect(() => {
		fetchBookings()
	}, [currentUser])

	const fetchBookings = async () => {
		if (!currentUser) {
			setIsLoading(false)
			return
		}

		try {
			setIsLoading(true)

			const token = await currentUser.getIdToken()
			const response = await fetch(`${BASE_URL}/api/bookings`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			})

			if (!response.ok) {
				throw new Error('Failed to fetch booking history')
			}

			const data = await response.json()
			console.log('API Response:', data)
			setRawData(data)

			// Check if data is an array or has a nested data property
			let bookingsData: any[] = []
			if (Array.isArray(data)) {
				bookingsData = data
			} else if (data && typeof data === 'object') {
				// Try to find an array in the response
				const possibleArrays = Object.values(data).filter(Array.isArray)
				if (possibleArrays.length > 0) {
					bookingsData = possibleArrays[0] as any[]
				} else if (data.data && Array.isArray(data.data)) {
					bookingsData = data.data
				} else if (data.bookings && Array.isArray(data.bookings)) {
					bookingsData = data.bookings
				}
			}

			// Map the data to our expected format
			const normalizedBookings = bookingsData.map((item) => {
				return {
					id:
						item.id ||
						item._id ||
						`booking-${Math.random().toString(36).substr(2, 9)}`,
					pickupAddress:
						item.pickupAddress || item.pickup_address || 'N/A',
					deliveryAddress:
						item.deliveryAddress || item.delivery_address || 'N/A',
					recipientName:
						item.recipientName || item.recipient_name || 'N/A',
					status: item.status || 'pending',
					date:
						item.date ||
						item.created_at ||
						item.updated_at ||
						new Date().toISOString().split('T')[0],
					isPaid: item.isPaid || item.is_paid || false,
					amount: item.amount || 0,
					// Store original data
					originalData: item,
				}
			})

			setBookings(normalizedBookings)
		} catch (error) {
			console.error('Error fetching bookings:', error)
			toast({
				title: 'Error fetching booking history',
				description:
					error instanceof Error
						? error.message
						: 'An unknown error occurred',
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
		} finally {
			setIsLoading(false)
		}
	}

	const filteredBookings = bookings.filter((booking) => {
		const matchesSearch =
			String(booking.pickupAddress)
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			String(booking.deliveryAddress)
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			String(booking.recipientName)
				.toLowerCase()
				.includes(searchQuery.toLowerCase())

		const matchesDate =
			!dateFilter || (booking.date && booking.date.includes(dateFilter))

		const matchesStatus = !statusFilter || booking.status === statusFilter

		const matchesPayment =
			!paymentFilter ||
			(paymentFilter === 'paid' ? booking.isPaid : !booking.isPaid)

		return matchesSearch && matchesDate && matchesStatus && matchesPayment
	})

	// Define theme colors to match the app style
	const themeColors = {
		background: '#191919', // Black background
		accent: '#F75708', // Orange
		secondary: '#E4DCFF', // Light/whitish
	}

	return (
		<Container maxW="container.xl" py={8}>
			<Card bg={themeColors.background} color={themeColors.secondary}>
				<CardBody>
					<Flex
						justifyContent="space-between"
						alignItems="center"
						mb={6}
					>
						<Heading size="lg" color={themeColors.secondary}>
							Delivery History
						</Heading>
						<Button
							leftIcon={<FiRefreshCw />}
							colorScheme="orange"
							size="sm"
							onClick={fetchBookings}
							isLoading={isLoading}
							variant="outline"
						>
							Refresh
						</Button>
					</Flex>

					{/* Debug panel */}
					<Box mb={4}>
						<Button
							size="sm"
							onClick={() => setShowDebug(!showDebug)}
							variant="outline"
							colorScheme="blue"
							mb={2}
						>
							{showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
						</Button>

						{showDebug && rawData && (
							<Box
								bg="gray.800"
								p={3}
								rounded="md"
								mb={4}
								overflowX="auto"
							>
								<Text mb={2} fontWeight="bold">
									Raw API Response:
								</Text>
								<Code
									colorScheme="blackAlpha"
									whiteSpace="pre"
									display="block"
									overflowX="auto"
								>
									{JSON.stringify(rawData, null, 2)}
								</Code>
								<Text mt={4} mb={2} fontWeight="bold">
									Processed Bookings:
								</Text>
								<Code
									colorScheme="blackAlpha"
									whiteSpace="pre"
									display="block"
									overflowX="auto"
								>
									{JSON.stringify(bookings, null, 2)}
								</Code>
							</Box>
						)}
					</Box>

					{/* Filters */}
					<Flex gap={4} mb={6} flexWrap="wrap">
						<InputGroup maxW="300px">
							<InputLeftElement pointerEvents="none">
								<FiSearch color="gray.300" />
							</InputLeftElement>
							<Input
								placeholder="Search deliveries..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								borderColor={`${themeColors.secondary}30`}
							/>
						</InputGroup>

						<InputGroup maxW="200px">
							<InputLeftElement pointerEvents="none">
								<FiCalendar color="gray.300" />
							</InputLeftElement>
							<Input
								type="date"
								value={dateFilter}
								onChange={(e) => setDateFilter(e.target.value)}
								borderColor={`${themeColors.secondary}30`}
							/>
						</InputGroup>

						<Select
							placeholder="Status"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							maxW="150px"
							borderColor={`${themeColors.secondary}30`}
						>
							<option value="pending">Pending</option>
							<option value="in_transit">In Transit</option>
							<option value="delivered">Delivered</option>
							<option value="cancelled">Cancelled</option>
						</Select>

						<Select
							placeholder="Payment Status"
							value={paymentFilter}
							onChange={(e) => setPaymentFilter(e.target.value)}
							maxW="150px"
							borderColor={`${themeColors.secondary}30`}
						>
							<option value="paid">Paid</option>
							<option value="unpaid">Unpaid</option>
						</Select>
					</Flex>

					{/* Loading State */}
					{isLoading ? (
						<Center py={10}>
							<Spinner
								thickness="4px"
								speed="0.65s"
								emptyColor="gray.200"
								color={themeColors.accent}
								size="xl"
							/>
						</Center>
					) : (
						<>
							{/* Table */}
							<Box overflowX="auto">
								{filteredBookings.length > 0 ? (
									<Table variant="simple">
										<Thead>
											<Tr>
												<Th color={themeColors.accent}>
													Date
												</Th>
												<Th color={themeColors.accent}>
													Pickup Address
												</Th>
												<Th color={themeColors.accent}>
													Delivery Address
												</Th>
												<Th color={themeColors.accent}>
													Recipient
												</Th>
												<Th color={themeColors.accent}>
													Status
												</Th>
												<Th color={themeColors.accent}>
													Amount
												</Th>
												<Th color={themeColors.accent}>
													Payment Status
												</Th>
											</Tr>
										</Thead>
										<Tbody>
											{filteredBookings.map((booking) => (
												<Tr key={booking.id}>
													<Td>{booking.date}</Td>
													<Td>
														{booking.pickupAddress}
													</Td>
													<Td>
														{
															booking.deliveryAddress
														}
													</Td>
													<Td>
														{booking.recipientName}
													</Td>
													<Td>
														<Text
															px={2}
															py={1}
															rounded="md"
															fontSize="sm"
															fontWeight="medium"
															bg={
																booking.status ===
																'delivered'
																	? 'green.100'
																	: booking.status ===
																		  'in_transit'
																		? 'blue.100'
																		: booking.status ===
																			  'cancelled'
																			? 'red.100'
																			: 'yellow.100'
															}
															color={
																booking.status ===
																'delivered'
																	? 'green.800'
																	: booking.status ===
																		  'in_transit'
																		? 'blue.800'
																		: booking.status ===
																			  'cancelled'
																			? 'red.800'
																			: 'yellow.800'
															}
															display="inline-block"
														>
															{booking.status ===
															'in_transit'
																? 'In Transit'
																: booking.status
																		?.charAt(
																			0,
																		)
																		.toUpperCase() +
																	(booking.status?.slice(
																		1,
																	) || '')}
														</Text>
													</Td>
													<Td>${booking.amount}</Td>
													<Td>
														<Text
															px={2}
															py={1}
															rounded="md"
															fontSize="sm"
															fontWeight="medium"
															bg={
																booking.isPaid
																	? 'green.100'
																	: 'red.100'
															}
															color={
																booking.isPaid
																	? 'green.800'
																	: 'red.800'
															}
															display="inline-block"
														>
															{booking.isPaid
																? 'Paid'
																: 'Unpaid'}
														</Text>
													</Td>
												</Tr>
											))}
										</Tbody>
									</Table>
								) : (
									<Center py={10}>
										<Text
											textAlign="center"
											color="gray.500"
										>
											{currentUser
												? 'No deliveries found. Try adjusting your filters or make your first delivery.'
												: 'Please log in to view your delivery history.'}
										</Text>
									</Center>
								)}
							</Box>
						</>
					)}
				</CardBody>
			</Card>
		</Container>
	)
}

export default DeliveryHistory
