import { useState, useEffect } from 'react'
import {
	Container,
	Heading,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	useToast,
	Flex,
	Spinner,
	Box,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import PaymentMethods from '../components/Account/PaymentMethods'
import ProfileSettings from '../components/Account/ProfileSettings'
import BillingHistory from '../components/Account/BillingHistory'
import UserInfo from '../components/Account/UserInfo'

export default function Account() {
	const { currentUser } = useAuth()
	const navigate = useNavigate()
	const toast = useToast()
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// If no user is logged in, redirect to home
		if (!currentUser && !isLoading) {
			toast({
				title: 'Access denied',
				description: 'Please log in to view your account',
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
			navigate('/')
		}

		// Set loading to false after authentication check
		setIsLoading(false)
	}, [currentUser, navigate, toast, isLoading])

	if (isLoading) {
		return (
			<Flex height="100vh" justify="center" align="center">
				<Spinner size="xl" color="orange.500" />
			</Flex>
		)
	}

	return (
		<Container maxW="container.lg" py={8}>
			<Box mb={4}>
				<UserInfo />
			</Box>

			<Heading mb={6} color="orange.500">
				My Account
			</Heading>

			<Tabs colorScheme="orange" variant="enclosed">
				<TabList>
					<Tab>Profile</Tab>
					<Tab>Payment Methods</Tab>
					<Tab>Billing History</Tab>
				</TabList>

				<TabPanels>
					<TabPanel>
						<ProfileSettings />
					</TabPanel>
					<TabPanel>
						<PaymentMethods />
					</TabPanel>
					<TabPanel>
						<BillingHistory />
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Container>
	)
}
