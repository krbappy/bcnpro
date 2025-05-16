import { useEffect, useState } from 'react'
import {
	Box,
	Flex,
	Heading,
	Text,
	Avatar,
	Button,
	useToast,
	Divider,
} from '@chakra-ui/react'
import { FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

// Define our local user profile type with the fields we want to display
interface UserProfileDisplay {
	name: string
	email: string
	phone?: string
	createdAt?: string
}

export default function UserInfo() {
	const { currentUser, userProfile, logout } = useAuth()
	const [profile, setProfile] = useState<UserProfileDisplay | null>(null)
	const toast = useToast()
	const navigate = useNavigate()

	useEffect(() => {
		if (currentUser) {
			// Initialize profile from auth context
			setProfile({
				name: currentUser.displayName || userProfile?.name || 'User',
				email: currentUser.email || userProfile?.email || '',
				phone: userProfile?.phone,
				createdAt: userProfile?.createdAt,
			})
		}
	}, [currentUser, userProfile])

	const handleLogout = async () => {
		try {
			await logout()
			toast({
				title: 'Logged out successfully',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})
			navigate('/')
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to log out',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
		}
	}

	if (!profile) {
		return null
	}

	return (
		<Box mb={6}>
			<Flex
				alignItems={{ base: 'flex-start', md: 'center' }}
				justifyContent="space-between"
				flexDirection={{ base: 'column', md: 'row' }}
				gap={4}
			>
				<Flex alignItems="center" gap={4}>
					<Avatar
						size="xl"
						name={profile.name}
						src={currentUser?.photoURL || undefined}
						bgGradient="linear(to-r, orange.400, orange.600)"
						color="white"
					/>
					<Box>
						<Heading size="md">{profile.name}</Heading>
						<Text color="gray.500">{profile.email}</Text>
						{profile.phone && (
							<Text fontSize="sm" mt={1}>
								Phone: {profile.phone}
							</Text>
						)}
						{profile.createdAt && (
							<Text fontSize="sm" color="gray.500">
								Member since:{' '}
								{new Date(
									profile.createdAt,
								).toLocaleDateString()}
							</Text>
						)}
					</Box>
				</Flex>

				<Button
					leftIcon={<FiLogOut />}
					colorScheme="orange"
					variant="outline"
					onClick={handleLogout}
				>
					Logout
				</Button>
			</Flex>
			<Divider my={6} />
		</Box>
	)
}
