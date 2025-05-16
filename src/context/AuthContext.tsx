import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from 'react'
import {
	getAuth,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
	GoogleAuthProvider,
	signInWithPopup,
	User as FirebaseUser,
} from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import axios from 'axios'

const firebaseConfig = {
	apiKey: 'AIzaSyAo981SHG05F9bDnQ6r5jb-PYvVVV_pSr8',
	authDomain: 'bcn-pro.firebaseapp.com',
	projectId: 'bcn-pro',
	storageBucket: 'bcn-pro.firebasestorage.app',
	messagingSenderId: '551589088902',
	appId: '1:551589088902:web:a342a34f750c28b81acb07',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// Define a type for your MongoDB user profile
interface UserProfile {
	_id: string // MongoDB ID
	firebaseUid: string
	email: string
	name?: string
	phone?: string
	createdAt?: string
	// Add other fields from your MongoDB user model
}

interface AuthContextType {
	currentUser: FirebaseUser | null
	userProfile: UserProfile | null // Add userProfile state
	login: (email: string, password: string) => Promise<void>
	signup: (email: string, password: string) => Promise<UserProfile | null> // Updated to return UserProfile
	logout: () => Promise<void>
	loginWithGoogle: () => Promise<UserProfile | null> // Updated to return UserProfile
	loadingAuth: boolean // Renamed loading to loadingAuth for clarity
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'

export function AuthProvider({ children }: { children: ReactNode }) {
	const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null) // State for MongoDB user profile
	const [loadingAuth, setLoadingAuth] = useState(true)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setCurrentUser(user)
			if (user) {
				try {
					const token = await user.getIdToken()
					// Fetch MongoDB user profile
					const response = await axios.get(
						`${BASE_URL}/api/users/me`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						},
					)
					setUserProfile(response.data as UserProfile)
					console.log('Fetched user profile:', response.data)
				} catch (error) {
					console.error('Failed to fetch user profile:', error)
					setUserProfile(null) // Clear profile on error
					// Optionally, sign out the user if profile fetch fails critically
					// await signOut(auth);
				}
			} else {
				setUserProfile(null) // Clear profile when no Firebase user
			}
			setLoadingAuth(false)
		})

		return unsubscribe
	}, [])

	const login = async (email: string, password: string) => {
		await signInWithEmailAndPassword(auth, email, password)
		// Profile will be fetched by onAuthStateChanged
	}

	const signup = async (
		email: string,
		password: string,
	): Promise<UserProfile | null> => {
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password,
		)
		const user = userCredential.user

		// Create user in backend
		try {
			const response = await fetch(`${BASE_URL}/api/users`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					firebaseUid: user.uid,
					email: user.email,
					name: user.displayName || '',
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					errorData.message || 'Failed to create user in backend',
				)
			}
			const backendUser = (await response.json()) as UserProfile
			setUserProfile(backendUser) // Set user profile immediately after creation
			return backendUser
		} catch (error) {
			await user.delete() // If backend creation fails, delete the Firebase user
			throw error // Re-throw the error to be caught by the caller
		}
	}

	const loginWithGoogle = async (): Promise<UserProfile | null> => {
		const provider = new GoogleAuthProvider()
		const userCredential = await signInWithPopup(auth, provider)
		const user = userCredential.user

		// Create or update user in backend
		try {
			const response = await fetch(`${BASE_URL}/api/users`, {
				// Assuming this endpoint handles both create and update (or use a specific one for Google login)
				method: 'POST', // Or PUT if your backend expects that for updates
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					firebaseUid: user.uid,
					email: user.email,
					name: user.displayName || '',
				}),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					errorData.message ||
						'Failed to create/update user in backend',
				)
			}
			const backendUser = (await response.json()) as UserProfile
			setUserProfile(backendUser) // Set user profile
			return backendUser
		} catch (error) {
			console.error(
				'Failed to create/update user in backend for Google login:',
				error,
			)
			// Decide on error handling: maybe the user already exists, so try fetching?
			// For now, re-throwing. If profile is critical, consider user.delete() if it was a *new* Firebase user.
			throw error
		}
	}

	const logout = async () => {
		await signOut(auth)
		setCurrentUser(null) // Explicitly set currentUser to null
		setUserProfile(null) // Clear MongoDB user profile on logout
	}

	const value = {
		currentUser,
		userProfile, // Provide userProfile
		login,
		signup,
		logout,
		loginWithGoogle,
		loadingAuth,
	}

	return (
		<AuthContext.Provider value={value}>
			{!loadingAuth && children}
		</AuthContext.Provider>
	)
}
