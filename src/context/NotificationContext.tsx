import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
	useRef,
} from 'react'
import { io, Socket } from 'socket.io-client'
import axios from 'axios'
import { useAuth } from './AuthContext'

interface Notification {
	_id: string
	userId: string
	message: string
	type: 'booking' | 'payment' | 'team' | 'system'
	seen: boolean
	createdAt: string
}

interface NotificationContextType {
	notifications: Notification[]
	unreadCount: number
	fetchNotifications: () => Promise<void>
	markAsRead: (notificationId: string) => Promise<void>
	markAllAsRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined,
)

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [notifications, setNotifications] = useState<Notification[]>([])
	const socketRef = useRef<Socket | null>(null)

	// const [socket, setSocket] = useState<Socket | null>(null)
	const [unreadCount, setUnreadCount] = useState(0)
	const { currentUser } = useAuth()
	const { userProfile } = useAuth()
	console.log(userProfile, 'userProfile')

	// Initialize socket connection and fetch notifications
	useEffect(() => {
		const initializeSocket = async () => {
			if (!currentUser) {
				setNotifications([])
				setUnreadCount(0)
				return
			}

			try {
				console.log('Initializing socket connection...')
				const token = await currentUser.getIdToken()
				socketRef.current = io(
					import.meta.env.VITE_BASE_URL || 'http://localhost:5000',
					{
						query: {
							userId: userProfile?._id,
						},
						auth: {
							token, // Now using the actual token string
						},
						transports: ['websocket'],
						reconnection: true,
						reconnectionAttempts: 5,
						reconnectionDelay: 1000,
					},
				)

				// Listen for new notifications

				socketRef.current?.on('connect_error', (error) => {
					console.error('Socket connection error:', error)
				})

				socketRef.current?.on('disconnect', (reason) => {
					console.log('Socket disconnected:', reason)
				})

				socketRef.current?.on(
					'new_notification',
					(notification: Notification) => {
						console.log('Received new notification:', notification)
						// Update notifications and unread count in a single state update
						setNotifications((prev) => {
							const newNotifications = [notification, ...prev]
							console.log(
								'Updated notifications:',
								newNotifications,
							)
							return newNotifications
						})
						setUnreadCount((prev) => {
							const newCount = prev + 1
							console.log('Updated unread count:', newCount)
							return newCount
						})
					},
				)

				// Store socket in state for cleanup
				// setSocket(socketRef.current)

				// Initial fetch of notifications
				await fetchNotifications()
			} catch (error) {
				console.error('Error initializing socket:', error)
			}
		}

		initializeSocket()

		return () => {
			console.log('Cleaning up socket connection...')
			if (socketRef.current) {
				socketRef.current?.removeAllListeners()
				socketRef.current?.close()
				socketRef.current = null
			}
		}
	}, [currentUser])

	// Fetch historical notifications
	const fetchNotifications = async () => {
		if (!currentUser) return

		try {
			console.log('Fetching notifications...')
			const token = await currentUser.getIdToken()
			const response = await axios.get(
				`${import.meta.env.VITE_BASE_URL}/api/notifications`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			)
			const unreadCount = response.data.filter(
				(n: Notification) => !n.seen,
			).length
			console.log('Fetched notifications:', response.data)
			console.log('Unread count:', unreadCount)
			setNotifications(response.data)
			setUnreadCount(unreadCount)
		} catch (error) {
			console.error('Error fetching notifications:', error)
		}
	}

	// Mark notification as read
	const markAsRead = async (notificationId: string) => {
		if (!currentUser) return

		try {
			const token = await currentUser.getIdToken()
			await axios.patch(
				`${import.meta.env.VITE_BASE_URL}/api/notifications/${notificationId}/read`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			)
			setNotifications((prev) =>
				prev.map((notification) =>
					notification._id === notificationId
						? { ...notification, seen: true }
						: notification,
				),
			)
			setUnreadCount((prev) => Math.max(0, prev - 1))
		} catch (error) {
			console.error('Error marking notification as read:', error)
		}
	}

	// Mark all notifications as read
	const markAllAsRead = async () => {
		if (!currentUser) return

		try {
			const token = await currentUser.getIdToken()
			await axios.patch(
				`${import.meta.env.VITE_BASE_URL}/api/notifications/mark-all-read`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			)
			setNotifications((prev) =>
				prev.map((notification) => ({ ...notification, seen: true })),
			)
			setUnreadCount(0)
		} catch (error) {
			console.error('Error marking all notifications as read:', error)
		}
	}

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				fetchNotifications,
				markAsRead,
				markAllAsRead,
			}}
		>
			{children}
		</NotificationContext.Provider>
	)
}

export const useNotifications = () => {
	const context = useContext(NotificationContext)
	if (context === undefined) {
		throw new Error(
			'useNotifications must be used within a NotificationProvider',
		)
	}
	return context
}
