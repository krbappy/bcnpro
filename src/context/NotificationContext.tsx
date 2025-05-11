import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
	useRef,
	useCallback,
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
	const [unreadCount, setUnreadCount] = useState(0)
	const { currentUser, userProfile, loadingAuth } = useAuth()

	const fetchNotifications = useCallback(async () => {
		if (!currentUser || !userProfile?._id) {
			console.log(
				'fetchNotifications skipped: No currentUser or userProfile._id',
				{
					hasCurrentUser: !!currentUser,
					hasUserProfileId: !!userProfile?._id,
				},
			)
			return
		}

		try {
			console.log(
				`Fetching notifications for userProfile ID: ${userProfile._id}...`,
			)
			const token = await currentUser.getIdToken()
			const response = await axios.get(
				`${import.meta.env.VITE_BASE_URL}/api/notifications`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			)
			const fetchedNotifications = response.data as Notification[]
			const currentUnreadCount = fetchedNotifications.filter(
				(n) => !n.seen,
			).length
			console.log('Fetched notifications:', fetchedNotifications)
			console.log(
				'Calculated unread count from fetch:',
				currentUnreadCount,
			)
			setNotifications(fetchedNotifications)
			setUnreadCount(currentUnreadCount)
		} catch (error) {
			console.error('Error fetching notifications:', error)
		}
	}, [currentUser, userProfile])

	useEffect(() => {
		let localSocketInstance: Socket | null = null

		const initializeSocket = async () => {
			if (loadingAuth || !currentUser || !userProfile?._id) {
				console.log(
					'NotificationContext: Skipping socket initialization (auth loading, no currentUser, or no userProfile._id)',
					{
						loadingAuth,
						hasCurrentUser: !!currentUser,
						hasUserProfileId: !!userProfile?._id,
					},
				)
				if (socketRef.current) {
					console.log(
						`NotificationContext: Cleaning up existing socket (${socketRef.current.id}) due to missing auth/user data.`,
					)
					socketRef.current.removeAllListeners()
					socketRef.current.close()
					socketRef.current = null
				}
				setNotifications([])
				setUnreadCount(0)
				return
			}

			if (
				socketRef.current &&
				socketRef.current.connected &&
				socketRef.current.io.opts.query?.userId === userProfile._id
			) {
				console.log(
					`NotificationContext: Socket already connected for user ${userProfile._id} (${socketRef.current.id}). Re-fetching notifications.`,
				)
				await fetchNotifications()
				return
			}

			if (socketRef.current) {
				console.log(
					`NotificationContext: Disconnecting existing socket (${socketRef.current.id}) before creating new one.`,
				)
				socketRef.current.removeAllListeners()
				socketRef.current.close()
				socketRef.current = null
			}

			console.log(
				`NotificationContext: Initializing new socket for userProfile ID: ${userProfile._id}`,
			)
			try {
				const token = await currentUser.getIdToken()
				localSocketInstance = io(
					import.meta.env.VITE_BASE_URL || 'http://localhost:5000',
					{
						query: { userId: userProfile._id },
						auth: { token },
						transports: ['websocket'],
						reconnection: true,
						reconnectionAttempts: 5,
						reconnectionDelay: 1000,
					},
				)
				socketRef.current = localSocketInstance

				localSocketInstance.on('connect', () => {
					console.log(
						`Socket connected: ${localSocketInstance?.id} for user ${userProfile._id}`,
					)
					fetchNotifications()
				})

				localSocketInstance.on('connect_error', (error) => {
					console.error(
						`Socket connection error for ${userProfile._id} (${localSocketInstance?.id || 'N/A'}):`,
						error,
					)
				})

				localSocketInstance.on('disconnect', (reason) => {
					console.log(
						`Socket disconnected: ${localSocketInstance?.id || 'N/A'}, reason: ${reason}`,
					)
				})

				localSocketInstance.on(
					'new_notification',
					(notification: Notification) => {
						console.log(
							`[SocketID: ${localSocketInstance?.id}] Received new_notification:`,
							notification,
						)

						if (notification.userId !== userProfile?._id) {
							console.warn(
								'Received notification intended for a different user:',
								notification,
								`Current userProfile ID: ${userProfile?._id}`,
							)
						}

						setNotifications((prev) => {
							if (prev.find((n) => n._id === notification._id)) {
								console.log(
									`[SocketID: ${localSocketInstance?.id}] Duplicate notification _id ${notification._id} received, already in state. Ignoring.`,
								)
								return prev
							}
							const newNotifications = [notification, ...prev]
							console.log(
								`[SocketID: ${localSocketInstance?.id}] Updated notifications list with _id ${notification._id}.`,
							)
							return newNotifications
						})
						setUnreadCount((prev) => prev + 1)
						console.log(
							`[SocketID: ${localSocketInstance?.id}] Incremented unread count.`,
						)
					},
				)
			} catch (error) {
				console.error('Error initializing socket:', error)
				if (localSocketInstance) {
					localSocketInstance.removeAllListeners()
					localSocketInstance.close()
				}
				if (socketRef.current === localSocketInstance) {
					socketRef.current = null
				}
			}
		}

		initializeSocket()

		return () => {
			if (localSocketInstance) {
				console.log(
					`NotificationContext: useEffect cleanup - Closing socket: ${localSocketInstance.id}`,
				)
				localSocketInstance.removeAllListeners()
				localSocketInstance.close()
				if (socketRef.current === localSocketInstance) {
					socketRef.current = null
				}
			} else if (socketRef.current) {
				console.log(
					`NotificationContext: useEffect cleanup - Fallback: Closing socketRef.current: ${socketRef.current.id}`,
				)
				socketRef.current.removeAllListeners()
				socketRef.current.close()
				socketRef.current = null
			}
		}
	}, [currentUser, userProfile, loadingAuth, fetchNotifications])

	const markAsRead = useCallback(
		async (notificationId: string) => {
			if (!currentUser || !userProfile?._id) return
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
				setNotifications((currentNots) => {
					const newUnread = currentNots.filter((n) => !n.seen).length
					console.log(
						'Recalculated unread count after markAsRead:',
						newUnread,
					)
					setUnreadCount(newUnread)
					return currentNots
				})
			} catch (error) {
				console.error('Error marking notification as read:', error)
			}
		},
		[currentUser, userProfile],
	)

	const markAllAsRead = useCallback(async () => {
		if (!currentUser || !userProfile?._id) return
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
			console.log(
				'All notifications marked as read, unread count set to 0.',
			)
		} catch (error) {
			console.error('Error marking all notifications as read:', error)
		}
	}, [currentUser, userProfile])

	useEffect(() => {
		const newUnreadCount = notifications.filter((n) => !n.seen).length
		if (newUnreadCount !== unreadCount) {
			console.log(
				'Derived new unread count from notifications state change:',
				newUnreadCount,
				'Previous unread count:',
				unreadCount,
			)
			setUnreadCount(newUnreadCount)
		}
	}, [notifications])

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
