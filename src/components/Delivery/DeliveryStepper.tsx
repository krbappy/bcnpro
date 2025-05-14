import React, {
	FunctionComponent,
	ReactElement,
	useEffect,
	useState,
} from 'react'
import { Box, useToast, useDisclosure } from '@chakra-ui/react'
import { MapComponentRef } from '../Map/MapComponent'

// Import hooks
import { useAddressSelection } from './hooks/useAddressSelection'
import { useStepperNavigation } from './hooks/useStepperNavigation'
import { useDeliveryFormStore, Order } from '../../stores/deliveryFormStore'
import { AuthModal } from '../AuthModal'
import { useAuth } from '../../context/AuthContext'

// Import components
import { StepperHeader } from './components/StepperHeader'
import { StepperNav } from './components/StepperNav'
import { StepperFooter } from './components/StepperFooter'
import { StopsList } from './components/StopsList'
import { VehicleSelection } from './components/VehicleSelection'
import { TimingSelection } from './components/TimingSelection'
import { OrdersSelection } from './components/OrdersSelection'
import { InfoForm } from './components/InfoForm'
import { ReviewForm } from './components/ReviewForm'
import { AddPaymentMethodModal } from '../../components/Account/PaymentMethods'

// Import theme
import { themeColors } from './theme'

// Special information section
// Commenting out but keeping component definition in case we need to use it later
/* 
const DailyRouteInfo = () => (
	<Box
		p={6}
		borderWidth="1px"
		borderRadius="md"
		borderColor={themeColors.lightGray}
		mb={6}
	>
		<Flex justify="space-between" align="center">
			<Box>
				<Text fontSize="xl" fontWeight="bold" color={themeColors.text}>
					Daily Dedicated Routes
				</Text>
				<Text fontSize="md" color={themeColors.gray}>
					Daily or recurring service. Short notice, ZERO long-term
					commitment.
				</Text>
			</Box>
			<Box
				as="svg"
				viewBox="0 0 24 24"
				boxSize={6}
				color={themeColors.gray}
			>
				<path fill="currentColor" d="M9 18l6-6-6-6" />
			</Box>
		</Flex>
	</Box>
)
*/

interface DeliveryStepperProps {
	mapRef: React.RefObject<MapComponentRef>
	mapLoaded: boolean
}

// Vehicle data mapping for display
const VEHICLE_NAMES: Record<string, string> = {
	car: 'Car',
	suv: 'SUV',
	'cargo-van': 'Cargo Van',
	'pickup-truck': 'Pickup Truck',
	'rack-vehicle': 'Rack Vehicle',
	'sprinter-van': 'Sprinter Van',
	'vehicle-with-hitch': 'Vehicle w/ Hitch',
	'box-truck': 'Box Truck',
	'box-truck-liftgate': 'BT w/ Liftgate',
	'open-deck': "20' Open Deck",
	'hotshot-trailer': 'Hotshot Trailer',
	flatbed: "48'-53' Flatbed",
}

// Define the missing interface
interface AdditionalVehicleInfo {
	truckSize?: string
	requiresLiftgate?: boolean
	requiresPalletJack?: boolean
}

