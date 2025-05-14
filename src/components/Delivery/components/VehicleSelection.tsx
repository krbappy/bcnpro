import React, { useState } from 'react'
import {
	Box,
	Grid,
	Text,
	Flex,
	Image,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Button,
	FormControl,
	FormLabel,
	Select,
	Checkbox,
	VStack,
} from '@chakra-ui/react'
import { CheckIcon } from '@chakra-ui/icons'
import { themeColors } from '../theme'

// Define vehicle data structure
interface VehicleData {
	id: string
	name: string
	description: string
	maxWeight: string
	imagePath: string
	hasAdditionalQuestions?: boolean
}

interface VehicleSelectionProps {
	onVehicleSelect: (
		vehicleType: string,
		additionalInfo?: AdditionalVehicleInfo,
	) => void
	selectedVehicle: string | null
}

interface AdditionalVehicleInfo {
	truckSize?: string
	requiresLiftgate?: boolean
	requiresPalletJack?: boolean
}

// Vehicle data with attributes matching the design
const VEHICLES: VehicleData[] = [
	{
		id: 'car',
		name: 'Car',
		description: 'Fast transport for lightweight tools or parts',
		maxWeight: '200 LBS MAX',
		imagePath: '/car.png',
	},
	{
		id: 'suv',
		name: 'SUV',
		description: 'Carries multiple boxes or small equipment',
		maxWeight: '800 LBS MAX',
		imagePath: '/suv.png',
	},
	{
		id: 'cargo-van',
		name: 'Cargo Van',
		description: 'Secure enclosed space for mid-size deliveries',
		maxWeight: '1.5K LBS MAX',
		imagePath: '/cargo.png',
	},
	{
		id: 'pickup-truck',
		name: 'Pickup Truck',
		description: 'Ideal for pipe, lumber, or oversized boxes',
		maxWeight: '1.5K LBS MAX',
		imagePath: '/pickuptrack.png',
	},
	{
		id: 'sprinter-van',
		name: 'Sprinter Van',
		description: 'Tall interior for pallets and large freight',
		maxWeight: '4K LBS MAX',
		imagePath: '/sprinter.png',
	},
	{
		id: 'box-truck',
		name: 'Box Truck',
		description: 'Heavy-duty delivery for large loads or appliances',
		maxWeight: '10K LBS MAX',
		imagePath: '/box_truck.png',
		hasAdditionalQuestions: true,
	},
	{
		id: 'hotshot-trailer',
		name: 'Hotshot Trailer',
		description: 'Handles long, oversized freight up to 40 feet',
		maxWeight: '16K LBS MAX',
		imagePath: '/hotshot.png',
	},
	{
		id: 'semi-truck',
		name: 'Semi Truck',
		description: 'Maximum capacity for bulk or industrial loads',
		maxWeight: '45K LBS MAX',
		imagePath: '/semi_truck.png',
	},
]

