import { Badge } from '@chakra-ui/react'
import { FunctionComponent, ReactElement } from 'react'

interface StatusBadgeProps {
	status: 'active' | 'pending' | 'inactive'
}

export const StatusBadge: FunctionComponent<StatusBadgeProps> = ({
	status,
}): ReactElement => {
	const colorScheme = {
		active: 'green',
		pending: 'yellow',
		inactive: 'red',
	}[status]

	return (
		<Badge
			colorScheme={colorScheme}
			fontSize="0.8em"
			borderRadius="full"
			px={2}
		>
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</Badge>
	)
}
