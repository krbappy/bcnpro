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
	User,
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
	currentUser: User | null
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

export function AuthProvider({ children }: { children: ReactNode }) {
	const [currentUser, setCurrentUser] = useState<User | null>(null)
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
		await createUserWithEmailAndPassword(auth, email, password)
	}

	const logout = async () => {
		await signOut(auth)
	}

	const loginWithGoogle = async () => {
		const provider = new GoogleAuthProvider()
		await signInWithPopup(auth, provider)
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
