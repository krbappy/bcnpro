import { useState, useEffect } from 'react'
import {
	Box,
	Button,
	Heading,
	VStack,
	Text,
	useToast,
	Card,
	CardBody,
	Flex,
	Icon,
	Divider,
	HStack,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Spinner,
} from '@chakra-ui/react'
import { FiCreditCard, FiPlus, FiTrash2, FiStar } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { loadStripe } from '@stripe/stripe-js'
import {
	Elements,
	PaymentElement,
	useStripe,
	useElements,
} from '@stripe/react-stripe-js'

// Initialize Stripe with your public key
const stripePromise = loadStripe(
	'pk_test_51RJejWRrx89HVRX8azXLTKFc0MDXS6N6svYPIWYV5Db4mxcQb8yvL3qMQsIOrnHCBwJWHbzULXZHN9vUefu6KDmA00K9dx7HlK',
)

// Base URL for API calls
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'

// Component for adding a new payment method
const AddPaymentMethodForm = ({ onSuccess }: { onSuccess: () => void }) => {
	const stripe = useStripe()
	const elements = useElements()
	const [isLoading, setIsLoading] = useState(false)
	const toast = useToast()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!stripe || !elements) {
			return
		}

		setIsLoading(true)

		try {
			const result = await stripe.confirmSetup({
				elements,
				confirmParams: {
					return_url: `${window.location.origin}/account`,
				},
				redirect: 'if_required',
			})

			if (result.error) {
				toast({
					title: 'Error',
					description: result.error.message,
					status: 'error',
					duration: 5000,
					isClosable: true,
				})
			} else {
				toast({
					title: 'Success',
					description: 'Payment method added successfully',
					status: 'success',
					duration: 3000,
					isClosable: true,
				})

				// Make sure we're not causing React errors by delaying the success callback
				setTimeout(() => {
					onSuccess()
				}, 100)
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to add payment method'
			toast({
				title: 'Error',
				description: errorMessage,
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Box as="form" onSubmit={handleSubmit} w="100%">
			<PaymentElement />
			<Button
				mt={4}
				colorScheme="orange"
				type="submit"
				isLoading={isLoading}
				isDisabled={!stripe || !elements || isLoading}
				w="100%"
			>
				Add Payment Method
			</Button>
		</Box>
	)
}

interface PaymentMethod {
	id: string
	card: {
		brand: string
		last4: string
		exp_month: number
		exp_year: number
	}
	isDefault?: boolean
}

// Exportable function to check if a user has payment methods
export const checkUserHasPaymentMethod = async (
	userId: string,
): Promise<boolean> => {
	if (!userId) return false

	try {
		const auth = await import('../../context/AuthContext').then((m) =>
			m.useAuth(),
		)
		const currentUser = auth.currentUser

		if (!currentUser) return false

		const token = await currentUser.getIdToken()

		const response = await fetch(
			`${BASE_URL}/api/payments/payment-methods`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			},
		)

		if (!response.ok) {
			return false
		}

		const data = await response.json()
		const methods = Array.isArray(data) ? data : data.paymentMethods || []

		return methods.length > 0
	} catch (error) {
		console.error('Error checking payment methods:', error)
		return false
	}
}

// Exportable function to charge a payment
export const chargePayment = async (
	amount: number,
	description: string,
): Promise<boolean> => {
	const auth = await import('../../context/AuthContext').then((m) =>
		m.useAuth(),
	)
	const currentUser = auth.currentUser

	if (!currentUser) return false

	try {
		const token = await currentUser.getIdToken()

		const response = await fetch(`${BASE_URL}/api/payments/charge`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				amount,
				description,
			}),
		})

		if (!response.ok) {
			const errorData = await response.json()
			throw new Error(errorData.message || 'Failed to process payment')
		}

		return true
	} catch (error) {
		console.error('Payment processing error:', error)
		throw error
	}
}

