import { FunctionComponent, ReactElement, useEffect } from 'react'
import {
	Box,
	VStack,
	Text,
	Button,
	useToast,
	Flex,
	Badge,
} from '@chakra-ui/react'
import { useNotifications } from '../context/NotificationContext'
import { format } from 'date-fns'

export const Notifications: FunctionComponent = (): ReactElement => {
	const { notifications, fetchNotifications, markAsRead, markAllAsRead } =
		useNotifications()
	const toast = useToast()
	// console.log(notifications, 'notifications')

	useEffect(() => {
		fetchNotifications()
	}, [])

	const handleMarkAllAsRead = async () => {
		try {
			await markAllAsRead()
			toast({
				title: 'All notifications marked as read',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})
		} catch (error) {
			toast({
				title: 'Failed to mark notifications as read',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
		}
	}

	const handleMarkAsRead = async (notificationId: string) => {
		try {
			await markAsRead(notificationId)
		} catch (error) {
			toast({
				title: 'Failed to mark notification as read',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
		}
	}

	return (
		<Box p={4} maxW="800px" mx="auto">
			<Flex justify="space-between" align="center" mb={4}>
				<Text fontSize="2xl" fontWeight="bold">
					Notifications
				</Text>
				<Button
					colorScheme="blue"
					onClick={handleMarkAllAsRead}
					isDisabled={notifications.every((n) => n.seen)}
				>
					Mark all as read
				</Button>
			</Flex>

			<VStack spacing={4} align="stretch">
				{notifications.length === 0 ? (
					<Text textAlign="center" color="gray.500">
						No notifications
					</Text>
				) : (
					notifications.map((notification) => (
						<Box
							key={notification._id}
							p={4}
							borderWidth="1px"
							borderRadius="md"
							bg={notification.seen ? 'transparent' : 'blue.50'}
							position="relative"
							onClick={() => handleMarkAsRead(notification._id)}
							cursor="pointer"
							_hover={{
								bg: notification.seen ? 'gray.50' : 'blue.100',
							}}
						>
							<Flex justify="space-between" align="start">
								<VStack align="start" spacing={1}>
									<Text fontWeight="medium">
										{notification.message}
									</Text>
									<Text fontSize="sm" color="gray.500">
										{format(
											new Date(notification.createdAt),
											'PPp',
										)}
									</Text>
								</VStack>
								<Badge
									colorScheme={
										notification.type === 'booking'
											? 'green'
											: notification.type === 'payment'
												? 'blue'
												: notification.type === 'team'
													? 'purple'
													: 'gray'
									}
								>
									{notification.type}
								</Badge>
							</Flex>
							{!notification.seen && (
								<Box
									position="absolute"
									top={2}
									right={2}
									w={2}
									h={2}
									borderRadius="full"
									bg="blue.500"
								/>
							)}
						</Box>
					))
				)}
			</VStack>
		</Box>
	)
}
