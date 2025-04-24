import { useState } from 'react'
import { useDeliveryFormStore } from '../../../stores/deliveryFormStore'
import { Address } from './useAddressSelection'

interface StepContent {
	title: string
	description: string
}

interface StopsData {
	stops: number[]
	selectedAddresses: Record<number, Address>
	routeDistance: {
		meters: number
		displayValue: string
	}
}

interface VehicleData {
	vehicleType: string
}

interface TimingData {
	date: string
	timeWindow: string
}

interface OrderData {
	weight: string
	size: string
}

interface InfoData {
	info: string
}

type StepData = StopsData | VehicleData | TimingData | OrderData | InfoData

export function useStepperNavigation() {
	const [currentStep, setCurrentStep] = useState<number>(1)
	const setStopsAndAddresses = useDeliveryFormStore(
		(state) => state.setStopsAndAddresses,
	)
	const setRouteDistance = useDeliveryFormStore(
		(state) => state.setRouteDistance,
	)
	const resetForm = useDeliveryFormStore((state) => state.resetForm)

	// Dynamic header content based on current step
	const getHeaderContent = (): StepContent => {
		switch (currentStep) {
			case 1:
				return {
					title: 'STOPS',
					description:
						'Please enter your origin and destination addresses.',
				}
			case 2:
				return {
					title: 'VEHICLE',
					description: 'Select the vehicle type for your delivery.',
				}
			case 3: {
				// Get the destination address from the store if available
				const addresses =
					useDeliveryFormStore.getState().selectedAddresses
				const stops = useDeliveryFormStore.getState().stops

				// Try to get destination address (last stop)
				const destAddress =
					addresses[stops.length - 1]?.place_name ||
					'3790 S Las Vegas Blvd'

				return {
					title: 'TIMING',
					description: `Choose when you would like us to arrive to ${destAddress}`,
				}
			}
			case 4:
				return {
					title: 'ORDER DETAILS',
					description: 'Provide details about your order.',
				}
			case 5:
				return {
					title: 'ADDITIONAL INFO',
					description:
						'Add any additional information for your delivery.',
				}
			case 6:
				return {
					title: 'REVIEW',
					description: 'Review your order details before submitting.',
				}
			default:
				return {
					title: 'DELIVERY',
					description: 'Plan your delivery.',
				}
		}
	}

	// Save data to the Zustand store based on the current step
	const saveStepData = (data: StepData) => {
		if (currentStep === 1) {
			// Save stops and addresses to store
			const stopsData = data as StopsData
			setStopsAndAddresses(stopsData.stops, stopsData.selectedAddresses)
			setRouteDistance(stopsData.routeDistance)
		} else if (currentStep === 2) {
			// Vehicle step
			const vehicleData = data as VehicleData
			useDeliveryFormStore
				.getState()
				.setVehicleType(vehicleData.vehicleType)
		} else if (currentStep === 3) {
			// Timing step
			const timingData = data as TimingData
			useDeliveryFormStore
				.getState()
				.setDeliveryTiming(timingData.date, timingData.timeWindow)
		} else if (currentStep === 4) {
			// Orders step
			const orderData = data as OrderData
			useDeliveryFormStore
				.getState()
				.setOrderDetails(orderData.weight, orderData.size)
		} else if (currentStep === 5) {
			// Info step
			const infoData = data as InfoData
			useDeliveryFormStore.getState().setAdditionalInfo(infoData.info)
		}
	}

	const nextStep = (data: StepData | null = null) => {
		// Save current step data if provided
		if (data) {
			saveStepData(data)
		}
		setCurrentStep(Math.min(currentStep + 1, 6))
	}

	const prevStep = () => {
		setCurrentStep(Math.max(currentStep - 1, 1))
	}

	const goToStep = (step: number) => {
		setCurrentStep(Math.min(Math.max(step, 1), 6))
	}

	const resetStepperForm = () => {
		// Reset both local state and Zustand store
		setCurrentStep(1)
		resetForm()
	}

	return {
		currentStep,
		headerContent: getHeaderContent(),
		nextStep,
		prevStep,
		goToStep,
		resetStepperForm,
		saveStepData,
	}
}
