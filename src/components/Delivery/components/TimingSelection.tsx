import React, { useState, useEffect, useCallback } from 'react'
import {
	Box,
	Text,
	VStack,
	HStack,
	Flex,
	Icon,
	Badge,
	Input,
	FormControl,
	FormLabel,
	Alert,
	AlertIcon,
	AlertTitle,
} from '@chakra-ui/react'
import { FiZap, FiClock, FiCalendar, FiInfo } from 'react-icons/fi'
import { themeColors } from '../theme'
import { useDeliveryFormStore } from '../../../stores/deliveryFormStore'

// Default pricing constants (fallback if env vars not set)
const DEFAULT_BASE_PRICE = 5
const DEFAULT_VEHICLE_PRICES = {
	car: 1,
	suv: 5,
	'cargo-van': 10,
	'pickup-truck': 8,
	'rack-vehicle': 12,
	'sprinter-van': 15,
	'vehicle-with-hitch': 12,
	'box-truck': 20,
	'box-truck-liftgate': 22,
	'open-deck': 25,
	'hotshot-trailer': 30,
	flatbed: 35,
}

interface TimingSelectionProps {
	routeDistance: {
		meters: number
		displayValue: string
	}
	onTimingSelect: (timing: {
		type: string
		date?: string
		time?: string
		isValid?: boolean
	}) => void
}

