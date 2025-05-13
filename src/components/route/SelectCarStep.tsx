import { FunctionComponent } from 'react'
import { Box, Grid, Text, Flex, Image, Button } from '@chakra-ui/react'
import { CheckIcon } from '@chakra-ui/icons'
import { themeColors } from '../../components/Delivery/theme'

interface SelectCarStepProps {
	onNext: () => void
	onBack: () => void
	selectedVehicle: string | null
	onVehicleSelect: (vehicleType: string) => void
}

// Vehicle data with attributes matching the design
const VEHICLES = [
	{
		id: 'car',
		name: 'Car',
		description: 'Small boxes, bags, fittings, fasteners, romex',
		maxWeight: '200 LBS MAX',
		imagePath: '/car.png',
	},
	{
		id: 'suv',
		name: 'SUV',
		description: 'Boxes, tankless water heaters, electrical panels',
		maxWeight: '800 LBS MAX',
		imagePath: '/suv.png',
	},
	{
		id: 'cargo-van',
		name: 'Cargo Van',
		description: 'Pickup truck capacity enclosed for protection',
		maxWeight: '1.5K LBS MAX',
		imagePath: '/cargo.png',
	},
	{
		id: 'pickup-truck',
		name: 'Pickup Truck',
		description: "Pallets, 10' pipe or lumber, large boxes",
		maxWeight: '1.5K LBS MAX',
		imagePath: '/pickuptrack.png',
	},
]

export const SelectCarStep: FunctionComponent<SelectCarStepProps> = ({
	onNext,
	onBack,
	selectedVehicle,
	onVehicleSelect,
}) => {
	// Placeholder image for error fallback
	const placeholderImage = '/vehicle-placeholder.svg'

	return (
		<Box>
			<Grid
				templateColumns={{
					base: 'repeat(2, 1fr)',
					md: 'repeat(3, 1fr)',
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
						onClick={() => onVehicleSelect(vehicle.id)}
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

			<Flex mt={6} justifyContent="space-between">
				<Button onClick={onBack} colorScheme="gray.500">
					Back
				</Button>
				<Button
					colorScheme="orange"
					onClick={onNext}
					disabled={!selectedVehicle}
				>
					Next
				</Button>
			</Flex>
		</Box>
	)
}

export default SelectCarStep