export const VehicleSelection: React.FC<VehicleSelectionProps> = ({
	onVehicleSelect,
	selectedVehicle,
}) => {
	// Placeholder image for error fallback
	const placeholderImage = '/vehicle-placeholder.svg'

	// State for modal
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [tempSelectedVehicle, setTempSelectedVehicle] = useState<
		string | null
	>(null)
	const [additionalInfo, setAdditionalInfo] = useState<AdditionalVehicleInfo>(
		{
			truckSize: '16ft',
			requiresLiftgate: false,
			requiresPalletJack: false,
		},
	)

	// Handle vehicle selection
	const handleVehicleSelect = (vehicleId: string) => {
		const vehicle = VEHICLES.find((v) => v.id === vehicleId)

		if (vehicle?.hasAdditionalQuestions) {
			setTempSelectedVehicle(vehicleId)
			setIsModalOpen(true)
		} else {
			onVehicleSelect(vehicleId)
		}
	}

	// Handle modal submission
	const handleModalSubmit = () => {
		if (tempSelectedVehicle) {
			onVehicleSelect(tempSelectedVehicle, additionalInfo)
			setIsModalOpen(false)
		}
	}

	return (
		<Box mb={8}>
			<Grid
				templateColumns={{
					base: 'repeat(2, 1fr)',
					md: 'repeat(2, 1fr)',
				}}
				gap="19px"
			>
				{VEHICLES.map((vehicle) => (
					<Box
						key={vehicle.id}
						borderWidth="1px"
						borderRadius="md"
						borderColor={
							selectedVehicle === vehicle.id
								? themeColors.accent
								: themeColors.lightGray
						}
						p={4}
						position="relative"
						cursor="pointer"
						onClick={() => handleVehicleSelect(vehicle.id)}
						tabIndex={0}
						_hover={{
							borderColor: themeColors.accent + '80',
							boxShadow: 'sm',
						}}
						textAlign="center"
					>
						{/* Check icon for selected vehicle */}
						{selectedVehicle === vehicle.id && (
							<Flex
								position="absolute"
								top={2}
								left={2}
								w="20px"
								h="20px"
								borderRadius="full"
								bgColor={themeColors.accent}
								alignItems="center"
								justifyContent="center"
							>
								<CheckIcon color="white" w={3} h={3} />
							</Flex>
						)}

						{/* Vehicle image */}
						<Image
							src={vehicle.imagePath}
							fallbackSrc={placeholderImage}
							alt={vehicle.name}
							mx="auto"
							h="75px"
							mb={2}
						/>

						{/* Vehicle name */}
						<Text
							fontSize="18px"
							fontWeight="600"
							lineHeight="20px"
							textAlign="center"
							mb={2}
							textColor={themeColors.text}
						>
							{vehicle.name}
						</Text>

						{/* Description */}
						<Text
							fontSize="12px"
							fontWeight="500"
							lineHeight="1.25"
							maxWidth="145px"
							mx="auto"
							mb={2}
							textAlign="center"
							textColor={themeColors.text}
						>
							{vehicle.description}
						</Text>

						{/* Max weight */}
						<Text
							fontSize="11px"
							fontWeight="600"
							letterSpacing="0.02em"
							color={themeColors.gray}
							textTransform="uppercase"
							textAlign="center"
							mt={1}
						>
							{vehicle.maxWeight}
						</Text>
					</Box>
				))}
			</Grid>

			{/* Additional Questions Modal */}
			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Additional Information Needed</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing={4} align="stretch">
							<FormControl>
								<FormLabel>Choose Truck Size</FormLabel>
								<Select
									value={additionalInfo.truckSize}
									onChange={(e) =>
										setAdditionalInfo({
											...additionalInfo,
											truckSize: e.target.value,
										})
									}
								>
									<option value="16ft">16ft Box Truck</option>
									<option value="24ft">24ft Box Truck</option>
									<option value="26ft">26ft Box Truck</option>
								</Select>
							</FormControl>

							<FormControl>
								<Checkbox
									isChecked={additionalInfo.requiresLiftgate}
									onChange={(e) =>
										setAdditionalInfo({
											...additionalInfo,
											requiresLiftgate: e.target.checked,
										})
									}
								>
									Requires liftgate
								</Checkbox>
							</FormControl>

							<FormControl>
								<Checkbox
									isChecked={
										additionalInfo.requiresPalletJack
									}
									onChange={(e) =>
										setAdditionalInfo({
											...additionalInfo,
											requiresPalletJack:
												e.target.checked,
										})
									}
								>
									Requires pallet jack
								</Checkbox>
							</FormControl>
						</VStack>
					</ModalBody>

					<ModalFooter>
						<Button
							colorScheme="blue"
							mr={3}
							onClick={handleModalSubmit}
						>
							Confirm Selection
						</Button>
						<Button
							variant="ghost"
							onClick={() => setIsModalOpen(false)}
						>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	)
}
