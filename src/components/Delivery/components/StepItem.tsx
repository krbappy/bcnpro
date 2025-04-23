import React, { ReactElement } from 'react'
import { Flex, Box, Text } from '@chakra-ui/react'
import { themeColors } from '../theme'

interface StepItemProps {
	label: string
	isActive: boolean
	icon: React.ReactElement
}

export const StepItem = ({
	label,
	isActive,
	icon,
}: StepItemProps): ReactElement => {
	const iconColor = isActive ? '#FCFCFC' : themeColors.text
	return (
		<Flex align="center" justify="center" direction="column">
			<Box
				p={2}
				borderRadius="full"
				bg={isActive ? themeColors.accent : 'transparent'}
				color={isActive ? 'white' : themeColors.gray}
				border={isActive ? 'none' : `1px solid ${themeColors.gray}`}
				display="flex"
				alignItems="center"
				justifyContent="center"
				width="40px"
				height="40px"
			>
				{React.cloneElement(icon, {
					fill: iconColor,
				})}
			</Box>
			<Text
				mt={2}
				fontSize="sm"
				color={isActive ? themeColors.text : themeColors.gray}
				fontWeight={isActive ? 'medium' : 'normal'}
			>
				{label}
			</Text>
		</Flex>
	)
}
