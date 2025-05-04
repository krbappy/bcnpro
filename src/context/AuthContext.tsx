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

interface AuthContextType {
	currentUser: FirebaseUser | null
	login: (email: string, password: string) => Promise<void>
	signup: (email: string, password: string) => Promise<void>
	logout: () => Promise<void>
	loginWithGoogle: () => Promise<void>
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
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setCurrentUser(user)
			setLoading(false)
		})

		return unsubscribe
	}, [])

	const login = async (email: string, password: string) => {
		await signInWithEmailAndPassword(auth, email, password)
	}

	const signup = async (email: string, password: string) => {
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
				throw new Error('Failed to create user in backend')
			}
		} catch (error) {
			// If backend creation fails, delete the Firebase user
			await user.delete()
			throw new Error('Failed to complete signup process')
		}
	}

	const loginWithGoogle = async () => {
		const provider = new GoogleAuthProvider()
		const userCredential = await signInWithPopup(auth, provider)
		const user = userCredential.user

		// Create or update user in backend
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
				throw new Error('Failed to create/update user in backend')
			}
		} catch (error) {
			// If backend creation fails, delete the Firebase user if it's a new user
			// For existing users, we might want to handle this differently
			console.error('Failed to update user in backend:', error)
		}
	}

	const logout = async () => {
		await signOut(auth)
	}

	const value = {
		currentUser,
		login,
		signup,
		logout,
		loginWithGoogle,
	}

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	)
}
