import React, { ReactElement } from 'react'
import { Text, Box } from '@chakra-ui/react'
import { themeColors } from '../theme'

interface StepperHeaderProps {
	title: string
	description: string
	errorMessage?: string | null
}

export const StepperHeader = ({
	title,
	description,
	errorMessage,
}: StepperHeaderProps): ReactElement => {
	return (
		<>
			<Text
				fontSize="2xl"
				fontWeight="bold"
				mb={2}
				color={themeColors.text}
				textAlign="center"
				textTransform="uppercase"
			>
				{title}
			</Text>
			<Text
				fontSize="md"
				mb={6}
				color={themeColors.text}
				textAlign="center"
			>
				{description}
			</Text>

			{/* Error message display */}
			{errorMessage && (
				<Box
					mb={4}
					p={3}
					bg="red.50"
					color="red.600"
					borderRadius="md"
					borderLeft="4px solid"
					borderLeftColor="red.500"
				>
					<Text>{errorMessage}</Text>
				</Box>
			)}
		</>
	)
}
