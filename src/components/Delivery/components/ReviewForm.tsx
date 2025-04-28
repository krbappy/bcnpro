import React, { useEffect } from 'react'
import {
	Box,
	Text,
	VStack,
	HStack,
	Flex,
	Button,
	Divider,
	Icon,
	Circle,
} from '@chakra-ui/react'
import {
	FiMapPin,
	FiTruck,
	FiClock,
	FiPackage,
	FiUser,
	FiEdit,
} from 'react-icons/fi'
import { useDeliveryFormStore } from '../../../stores/deliveryFormStore'
import { themeColors } from '../theme'

// Add these interfaces for Address type
interface FormattedAddress {
	name?: string
	formatted_address?: string
	place_name?: string
}

interface ReviewFormProps {
	onEditSection: (sectionIndex: number) => void
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ onEditSection }) => {
	// Get all the form data from the Zustand store
	const storeData = useDeliveryFormStore((state) => ({
		stops: state.stops,
		selectedAddresses: state.selectedAddresses as Record<
			number,
			FormattedAddress
		>,
		routeDistance: state.routeDistance,
		vehicleType: state.vehicleType,
		deliveryTiming: state.deliveryTiming,
		orders: state.orders,
		totalWeight: state.totalWeight,
		contactInfo: state.contactInfo,
	}))

	// Log all form data when component mounts
	useEffect(() => {
		console.log('Review Form Data:', {
			stops: storeData.stops,
			addresses: storeData.selectedAddresses,
			routeDistance: storeData.routeDistance,
			vehicleType: storeData.vehicleType,
			deliveryTiming: storeData.deliveryTiming,
			orders: storeData.orders,
			totalWeight: storeData.totalWeight,
			contactInfo: storeData.contactInfo,
		})
	}, [storeData])

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

	const getVehicleDisplayName = (): string => {
		if (!storeData.vehicleType) return '-'
		return VEHICLE_NAMES[storeData.vehicleType] || storeData.vehicleType
	}

	// Calculate the total number of items
	const getTotalItems = (): number => {
		return storeData.orders.reduce((total, order) => {
			return (
				total +
				order.items.reduce((itemTotal, item) => {
					return itemTotal + (parseInt(item.quantity) || 0)
				}, 0)
			)
		}, 0)
	}

	// Render sections

	// Section 1: Addresses
	const renderAddressesSection = () => (
		<Box mb={6} position="relative">
			<Flex justify="space-between" align="center" mb={2}>
				<HStack spacing={2}>
					<Icon
						as={FiMapPin}
						color={themeColors.accent}
						boxSize={5}
					/>
					<Text
						fontSize="lg"
						fontWeight="bold"
						color={themeColors.accent}
					>
						Addresses
					</Text>
				</HStack>
				<Button
					size="sm"
					variant="outline"
					leftIcon={<FiEdit />}
					onClick={() => onEditSection(1)}
					color={themeColors.accent}
					borderColor={themeColors.accent}
					_hover={{ bg: `${themeColors.accent}10` }}
				>
					Edit
				</Button>
			</Flex>
			<Divider mb={4} borderColor={themeColors.lightGray} />

			<Box position="relative" pl={8} mb={4}>
				<Circle
					size="28px"
					bg={themeColors.accent}
					color="white"
					position="absolute"
					left={0}
					top={0}
					fontSize="14px"
					fontWeight="bold"
				>
					1
				</Circle>

				<VStack align="stretch" spacing={2}>
					{storeData.stops.map((stopId) => {
						const address = storeData.selectedAddresses[stopId]
						return address ? (
							<Box key={stopId} ml={2}>
								<Text
									fontWeight="bold"
									color={themeColors.text}
								>
									{address.name || 'Pickup Location'}
								</Text>
								<Text color={themeColors.gray}>
									{address.formatted_address ||
										address.place_name ||
										'Address not specified'}
								</Text>
							</Box>
						) : null
					})}
				</VStack>
			</Box>
			<Box pl={1}>
				<Text
					fontSize="sm"
					fontWeight="medium"
					color={themeColors.gray}
				>
					{storeData.routeDistance.displayValue} total
				</Text>
				<Text
					fontSize="sm"
					fontWeight="medium"
					color={themeColors.gray}
				>
					Estimated pickup arrival by 1:05 AM
				</Text>
			</Box>
		</Box>
	)

	// Section 2: Vehicle
	const renderVehicleSection = () => (
		<Box mb={6} position="relative">
			<Flex justify="space-between" align="center" mb={2}>
				<HStack spacing={2}>
					<Icon as={FiTruck} color={themeColors.accent} boxSize={5} />
					<Text
						fontSize="lg"
						fontWeight="bold"
						color={themeColors.accent}
					>
						Vehicle
					</Text>
				</HStack>
				<Button
					size="sm"
					variant="outline"
					leftIcon={<FiEdit />}
					onClick={() => onEditSection(2)}
					color={themeColors.accent}
					borderColor={themeColors.accent}
					_hover={{ bg: `${themeColors.accent}10` }}
				>
					Edit
				</Button>
			</Flex>
			<Divider mb={4} borderColor={themeColors.lightGray} />

			<Box pl={1} mb={2}>
				<Text fontWeight="bold" color={themeColors.text}>
					{getVehicleDisplayName()}
				</Text>
				<Text color={themeColors.gray}>
					Small boxes, bags, fittings, fasteners, romex
				</Text>
				<Text
					fontSize="sm"
					fontWeight="medium"
					color={themeColors.gray}
					mt={1}
				>
					200 LBS MAX
				</Text>
			</Box>
		</Box>
	)

	// Section 3: Timing
	const renderTimingSection = () => (
		<Box mb={6} position="relative">
			<Flex justify="space-between" align="center" mb={2}>
				<HStack spacing={2}>
					<Icon as={FiClock} color={themeColors.accent} boxSize={5} />
					<Text
						fontSize="lg"
						fontWeight="bold"
						color={themeColors.accent}
					>
						Timing
					</Text>
				</HStack>
				<Button
					size="sm"
					variant="outline"
					leftIcon={<FiEdit />}
					onClick={() => onEditSection(3)}
					color={themeColors.accent}
					borderColor={themeColors.accent}
					_hover={{ bg: `${themeColors.accent}10` }}
				>
					Edit
				</Button>
			</Flex>
			<Divider mb={4} borderColor={themeColors.lightGray} />

			<Box pl={1} mb={2}>
				<Text
					fontWeight="bold"
					textTransform="lowercase"
					color={themeColors.text}
				>
					{storeData.deliveryTiming.timeWindow?.toLowerCase() ||
						'rush'}
				</Text>
				{storeData.deliveryTiming.date && (
					<Text color={themeColors.gray}>
						{storeData.deliveryTiming.date}
					</Text>
				)}
			</Box>
		</Box>
	)

	// Section 4: Orders
	const renderOrdersSection = () => (
		<Box mb={6} position="relative">
			<Flex justify="space-between" align="center" mb={2}>
				<HStack spacing={2}>
					<Icon
						as={FiPackage}
						color={themeColors.accent}
						boxSize={5}
					/>
					<Text
						fontSize="lg"
						fontWeight="bold"
						color={themeColors.accent}
					>
						Orders
					</Text>
				</HStack>
				<Button
					size="sm"
					variant="outline"
					leftIcon={<FiEdit />}
					onClick={() => onEditSection(4)}
					color={themeColors.accent}
					borderColor={themeColors.accent}
					_hover={{ bg: `${themeColors.accent}10` }}
				>
					Edit
				</Button>
			</Flex>
			<Divider mb={4} borderColor={themeColors.lightGray} />

			<Box pl={1} mb={2}>
				<Text fontWeight="bold" color={themeColors.text}>
					Total items: {getTotalItems()}
				</Text>
				<Text color={themeColors.gray}>
					Total weight: {parseFloat(storeData.totalWeight).toFixed(1)}{' '}
					lbs
				</Text>
				{storeData.orders.map((order, index) => (
					<Box
						key={order.id}
						mt={2}
						bg="#f9f9f9"
						p={2}
						borderRadius="md"
					>
						<Text
							fontSize="sm"
							fontWeight="bold"
							color={themeColors.text}
						>
							Order {index + 1}
						</Text>
						{order.poNumber && (
							<Text fontSize="sm" color={themeColors.gray}>
								PO#: {order.poNumber}
							</Text>
						)}
						{order.orderNumber && (
							<Text fontSize="sm" color={themeColors.gray}>
								Order#: {order.orderNumber}
							</Text>
						)}
						<Text fontSize="sm" color={themeColors.gray}>
							{order.items.length} items
						</Text>
					</Box>
				))}
			</Box>
		</Box>
	)

	// Section 5: Contact Info
	const renderContactInfoSection = () => (
		<Box mb={6} position="relative">
			<Flex justify="space-between" align="center" mb={2}>
				<HStack spacing={2}>
					<Icon as={FiUser} color={themeColors.accent} boxSize={5} />
					<Text
						fontSize="lg"
						fontWeight="bold"
						color={themeColors.accent}
					>
						Contact Info
					</Text>
				</HStack>
				<Button
					size="sm"
					variant="outline"
					leftIcon={<FiEdit />}
					onClick={() => onEditSection(5)}
					color={themeColors.accent}
					borderColor={themeColors.accent}
					_hover={{ bg: `${themeColors.accent}10` }}
				>
					Edit
				</Button>
			</Flex>
			<Divider mb={4} borderColor={themeColors.lightGray} />

			<VStack align="stretch" spacing={4}>
				{storeData.stops.map((stopId) => {
					const contactInfo = storeData.contactInfo[stopId]
					const address = storeData.selectedAddresses[stopId]
					return contactInfo ? (
						<Box key={stopId} position="relative" pl={8}>
							<Circle
								size="28px"
								bg={themeColors.accent}
								color="white"
								position="absolute"
								left={0}
								top={0}
								fontSize="14px"
								fontWeight="bold"
							>
								{stopId}
							</Circle>

							<Box ml={2}>
								<Text fontWeight="bold">
									{address?.name || `Stop ${stopId}`}
								</Text>
								<Text color={themeColors.gray}>
									{contactInfo.name}
								</Text>
								<Text color={themeColors.gray}>
									{contactInfo.phone}
								</Text>
								<Text color={themeColors.gray}>
									{contactInfo.email}
								</Text>
								{contactInfo.company && (
									<Text color={themeColors.gray}>
										{contactInfo.company}
									</Text>
								)}
								{contactInfo.notes && (
									<Text
										color={themeColors.gray}
										fontSize="sm"
									>
										Notes: {contactInfo.notes}
									</Text>
								)}
							</Box>
						</Box>
					) : null
				})}
			</VStack>
		</Box>
	)

	return (
		<Box mb={8} className="review-form" pt={4}>
			<Text
				mb={6}
				fontSize="md"
				color={themeColors.gray}
				textAlign="center"
			>
				Review your order details before submitting.
			</Text>
			{renderAddressesSection()}
			{renderVehicleSection()}
			{renderTimingSection()}
			{renderOrdersSection()}
			{renderContactInfoSection()}
		</Box>
	)
}
