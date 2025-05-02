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
	Badge,
} from '@chakra-ui/react'
import { FiSearch, FiCalendar } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

// Define types properly to avoid 'any'
interface ContactInfo {
	name: string
	phone: string
	email: string
	company?: string
	notes?: string
	saveToAddressBook?: boolean
}

interface Address {
	street: string
	city?: string
	state?: string
	zipCode?: string
	country?: string
	coordinates?: [number, number]
}

interface OrderItem {
	description: string
	length: string
	width: string
	height: string
	weight: string
	quantity: string
}

interface Order {
	id: string
	poNumber: string
	orderNumber: string
	bolNumber: string
	items: OrderItem[]
	isOpen: boolean
}

interface Booking {
	_id: string
	user: string
	stops: number[]
	selectedAddresses?: Record<string, Address>
	vehicleType: string
	orders: Order[]
	totalWeight: string
	additionalInfo?: string
	contactInfo?: Record<string, ContactInfo>
	currency: string
	paymentStatus: string
	isPaid: boolean
	price: number
	createdAt: string
	updatedAt: string
	paidAt?: string
	orderStatus: string
	paymentIntentId?: string
	paymentMethodId?: string
	routeDistance?: {
		meters: number
		displayValue: string
	}
	deliveryTiming?: {
		date: string
		timeWindow: string
		isValid: boolean
	}
	[key: string]: unknown
}

interface BookingDisplay {
	id: string
	pickupAddress: string
	deliveryAddress: string
	recipientName: string
	status: string
	date: string
	orderStatus: string
	isPaid: boolean
	amount: number
	rawDate: string // Store the raw date for sorting and filtering
}

// Helper function to standardize date format for comparison
const formatDateForComparison = (dateString: string): string => {
	if (!dateString) return ''

	try {
		// If it's already in YYYY-MM-DD format (from the date input)
		if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
			return dateString
		}

		const date = new Date(dateString)
		if (isNaN(date.getTime())) return dateString

		// Format as YYYY-MM-DD for comparison
		return date.toISOString().split('T')[0]
	} catch (e) {
		console.error('Error formatting date:', e)
		return dateString
	}
}

const DeliveryHistory = () => {
	const [displayBookings, setDisplayBookings] = useState<BookingDisplay[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState('')
	const [dateFilter, setDateFilter] = useState('')
	const [statusFilter, setStatusFilter] = useState('')
	const [paymentFilter, setPaymentFilter] = useState('')
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

			// Handle different response structures
			let bookingsArray: Booking[] = []
			if (Array.isArray(data)) {
				bookingsArray = data
			} else if (data && typeof data === 'object') {
				// Check for common response patterns
				if (data.data && Array.isArray(data.data)) {
					bookingsArray = data.data
				} else if (data.bookings && Array.isArray(data.bookings)) {
					bookingsArray = data.bookings
				} else {
					// For debugging, if it's a single booking, wrap it in an array
					bookingsArray = [data as Booking]
				}
			}

			// Transform bookings into display format
			const transformed = bookingsArray.map(transformBookingForDisplay)

			// Sort by date, newest first
			const sortedBookings = [...transformed].sort((a, b) => {
				try {
					const dateA = new Date(a.rawDate || a.date)
					const dateB = new Date(b.rawDate || b.date)

					// If both dates are valid, sort in descending order (newest first)
					if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
						return dateB.getTime() - dateA.getTime()
					}
				} catch (e) {
					console.error('Error sorting dates:', e)
				}

				return 0 // Keep original order if dates aren't valid
			})

			setDisplayBookings(sortedBookings)
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

	// Transform the complex booking object into a simpler display format
	const transformBookingForDisplay = (booking: Booking): BookingDisplay => {
		// Get pickup and delivery addresses - add safety checks
		let pickupAddress = 'N/A'
		let deliveryAddress = 'N/A'

		// Safely access addresses from both formats
		if (
			booking.selectedAddresses &&
			typeof booking.selectedAddresses === 'object'
		) {
			pickupAddress =
				booking.selectedAddresses['0']?.street || pickupAddress
			deliveryAddress =
				booking.selectedAddresses['1']?.street || deliveryAddress
		}

		// Get recipient name from the delivery contact info
		let recipientName = 'N/A'
		if (booking.contactInfo && typeof booking.contactInfo === 'object') {
			recipientName =
				booking.contactInfo['2']?.name ||
				booking.contactInfo['1']?.name ||
				recipientName
		}

		// Store raw date for sorting and filtering
		const rawDate = booking.createdAt || ''

		// Format date from createdAt for display
		let displayDate = 'N/A'
		try {
			// Handle both string dates and timestamps
			if (rawDate) {
				displayDate = new Date(rawDate).toLocaleDateString()
			}
		} catch (e) {
			console.error('Error parsing date:', e)
		}

		// Use the orderStatus field from the API response
		const status = booking.orderStatus || 'pending'

		return {
			id: booking._id || String(Math.random()),
			pickupAddress,
			deliveryAddress,
			recipientName,
			orderStatus: status,
			status: status,
			date: displayDate,
			rawDate: rawDate,
			isPaid: Boolean(booking.isPaid),
			amount: Number(booking.price) || 0,
		}
	}

	const filteredBookings = displayBookings.filter((booking) => {
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

		// Improved date filtering logic
		let matchesDate = true
		if (dateFilter) {
			const formattedBookingDate = formatDateForComparison(
				booking.rawDate,
			)
			const formattedFilterDate = formatDateForComparison(dateFilter)
			matchesDate = formattedBookingDate === formattedFilterDate
		}

		// Use orderStatus for filtering as that's what we're displaying
		const matchesStatus =
			!statusFilter || booking.orderStatus === statusFilter

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
					</Flex>

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
							<option value="processing">Processing</option>
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
														<Badge
															px={2}
															py={1}
															rounded="md"
															fontSize="sm"
															fontWeight="medium"
															colorScheme={
																booking.orderStatus ===
																'delivered'
																	? 'green'
																	: booking.orderStatus ===
																		  'in_transit'
																		? 'blue'
																		: booking.orderStatus ===
																			  'cancelled'
																			? 'red'
																			: 'yellow'
															}
															textTransform="capitalize"
														>
															{booking.orderStatus ===
															'in_transit'
																? 'In Transit'
																: booking.orderStatus
																		?.charAt(
																			0,
																		)
																		.toUpperCase() +
																	(booking.orderStatus?.slice(
																		1,
																	) || '')}
														</Badge>
													</Td>
													<Td>${booking.amount}</Td>
													<Td>
														<Badge
															px={2}
															py={1}
															rounded="md"
															fontSize="sm"
															fontWeight="medium"
															colorScheme={
																booking.isPaid
																	? 'green'
																	: 'red'
															}
														>
															{booking.isPaid
																? 'Paid'
																: 'Unpaid'}
														</Badge>
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
