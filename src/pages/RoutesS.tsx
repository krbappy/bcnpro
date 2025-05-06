import { FunctionComponent } from 'react'
import {
	Box,
	Container,
	Heading,
	Step,
	StepDescription,
	StepIcon,
	StepIndicator,
	StepNumber,
	StepSeparator,
	StepStatus,
	StepTitle,
	Stepper,
	useSteps,
	VStack,
} from '@chakra-ui/react'
import { useRouteStore } from '../stores/routeStore'
import { RouteTypeStep } from '../components/route/RouteTypeStep'
import { SelectCarStep } from '../components/route/SelectCarStep'
import { AddStopsStep } from '../components/route/AddStopsStep'
import { OptimizeRouteStep } from '../components/route/OptimizeRouteStep'
import { AssignDriverStep } from '../components/route/AssignDriverStep'
import { FinalizeStep } from '../components/route/FinalizeStep'

const steps = [
	{ title: 'Choose Route Type', description: 'Single or Multiple Stops' },
	{ title: 'Select Vehicle', description: 'Choose vehicle type' },
	{ title: 'Add Stops', description: 'Enter stop details' },
	{ title: 'Optimize Route', description: 'Calculate best route' },
	{ title: 'Assign Driver', description: 'Select a driver' },
	{ title: 'Finalize & Dispatch', description: 'Review and send' },
]

export const Routes: FunctionComponent = () => {
	const { activeStep, setActiveStep } = useSteps({
		index: 0,
		count: steps.length,
	})

	const { selectedVehicle, setSelectedVehicle } = useRouteStore((state) => ({
		selectedVehicle: state.selectedVehicle,
		setSelectedVehicle: state.setSelectedVehicle,
	}))

	const renderStepContent = () => {
		switch (activeStep) {
			case 0:
				return <RouteTypeStep onNext={() => setActiveStep(1)} />
			case 1:
				return (
					<SelectCarStep
						onNext={() => setActiveStep(2)}
						onBack={() => setActiveStep(0)}
						selectedVehicle={selectedVehicle}
						onVehicleSelect={setSelectedVehicle}
					/>
				)
			case 2:
				return (
					<AddStopsStep
						onNext={() => setActiveStep(3)}
						onBack={() => setActiveStep(1)}
					/>
				)
			case 3:
				return (
					<OptimizeRouteStep
						onNext={() => setActiveStep(4)}
						onBack={() => setActiveStep(2)}
					/>
				)
			case 4:
				return (
					<AssignDriverStep
						onNext={() => setActiveStep(5)}
						onBack={() => setActiveStep(3)}
					/>
				)
			case 5:
				return <FinalizeStep onBack={() => setActiveStep(4)} />
			default:
				return null
		}
	}

	return (
		<Container maxW="container.xl" py={8}>
			<VStack spacing={8} align="stretch">
				<Heading size="lg">Route Planning</Heading>

				<Stepper index={activeStep} colorScheme="orange">
					{steps.map((step, index) => (
						<Step key={index}>
							<StepIndicator>
								<StepStatus
									complete={<StepIcon />}
									incomplete={<StepNumber />}
									active={<StepNumber />}
								/>
							</StepIndicator>

							<Box flexShrink={0}>
								<StepTitle>{step.title}</StepTitle>
								<StepDescription>
									{step.description}
								</StepDescription>
							</Box>

							<StepSeparator />
						</Step>
					))}
				</Stepper>

				<Box
					bg="white"
					p={6}
					borderRadius="lg"
					boxShadow="sm"
					minH="400px"
				>
					{renderStepContent()}
				</Box>
			</VStack>
		</Container>
	)
}

export default Routes
