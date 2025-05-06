import { FunctionComponent, useState } from 'react'
import {
	VStack,
	Heading,
	Button,
	Text,
	Box,
	FormControl,
	FormLabel,
	Input,
	Textarea,
	HStack,
	useToast,
	IconButton,
} from '@chakra-ui/react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { useRouteStore, Stop } from '../../store/routeStore'
import { themeColors } from '../Delivery/theme'

interface AddStopsStepProps {
	onNext: () => void
	onBack: () => void
}

export const AddStopsStep: FunctionComponent<AddStopsStepProps> = ({
	onNext,
	onBack,
}) => {
	const toast = useToast()
	const { currentRoute, setCurrentRoute } = useRouteStore()
	const [newStop, setNewStop] = useState<Stop>({
		name: '',
		address: '',
		phoneNumber: '',
		deliveryNotes: '',
	})

	const handleAddStop = () => {
		if (!newStop.name || !newStop.address) {
			toast({
				title: 'Required fields missing',
				description: 'Please fill in at least the name and address',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
			return
		}

		if (currentRoute) {
			setCurrentRoute({
				...currentRoute,
				stops: [...currentRoute.stops, { ...newStop }],
			})
			setNewStop({
				name: '',
				address: '',
				phoneNumber: '',
				deliveryNotes: '',
			})
		}
	}

	const handleRemoveStop = (index: number) => {
		if (currentRoute) {
			const newStops = [...currentRoute.stops]
			newStops.splice(index, 1)
			setCurrentRoute({
				...currentRoute,
				stops: newStops,
			})
		}
	}

	const handleNext = () => {
		if (!currentRoute?.stops.length) {
			toast({
				title: 'No stops added',
				description: 'Please add at least one stop',
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
				Add Stops
			</Heading>

			{/* Existing Stops */}
			{currentRoute?.stops.map((stop, index) => (
				<Box
					key={index}
					p={4}
					borderWidth={1}
					borderRadius="md"
					borderColor="gray.200"
				>
					<HStack justify="space-between" align="start">
						<VStack align="stretch" flex={1}>
							<Text fontWeight="medium" color="gray.600">
								{stop.name}
							</Text>
							<Text fontSize="sm" color="gray.600">
								{stop.address}
							</Text>
							{stop.phoneNumber && (
								<Text fontSize="sm" color="gray.600">
									{stop.phoneNumber}
								</Text>
							)}
							{stop.deliveryNotes && (
								<Text fontSize="sm" color="gray.600">
									{stop.deliveryNotes}
								</Text>
							)}
						</VStack>
						<IconButton
							icon={<FiTrash2 />}
							aria-label="Remove stop"
							variant="ghost"
							colorScheme="red"
							size="sm"
							onClick={() => handleRemoveStop(index)}
						/>
					</HStack>
				</Box>
			))}

			{/* Add New Stop Form */}
			<Box p={4} borderWidth={1} borderRadius="md" borderColor="gray.200">
				<VStack spacing={4}>
					<FormControl isRequired>
						<FormLabel color="gray.600">Name</FormLabel>
						<Input
							value={newStop.name}
							onChange={(e) =>
								setNewStop({ ...newStop, name: e.target.value })
							}
							placeholder="Enter stop name"
							borderColor={themeColors.lightGray}
							color={themeColors.text}
							_focus={{
								borderColor: themeColors.accent,
								outline: 'none',
								boxShadow: 'none',
							}}
							_active={{
								borderColor: themeColors.accent,
								boxShadow: 'none',
							}}
						/>
					</FormControl>

					<FormControl isRequired>
						<FormLabel color="gray.600">Address</FormLabel>
						<Input
							value={newStop.address}
							onChange={(e) =>
								setNewStop({
									...newStop,
									address: e.target.value,
								})
							}
							placeholder="Enter address"
							borderColor={themeColors.lightGray}
							color={themeColors.text}
							_focus={{
								borderColor: themeColors.accent,
								outline: 'none',
								boxShadow: 'none',
							}}
							_active={{
								borderColor: themeColors.accent,
								boxShadow: 'none',
							}}
						/>
					</FormControl>

					<FormControl>
						<FormLabel color="gray.600">Phone Number</FormLabel>
						<Input
							value={newStop.phoneNumber}
							onChange={(e) =>
								setNewStop({
									...newStop,
									phoneNumber: e.target.value,
								})
							}
							placeholder="Enter phone number"
							borderColor={themeColors.lightGray}
							color={themeColors.text}
							_focus={{
								borderColor: themeColors.accent,
								outline: 'none',
								boxShadow: 'none',
							}}
							_active={{
								borderColor: themeColors.accent,
								boxShadow: 'none',
							}}
						/>
					</FormControl>

					<FormControl>
						<FormLabel color="gray.600">Delivery Notes</FormLabel>
						<Textarea
							value={newStop.deliveryNotes}
							onChange={(e) =>
								setNewStop({
									...newStop,
									deliveryNotes: e.target.value,
								})
							}
							placeholder="Enter any special instructions or notes"
							borderColor={themeColors.lightGray}
							color={themeColors.text}
							_focus={{
								borderColor: themeColors.accent,
								outline: 'none',
								boxShadow: 'none',
							}}
							_active={{
								borderColor: themeColors.accent,
								boxShadow: 'none',
							}}
						/>
					</FormControl>

					<Button
						leftIcon={<FiPlus />}
						colorScheme="orange"
						variant="ghost"
						onClick={handleAddStop}
						alignSelf="flex-start"
					>
						Add Stop
					</Button>
				</VStack>
			</Box>

			<HStack justify="space-between" pt={4}>
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
