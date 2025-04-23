import React, {
	FunctionComponent,
	ReactElement,
	useEffect,
	useState,
} from 'react'
import { Box, Text } from '@chakra-ui/react'
import { MapComponentRef } from '../Map/MapComponent'

// Import hooks
import { useAddressSelection } from './hooks/useAddressSelection'
import { useStepperNavigation } from './hooks/useStepperNavigation'
import { useDeliveryFormStore } from '../../stores/deliveryFormStore'

// Import components
import { StepperHeader } from './components/StepperHeader'
import { StepperNav } from './components/StepperNav'
import { StepperFooter } from './components/StepperFooter'
import { StopsList } from './components/StopsList'
import { VehicleSelection } from './components/VehicleSelection'

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
	const { currentStep, headerContent, nextStep, prevStep, resetStepperForm } =
		useStepperNavigation()

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

	// Get the saved form data from the Zustand store
	const storeData = useDeliveryFormStore((state) => ({
		savedStops: state.stops,
		savedAddresses: state.selectedAddresses,
		savedDistance: state.routeDistance,
		vehicleType: state.vehicleType,
	}))

	// Set the selected vehicle from store when component loads
	useEffect(() => {
		if (storeData.vehicleType) {
			setSelectedVehicle(storeData.vehicleType)
		}
	}, [storeData.vehicleType])

	// Log the current store data whenever it changes (for debugging)
	useEffect(() => {
		console.log('Form store data updated:', storeData)
	}, [storeData])

	// Handle vehicle selection
	const handleVehicleSelect = (vehicleType: string) => {
		setSelectedVehicle(vehicleType)
	}

	// Get the display name for the selected vehicle
	const getVehicleDisplayName = (): string => {
		if (!selectedVehicle) return '-'
		return VEHICLE_NAMES[selectedVehicle] || selectedVehicle
	}

	// Handle Next button click - saves data to store
	const handleNextClick = () => {
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
		} else {
			// For other steps, just navigate without saving for now
			// In a real app, you would collect and save the form data from each step
			nextStep()
		}
	}

	// Handle Reset button click
	const handleResetClick = () => {
		resetForm()
		resetStepperForm()
		setSelectedVehicle(null)
	}

	// Check if Next button should be disabled
	const isNextButtonDisabled = () => {
		if (currentStep === 1) {
			// Disable Next if no origin and destination
			return !selectedAddresses[0] || !selectedAddresses[stops.length - 1]
		} else if (currentStep === 2) {
			// Disable Next if no vehicle selected
			return !selectedVehicle
		}
		return false
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
						selectedVehicle={selectedVehicle}
					/>
				)
			case 3:
				return (
					<Box mb={8}>
						<Text color={themeColors.text}>
							Timing selection options will appear here
						</Text>
					</Box>
				)
			case 4:
				return (
					<Box mb={8}>
						<Text color={themeColors.text}>
							Order details will appear here
						</Text>
					</Box>
				)
			case 5:
				return (
					<Box mb={8}>
						<Text color={themeColors.text}>
							Additional information fields will appear here
						</Text>
					</Box>
				)
			case 6:
				return (
					<Box mb={8}>
						<Text color={themeColors.text}>
							Review summary will appear here
						</Text>
					</Box>
				)
			default:
				return null
		}
	}

	return (
		<Box
			position="absolute"
			top={0}
			left="0px"
			right={0}
			p={6}
			bg="white"
			borderRadius="md"
			boxShadow="md"
			maxWidth="600px"
			mx="auto"
			zIndex={100}
			minWidth="600px"
			minHeight="100%"
			display="flex"
			flexDirection="column"
			height="100vh"
		>
			{/* Header */}
			<StepperHeader
				title={headerContent.title}
				description={headerContent.description}
				errorMessage={routeError}
			/>

			{/* Navigation Steps */}
			<StepperNav currentStep={currentStep} />

			{/* Step Content - Scrollable */}
			<Box
				overflowY="auto"
				height="100%"
				my={2}
				pl={2}
				pr={2}
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

			{/* Daily Dedicated Routes section */}
			{/* <DailyRouteInfo /> */}

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
				/>
			</Box>
		</Box>
	)
}
