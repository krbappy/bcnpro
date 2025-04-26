import React, { ReactElement } from 'react'
import { Flex, Button, Box, Text, HStack } from '@chakra-ui/react'
import { themeColors } from '../theme'

interface StepperFooterProps {
	onReset: () => void
	onNext: () => void
	onBack?: () => void
	isLastStep: boolean
	currentStep: number
	distance?: string
	isNextDisabled?: boolean
	vehicle?: string
	timing?: string
	total?: string
}

export const StepperFooter = ({
	onReset,
	onNext,
	onBack,
	isLastStep,
	currentStep,
	distance = '-',
	isNextDisabled = false,
	vehicle = '-',
	timing = '-',
	total = '-',
}: StepperFooterProps): ReactElement => {
	const isReviewStep = currentStep === 6

	return (
		<Flex
			justify="space-between"
			align="center"
			py={3}
			px={4}
			borderTop="1px solid"
			borderColor={themeColors.lightGray}
			bg={isReviewStep ? 'white' : 'transparent'}
			position="sticky"
			bottom={0}
			left={0}
			right={0}
			width="100%"
			zIndex={100}
		>
			{currentStep === 1 ? (
				<Button
					variant="outline"
					onClick={onReset}
					color={themeColors.text}
					borderColor={themeColors.lightGray}
					size="md"
					minW="100px"
				>
					Reset
				</Button>
			) : (
				<Button
					variant="outline"
					onClick={onBack}
					color={themeColors.text}
					borderColor={themeColors.lightGray}
					size="md"
					minW="100px"
				>
					Back
				</Button>
			)}

			{isReviewStep ? (
				<HStack spacing={3} mx={2} flex={1} justify="space-around">
					<Box textAlign="center">
						<Text
							fontSize="xs"
							fontWeight="medium"
							color={themeColors.gray}
						>
							DISTANCE
						</Text>
						<Text fontWeight="bold">{distance}</Text>
					</Box>
					<Box textAlign="center">
						<Text
							fontSize="xs"
							fontWeight="medium"
							color={themeColors.gray}
						>
							VEHICLE
						</Text>
						<Text fontWeight="bold">{vehicle}</Text>
					</Box>
					<Box textAlign="center">
						<Text
							fontSize="xs"
							fontWeight="medium"
							color={themeColors.gray}
						>
							TIMING
						</Text>
						<Text fontWeight="bold">{timing}</Text>
					</Box>
					<Box textAlign="center">
						<Text
							fontSize="xs"
							fontWeight="medium"
							color={themeColors.gray}
						>
							TOTAL
						</Text>
						<Text fontWeight="bold">{total}</Text>
					</Box>
				</HStack>
			) : (
				<Box flex={1}></Box> // Empty space for non-review steps
			)}

			<Button
				bg={themeColors.accent}
				color="white"
				_hover={{ bg: `${themeColors.accent}cc` }}
				onClick={onNext}
				isDisabled={isNextDisabled}
				opacity={isNextDisabled ? 0.7 : 1}
				size="md"
				minW="100px"
				borderRadius="md"
				fontWeight="600"
			>
				{isLastStep ? 'Submit' : 'Next'}
			</Button>
		</Flex>
	)
}
