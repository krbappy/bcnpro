import { useState, useEffect } from 'react'
import {
	Box,
	Button,
	FormControl,
	FormLabel,
	Input,
	VStack,
	useToast,
	Heading,
	FormErrorMessage,
} from '@chakra-ui/react'
import { useAuth } from '../../context/AuthContext'

interface UserProfile {
	name: string
	phone: string
}

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'

export default function ProfileSettings() {
	const { currentUser } = useAuth()
	const [profile, setProfile] = useState<UserProfile>({
		name: '',
		phone: '',
	})
	const [errors, setErrors] = useState<{ [key: string]: string }>({})
	const [isLoading, setIsLoading] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const toast = useToast()

	useEffect(() => {
		// Load user profile on component mount
		if (currentUser) {
			fetchUserProfile()
		}
	}, [currentUser])

	const fetchUserProfile = async () => {
		if (!currentUser) return

		setIsLoading(true)
		try {
			const token = await currentUser.getIdToken()

			const response = await fetch(
				`${BASE_URL}/api/users/${currentUser.email}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
				},
			)

			if (!response.ok) {
				throw new Error('Failed to fetch user profile')
			}

			const data = await response.json()
			setProfile({
				name: data.name || currentUser.displayName || '',
				phone: data.phone || '',
			})
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to load profile'
			toast({
				title: 'Error',
				description: errorMessage,
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
		} finally {
			setIsLoading(false)
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setProfile((prev) => ({
			...prev,
			[name]: value,
		}))

		// Clear error when field is edited
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev }
				delete newErrors[name]
				return newErrors
			})
		}
	}

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {}

		if (!profile.name.trim()) {
			newErrors.name = 'Name is required'
		}

		if (profile.phone && !/^\+?[0-9]{10,15}$/.test(profile.phone)) {
			newErrors.phone = 'Please enter a valid phone number'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm() || !currentUser) {
			return
		}

		setIsSaving(true)
		try {
			const token = await currentUser.getIdToken()

			const response = await fetch(
				`${BASE_URL}/api/users/${currentUser.email}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						name: profile.name,
						phone: profile.phone,
					}),
				},
			)

			if (!response.ok) {
				throw new Error('Failed to update profile')
			}

			toast({
				title: 'Success',
				description: 'Profile updated successfully',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to update profile'
			toast({
				title: 'Error',
				description: errorMessage,
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<Box>
			<Heading size="md" mb={6}>
				Profile Settings
			</Heading>

			<Box as="form" onSubmit={handleSubmit}>
				<VStack spacing={4} align="flex-start">
					<FormControl isInvalid={!!errors.name} isRequired>
						<FormLabel>Name</FormLabel>
						<Input
							name="name"
							value={profile.name}
							onChange={handleChange}
							placeholder="Your name"
							isDisabled={isLoading}
						/>
						<FormErrorMessage>{errors.name}</FormErrorMessage>
					</FormControl>

					<FormControl isInvalid={!!errors.phone}>
						<FormLabel>Phone Number</FormLabel>
						<Input
							name="phone"
							value={profile.phone}
							onChange={handleChange}
							placeholder="Your phone number"
							isDisabled={isLoading}
						/>
						<FormErrorMessage>{errors.phone}</FormErrorMessage>
					</FormControl>

					<Button
						mt={4}
						colorScheme="orange"
						type="submit"
						isLoading={isSaving}
						isDisabled={isLoading || isSaving}
					>
						Save Changes
					</Button>
				</VStack>
			</Box>
		</Box>
	)
}
