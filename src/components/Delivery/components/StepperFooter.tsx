import React, { ReactElement } from 'react'
import { Flex, Button, Box, Text } from '@chakra-ui/react'
import { themeColors } from '../theme'

interface StepperFooterProps {
	onReset: () => void
	onNext: () => void
	isLastStep: boolean
}

export const StepperFooter = ({
	onReset,
	onNext,
	isLastStep,
}: StepperFooterProps): ReactElement => {
	return (
		<Flex justify="space-between" align="center" mt={6}>
			<Button
				variant="outline"
				onClick={onReset}
				color={themeColors.text}
				borderColor={themeColors.lightGray}
			>
				Reset
			</Button>

			<Flex align="center" gap={10}>
				<Box textAlign="center">
					<Text fontSize="xs" color={themeColors.gray}>
						DISTANCE
					</Text>
					<Text color={themeColors.text}>-</Text>
				</Box>
				<Box textAlign="center">
					<Text fontSize="xs" color={themeColors.gray}>
						VEHICLE
					</Text>
					<Text color={themeColors.text}>-</Text>
				</Box>
				<Box textAlign="center">
					<Text fontSize="xs" color={themeColors.gray}>
						TIMING
					</Text>
					<Text color={themeColors.text}>-</Text>
				</Box>
				<Box textAlign="center">
					<Text fontSize="xs" color={themeColors.gray}>
						TOTAL
					</Text>
					<Text color={themeColors.text}>-</Text>
				</Box>
			</Flex>

			<Button
				bg={themeColors.accent}
				color="white"
				_hover={{ bg: `${themeColors.accent}80` }}
				onClick={onNext}
			>
				{isLastStep ? 'Submit' : 'Next'}
			</Button>
		</Flex>
	)
}
