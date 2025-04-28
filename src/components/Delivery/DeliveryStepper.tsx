import React, {
	FunctionComponent,
	ReactElement,
	useEffect,
	useState,
} from 'react'
import { Box } from '@chakra-ui/react'
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
	const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)

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

	// Log the current store data whenever it changes (for debugging)
	useEffect(() => {
		console.log('Form store data updated:', storeData)
	}, [storeData])

	// Handle vehicle selection
	const handleVehicleSelect = (vehicleType: string) => {
		setSelectedVehicle(vehicleType)
	}

	// Handle timing selection
	const handleTimingSelect = (timing: {
		type: string
		date?: string
		time?: string
		isValid?: boolean
	}) => {
		console.log('DeliveryStepper received timing:', timing)

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
	}

	// Get the display name for the selected vehicle
	const getVehicleDisplayName = (): string => {
		if (!selectedVehicle) return '-'
		return VEHICLE_NAMES[selectedVehicle] || selectedVehicle
	}

	// Get the display name for the selected timing
	const getTimingDisplayName = (): string => {
		// Get timing from Zustand store
		const storeData = useDeliveryFormStore.getState()
		return storeData.deliveryTiming.timeWindow || '-'
	}

	// Get total price for the current selection
	const getTotalPrice = (): string => {
		if (currentStep < 3 || !selectedTiming) return '-'

		const basePrice = calculatePrice()
		let totalPrice = basePrice

		if (selectedTiming.type === 'same-day') {
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
		const vehicleType = selectedVehicle || 'car'
		const vehiclePriceKey = `VITE_VEHICLE_PRICE_${vehicleType.toUpperCase().replace(/-/g, '_')}`
		const vehiclePrice = import.meta.env[vehiclePriceKey]
			? parseFloat(import.meta.env[vehiclePriceKey] as string)
			: 1 // Default vehicle price

		// Extract distance in miles
		const distanceInMiles =
			parseFloat(routeDistance.displayValue.split(' ')[0]) || 0

		// Calculate price: base * distance + vehicle price
		return basePrice * distanceInMiles + vehiclePrice
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
					selectedVehicle as keyof typeof VEHICLE_CAPACITY
				] || 0

			if (data.totalWeight > vehicleCapacity) {
				// Suggest next larger vehicle
				let suggestedVehicle = 'suv'
				if (selectedVehicle === 'car') {
					suggestedVehicle = 'suv'
				} else if (selectedVehicle === 'suv') {
					suggestedVehicle = 'pickup-truck'
				} else if (selectedVehicle === 'pickup-truck') {
					suggestedVehicle = 'cargo-van'
				} else {
					suggestedVehicle = 'sprinter-van'
				}

				setCapacityWarning(
					`The total weight (${data.totalWeight.toFixed(1)} lbs) exceeds the ${selectedVehicle} capacity of ${vehicleCapacity} lbs. Please consider upgrading to a ${suggestedVehicle}.`,
				)
			} else {
				setCapacityWarning(null)
			}
		} else {
			setCapacityWarning(null)
		}
	}

	// Handle Next button click - saves data to store
	const handleNextClick = () => {
		if (currentStep === 6 && !currentUser) {
			setAuthModalOpen(true)
			return
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

			// Save to store and proceed
			storeObj.setDeliveryTiming(
				selectedTiming.date || '',
				selectedTiming.type === 'scheduled'
					? `Scheduled (${selectedTiming.date} at ${selectedTiming.time})`
					: selectedTiming.type === 'rush'
						? 'Rush'
						: 'Same Day',
				isValid,
			)
			nextStep({
				date: selectedTiming.date || '',
				timeWindow: selectedTiming.type,
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
			// For Step 6 (Review), just proceed
			nextStep()
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
		console.log('Current step:', currentStep)
		console.log('Selected timing type:', selectedTimingType)
		console.log('Scheduled date:', scheduledDate)
		console.log('Scheduled time:', scheduledTime)

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
					console.log('Scheduled validation check:', {
						hasDate: Boolean(scheduledDate),
						hasTime: Boolean(scheduledTime),
						valid,
					})
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
	console.log('isNextButtonDisabled', isNextButtonDisabled())

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
						selectedVehicle={selectedVehicle}
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
					isNextDisabled={isNextButtonDisabled()}
					vehicle={getVehicleDisplayName()}
					timing={getTimingDisplayName()}
					total={getTotalPrice()}
				/>
				<AuthModal
					isOpen={isAuthModalOpen}
					onClose={() => setAuthModalOpen(false)}
				/>
			</Box>
		</Box>
	)
}
