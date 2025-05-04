import { FunctionComponent, ReactElement } from 'react'
import { Badge } from '@chakra-ui/react'

interface RoleBadgeProps {
	role: 'owner' | 'admin' | 'member'
}

export const RoleBadge: FunctionComponent<RoleBadgeProps> = ({
	role,
}): ReactElement => {
	const getBadgeColor = () => {
		switch (role) {
			case 'owner':
				return 'purple'
			case 'admin':
				return 'red'
			case 'member':
				return 'green'
			default:
				return 'gray'
		}
	}

	return (
		<Badge colorScheme={getBadgeColor()} variant="solid">
			{role.charAt(0).toUpperCase() + role.slice(1)}
		</Badge>
	)
}
