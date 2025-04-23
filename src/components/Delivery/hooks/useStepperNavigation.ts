import { useState } from 'react'

interface StepContent {
	title: string
	description: string
}

export function useStepperNavigation() {
	const [currentStep, setCurrentStep] = useState<number>(1)

	// Dynamic header content based on current step
	const getHeaderContent = (): StepContent => {
		switch (currentStep) {
			case 1:
				return {
					title: 'Stops',
					description: 'Enter origin and destinations below',
				}
			case 2:
				return {
					title: 'Vehicle',
					description: 'Choose your preferred delivery vehicle',
				}
			case 3:
				return {
					title: 'Timing',
					description: 'Select delivery date and time window',
				}
			case 4:
				return {
					title: 'Orders',
					description: 'Enter details about your shipment',
				}
			case 5:
				return {
					title: 'Info',
					description: 'Provide additional information',
				}
			case 6:
				return {
					title: 'Review',
					description: 'Review your delivery details',
				}
			default:
				return {
					title: 'Stops',
					description: 'Enter origin and destinations below',
				}
		}
	}

	const nextStep = () => {
		setCurrentStep(Math.min(currentStep + 1, 6))
	}

	const prevStep = () => {
		setCurrentStep(Math.max(currentStep - 1, 1))
	}

	const goToStep = (step: number) => {
		setCurrentStep(Math.min(Math.max(step, 1), 6))
	}

	return {
		currentStep,
		headerContent: getHeaderContent(),
		nextStep,
		prevStep,
		goToStep,
	}
}