export const DeliveryStepper: FunctionComponent<DeliveryStepperProps> = ({
	mapRef,
	mapLoaded,
}): ReactElement => {
	// Initialize hooks
	const {
		currentStep,
		headerContent,
		nextStep,
		prevStep,
		resetStepperForm,
		goToStep,
	} = useStepperNavigation()

	const toast = useToast()

	const {
		stops,
		routeError,
		addStop,
		removeStop,
		resetForm,
		handleAddressSelect,
		enableMapPickingMode,
		cancelMapPickingMode,
		isMapPickingMode,
		activeAddressIndex,
		selectedAddresses,
		routeDistance,
	} = useAddressSelection(mapRef, mapLoaded)

	// State for vehicle selection
	const [selectedVehicle, setSelectedVehicle] = useState<{
		type: string
		additionalInfo?: string
	} | null>(null)

	// State for timing selection
	const [selectedTiming, setSelectedTiming] = useState<{
		type: string
		date?: string
		time?: string
		isValid?: boolean
	} | null>(null)

	// Add a direct selectedTimingType state
	const [selectedTimingType, setSelectedTimingType] = useState<string>('rush')
	const [scheduledDate, setScheduledDate] = useState<string>('')
	const [scheduledTime, setScheduledTime] = useState<string>('')

	// State for vehicle capacity warning
	const [capacityWarning, setCapacityWarning] = useState<string | null>(null)

	// State for info step validation
	const [isInfoValid, setIsInfoValid] = useState<boolean>(false)

	// Auth modal state
	const [isAuthModalOpen, setAuthModalOpen] = useState(false)
	const { currentUser } = useAuth()

	// Payment method modal state
	const {
		isOpen: isPaymentMethodModalOpen,
		onOpen: onPaymentMethodModalOpen,
		onClose: onPaymentMethodModalClose,
	} = useDisclosure()
	const [hasPaymentMethod, setHasPaymentMethod] = useState<boolean>(false)
	const [isProcessingPayment, setIsProcessingPayment] =
		useState<boolean>(false)

	// Get the saved form data from the Zustand store
	const storeData = useDeliveryFormStore((state) => ({
		savedStops: state.stops,
		savedAddresses: state.selectedAddresses,
		savedDistance: state.routeDistance,
		vehicleType: state.vehicleType,
		deliveryTiming: state.deliveryTiming,
		orders: state.orders,
		totalWeight: state.totalWeight,
		contactInfo: state.contactInfo,
	}))

	// State for orders - initialize from the store if available
	const [ordersData, setOrdersData] = useState<{
		totalWeight: number
		orders: Order[]
	}>({
		totalWeight:
			storeData.orders.length > 0
				? parseFloat(storeData.totalWeight) || 0
				: 0,
		orders: storeData.orders.length > 0 ? storeData.orders : [],
	})

	// Set the selected vehicle from store when component loads
	useEffect(() => {
		if (storeData.vehicleType) {
			setSelectedVehicle(storeData.vehicleType)
		}
		if (
			storeData.deliveryTiming?.date ||
			storeData.deliveryTiming?.timeWindow
		) {
			setSelectedTiming({
				type: storeData.deliveryTiming.date || 'rush',
				date: storeData.deliveryTiming.date || undefined,
				time: storeData.deliveryTiming.timeWindow || undefined,
				isValid: true,
			})
		}
	}, [storeData.vehicleType, storeData.deliveryTiming])

	// Fetch payment methods on component mount and when user changes
	useEffect(() => {
		if (currentUser) {
			checkPaymentMethod()
		}
	}, [currentUser])

	// Check if user has a payment method
	const checkPaymentMethod = async () => {
		if (!currentUser) return false

		try {
			const token = await currentUser.getIdToken()

			const response = await fetch(
				`${import.meta.env.VITE_BASE_URL}/api/payments/check-payment-method`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				},
			)

			if (!response.ok) {
				setHasPaymentMethod(false)
				return false
			}

			const data = await response.json()
			const hasValidPayment =
				data.hasPaymentMethod || data.teamPaymentAvailable
			setHasPaymentMethod(hasValidPayment)

			// If payment method exists, show a toast with the details

			return data
		} catch (error) {
			console.error('Error checking payment methods:', error)
			setHasPaymentMethod(false)
			return false
		}
	}

	// Handle vehicle selection
	const handleVehicleSelect = (
		vehicleType: string,
		additionalInfo?: AdditionalVehicleInfo,
	) => {
		setSelectedVehicle({
			type: vehicleType,
			additionalInfo: additionalInfo
				? JSON.stringify(additionalInfo)
				: undefined,
		})
	}

	// Handle timing selection
	const handleTimingSelect = (timing: {
		type: string
		date?: string
		time?: string
		isValid?: boolean
	}) => {
		// Update the individual pieces of state
		setSelectedTimingType(timing.type)
		setScheduledDate(timing.date || '')
		setScheduledTime(timing.time || '')

		// Also update the combined state for backward compatibility
		setSelectedTiming({
			type: timing.type,
			date: timing.date || '',
			time: timing.time || '',
			isValid: timing.isValid !== false,
		})

		// Immediately update the store to ensure footer reflects the selection
		const storeObj = useDeliveryFormStore.getState()
		const timeWindowDisplay =
			timing.type === 'scheduled'
				? `Scheduled`
				: timing.type === 'rush'
					? 'FastTrak'
					: 'Same Day'

		storeObj.setDeliveryTiming(
			timing.date || '',
			timeWindowDisplay,
			timing.isValid !== false,
		)
	}

	// Get the display name for the selected vehicle
	const getVehicleDisplayName = (): string => {
		if (!selectedVehicle) return '-'

		// Just show the basic vehicle type without additional info
		const vehicleType = selectedVehicle.type
		return VEHICLE_NAMES[vehicleType] || vehicleType
	}

	// Get the display name for the selected timing
	const getTimingDisplayName = (): string => {
		// Get timing from Zustand store
		const storeData = useDeliveryFormStore.getState()
		// Format the timing display to ensure consistency
		const timeWindow = storeData.deliveryTiming.timeWindow || '-'

		if (timeWindow === 'Rush') {
			return 'FastTrak'
		} else if (timeWindow === 'rush') {
			return 'FastTrak'
		}

		return timeWindow
	}

	// Get total price for the current selection
	const getTotalPrice = (): string => {
		if (currentStep < 3) return '-'

		const basePrice = calculatePrice()
		let totalPrice = basePrice

		// Get the selected timing type from the store
		const storeData = useDeliveryFormStore.getState()
		const storeTimingWindow = storeData.deliveryTiming.timeWindow || ''

		// Apply discount if Same Day is selected - check both local state and store
		if (
			selectedTiming?.type === 'same-day' ||
			storeTimingWindow === 'Same Day'
		) {
			totalPrice = basePrice * 0.9 // 10% discount
		}

		return `$${totalPrice.toFixed(2)}`
	}

	// Calculate the price based on distance and vehicle
	const calculatePrice = (): number => {
		// Get base price from env or use default
		const basePrice = import.meta.env.VITE_BASE_PRICE
			? parseFloat(import.meta.env.VITE_BASE_PRICE as string)
			: 5 // Default base price

		// Get vehicle-specific price from env
		const vehicleType = selectedVehicle?.type || 'car'
		const vehiclePriceKey = `VITE_VEHICLE_PRICE_${vehicleType.toUpperCase().replace(/-/g, '_')}`

		// Extract distance in miles
		const distanceInMiles =
			parseFloat(routeDistance.displayValue.split(' ')[0]) || 0

		// Calculate price: base * distance + vehicle price
		return (
			basePrice * distanceInMiles +
			(import.meta.env[vehiclePriceKey]
				? parseFloat(import.meta.env[vehiclePriceKey] as string)
				: 1)
		) // Default vehicle price
	}

	// Handle orders data changes
	const handleOrdersDataChange = (data: {
		totalWeight: number
		orders: Order[]
	}) => {
		setOrdersData(data)

		// Check if the weight exceeds vehicle capacity
		if (selectedVehicle && data.totalWeight > 0) {
			// Vehicle capacity constants (in lbs)
			const VEHICLE_CAPACITY = {
				car: 300,
				suv: 750,
				'cargo-van': 3000,
				'pickup-truck': 1500,
				'rack-vehicle': 1200,
				'sprinter-van': 3500,
				'vehicle-with-hitch': 2000,
				'box-truck': 5000,
				'box-truck-liftgate': 5000,
				'open-deck': 10000,
				'hotshot-trailer': 15000,
				flatbed: 40000,
			}

			const vehicleCapacity =
				VEHICLE_CAPACITY[
					selectedVehicle.type as keyof typeof VEHICLE_CAPACITY
				] || 0

			if (data.totalWeight > vehicleCapacity) {
				// Suggest next larger vehicle
				let suggestedVehicle = 'suv'
				if (selectedVehicle.type === 'car') {
					suggestedVehicle = 'suv'
				} else if (selectedVehicle.type === 'suv') {
					suggestedVehicle = 'pickup-truck'
				} else if (selectedVehicle.type === 'pickup-truck') {
					suggestedVehicle = 'cargo-van'
				} else {
					suggestedVehicle = 'sprinter-van'
				}

				setCapacityWarning(
					`The total weight (${data.totalWeight.toFixed(1)} lbs) exceeds the ${selectedVehicle.type} capacity of ${vehicleCapacity} lbs. Please consider upgrading to a ${suggestedVehicle}.`,
				)
			} else {
				setCapacityWarning(null)
			}
		} else {
			setCapacityWarning(null)
		}
	}

	// Handle Next button click - saves data to store
	const handleNextClick = async () => {
		if (currentStep === 6 && !currentUser) {
			setAuthModalOpen(true)
			return
		}

		// If user is logged in and on the review step, check for payment method
		if (currentStep === 6 && currentUser) {
			// Check payment method before proceeding
			await checkPaymentMethod()

			if (!hasPaymentMethod) {
				onPaymentMethodModalOpen()
				return
			}
		}

		if (currentStep === 1) {
			// For Step 1 (Stops), save the stops, addresses and route distance
			nextStep({
				stops,
				selectedAddresses,
				routeDistance,
			})
		} else if (currentStep === 2 && selectedVehicle) {
			// For Step 2 (Vehicle), save the selected vehicle type
			const storeObj = useDeliveryFormStore.getState()
			storeObj.setVehicleType(selectedVehicle)

			nextStep({
				vehicleType: selectedVehicle,
			})
		} else if (currentStep === 3 && selectedTiming) {
			// For Step 3 (Timing), save the selected timing
			const storeObj = useDeliveryFormStore.getState()
			const isValid =
				selectedTiming.type !== 'scheduled' ||
				(Boolean(selectedTiming.date) && Boolean(selectedTiming.time))

			// Only proceed if the timing selection is valid
			if (!isValid) {
				alert('Please complete all required timing fields')
				return
			}

			// The timeWindow and date are already set in the store by handleTimingSelect
			// Just use the existing value instead of recalculating it
			const currentTimingWindow = storeObj.deliveryTiming.timeWindow || ''

			// Pass the existing date and timeWindow to nextStep to prevent overriding
			nextStep({
				date: storeObj.deliveryTiming.date || '',
				timeWindow: currentTimingWindow,
			})
		} else if (currentStep === 4) {
			// For Step 4 (Orders), check if there's a capacity warning
			if (capacityWarning) {
				alert(
					'Please adjust your order or change your vehicle type to continue.',
				)
				return
			}

			// Save order data to the store
			const storeObj = useDeliveryFormStore.getState()
			storeObj.setOrders(ordersData.orders)
			storeObj.setTotalWeight(ordersData.totalWeight.toString())

			nextStep({
				weight: ordersData.totalWeight.toString(),
				size: ordersData.orders.length.toString(),
			})
		} else if (currentStep === 5) {
			// For Step 5 (Info), validate contact information
			if (!isInfoValid) {
				alert(
					'Please provide required contact information for all stops',
				)
				return
			}

			// Contact info is already saved in the store by the InfoForm component
			nextStep({
				info: 'Contact information completed',
			})
		} else if (currentStep === 6) {
			// For Step 6 (Review), submit the booking
			try {
				setIsProcessingPayment(true)
				const storeObj = useDeliveryFormStore.getState()

				// Calculate the final price
				const totalPrice = calculatePrice()

				// First, get the MongoDB user ID using Firebase UID
				const userResponse = await fetch(
					`${import.meta.env.VITE_BASE_URL}/api/users/${currentUser?.email}`,
					{
						headers: {
							Authorization: `Bearer ${await currentUser?.getIdToken()}`,
						},
					},
				)

				if (!userResponse.ok) {
					throw new Error('Failed to fetch user information')
				}

				const bookingData = {
					stops: storeObj.stops,
					selectedAddresses: Object.fromEntries(
						Object.entries(storeObj.selectedAddresses).map(
							([key, value]) => [
								key,
								{
									street: value.place_name,
									city: '',
									state: '',
									zipCode: '',
									country: '',
									coordinates: value.center,
								},
							],
						),
					),
					routeDistance: storeObj.routeDistance,
					vehicleType: storeObj.vehicleType,
					deliveryTiming: storeObj.deliveryTiming,
					orderDetails: storeObj.orderDetails,
					orders: storeObj.orders,
					totalWeight: storeObj.totalWeight,
					additionalInfo: storeObj.additionalInfo,
					contactInfo: storeObj.contactInfo,
					totalAmount: totalPrice,
					paymentStatus: 'pending',
				}
				const bookingDataWithUser = {
					firebaseUid: currentUser?.uid,
					...bookingData,
				}

				// Create the booking first
				const bookingResponse = await fetch(
					`${import.meta.env.VITE_BASE_URL}/api/bookings`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${await currentUser?.getIdToken()}`,
						},
						body: JSON.stringify(bookingDataWithUser),
					},
				)

				if (!bookingResponse.ok) {
					throw new Error('Failed to create booking')
				}

				// Get the booking ID from the response
				const bookingResult = await bookingResponse.json()
				const bookingId = bookingResult.id || bookingResult._id

				// Now process the payment with the booking ID
				try {
					const token = await currentUser?.getIdToken()

					// Get payment method details
					const paymentMethodData = await checkPaymentMethod()
					if (
						!paymentMethodData ||
						(!paymentMethodData.hasPaymentMethod &&
							!paymentMethodData.teamPaymentAvailable)
					) {
						throw new Error('No payment methods available')
					}

					// Now create the payment using the payment method from the check response
					const paymentResponse = await fetch(
						`${import.meta.env.VITE_BASE_URL}/api/payments/charge`,
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`,
							},
							body: JSON.stringify({
								bookingId: bookingId,
								amount: Math.round(totalPrice * 100), // Convert to cents for Stripe
								currency: 'usd',
								description: `Delivery booking - ${typeof storeObj.vehicleType === 'string' ? storeObj.vehicleType : storeObj.vehicleType?.type || 'unknown'} vehicle, ${storeObj.routeDistance.displayValue} miles`,
							}),
						},
					)

					if (!paymentResponse.ok) {
						const errorData = await paymentResponse.json()
						throw new Error(
							errorData.message || 'Failed to process payment',
						)
					}

					// Update booking payment status
					const updateResponse = await fetch(
						`${import.meta.env.VITE_BASE_URL}/api/bookings/${bookingId}/payment-status`,
						{
							method: 'PATCH',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`,
							},
							body: JSON.stringify({ status: 'paid' }),
						},
					)

					if (!updateResponse.ok) {
						console.warn('Failed to update booking payment status')
					}
				} catch (error) {
					console.error('Payment error:', error)
					toast({
						title: 'Payment Failed',
						description:
							error instanceof Error
								? error.message
								: 'Failed to process payment',
						status: 'error',
						duration: 5000,
						isClosable: true,
					})
					setIsProcessingPayment(false)
					return
				}

				// Reset form and show success message
				handleResetClick()
				toast({
					title: 'Booking submitted successfully',
					description:
						'Your payment has been processed and delivery is booked.',
					status: 'success',
					duration: 5000,
					isClosable: true,
				})
			} catch (error) {
				console.error('Error submitting booking:', error)
				toast({
					title: 'Failed to submit booking',
					description:
						error instanceof Error
							? error.message
							: 'An error occurred',
					status: 'error',
					duration: 5000,
					isClosable: true,
				})
			} finally {
				setIsProcessingPayment(false)
			}
		} else {
			// For other steps, just navigate without saving for now
			nextStep()
		}
	}

	// Handle Reset button click
	const handleResetClick = () => {
		resetForm()
		resetStepperForm()
		setSelectedVehicle(null)
		setSelectedTiming(null)
	}

	// Check if Next button should be disabled
	const isNextButtonDisabled = () => {
		// For debugging

		switch (currentStep) {
			case 1:
				// Address step - require both stops to be selected
				return Object.keys(selectedAddresses).length < 2 || !!routeError
			case 2:
				// Vehicle step - require vehicle selection
				return !selectedVehicle
			case 3:
				// Timing step - require valid timing selection
				if (selectedTimingType === 'scheduled') {
					// Both date and time are required for scheduled deliveries
					const valid =
						Boolean(scheduledDate) && Boolean(scheduledTime)

					return !valid
				}

				// For other types, just need a valid selection
				return !selectedTimingType
			case 4:
				// Orders step - require at least one valid order with item(s)
				// Also check if there's a capacity warning
				return (
					ordersData.orders.length === 0 ||
					!ordersData.orders.some(
						(order) => order.items && order.items.length > 0,
					) ||
					!!capacityWarning
				)
			case 5:
				// Info step - require contact info for all stops
				return !isInfoValid
			case 6:
				// Review step - always enable the Next button
				return false
			default:
				return false
		}
	}

	// Render appropriate content based on current step
	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<StopsList
						stops={stops}
						onAddStop={addStop}
						onRemoveStop={removeStop}
						onAddressSelect={handleAddressSelect}
						enableMapPickingMode={enableMapPickingMode}
						cancelMapPickingMode={cancelMapPickingMode}
						isMapPickingMode={isMapPickingMode}
						activeAddressIndex={activeAddressIndex}
						selectedAddresses={selectedAddresses}
					/>
				)
			case 2:
				return (
					<VehicleSelection
						onVehicleSelect={handleVehicleSelect}
						selectedVehicle={selectedVehicle?.type || null}
					/>
				)
			case 3:
				return (
					<TimingSelection
						routeDistance={routeDistance}
						onTimingSelect={handleTimingSelect}
					/>
				)
			case 4:
				return (
					<OrdersSelection
						onOrdersDataChange={handleOrdersDataChange}
					/>
				)
			case 5:
				return (
					<InfoForm
						onInfoChange={(isValid) => setIsInfoValid(isValid)}
					/>
				)
			case 6:
				return <ReviewForm onEditSection={handleEditSection} />
			default:
				return null
		}
	}

	// Handle editing a specific section
	const handleEditSection = (sectionIndex: number) => {
		// Navigate to the specified step
		if (sectionIndex >= 1 && sectionIndex <= 5) {
			// Use the goToStep function from the useStepperNavigation hook
			goToStep(sectionIndex)
		}
	}

	return (
		<Box
			position="absolute"
			top={0}
			left="0px"
			right={0}
			p={0}
			bg="white"
			borderRadius="md"
			boxShadow="md"
			maxWidth="600px"
			mx="auto"
			zIndex={100}
			minWidth="600px"
			height="100vh"
			display="flex"
			flexDirection="column"
		>
			{/* Header */}
			<Box p={6} pb={3}>
				<StepperHeader
					title={headerContent.title}
					description={headerContent.description}
					errorMessage={routeError}
				/>

				{/* Navigation Steps */}
				<StepperNav currentStep={currentStep} />
			</Box>

			{/* Step Content - Scrollable */}
			<Box
				overflowY="auto"
				height="100%"
				px={6}
				css={{
					'&::-webkit-scrollbar': {
						width: '4px',
					},
					'&::-webkit-scrollbar-track': {
						background: themeColors.lightGray,
					},
					'&::-webkit-scrollbar-thumb': {
						background: themeColors.gray,
						borderRadius: '2px',
					},
				}}
			>
				{renderStepContent()}
			</Box>

			{/* Footer - Fixed at bottom */}
			<Box mt="auto">
				<StepperFooter
					onReset={handleResetClick}
					onNext={handleNextClick}
					onBack={prevStep}
					isLastStep={currentStep === 6}
					currentStep={currentStep}
					distance={routeDistance.displayValue}
					isNextDisabled={
						isNextButtonDisabled() || isProcessingPayment
					}
					vehicle={getVehicleDisplayName()}
					timing={getTimingDisplayName()}
					total={getTotalPrice()}
				/>
				<AuthModal
					isOpen={isAuthModalOpen}
					onClose={() => setAuthModalOpen(false)}
				/>

				{/* Payment Method Modal */}
				<AddPaymentMethodModal
					isOpen={isPaymentMethodModalOpen}
					onClose={onPaymentMethodModalClose}
					onSuccess={() => {
						checkPaymentMethod()
						// If payment method was added, continue with booking
						setTimeout(() => {
							if (hasPaymentMethod) {
								handleNextClick()
							}
						}, 500)
					}}
				/>
			</Box>
		</Box>
	)
}