export const TimingSelection: React.FC<TimingSelectionProps> = ({
	routeDistance,
	onTimingSelect,
}) => {
	const [selectedValue, setSelectedValue] = useState<string>('rush')
	const [scheduledDate, setScheduledDate] = useState<string>('')
	const [scheduledTime, setScheduledTime] = useState<string>('')
	const [validationError, setValidationError] = useState<string>('')

	// Get the selected vehicle type from the store
	const vehicleType = useDeliveryFormStore((state) => state.vehicleType) || {
		type: 'car',
	}

	// Get the setDeliveryTiming action from the store
	const setDeliveryTiming = useDeliveryFormStore(
		(state) => state.setDeliveryTiming,
	)

	// Check if time is past 1 PM for Same Day availability
	const currentHour = new Date().getHours()
	const isSameDayAvailable = currentHour < 13 // Before 1 PM

	// Current time for estimated arrival
	const currentTime = new Date()
	const estimatedArrival = new Date(currentTime.getTime() + 60 * 60 * 1000) // 1 hour from now
	const formattedTime = estimatedArrival.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	})

	// Calculate price based on distance and vehicle type
	const calculatePrice = (): number => {
		// Get base price from env or use default
		const basePrice = import.meta.env.VITE_BASE_PRICE
			? parseFloat(import.meta.env.VITE_BASE_PRICE as string)
			: DEFAULT_BASE_PRICE

		// Get vehicle-specific price from env or use default
		const vehicleTypeKey =
			typeof vehicleType === 'string' ? vehicleType : vehicleType.type
		const vehiclePriceKey = `VITE_VEHICLE_PRICE_${vehicleTypeKey.toUpperCase().replace(/-/g, '_')}`
		const vehiclePrice = import.meta.env[vehiclePriceKey]
			? parseFloat(import.meta.env[vehiclePriceKey] as string)
			: DEFAULT_VEHICLE_PRICES[
					vehicleTypeKey as keyof typeof DEFAULT_VEHICLE_PRICES
				] || 1

		// Extract distance in miles
		const distanceInMiles =
			parseFloat(routeDistance.displayValue.split(' ')[0]) || 0

		// Calculate final price: base * distance + vehicle price
		return basePrice * distanceInMiles + vehiclePrice
	}

	const basePrice = calculatePrice()
	const sameDayPrice = (basePrice * 0.9).toFixed(2) // 10% discount
	const rushPrice = basePrice.toFixed(2)
	const scheduledPrice = basePrice.toFixed(2)

	// Helper to update the Zustand store with the current timing selection
	const updateTimingStore = useCallback(
		(type: string, date: string = '', time: string = '') => {
			let timingString = type
			let dateValue = ''

			// Determine if this selection is valid
			const isValid = (() => {
				// If scheduled, we need both date and time
				if (type === 'scheduled') {
					const valid = Boolean(date) && Boolean(time)
					return valid
				}
				// If same-day, check availability
				if (type === 'same-day') {
					return isSameDayAvailable
				}
				// Rush is always valid
				return true
			})()

			// Set friendly labels for each option
			if (type === 'scheduled' && date && time) {
				timingString = 'Scheduled'
				dateValue = date
			} else if (type === 'scheduled') {
				// Invalid scheduled selection
				timingString = 'Scheduled'
			} else if (type === 'rush') {
				timingString = 'Rush'
				// No date for rush
			} else if (type === 'same-day') {
				timingString = 'Same Day'
				// No date for same day
			}

			// Update the store with just the label, not the full details
			// Only pass a date if it's the scheduled option
			setDeliveryTiming(dateValue, timingString, isValid)

			// Also update parent component with validation status
			onTimingSelect({
				type,
				date,
				time,
				isValid,
			})
		},
		[setDeliveryTiming, onTimingSelect, isSameDayAvailable],
	)

	// Validate and show error if needed
	useEffect(() => {
		if (selectedValue === 'scheduled') {
			if (!scheduledDate && !scheduledTime) {
				setValidationError(
					'Please select both date and time for scheduled delivery',
				)
			} else if (!scheduledDate) {
				setValidationError('Please select a pickup date')
			} else if (!scheduledTime) {
				setValidationError('Please select a pickup time')
			} else {
				setValidationError('')
			}
		} else {
			setValidationError('')
		}
	}, [selectedValue, scheduledDate, scheduledTime])

	// Handle option selection
	const handleOptionSelect = useCallback(
		(value: string) => {
			// Don't allow selecting disabled options
			if (value === 'same-day' && !isSameDayAvailable) {
				return
			}

			// Update the selected value first
			setSelectedValue(value)

			// Clear scheduled date/time when switching away from scheduled
			if (value !== 'scheduled') {
				setScheduledDate('')
				setScheduledTime('')

				// Immediately notify parent with the selection and mark as valid
				onTimingSelect({
					type: value,
					isValid: true,
				})

				// Update the store
				updateTimingStore(value)
			} else {
				// For scheduled, update with current values (which may be empty)
				// This will show validation errors if fields are empty
				onTimingSelect({
					type: value,
					date: scheduledDate,
					time: scheduledTime,
					isValid: Boolean(scheduledDate && scheduledTime),
				})

				updateTimingStore(value, scheduledDate, scheduledTime)
			}
		},
		[
			isSameDayAvailable,
			scheduledDate,
			scheduledTime,
			updateTimingStore,
			onTimingSelect,
		],
	)

	// Handle scheduled date/time changes
	const handleScheduledDateChange = useCallback(
		(newDate: string) => {
			setScheduledDate(newDate)

			// Update the store with new values
			updateTimingStore('scheduled', newDate, scheduledTime)
		},
		[scheduledTime, updateTimingStore],
	)

	const handleScheduledTimeChange = useCallback(
		(newTime: string) => {
			setScheduledTime(newTime)

			// Update the store with new values
			updateTimingStore('scheduled', scheduledDate, newTime)
		},
		[scheduledDate, updateTimingStore],
	)

	// Set initial selection on mount (only once)
	useEffect(() => {
		// Explicitly set the rush option as selected initially
		const initialType = 'rush'
		setSelectedValue(initialType)

		// Notify parent about initial selection
		onTimingSelect({
			type: initialType,
			isValid: true,
		})

		// Update the store
		updateTimingStore(initialType)

		// This effect should only run once on mount
		// eslint-disable-next-line
	}, [])

	// Render the Rush option
	const renderRushOption = () => {
		const isSelected = selectedValue === 'rush'

		// Get pricing details
		const distanceInMiles =
			parseFloat(routeDistance.displayValue.split(' ')[0]) || 0
		const basePerMile = import.meta.env.VITE_BASE_PRICE
			? parseFloat(import.meta.env.VITE_BASE_PRICE as string)
			: DEFAULT_BASE_PRICE
		const vehiclePriceKey = `VITE_VEHICLE_PRICE_${vehicleType.type.toUpperCase().replace(/-/g, '_')}`
		const vehiclePrice = import.meta.env[vehiclePriceKey]
			? parseFloat(import.meta.env[vehiclePriceKey] as string)
			: DEFAULT_VEHICLE_PRICES[
					vehicleType.type as keyof typeof DEFAULT_VEHICLE_PRICES
				] || 1

		return (
			<Box
				onClick={() => handleOptionSelect('rush')}
				cursor="pointer"
				borderWidth="1px"
				borderRadius="md"
				mt={2}
				borderColor={
					isSelected ? themeColors.accent : themeColors.lightGray
				}
				p={4}
				mb={4}
				boxShadow={
					isSelected ? `0 0 0 1px ${themeColors.accent}` : 'none'
				}
				transition="all 0.2s"
				_hover={{ borderColor: themeColors.accent }}
				position="relative"
				data-value="rush"
			>
				<Flex justify="space-between" align="center">
					<HStack spacing={4} align="flex-start">
						<Box color={themeColors.text} mt={1}>
							<Icon as={FiZap} boxSize={6} />
						</Box>
						<VStack align="flex-start" spacing={1}>
							<Text
								fontWeight="bold"
								fontSize="lg"
								color={themeColors.text}
							>
								Rush
							</Text>
							<Text color={themeColors.gray} fontSize="sm">
								We&apos;ll begin matching a driver to deliver
								your order immediately after booking
							</Text>
							<Flex align="center" mt={2}>
								<Text
									color={themeColors.text}
									fontSize="sm"
									fontWeight="medium"
								>
									Estimated pickup arrival by {formattedTime}
								</Text>
								<Icon as={FiInfo} ml={1} />
							</Flex>

							<Text color={themeColors.gray} fontSize="xs" mt={1}>
								${basePerMile}/mi × {distanceInMiles} mi + $
								{vehiclePrice} ({vehicleType.type})
							</Text>
						</VStack>
					</HStack>
					<Flex direction="column" align="flex-end">
						<Text
							fontWeight="bold"
							fontSize="2xl"
							color={themeColors.text}
						>
							${rushPrice}
						</Text>
					</Flex>
				</Flex>
			</Box>
		)
	}

	// Render the Same Day option
	const renderSameDayOption = () => {
		const isSelected = selectedValue === 'same-day'
		const isDisabled = !isSameDayAvailable

		// Get pricing details
		const distanceInMiles =
			parseFloat(routeDistance.displayValue.split(' ')[0]) || 0
		const basePerMile = import.meta.env.VITE_BASE_PRICE
			? parseFloat(import.meta.env.VITE_BASE_PRICE as string)
			: DEFAULT_BASE_PRICE
		const vehiclePriceKey = `VITE_VEHICLE_PRICE_${vehicleType.type.toUpperCase().replace(/-/g, '_')}`
		const vehiclePrice = import.meta.env[vehiclePriceKey]
			? parseFloat(import.meta.env[vehiclePriceKey] as string)
			: DEFAULT_VEHICLE_PRICES[
					vehicleType.type as keyof typeof DEFAULT_VEHICLE_PRICES
				] || 1

		return (
			<Box
				onClick={() => !isDisabled && handleOptionSelect('same-day')}
				cursor={isDisabled ? 'not-allowed' : 'pointer'}
				borderWidth="1px"
				borderRadius="md"
				borderColor={
					isSelected ? themeColors.accent : themeColors.lightGray
				}
				p={4}
				mb={4}
				boxShadow={
					isSelected ? `0 0 0 1px ${themeColors.accent}` : 'none'
				}
				transition="all 0.2s"
				_hover={{
					borderColor: isDisabled
						? themeColors.lightGray
						: themeColors.accent,
				}}
				position="relative"
				opacity={isDisabled ? 0.6 : 1}
				data-value="same-day"
			>
				<Flex justify="space-between" align="center">
					<HStack spacing={4} align="flex-start">
						<Box color={themeColors.text} mt={1}>
							<Icon as={FiClock} boxSize={6} />
						</Box>
						<VStack align="flex-start" spacing={1}>
							<Text
								fontWeight="bold"
								fontSize="lg"
								color={themeColors.text}
							>
								Same Day
							</Text>
							<Text color={themeColors.gray} fontSize="sm">
								Book your order by a certain time and we will
								deliver it within the day
							</Text>

							<Text color={themeColors.gray} fontSize="xs" mt={1}>
								(${basePerMile}/mi × {distanceInMiles} mi + $
								{vehiclePrice}) × 0.9 (10% discount)
							</Text>
						</VStack>
					</HStack>
					<Flex direction="column" align="flex-end">
						<Text
							fontWeight="bold"
							fontSize="2xl"
							color={themeColors.text}
						>
							${sameDayPrice}
						</Text>
						{isSameDayAvailable && (
							<Text
								fontSize="sm"
								color="green.500"
								fontWeight="medium"
							>
								Save ${(basePrice * 0.1).toFixed(2)}
							</Text>
						)}
					</Flex>
				</Flex>

				{!isSameDayAvailable && (
					<Badge
						position="absolute"
						top="-12px"
						left="50%"
						transform="translateX(-50%)"
						bg="gray.600"
						color="white"
						px={3}
						py={1}
						borderRadius="md"
						fontSize="xs"
					>
						AVAILABLE WHEN BOOKED BEFORE NOON
					</Badge>
				)}
			</Box>
		)
	}

	// Render the Scheduled option
	const renderScheduledOption = () => {
		const isSelected = selectedValue === 'scheduled'

		// Get pricing details
		const distanceInMiles =
			parseFloat(routeDistance.displayValue.split(' ')[0]) || 0
		const basePerMile = import.meta.env.VITE_BASE_PRICE
			? parseFloat(import.meta.env.VITE_BASE_PRICE as string)
			: DEFAULT_BASE_PRICE
		const vehiclePriceKey = `VITE_VEHICLE_PRICE_${vehicleType.type.toUpperCase().replace(/-/g, '_')}`
		const vehiclePrice = import.meta.env[vehiclePriceKey]
			? parseFloat(import.meta.env[vehiclePriceKey] as string)
			: DEFAULT_VEHICLE_PRICES[
					vehicleType.type as keyof typeof DEFAULT_VEHICLE_PRICES
				] || 1

		return (
			<Box
				onClick={() => handleOptionSelect('scheduled')}
				cursor="pointer"
				borderWidth="1px"
				borderRadius="md"
				borderColor={
					isSelected ? themeColors.accent : themeColors.lightGray
				}
				p={4}
				mb={4}
				boxShadow={
					isSelected ? `0 0 0 1px ${themeColors.accent}` : 'none'
				}
				transition="all 0.2s"
				_hover={{ borderColor: themeColors.accent }}
				position="relative"
				data-value="scheduled"
			>
				<Flex justify="space-between" align="center">
					<HStack spacing={4} align="flex-start">
						<Box color={themeColors.text} mt={1}>
							<Icon as={FiCalendar} boxSize={6} />
						</Box>
						<VStack align="flex-start" spacing={1}>
							<Text
								fontWeight="bold"
								fontSize="lg"
								color={themeColors.text}
							>
								Scheduled
							</Text>
							<Text color={themeColors.gray} fontSize="sm">
								Book your order for a future date and time to be
								picked up
							</Text>

							<Text color={themeColors.gray} fontSize="xs" mt={1}>
								${basePerMile}/mi × {distanceInMiles} mi + $
								{vehiclePrice} ({vehicleType.type})
							</Text>
						</VStack>
					</HStack>
					<Flex direction="column" align="flex-end">
						<Text
							fontWeight="bold"
							fontSize="2xl"
							color={themeColors.text}
						>
							${scheduledPrice}
						</Text>
					</Flex>
				</Flex>
			</Box>
		)
	}

	return (
		<VStack align="stretch" spacing={4}>
			{renderRushOption()}
			{renderSameDayOption()}
			{renderScheduledOption()}

			{selectedValue === 'scheduled' && (
				<Box
					mt={2}
					p={4}
					borderWidth="1px"
					borderRadius="md"
					borderColor={themeColors.lightGray}
				>
					<VStack spacing={4}>
						{validationError && (
							<Alert status="warning" borderRadius="md">
								<AlertIcon />
								<AlertTitle>{validationError}</AlertTitle>
							</Alert>
						)}

						<FormControl isRequired>
							<FormLabel color={themeColors.text}>
								Pickup Date
							</FormLabel>
							<Box position="relative">
								<Input
									type="date"
									color={themeColors.text}
									value={scheduledDate}
									borderColor={
										!scheduledDate && validationError
											? 'red.300'
											: themeColors.lightGray
									}
									bg="white"
									_hover={{
										borderColor: themeColors.accent,
									}}
									onChange={(e) => {
										handleScheduledDateChange(
											e.target.value,
										)
									}}
									min={new Date().toISOString().split('T')[0]}
									sx={{
										'&::-webkit-calendar-picker-indicator':
											{
												filter: 'invert(40%)',
												cursor: 'pointer',
												position: 'absolute',
												top: 0,
												right: 0,
												bottom: 0,
												width: '100%',
												height: '100%',
												opacity: 0,
												zIndex: 2,
											},
									}}
								/>
								<Box
									position="absolute"
									top="50%"
									right="10px"
									transform="translateY(-50%)"
									pointerEvents="none"
									zIndex={1}
								>
									<Icon
										as={FiCalendar}
										color={themeColors.gray}
									/>
								</Box>
							</Box>
						</FormControl>
						<FormControl isRequired>
							<FormLabel color={themeColors.text}>
								Pickup Time
							</FormLabel>
							<Box position="relative">
								<Input
									type="time"
									color={themeColors.text}
									value={scheduledTime}
									borderColor={
										!scheduledTime && validationError
											? 'red.300'
											: themeColors.lightGray
									}
									bg="white"
									_hover={{
										borderColor: themeColors.accent,
									}}
									onChange={(e) => {
										handleScheduledTimeChange(
											e.target.value,
										)
									}}
									sx={{
										'&::-webkit-calendar-picker-indicator':
											{
												filter: 'invert(40%)',
												cursor: 'pointer',
												position: 'absolute',
												top: 0,
												right: 0,
												bottom: 0,
												width: '100%',
												height: '100%',
												opacity: 0,
												zIndex: 2,
											},
									}}
								/>
								<Box
									position="absolute"
									top="50%"
									right="10px"
									transform="translateY(-50%)"
									pointerEvents="none"
									zIndex={1}
								>
									<Icon
										as={FiClock}
										color={themeColors.gray}
									/>
								</Box>
							</Box>
						</FormControl>
					</VStack>
				</Box>
			)}
		</VStack>
	)
}