// Exportable component for payment method modal
export const AddPaymentMethodModal = ({
	isOpen,
	onClose,
	onSuccess,
}: {
	isOpen: boolean
	onClose: () => void
	onSuccess?: () => void
}) => {
	const { currentUser } = useAuth()
	const [setupIntent, setSetupIntent] = useState<{
		clientSecret: string
	} | null>(null)
	const toast = useToast()

	const createCustomer = async () => {
		if (!currentUser) return

		try {
			const token = await currentUser.getIdToken()

			const response = await fetch(
				`${BASE_URL}/api/payments/create-customer`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				},
			)

			if (!response.ok) {
				throw new Error('Failed to create customer')
			}

			return await response.json()
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to create customer'
			console.error(errorMessage)
		}
	}

	const getSetupIntent = async () => {
		if (!currentUser) return

		try {
			// First ensure we have a customer
			await createCustomer()

			const token = await currentUser.getIdToken()

			const response = await fetch(
				`${BASE_URL}/api/payments/setup-intent`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				},
			)

			if (!response.ok) {
				throw new Error('Failed to create setup intent')
			}

			const data = await response.json()
			setSetupIntent(data)
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to initialize payment form'
			toast({
				title: 'Error',
				description: errorMessage,
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
		}
	}

	const handleModalClose = () => {
		setSetupIntent(null)
		onClose()
	}

	const handleSuccess = () => {
		handleModalClose()
		if (onSuccess) {
			setTimeout(() => {
				onSuccess()
			}, 300)
		}
	}

	useEffect(() => {
		if (isOpen && currentUser) {
			getSetupIntent()
		}
	}, [isOpen, currentUser])

	return (
		<Modal isOpen={isOpen} onClose={handleModalClose} size="md">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Add Payment Method</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					{setupIntent ? (
						<Elements
							stripe={stripePromise}
							options={{
								clientSecret: setupIntent.clientSecret,
							}}
						>
							<AddPaymentMethodForm onSuccess={handleSuccess} />
						</Elements>
					) : (
						<Flex justify="center" py={10}>
							<Spinner size="xl" color="orange.500" />
						</Flex>
					)}
				</ModalBody>
				<ModalFooter>
					<Button variant="ghost" onClick={handleModalClose}>
						Cancel
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}

export default function PaymentMethods() {
	const { currentUser } = useAuth()
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [setupIntent, setSetupIntent] = useState<{
		clientSecret: string
	} | null>(null)
	const { isOpen, onOpen, onClose } = useDisclosure()
	const toast = useToast()

	const fetchPaymentMethods = async () => {
		if (!currentUser) return

		setIsLoading(true)
		try {
			const token = await currentUser.getIdToken()

			const response = await fetch(
				`${BASE_URL}/api/payments/payment-methods`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				},
			)

			if (!response.ok) {
				throw new Error('Failed to fetch payment methods')
			}

			const data = await response.json()
			// Handle both formats: array directly or {paymentMethods: [...]}
			const methods = Array.isArray(data)
				? data
				: data.paymentMethods || []
			setPaymentMethods(methods)
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to load payment methods'
			toast({
				title: 'Error',
				description: errorMessage,
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
			// Set empty array to avoid undefined errors
			setPaymentMethods([])
		} finally {
			setIsLoading(false)
		}
	}

	const handleAddPaymentMethod = () => {
		getSetupIntent()
		onOpen()
	}

	const createCustomer = async () => {
		if (!currentUser) return

		try {
			const token = await currentUser.getIdToken()

			const response = await fetch(
				`${BASE_URL}/api/payments/create-customer`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				},
			)

			if (!response.ok) {
				throw new Error('Failed to create customer')
			}

			return await response.json()
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to create customer'
			console.error(errorMessage)
			// We'll continue with the setup intent process and let it handle any errors
		}
	}

	const getSetupIntent = async () => {
		if (!currentUser) return

		try {
			// First ensure we have a customer
			await createCustomer()

			const token = await currentUser.getIdToken()

			const response = await fetch(
				`${BASE_URL}/api/payments/setup-intent`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				},
			)

			if (!response.ok) {
				throw new Error('Failed to create setup intent')
			}

			const data = await response.json()
			setSetupIntent(data)
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to initialize payment form'
			toast({
				title: 'Error',
				description: errorMessage,
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
		}
	}

	const handleSetDefaultPaymentMethod = async (id: string) => {
		if (!currentUser) return

		try {
			const token = await currentUser.getIdToken()

			const response = await fetch(
				`${BASE_URL}/api/payments/set-default-payment-method`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ paymentMethodId: id }),
				},
			)

			if (!response.ok) {
				throw new Error('Failed to set default payment method')
			}

			toast({
				title: 'Success',
				description: 'Default payment method updated',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})

			// Refresh payment methods
			fetchPaymentMethods()
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to set default payment method'
			toast({
				title: 'Error',
				description: errorMessage,
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
		}
	}

	const handleDeletePaymentMethod = async (id: string) => {
		if (!currentUser) return

		try {
			const token = await currentUser.getIdToken()

			const response = await fetch(
				`${BASE_URL}/api/payments/payment-methods/${id}`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				},
			)

			if (!response.ok) {
				throw new Error('Failed to delete payment method')
			}

			toast({
				title: 'Success',
				description: 'Payment method deleted',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})

			// Refresh payment methods
			fetchPaymentMethods()
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to delete payment method'
			toast({
				title: 'Error',
				description: errorMessage,
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
		}
	}

	const handleModalClose = () => {
		setSetupIntent(null)
		onClose()
		// Use setTimeout to ensure the modal is fully closed before fetching
		setTimeout(() => {
			fetchPaymentMethods()
		}, 300)
	}

	// Fetch payment methods on component mount
	useEffect(() => {
		if (currentUser) {
			fetchPaymentMethods()
		}
	}, [currentUser])

	if (isLoading && (!paymentMethods || paymentMethods.length === 0)) {
		return (
			<Flex justify="center" py={10}>
				<Spinner size="xl" color="orange.500" />
			</Flex>
		)
	}

	return (
		<Box>
			<Flex justifyContent="space-between" alignItems="center" mb={4}>
				<Heading size="md">Payment Methods</Heading>
				<Button
					leftIcon={<FiPlus />}
					colorScheme="orange"
					onClick={handleAddPaymentMethod}
				>
					Add Payment Method
				</Button>
			</Flex>

			<Divider mb={4} />

			<VStack spacing={4} align="stretch">
				{!paymentMethods || paymentMethods.length === 0 ? (
					<Card variant="outline">
						<CardBody>
							<Flex
								direction="column"
								align="center"
								justify="center"
								py={6}
							>
								<Icon
									as={FiCreditCard}
									boxSize={12}
									color="gray.400"
									mb={4}
								/>
								<Text mb={2} fontSize="lg" fontWeight="medium">
									No payment methods added
								</Text>
								<Text mb={4} color="gray.500">
									Add a payment method to easily pay for
									deliveries
								</Text>
								<Button
									leftIcon={<FiPlus />}
									colorScheme="orange"
									onClick={handleAddPaymentMethod}
								>
									Add Payment Method
								</Button>
							</Flex>
						</CardBody>
					</Card>
				) : (
					paymentMethods.map((method) => (
						<Card key={method.id} variant="outline">
							<CardBody>
								<Flex justify="space-between" align="center">
									<HStack spacing={4}>
										<Icon
											as={FiCreditCard}
											boxSize={6}
											color="gray.600"
										/>
										<Box>
											<Text fontWeight="medium">
												{method.card.brand
													.charAt(0)
													.toUpperCase() +
													method.card.brand.slice(
														1,
													)}{' '}
												•••• {method.card.last4}
											</Text>
											<Text
												fontSize="sm"
												color="gray.500"
											>
												Expires {method.card.exp_month}/
												{method.card.exp_year}
											</Text>
										</Box>
										{method.isDefault && (
											<Flex
												align="center"
												bg="green.100"
												px={2}
												py={1}
												borderRadius="md"
											>
												<Icon
													as={FiStar}
													color="green.500"
													mr={1}
												/>
												<Text
													fontSize="xs"
													color="green.700"
													fontWeight="medium"
												>
													Default
												</Text>
											</Flex>
										)}
									</HStack>

									<HStack>
										{!method.isDefault && (
											<Button
												size="sm"
												variant="ghost"
												leftIcon={<FiStar />}
												onClick={() =>
													handleSetDefaultPaymentMethod(
														method.id,
													)
												}
											>
												Set Default
											</Button>
										)}
										<Button
											size="sm"
											colorScheme="red"
											variant="ghost"
											leftIcon={<FiTrash2 />}
											onClick={() =>
												handleDeletePaymentMethod(
													method.id,
												)
											}
										>
											Remove
										</Button>
									</HStack>
								</Flex>
							</CardBody>
						</Card>
					))
				)}
			</VStack>

			{/* Add Payment Method Modal */}
			<Modal isOpen={isOpen} onClose={handleModalClose} size="md">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Add Payment Method</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						{setupIntent ? (
							<Elements
								stripe={stripePromise}
								options={{
									clientSecret: setupIntent.clientSecret,
								}}
							>
								<AddPaymentMethodForm
									onSuccess={handleModalClose}
								/>
							</Elements>
						) : (
							<Flex justify="center" py={10}>
								<Spinner size="xl" color="orange.500" />
							</Flex>
						)}
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" onClick={handleModalClose}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	)
}
