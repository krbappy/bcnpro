import React, { ReactElement } from 'react'
import { Flex } from '@chakra-ui/react'

// Icons
import {
	LocationIcon,
	VehicleIcon,
	TimingIcon,
	OrdersIcon,
	InfoIcon,
	ReviewIcon,
} from '../icons'
import { StepItem } from './StepItem'

interface StepperNavProps {
	currentStep: number
}

export const StepperNav = ({ currentStep }: StepperNavProps): ReactElement => {
	return (
		<Flex justify="space-between" mb={8} px={10}>
			<StepItem
				label="STOPS"
				isActive={currentStep === 1}
				icon={
					<LocationIcon
						fill={currentStep === 1 ? '#FFFFFF' : '#191919'}
					/>
				}
			/>
			<StepItem
				label="VEHICLE"
				isActive={currentStep === 2}
				icon={
					<VehicleIcon
						fill={currentStep === 2 ? '#FFFFFF' : '#191919'}
					/>
				}
			/>
			<StepItem
				label="TIMING"
				isActive={currentStep === 3}
				icon={
					<TimingIcon
						fill={currentStep === 3 ? '#FFFFFF' : '#191919'}
					/>
				}
			/>
			<StepItem
				label="ORDERS"
				isActive={currentStep === 4}
				icon={
					<OrdersIcon
						fill={currentStep === 4 ? '#FFFFFF' : '#191919'}
					/>
				}
			/>
			<StepItem
				label="INFO"
				isActive={currentStep === 5}
				icon={
					<InfoIcon
						fill={currentStep === 5 ? '#FFFFFF' : '#191919'}
					/>
				}
			/>
			<StepItem
				label="REVIEW"
				isActive={currentStep === 6}
				icon={
					<ReviewIcon
						fill={currentStep === 6 ? '#FFFFFF' : '#191919'}
					/>
				}
			/>
		</Flex>
	)
}
