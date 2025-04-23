import React, { ReactElement } from 'react'
import { Flex, Box, Button } from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import { AddressInput } from './AddressInput'
import { Address } from '../hooks/useAddressSelection'
import { themeColors } from '../theme'

interface StopsListProps {
	stops: number[]
	onAddStop: () => void
	onRemoveStop: (index: number) => void
	onAddressSelect: (index: number, address: Address | null) => void
	enableMapPickingMode: (index: number) => void
	cancelMapPickingMode: () => void
	isMapPickingMode: boolean
	activeAddressIndex: number | null
	selectedAddresses: Record<number, Address>
}

export const StopsList = ({
	stops,
	onAddStop,
	onRemoveStop,
	onAddressSelect,
	enableMapPickingMode,
	cancelMapPickingMode,
	isMapPickingMode,
	activeAddressIndex,
	selectedAddresses,
}: StopsListProps): ReactElement => {
	return (
		<Flex justify="center" align="center" flexDirection="column">
			{/* Stops Form */}
			<Box mb={8} width="100%">
				{stops.map((stop, index) => (
					<AddressInput
						key={index}
						number={index + 1}
						label={
							index === 0
								? 'ORIGIN'
								: index === 1
									? 'DESTINATION'
									: `STOP ${index}`
						}
						showRemoveButton={index > 1}
						onRemove={() => onRemoveStop(index)}
						onAddressSelect={(address) =>
							onAddressSelect(index, address)
						}
						enableMapPickingMode={enableMapPickingMode}
						cancelMapPickingMode={cancelMapPickingMode}
						isMapPickingMode={isMapPickingMode}
						activeAddressIndex={activeAddressIndex}
						selectedAddress={selectedAddresses[index]}
					/>
				))}
			</Box>

			{/* Add Another Stop Button */}
			<Button
				leftIcon={<AddIcon />}
				variant="outline"
				mb={8}
				onClick={onAddStop}
				color={themeColors.accent}
				borderColor={themeColors.accent}
				_hover={{ bg: `${themeColors.accent}10` }}
			>
				Add another stop
			</Button>
		</Flex>
	)
}
