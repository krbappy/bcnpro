import React, { ReactElement, useEffect } from 'react'
import {
	Flex,
	Box,
	Text,
	IconButton,
	Input,
	InputGroup,
	InputRightElement,
	List,
	ListItem,
} from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
import { FiMapPin } from 'react-icons/fi'
import { useAddressSearch } from '../hooks/useAddressSearch'
import { Address } from '../hooks/useAddressSelection'
import { themeColors } from '../theme'

interface AddressInputProps {
	number: number
	label: string
	placeholder?: string
	onRemove?: () => void
	showRemoveButton?: boolean
	onAddressSelect?: (address: Address | null) => void
	enableMapPickingMode?: (index: number) => void
	cancelMapPickingMode?: () => void
	isMapPickingMode?: boolean
	activeAddressIndex?: number | null
	selectedAddress?: Address | null
}

export const AddressInput = ({
	number,
	label,
	placeholder = 'Search for address',
	onRemove,
	showRemoveButton = false,
	onAddressSelect,
	enableMapPickingMode,
	cancelMapPickingMode,
	isMapPickingMode = false,
	activeAddressIndex = null,
	selectedAddress = null,
}: AddressInputProps): ReactElement => {
	const {
		inputValue,
		setInputValue,
		suggestions,
		showSuggestions,
		setShowSuggestions,
		suggestionsRef,
		handleInputChange,
		handleSelectAddress,
	} = useAddressSearch((address) => {
		if (onAddressSelect) {
			onAddressSelect(address)
		}
	})

	// Check if this specific address input is in map picking mode
	const isThisInputInPickingMode =
		isMapPickingMode && activeAddressIndex === number - 1

	// Handle map picking button click
	const handleMapPickingClick = () => {
		if (isThisInputInPickingMode && cancelMapPickingMode) {
			// If already in picking mode for this input, cancel it
			cancelMapPickingMode()
		} else if (enableMapPickingMode) {
			// Enable picking mode for this input
			enableMapPickingMode(number - 1)
		}
	}

	// Update input value when selected address changes
	useEffect(() => {
		if (selectedAddress) {
			setInputValue(selectedAddress.place_name)
		}
	}, [selectedAddress, setInputValue])

	return (
		<Flex width="100%" direction="row" mb={4} align="flex-start">
			<Flex
				mr={4}
				align="center"
				justify="center"
				bg={themeColors.text}
				color="white"
				w="30px"
				h="30px"
				borderRadius="full"
				fontWeight="bold"
			>
				{number}
			</Flex>

			<Box flex={1} position="relative" ref={suggestionsRef}>
				<Text
					fontWeight="bold"
					mb={2}
					fontSize="sm"
					color={themeColors.text}
				>
					{label}
				</Text>

				<Flex>
					<InputGroup>
						<Input
							placeholder={placeholder}
							borderRadius="md"
							bg="white"
							borderColor={
								isThisInputInPickingMode
									? themeColors.accent
									: themeColors.lightGray
							}
							color={themeColors.text}
							_focus={{ borderColor: themeColors.accent }}
							value={inputValue}
							onChange={handleInputChange}
							onFocus={() => {
								if (suggestions.length > 0) {
									setShowSuggestions(true)
								}
							}}
							isDisabled={isThisInputInPickingMode}
						/>
						<InputRightElement>
							<CloseIcon
								fontSize="xs"
								color="gray.500"
								cursor="pointer"
								onClick={() => {
									setInputValue('')
									setShowSuggestions(false)
									if (onAddressSelect) {
										onAddressSelect(null)
									}
								}}
							/>
						</InputRightElement>
					</InputGroup>

					<IconButton
						ml={2}
						aria-label="Pick location from map"
						icon={<FiMapPin />}
						variant={isThisInputInPickingMode ? 'solid' : 'outline'}
						colorScheme={
							isThisInputInPickingMode ? 'blue' : undefined
						}
						color={
							isThisInputInPickingMode
								? 'white'
								: themeColors.gray
						}
						borderColor={themeColors.lightGray}
						size="md"
						borderRadius="md"
						onClick={handleMapPickingClick}
					/>
				</Flex>

				{/* Address suggestions dropdown */}
				{showSuggestions && suggestions.length > 0 && (
					<Box
						position="absolute"
						zIndex={100}
						width="100%"
						mt={1}
						bg="white"
						borderRadius="md"
						boxShadow="md"
						border="1px solid"
						borderColor={themeColors.lightGray}
					>
						<List spacing={0}>
							{suggestions.map((suggestion, index) => (
								<ListItem
									key={index}
									py={2}
									px={4}
									_hover={{ bg: 'gray.50' }}
									cursor="pointer"
									onClick={() =>
										handleSelectAddress(suggestion)
									}
								>
									<Text
										fontSize="sm"
										color={themeColors.text}
									>
										{suggestion.place_name}
									</Text>
								</ListItem>
							))}
						</List>
					</Box>
				)}
			</Box>

			{showRemoveButton && onRemove && (
				<IconButton
					ml={2}
					aria-label="Remove stop"
					icon={<CloseIcon />}
					variant="outline"
					color={themeColors.gray}
					borderColor={themeColors.lightGray}
					size="md"
					borderRadius="md"
					onClick={onRemove}
				/>
			)}
		</Flex>
	)
}
