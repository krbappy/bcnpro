import React, { ReactElement } from 'react'
import { Flex, Button, Box, Text } from '@chakra-ui/react'
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
	return (
		<Flex justify="space-between" align="center" mt={6}>
			{currentStep === 1 ? (
				<Button
					variant="outline"
					onClick={onReset}
					color={themeColors.text}
					borderColor={themeColors.lightGray}
				>
					Reset
				</Button>
			) : (
				<Button
					variant="outline"
					onClick={onBack}
					color={themeColors.text}
					borderColor={themeColors.lightGray}
				>
					Back
				</Button>
			)}

			<Flex align="center" gap={10}>
				<Box textAlign="center">
					<Text fontSize="xs" color={themeColors.gray}>
						DISTANCE
					</Text>
					<Text color={themeColors.text}>{distance}</Text>
				</Box>
				<Box textAlign="center">
					<Text fontSize="xs" color={themeColors.gray}>
						VEHICLE
					</Text>
					<Text color={themeColors.text}>{vehicle}</Text>
				</Box>
				<Box textAlign="center">
					<Text fontSize="xs" color={themeColors.gray}>
						TIMING
					</Text>
					<Text color={themeColors.text}>{timing}</Text>
				</Box>
				<Box textAlign="center">
					<Text fontSize="xs" color={themeColors.gray}>
						TOTAL
					</Text>
					<Text color={themeColors.text}>{total}</Text>
				</Box>
			</Flex>

			<Button
				bg={themeColors.accent}
				color="white"
				_hover={{ bg: `${themeColors.accent}80` }}
				onClick={onNext}
				isDisabled={isNextDisabled}
				opacity={isNextDisabled ? 0.7 : 1}
			>
				{isLastStep ? 'Submit' : 'Next'}
			</Button>
		</Flex>
	)
}
