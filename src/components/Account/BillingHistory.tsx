import { useState, useEffect } from 'react'
import {
	Box,
	Heading,
	Text,
	Spinner,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Badge,
	useToast,
	Alert,
	AlertIcon,
} from '@chakra-ui/react'
import { useAuth } from '../../context/AuthContext'

interface PaymentIntent {
	id: string
	amount: number
	created: number
	status: string
	description: string
	payment_method: string
	currency: string
	customer: string
	metadata: {
		bookingId: string
		userId: string
	}
}

interface BookingPayment {
	_id: string
	paymentIntentId: string
	price: number
	paymentStatus: string
	orderStatus: string
	createdAt: string
	paidAt: string
	paymentMethodId: string
	currency: string
	routeDistance?: {
		meters: number
		displayValue: string
	}
}

interface PaymentTransaction {
	id: string
	amount: number
	status: string
	date: string
	description: string
	paymentMethod?: {
		brand: string
		last4: string
	}
	bookingId?: string
	distance?: string
}

interface PaymentHistoryResponse {
	paymentIntents: PaymentIntent[]
	bookingPayments: BookingPayment[]
}

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'

export default function BillingHistory() {
	const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const { currentUser } = useAuth()
	const toast = useToast()

	useEffect(() => {
		if (currentUser) {
			fetchTransactions()
		}
	}, [currentUser])

	const fetchTransactions = async () => {
		if (!currentUser) return

		try {
			setIsLoading(true)
			const token = await currentUser.getIdToken()

			const response = await fetch(`${BASE_URL}/api/payments/history`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			})

			if (!response.ok) {
				throw new Error('Failed to fetch transaction history')
			}

			const data: PaymentHistoryResponse = await response.json()

			// Process the payment data
			const processedTransactions = processPaymentData(data)
			setTransactions(processedTransactions)
		} catch (error) {
			console.error('Error fetching transactions:', error)
			toast({
				title: 'Error',
				description:
					error instanceof Error
						? error.message
						: 'An unexpected error occurred',
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
		} finally {
			setIsLoading(false)
		}
	}

	// Process payment data from API response
	const processPaymentData = (
		data: PaymentHistoryResponse,
	): PaymentTransaction[] => {
		if (!data.paymentIntents || !data.bookingPayments) {
			return []
		}

		// Map all payment intents to our transaction format
		return data.paymentIntents.map((intent) => {
			// Find the matching booking payment for additional details
			const bookingPayment = data.bookingPayments.find(
				(booking) => booking.paymentIntentId === intent.id,
			)

			// Extract booking details from the description
			// Format: "Booking ID: 68207d76b23ac1479b55d59f - Delivery booking - suv vehicle, [object Object] miles"
			let vehicleType = 'vehicle'
			const descriptionMatch =
				intent.description?.match(/- (\w+(-\w+)?) vehicle/) || []
			if (descriptionMatch.length > 1) {
				vehicleType = descriptionMatch[1]
			}

			// Create a clean description that doesn't have [object Object]
			const cleanDescription = `Delivery booking - ${vehicleType} vehicle`
			console.log(bookingPayment?.routeDistance?.displayValue)

			return {
				id: intent.id,
				amount: intent.amount,
				status: intent.status,
				date:
					bookingPayment?.paidAt ||
					new Date(intent.created * 1000).toISOString(),
				description: cleanDescription,
				paymentMethod: {
					brand: 'card', // Default as API doesn't provide brand details directly
					last4: intent.payment_method.slice(-4), // Use last 4 chars of payment method ID
				},
				bookingId: intent.metadata?.bookingId || bookingPayment?._id,
				distance: bookingPayment?.routeDistance?.displayValue,
			}
		})
	}

	// Helper function to format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount / 100)
	}

	// Helper function to format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		})
	}

	if (isLoading) {
		return (
			<Box textAlign="center" py={6}>
				<Spinner size="xl" color="orange.500" />
			</Box>
		)
	}

	if (transactions.length === 0) {
		return (
			<Box>
				<Heading size="md" mb={6}>
					Billing History
				</Heading>
				<Alert status="info" borderRadius="md">
					<AlertIcon />
					You don&apos;t have any billing transactions yet.
				</Alert>
			</Box>
		)
	}

	return (
		<Box>
			<Heading size="md" mb={6}>
				Billing History
			</Heading>
			<Box overflowX="auto">
				<Table variant="simple">
					<Thead>
						<Tr>
							<Th>Date</Th>
							<Th>Description</Th>
							<Th>Distance</Th>
							<Th>Amount</Th>
							<Th>Status</Th>
						</Tr>
					</Thead>
					<Tbody>
						{transactions.map((transaction) => (
							<Tr key={transaction.id}>
								<Td>{formatDate(transaction.date)}</Td>
								<Td>
									{transaction.description}
									{transaction.bookingId && (
										<Text
											fontSize="xs"
											color="gray.500"
											mt={1}
										>
											Booking ID: {transaction.bookingId}
										</Text>
									)}
								</Td>
								<Td>{transaction.distance || '-'}</Td>
								<Td>{formatCurrency(transaction.amount)}</Td>
								<Td>
									<Badge
										colorScheme={
											transaction.status === 'succeeded'
												? 'green'
												: transaction.status ===
													  'pending'
													? 'yellow'
													: 'red'
										}
									>
										{transaction.status
											.charAt(0)
											.toUpperCase() +
											transaction.status.slice(1)}
									</Badge>
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</Box>
		</Box>
	)
}
