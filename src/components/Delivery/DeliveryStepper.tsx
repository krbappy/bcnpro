import React, { FunctionComponent, ReactElement } from 'react'
import { Box, Text, Flex } from '@chakra-ui/react'
import { MapComponentRef } from '../Map/MapComponent'

// Import hooks
import { useAddressSelection } from './hooks/useAddressSelection'
import { useStepperNavigation } from './hooks/useStepperNavigation'

// Import components
import { StepperHeader } from './components/StepperHeader'
import { StepperNav } from './components/StepperNav'
import { StepperFooter } from './components/StepperFooter'
import { StopsList } from './components/StopsList'

// Import theme
import { themeColors } from './theme'

// Special information section
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

interface DeliveryStepperProps {
	mapRef: React.RefObject<MapComponentRef>
	mapLoaded: boolean
}

export const DeliveryStepper: FunctionComponent<DeliveryStepperProps> = ({
	mapRef,
	mapLoaded,
}): ReactElement => {
	// Initialize hooks
	const { currentStep, headerContent, nextStep } = useStepperNavigation()

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
	} = useAddressSelection(mapRef, mapLoaded)

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
					<Box mb={8}>
						<Text color={themeColors.text}>
							Vehicle selection options will appear here
						</Text>
					</Box>
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
		>
			{/* Header */}
			<StepperHeader
				title={headerContent.title}
				description={headerContent.description}
				errorMessage={routeError}
			/>

			{/* Navigation Steps */}
			<StepperNav currentStep={currentStep} />

			{/* Step Content */}
			{renderStepContent()}

			{/* Daily Dedicated Routes section */}
			<DailyRouteInfo />

			{/* Footer */}
			<StepperFooter
				onReset={resetForm}
				onNext={nextStep}
				isLastStep={currentStep === 6}
			/>
		</Box>
	)
}
