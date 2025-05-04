import { FunctionComponent, ReactElement, useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
	Box,
	Button,
	Container,
	Heading,
	Text,
	VStack,
	useToast,
	Spinner,
	Alert,
	AlertIcon,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { teamService } from '../services/teamService'

export const TeamInvitation: FunctionComponent = (): ReactElement => {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const toast = useToast()
	const { currentUser, loginWithGoogle } = useAuth()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const teamId = searchParams.get('teamId')
	const email = searchParams.get('email')?.toLowerCase()

	useEffect(() => {
		console.log('TeamInvitation mounted with:', {
			teamId,
			email,
			currentUser,
		})

		if (!teamId || !email) {
			setError('Invalid invitation link. Please check the URL.')
			return
		}

		const acceptInvitation = async () => {
			if (!currentUser) return

			try {
				setIsLoading(true)
				console.log('Accepting invitation for:', { teamId, email })
				await teamService.acceptInvitation(teamId, email)
				toast({
					title: 'Invitation accepted successfully',
					status: 'success',
					duration: 3000,
					isClosable: true,
				})
				navigate('/team-management')
			} catch (error) {
				console.error('Error accepting invitation:', error)
				const message =
					error instanceof Error
						? error.message
						: 'Failed to accept invitation'
				setError(message)
				toast({
					title: 'Failed to accept invitation',
					description: message,
					status: 'error',
					duration: 5000,
					isClosable: true,
				})
			} finally {
				setIsLoading(false)
			}
		}

		if (currentUser && currentUser.email?.toLowerCase() === email) {
			acceptInvitation()
		}
	}, [currentUser, teamId, email, navigate, toast])

	const handleGoogleLogin = async () => {
		try {
			setIsLoading(true)
			await loginWithGoogle()
		} catch (error) {
			console.error('Login error:', error)
			const message =
				error instanceof Error ? error.message : 'Failed to login'
			toast({
				title: 'Login failed',
				description: message,
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
		} finally {
			setIsLoading(false)
		}
	}

	if (!teamId || !email) {
		return (
			<Container maxW="container.md" py={8}>
				<Alert status="error">
					<AlertIcon />
					Invalid invitation link. Please check the URL.
				</Alert>
			</Container>
		)
	}

	if (isLoading) {
		return (
			<Container maxW="container.md" py={8}>
				<VStack spacing={4} align="center">
					<Spinner size="xl" />
					<Text>Processing invitation...</Text>
				</VStack>
			</Container>
		)
	}

	if (error) {
		return (
			<Container maxW="container.md" py={8}>
				<Alert status="error">
					<AlertIcon />
					{error}
				</Alert>
			</Container>
		)
	}

	if (!currentUser) {
		return (
			<Container maxW="container.md" py={8}>
				<VStack spacing={6} align="stretch">
					<Heading size="lg">Team Invitation</Heading>
					<Text>
						Youve been invited to join a team. Please sign in with
						Google to accept the invitation.
					</Text>
					<Box>
						<Button
							colorScheme="blue"
							size="lg"
							width="full"
							onClick={handleGoogleLogin}
							isLoading={isLoading}
						>
							Continue with Google
						</Button>
					</Box>
				</VStack>
			</Container>
		)
	}

	if (currentUser.email?.toLowerCase() !== email) {
		return (
			<Container maxW="container.md" py={8}>
				<Alert status="warning">
					<AlertIcon />
					This invitation was sent to {email}. Please sign in with
					that email address.
				</Alert>
			</Container>
		)
	}

	return (
		<Container maxW="container.md" py={8}>
			<VStack spacing={4} align="center">
				<Spinner size="xl" />
				<Text>Accepting invitation...</Text>
			</VStack>
		</Container>
	)
}
