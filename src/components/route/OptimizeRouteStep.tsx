import { FunctionComponent, useState } from 'react'
import {
	VStack,
	Heading,
	Button,
	Text,
	Box,
	HStack,
	List,
	ListItem,
	IconButton,
	Flex,
	Divider,
	useToast,
} from '@chakra-ui/react'
import { FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { useRouteStore } from '../../store/routeStore'

interface OptimizeRouteStepProps {
	onNext: () => void
	onBack: () => void
}

export const OptimizeRouteStep: FunctionComponent<OptimizeRouteStepProps> = ({
	onNext,
	onBack,
}) => {
	const toast = useToast()
	const { currentRoute, setCurrentRoute } = useRouteStore()
	const [isOptimizing, setIsOptimizing] = useState(false)

	const handleOptimize = () => {
		setIsOptimizing(true)
		// Simulate optimization calculation
		setTimeout(() => {
			if (currentRoute) {
				const optimizedSequence = [
					...Array(currentRoute.stops.length),
				].map((_, i) => i)
				// In a real app, this would use a proper routing algorithm
				setCurrentRoute({
					...currentRoute,
					optimizedRoute: {
						sequence: optimizedSequence,
						estimatedTime: Math.round(
							optimizedSequence.length * 15,
						), // 15 mins per stop
						fuelCost: Math.round(optimizedSequence.length * 5), // $5 per stop
					},
				})
			}
			setIsOptimizing(false)
		}, 1500)
	}

	const moveStop = (fromIndex: number, direction: 'up' | 'down') => {
		if (!currentRoute) return

		const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
		if (toIndex < 0 || toIndex >= currentRoute.stops.length) return

		const newStops = [...currentRoute.stops]
		const [movedStop] = newStops.splice(fromIndex, 1)
		newStops.splice(toIndex, 0, movedStop)

		setCurrentRoute({
			...currentRoute,
			stops: newStops,
			optimizedRoute: {
				sequence: [...Array(newStops.length)].map((_, i) => i),
				estimatedTime: currentRoute.optimizedRoute.estimatedTime,
				fuelCost: currentRoute.optimizedRoute.fuelCost,
			},
		})
	}

	const handleNext = () => {
		if (!currentRoute?.optimizedRoute.sequence.length) {
			toast({
				title: 'Route not optimized',
				description: 'Please optimize the route first',
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
				Optimize Route
			</Heading>

			<Button
				colorScheme="orange"
				onClick={handleOptimize}
				isLoading={isOptimizing}
				loadingText="Optimizing..."
			>
				Use Route Optimizer
			</Button>

			<Box borderWidth={1} borderRadius="md" p={4}>
				<List spacing={3}>
					{currentRoute?.stops.map((stop, index) => (
						<ListItem key={index}>
							<Flex align="center" justify="space-between">
								<Box flex={1}>
									<Text fontWeight="medium" color="gray.600">
										{stop.name}
									</Text>
									<Text fontSize="sm" color="gray.600">
										{stop.address}
									</Text>
								</Box>
								<HStack>
									<IconButton
										icon={<FiArrowUp />}
										aria-label="Move up"
										size="sm"
										colorScheme="gray.500"
										borderWidth={2}
										borderColor="gray.600"
										isDisabled={index === 0}
										onClick={() => moveStop(index, 'up')}
									/>
									<IconButton
										icon={<FiArrowDown />}
										aria-label="Move down"
										size="sm"
										isDisabled={
											index ===
											(currentRoute?.stops.length || 0) -
												1
										}
										onClick={() => moveStop(index, 'down')}
									/>
								</HStack>
							</Flex>
						</ListItem>
					))}
				</List>
			</Box>

			{currentRoute &&
				currentRoute.optimizedRoute &&
				currentRoute.optimizedRoute.sequence.length > 0 && (
					<Box borderWidth={1} borderRadius="md" p={4} bg="orange.50">
						<Text fontWeight="medium" mb={2} color="gray.600">
							Route Summary
						</Text>
						<Text fontSize="sm" color="gray.600">
							Estimated Time:{' '}
							{currentRoute.optimizedRoute.estimatedTime} minutes
						</Text>
						<Text fontSize="sm" color="gray.600">
							Estimated Fuel Cost: $
							{currentRoute.optimizedRoute.fuelCost}
						</Text>
					</Box>
				)}

			<Divider />

			<HStack justify="space-between">
				<Button
					colorScheme="gray.500"
					variant={'solid'}
					onClick={onBack}
				>
					Back
				</Button>
				<Button colorScheme="orange" onClick={handleNext}>
					Next
				</Button>
			</HStack>
		</VStack>
	)
}
