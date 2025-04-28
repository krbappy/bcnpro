import { useState } from 'react'
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Button,
	VStack,
	Input,
	Text,
	useToast,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Box,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

// Custom theme colors to match the app
const themeColors = {
	background: '#191919', // Black background
	accent: '#F75708', // Orange
	secondary: '#E4DCFF', // Light/whitish
}

interface AuthModalProps {
	isOpen: boolean
	onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const { login, signup, loginWithGoogle } = useAuth()
	const toast = useToast()

	const handleEmailAuth = async (isLogin: boolean) => {
		try {
			setIsLoading(true)
			if (isLogin) {
				await login(email, password)
			} else {
				await signup(email, password)
			}
			onClose()
			toast({
				title: isLogin
					? 'Logged in successfully'
					: 'Account created successfully',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})
		} catch (error) {
			toast({
				title: 'Error',
				description:
					error instanceof Error
						? error.message
						: 'An error occurred',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
		} finally {
			setIsLoading(false)
		}
	}

	const handleGoogleLogin = async () => {
		try {
			setIsLoading(true)
			await loginWithGoogle()
			onClose()
			toast({
				title: 'Logged in successfully with Google',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})
		} catch (error) {
			toast({
				title: 'Error',
				description:
					error instanceof Error
						? error.message
						: 'An error occurred',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} isCentered>
			<ModalOverlay backdropFilter="blur(4px)" />
			<ModalContent
				bg={themeColors.background}
				color={themeColors.secondary}
				borderColor={`${themeColors.secondary}20`}
				borderWidth="1px"
			>
				<ModalHeader
					borderBottomWidth="1px"
					borderColor={`${themeColors.secondary}20`}
				>
					Authentication
				</ModalHeader>
				<ModalCloseButton color={themeColors.secondary} />
				<ModalBody pb={6}>
					<Tabs isFitted variant="enclosed" colorScheme="orange">
						<TabList
							mb="1em"
							borderColor={`${themeColors.secondary}20`}
						>
							<Tab
								_selected={{
									color: themeColors.accent,
									borderColor: themeColors.accent,
								}}
								color={themeColors.secondary}
							>
								Login
							</Tab>
							<Tab
								_selected={{
									color: themeColors.accent,
									borderColor: themeColors.accent,
								}}
								color={themeColors.secondary}
							>
								Sign Up
							</Tab>
						</TabList>
						<TabPanels>
							<TabPanel>
								<VStack spacing={4}>
									<Input
										placeholder="Email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										bg="rgba(228, 220, 255, 0.05)"
										borderColor={`${themeColors.secondary}30`}
										_hover={{
											borderColor: `${themeColors.secondary}50`,
										}}
										_focus={{
											borderColor: themeColors.accent,
											boxShadow: `0 0 0 1px ${themeColors.accent}`,
										}}
										color={themeColors.secondary}
										_placeholder={{
											color: `${themeColors.secondary}70`,
										}}
									/>
									<Input
										type="password"
										placeholder="Password"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										bg="rgba(228, 220, 255, 0.05)"
										borderColor={`${themeColors.secondary}30`}
										_hover={{
											borderColor: `${themeColors.secondary}50`,
										}}
										_focus={{
											borderColor: themeColors.accent,
											boxShadow: `0 0 0 1px ${themeColors.accent}`,
										}}
										color={themeColors.secondary}
										_placeholder={{
											color: `${themeColors.secondary}70`,
										}}
									/>
									<Button
										bg={themeColors.accent}
										color={themeColors.secondary}
										width="full"
										onClick={() => handleEmailAuth(true)}
										isLoading={isLoading}
										_hover={{
											bg: `${themeColors.accent}80`,
										}}
									>
										Login
									</Button>
								</VStack>
							</TabPanel>
							<TabPanel>
								<VStack spacing={4}>
									<Input
										placeholder="Email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										bg="rgba(228, 220, 255, 0.05)"
										borderColor={`${themeColors.secondary}30`}
										_hover={{
											borderColor: `${themeColors.secondary}50`,
										}}
										_focus={{
											borderColor: themeColors.accent,
											boxShadow: `0 0 0 1px ${themeColors.accent}`,
										}}
										color={themeColors.secondary}
										_placeholder={{
											color: `${themeColors.secondary}70`,
										}}
									/>
									<Input
										type="password"
										placeholder="Password"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										bg="rgba(228, 220, 255, 0.05)"
										borderColor={`${themeColors.secondary}30`}
										_hover={{
											borderColor: `${themeColors.secondary}50`,
										}}
										_focus={{
											borderColor: themeColors.accent,
											boxShadow: `0 0 0 1px ${themeColors.accent}`,
										}}
										color={themeColors.secondary}
										_placeholder={{
											color: `${themeColors.secondary}70`,
										}}
									/>
									<Button
										bg={themeColors.accent}
										color={themeColors.secondary}
										width="full"
										onClick={() => handleEmailAuth(false)}
										isLoading={isLoading}
										_hover={{
											bg: `${themeColors.accent}80`,
										}}
									>
										Sign Up
									</Button>
								</VStack>
							</TabPanel>
						</TabPanels>
					</Tabs>
					<Box textAlign="center" my={4} position="relative">
						<Box
							position="absolute"
							top="50%"
							left="0"
							right="0"
							height="1px"
							bg={`${themeColors.secondary}20`}
						/>
						<Text
							as="span"
							px={2}
							bg={themeColors.background}
							color={`${themeColors.secondary}70`}
							position="relative"
						>
							OR
						</Text>
					</Box>
					<Button
						width="full"
						onClick={handleGoogleLogin}
						isLoading={isLoading}
						bg="rgba(228, 220, 255, 0.05)"
						color={themeColors.secondary}
						borderColor={`${themeColors.secondary}30`}
						_hover={{
							bg: 'rgba(228, 220, 255, 0.1)',
							borderColor: `${themeColors.secondary}50`,
						}}
						leftIcon={
							<img
								src="https://www.google.com/favicon.ico"
								alt="Google"
								style={{ width: '16px', height: '16px' }}
							/>
						}
					>
						Continue with Google
					</Button>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}
