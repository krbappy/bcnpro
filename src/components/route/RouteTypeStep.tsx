import { FunctionComponent } from 'react'
import {
	VStack,
	Heading,
	RadioGroup,
	Radio,
	Button,
	Text,
	Box,
	useToast,
} from '@chakra-ui/react'
import { useRouteStore, Route } from '../../store/routeStore'
import { v4 as uuidv4 } from 'uuid'

interface RouteTypeStepProps {
	onNext: () => void
}

export const RouteTypeStep: FunctionComponent<RouteTypeStepProps> = ({
	onNext,
}) => {
	const toast = useToast()
	const { setCurrentRoute, currentRoute } = useRouteStore()

	const handleTypeSelect = (type: 'Single Stop' | 'Multiple Stops') => {
		const newRoute: Route = {
			id: uuidv4(),
			type,
			stops: [],
			optimizedRoute: {
				sequence: [],
				estimatedTime: 0,
				fuelCost: 0,
			},
			driver: {
				autoAssigned: false,
			},
			status: 'draft',
		}
		setCurrentRoute(newRoute)
	}

	const handleNext = () => {
		if (!currentRoute?.type) {
			toast({
				title: 'Please select a route type',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
			return
		}
		onNext()
	}

	return (
		<VStack spacing={6} align="stretch">
			<Heading size="md" color="gray.600">
				Choose Route Type
			</Heading>

			<RadioGroup
				onChange={(value) =>
					handleTypeSelect(value as 'Single Stop' | 'Multiple Stops')
				}
				value={currentRoute?.type}
			>
				<VStack spacing={4} align="stretch">
					<Box
						p={4}
						borderWidth={1}
						borderRadius="md"
						borderColor={
							currentRoute?.type === 'Single Stop'
								? 'orange.500'
								: 'gray.200'
						}
						_hover={{ borderColor: 'orange.300' }}
					>
						<Radio
							value="Single Stop"
							colorScheme="orange"
							borderWidth={2}
							borderColor="gray.800"
							size="lg"
						>
							<Text
								fontWeight="medium"
								color={
									currentRoute?.type === 'Single Stop'
										? 'orange.500'
										: 'gray.600'
								}
							>
								Single Stop
							</Text>
							<Text fontSize="sm" color="gray.600">
								Best for direct deliveries to one location
							</Text>
						</Radio>
					</Box>

					<Box
						p={4}
						borderWidth={1}
						borderRadius="md"
						borderColor={
							currentRoute?.type === 'Multiple Stops'
								? 'orange.500'
								: 'gray.200'
						}
						_hover={{ borderColor: 'orange.300' }}
					>
						<Radio
							value="Multiple Stops"
							colorScheme="orange"
							borderWidth={2}
							borderColor="gray.800"
							size="lg"
						>
							<Text
								fontWeight="medium"
								color={
									currentRoute?.type === 'Multiple Stops'
										? 'orange.500'
										: 'gray.600'
								}
							>
								Multiple Stops
							</Text>
							<Text fontSize="sm" color="gray.600">
								Ideal for multiple deliveries in one route
							</Text>
						</Radio>
					</Box>
				</VStack>
			</RadioGroup>

			<Button
				colorScheme="orange"
				alignSelf="flex-end"
				onClick={handleNext}
				mt={4}
			>
				Next
			</Button>
		</VStack>
	)
}
