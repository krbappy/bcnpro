import React, { useEffect, useState } from 'react'
import {
	Box,
	Text,
	VStack,
	FormControl,
	FormLabel,
	Input,
	Button,
	Textarea,
	Heading,
	Badge,
	Flex,
	HStack,
	Divider,
	useToast,
} from '@chakra-ui/react'
import {
	useDeliveryFormStore,
	ContactInfo,
} from '../../../stores/deliveryFormStore'
import { themeColors } from '../theme'
import { Address } from '../hooks/useAddressSelection'

interface InfoFormProps {
	onInfoChange: (isValid: boolean) => void
}

export const InfoForm: React.FC<InfoFormProps> = ({ onInfoChange }) => {
	const { stops, selectedAddresses, contactInfo, setContactInfo } =
		useDeliveryFormStore((state) => ({
			stops: state.stops,
			selectedAddresses: state.selectedAddresses,
			contactInfo: state.contactInfo,
			setContactInfo: state.setContactInfo,
		}))

	const toast = useToast()

	// Initialize state for each stop's form
	const [forms, setForms] = useState<Record<number, ContactInfo>>({})
	const [activeStop, setActiveStop] = useState<number>(stops[0] || 1)

	// Initialize forms with data from the store or empty values
	useEffect(() => {
		const initialForms: Record<number, ContactInfo> = {}

		stops.forEach((stopId) => {
			initialForms[stopId] = contactInfo[stopId] || {
				name: '',
				phone: '',
				email: '',
				company: '',
				notes: '',
				saveToAddressBook: false,
			}
		})

		setForms(initialForms)

		// Set the first stop as active by default
		if (stops.length > 0 && !activeStop) {
			setActiveStop(stops[0])
		}
	}, [stops, contactInfo])

	// Check form validity on change
	useEffect(() => {
		const isValid = stops.every((stopId) => {
			const form = forms[stopId]
			return form && form.name && form.phone // Minimum required fields
		})

		onInfoChange(isValid)
	}, [forms, stops])

	// Handle input changes
	const handleInputChange = (
		stopId: number,
		field: keyof ContactInfo,
		value: string | boolean,
	) => {
		const updatedForms = {
			...forms,
			[stopId]: {
				...forms[stopId],
				[field]: value,
			},
		}

		setForms(updatedForms)

		// Save to store
		setContactInfo(stopId, updatedForms[stopId])
	}

	// Handle save to address book
	const handleSaveToAddressBook = (stopId: number) => {
		const form = forms[stopId]
		if (form.name && form.phone) {
			// Save logic would go here

			toast({
				title: 'Address saved',
				description: 'Contact info added to address book',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})

			handleInputChange(stopId, 'saveToAddressBook', true)
		} else {
			toast({
				title: 'Cannot save',
				description: 'Name and phone number are required',
				status: 'warning',
				duration: 3000,
				isClosable: true,
			})
		}
	}

	// Get stop type label
	const getStopTypeLabel = (index: number, total: number) => {
		if (index === 0) return 'Pickup'
		if (index === total - 1) return 'Dropoff'
		return `Stop ${index}`
	}

	// Get stop address display
	const getAddressDisplay = (address: Address | undefined) => {
		if (!address) return 'No address selected'
		return address.place_name || address.text || 'Selected Location'
	}

	return (
		<VStack spacing={6} align="stretch" w="100%">
			<Heading size="md" color="gray.800">
				Contact Information
			</Heading>
			<Text color="gray.600" fontWeight="medium">
				Please provide contact details for each stop.
			</Text>

			{/* Stop selector tabs */}
			<HStack spacing={2} overflowX="auto" pb={2}>
				{stops.map((stopId, index) => {
					// Determine button color scheme
					let colorScheme
					if (index === 0) {
						colorScheme = 'green'
					} else if (index === stops.length - 1) {
						colorScheme = 'red'
					} else {
						colorScheme = 'blue'
					}

					return (
						<Button
							key={stopId}
							size="md"
							variant={
								activeStop === stopId ? 'solid' : 'outline'
							}
							colorScheme={colorScheme}
							onClick={() => setActiveStop(stopId)}
							fontWeight="medium"
							boxShadow="sm"
							_hover={{
								transform: 'translateY(-2px)',
								boxShadow: 'md',
							}}
							minWidth="100px"
						>
							{getStopTypeLabel(index, stops.length)}
						</Button>
					)
				})}
			</HStack>

			{/* Current stop form */}
			{stops.map((stopId) => (
				<Box
					key={stopId}
					display={activeStop === stopId ? 'block' : 'none'}
					p={4}
					borderWidth="1px"
					borderRadius="md"
					borderColor={themeColors.lightGray}
					bg="white"
					boxShadow="sm"
				>
					<VStack spacing={4} align="stretch">
						<Flex justify="space-between" align="center">
							<Box>
								<Badge
									colorScheme={
										stopId === stops[0]
											? 'green'
											: stopId === stops[stops.length - 1]
												? 'red'
												: 'blue'
									}
									fontSize="sm"
									px={3}
									py={1}
									borderRadius="md"
									fontWeight="bold"
									textTransform="uppercase"
								>
									{getStopTypeLabel(
										stops.indexOf(stopId),
										stops.length,
									)}
								</Badge>
								<Text
									fontSize="lg"
									fontWeight="bold"
									mt={1}
									color="gray.800"
								>
									Order: {stopId}
								</Text>
							</Box>
							<Text fontSize="sm" color="gray.600">
								{getAddressDisplay(selectedAddresses[stopId])}
							</Text>
						</Flex>

						<Divider />

						<FormControl isRequired>
							<FormLabel color="gray.700" fontWeight="medium">
								Contact Name
							</FormLabel>
							<Input
								placeholder="Full name"
								value={forms[stopId]?.name || ''}
								onChange={(e) =>
									handleInputChange(
										stopId,
										'name',
										e.target.value,
									)
								}
								bg="gray.50"
								color="gray.800"
								borderColor={themeColors.lightGray}
								_hover={{ borderColor: themeColors.accent }}
								_placeholder={{ color: 'gray.500' }}
							/>
						</FormControl>

						<FormControl isRequired>
							<FormLabel color="gray.700" fontWeight="medium">
								Phone Number
							</FormLabel>
							<Input
								placeholder="Phone number"
								value={forms[stopId]?.phone || ''}
								onChange={(e) =>
									handleInputChange(
										stopId,
										'phone',
										e.target.value,
									)
								}
								bg="gray.50"
								color="gray.800"
								borderColor={themeColors.lightGray}
								_hover={{ borderColor: themeColors.accent }}
								_placeholder={{ color: 'gray.500' }}
							/>
						</FormControl>

						<FormControl>
							<FormLabel color="gray.700" fontWeight="medium">
								Email (Optional)
							</FormLabel>
							<Input
								placeholder="Email address"
								value={forms[stopId]?.email || ''}
								onChange={(e) =>
									handleInputChange(
										stopId,
										'email',
										e.target.value,
									)
								}
								bg="gray.50"
								color="gray.800"
								borderColor={themeColors.lightGray}
								_hover={{ borderColor: themeColors.accent }}
								_placeholder={{ color: 'gray.500' }}
							/>
						</FormControl>

						<FormControl>
							<FormLabel color="gray.700" fontWeight="medium">
								Company (Optional)
							</FormLabel>
							<Input
								placeholder="Company name"
								value={forms[stopId]?.company || ''}
								onChange={(e) =>
									handleInputChange(
										stopId,
										'company',
										e.target.value,
									)
								}
								bg="gray.50"
								color="gray.800"
								borderColor={themeColors.lightGray}
								_hover={{ borderColor: themeColors.accent }}
								_placeholder={{ color: 'gray.500' }}
							/>
						</FormControl>

						<FormControl>
							<FormLabel color="gray.700" fontWeight="medium">
								Address Notes (Optional)
							</FormLabel>
							<Textarea
								placeholder="Special instructions or notes"
								value={forms[stopId]?.notes || ''}
								onChange={(e) =>
									handleInputChange(
										stopId,
										'notes',
										e.target.value,
									)
								}
								bg="gray.50"
								color="gray.800"
								borderColor={themeColors.lightGray}
								_hover={{ borderColor: themeColors.accent }}
								_placeholder={{ color: 'gray.500' }}
							/>
						</FormControl>

						<Button
							onClick={() => handleSaveToAddressBook(stopId)}
							colorScheme="blue"
							variant="outline"
							isDisabled={forms[stopId]?.saveToAddressBook}
							size="md"
							mt={2}
							fontWeight="medium"
							_hover={{ bg: 'blue.50' }}
						>
							{forms[stopId]?.saveToAddressBook
								? 'Saved to Address Book'
								: 'Save address to Address Book'}
						</Button>
					</VStack>
				</Box>
			))}

			{/* Navigation buttons */}
			<HStack spacing={3} justify="center" mt={4}>
				{stops.map((stopId, index) => {
					// Determine button color scheme
					let colorScheme
					if (index === 0) {
						colorScheme = 'green'
					} else if (index === stops.length - 1) {
						colorScheme = 'red'
					} else {
						colorScheme = 'blue'
					}

					return (
						<Button
							key={stopId}
							size="sm"
							variant={
								activeStop === stopId ? 'solid' : 'outline'
							}
							colorScheme={colorScheme}
							onClick={() => setActiveStop(stopId)}
							fontWeight="medium"
							borderRadius="full"
							width="40px"
							height="40px"
							p={0}
						>
							{index + 1}
						</Button>
					)
				})}
			</HStack>
		</VStack>
	)
}
