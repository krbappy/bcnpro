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
	const iconColor = isActive ? '#FFFFFF' : themeColors.text
	return (
		<Flex align="center" justify="center" direction="column">
			<Box
				p={2}
				borderRadius="full"
				bg={isActive ? themeColors.accent : 'transparent'}
				color={isActive ? 'white' : themeColors.gray}
				border={
					isActive ? 'none' : `1px solid ${themeColors.lightGray}`
				}
				display="flex"
				alignItems="center"
				justifyContent="center"
				width="48px"
				height="48px"
				boxShadow={isActive ? '0px 2px 5px rgba(0, 0, 0, 0.1)' : 'none'}
			>
				{React.cloneElement(icon, {
					fill: iconColor,
					size: 20,
				})}
			</Box>
			<Text
				mt={2}
				fontSize="xs"
				color={isActive ? themeColors.accent : themeColors.gray}
				fontWeight={isActive ? 'bold' : 'medium'}
				textTransform="uppercase"
				letterSpacing="0.5px"
			>
				{label}
			</Text>
		</Flex>
	)
}
