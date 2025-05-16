// This page uses the app's dark color schema. All text on white backgrounds should use themeColors.text for accessibility.
import React, { useState, useEffect } from 'react'
import {
	Box,
	Flex,
	Input,
	Button,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Text,
	Icon,
	Heading,
	Center,
	InputGroup,
	InputLeftElement,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	FormControl,
	FormLabel,
	useDisclosure,
	Textarea,
	IconButton,
	useToast,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
} from '@chakra-ui/react'
import {
	FiSearch,
	FiPlus,
	FiMoreVertical,
	FiEdit2,
	FiTrash2,
} from 'react-icons/fi'
import { themeColors } from '../components/Delivery/theme'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'

interface AddressBookEntry {
	_id: string
	address: string
	company: string
	deliveryNotes: string
	contacts: string
	email: string
	createdAt: string
	user: string
}

const AddressBook: React.FC = () => {
	const { isOpen, onOpen, onClose } = useDisclosure()
	const [isEditMode, setIsEditMode] = useState(false)
	const [currentAddressId, setCurrentAddressId] = useState<string | null>(
		null,
	)
	const [addresses, setAddresses] = useState<AddressBookEntry[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const toast = useToast()
	const { currentUser } = useAuth() // Get the current user from your auth context

	const [formData, setFormData] = useState({
		address: '',
		company: '',
		deliveryNotes: '',
		contacts: '',
		email: '',
	})

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const fetchAddresses = async () => {
		try {
			if (!currentUser) {
				throw new Error('User not authenticated')
			}

			const token = await currentUser.getIdToken()

			const response = await axios.get(`${BASE_URL}/api/address-book`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			// Ensure response.data is an array
			setAddresses(Array.isArray(response.data) ? response.data : [])
		} catch (error) {
			toast({
				title: 'Error fetching addresses',
				status: 'error',
				duration: 3000,
			})
			setAddresses([]) // Set empty array on error
		}
	}

	useEffect(() => {
		fetchAddresses()
	}, [])

	const handleSubmit = async () => {
		try {
			if (isEditMode && currentAddressId) {
				if (!currentUser) {
					throw new Error('User not authenticated')
				}

				const token = await currentUser.getIdToken()

				await axios.put(
					`${BASE_URL}/api/address-book/${currentAddressId}`,
					formData,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				)
				toast({
					title: 'Address updated successfully',
					status: 'success',
					duration: 3000,
				})
			} else {
				if (!currentUser) {
					throw new Error('User not authenticated')
				}

				const token = await currentUser.getIdToken()

				await axios.post(`${BASE_URL}/api/address-book`, formData, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				toast({
					title: 'Address added successfully',
					status: 'success',
					duration: 3000,
				})
			}
			fetchAddresses()
			onClose()
			resetForm()
		} catch (error) {
			toast({
				title: 'Error saving address',
				status: 'error',
				duration: 3000,
			})
		}
	}

	const handleEdit = (address: AddressBookEntry) => {
		setIsEditMode(true)
		setCurrentAddressId(address._id)
		setFormData({
			address: address.address,
			company: address.company,
			deliveryNotes: address.deliveryNotes,
			contacts: address.contacts,
			email: address.email,
		})
		onOpen()
	}

	const handleDelete = async (id: string) => {
		if (window.confirm('Are you sure you want to delete this address?')) {
			try {
				if (!currentUser) {
					throw new Error('User not authenticated')
				}

				const token = await currentUser.getIdToken()

				await axios.delete(`${BASE_URL}/api/address-book/${id}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				toast({
					title: 'Address deleted successfully',
					status: 'success',
					duration: 3000,
				})
				fetchAddresses()
			} catch (error) {
				toast({
					title: 'Error deleting address',
					status: 'error',
					duration: 3000,
				})
			}
		}
	}

	const resetForm = () => {
		setFormData({
			address: '',
			company: '',
			deliveryNotes: '',
			contacts: '',
			email: '',
		})
		setIsEditMode(false)
		setCurrentAddressId(null)
	}

	const handleModalClose = () => {
		onClose()
		resetForm()
	}

	const filteredAddresses = addresses.filter((address) => {
		const searchTerm = searchQuery.toLowerCase().trim()
		if (!searchTerm) return true

		const searchableFields = [
			address.address,
			address.company,
			address.deliveryNotes,
			address.contacts,
			address.email,
		]

		return searchableFields.some((field) =>
			field?.toLowerCase().includes(searchTerm),
		)
	})

	return (
		<Box
			minH="100vh"
			bg={themeColors.background}
			px={{ base: 2, md: 8 }}
			py={6}
			mx={'auto'}
		>
			<Heading fontSize="2xl" color={themeColors.secondary} mb={1}>
				Address Book
			</Heading>
			<Text color={themeColors.secondary} mb={6}>
				Saved addresses will be available to all team members
			</Text>

			<Flex mb={4} align="center" justify="space-between">
				<Flex align="center" gap={2}>
					<InputGroup maxW="250px">
						<InputLeftElement pointerEvents="none">
							<Icon as={FiSearch} color={themeColors.gray} />
						</InputLeftElement>
						<Input
							placeholder="Search..."
							bg="white"
							color={themeColors.text}
							borderColor={themeColors.lightGray}
							_focus={{ borderColor: themeColors.accent }}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</InputGroup>
				</Flex>
				<Button
					leftIcon={<FiPlus />}
					bg={themeColors.accent}
					color={'white'}
					_hover={{ bg: themeColors.accent, color: 'white' }}
					fontWeight="semibold"
					onClick={() => {
						resetForm()
						onOpen()
					}}
				>
					Add address
				</Button>
			</Flex>

			<Box borderRadius="md" overflowX="auto" bg="white" boxShadow="md">
				<Table variant="simple">
					<Thead bg={themeColors.background}>
						<Tr>
							<Th color={themeColors.secondary}>Address</Th>
							<Th color={themeColors.secondary}>Company</Th>
							<Th color={themeColors.secondary}>
								Delivery Notes
							</Th>
							<Th color={themeColors.secondary}>Contacts</Th>
							<Th color={themeColors.secondary}>Email</Th>
							<Th color={themeColors.secondary}>Actions</Th>
						</Tr>
					</Thead>
					<Tbody bg={themeColors.background}>
						{filteredAddresses.length > 0 ? (
							filteredAddresses.map((address) => (
								<Tr key={address._id}>
									<Td>{address.address}</Td>
									<Td>{address.company}</Td>
									<Td>{address.deliveryNotes}</Td>
									<Td>{address.contacts}</Td>
									<Td>{address.email}</Td>
									<Td>
										<Menu>
											<MenuButton
												as={IconButton}
												icon={<FiMoreVertical />}
												variant="ghost"
												size="sm"
											/>
											<MenuList>
												<MenuItem
													icon={<FiEdit2 />}
													onClick={() =>
														handleEdit(address)
													}
												>
													Edit
												</MenuItem>
												<MenuItem
													icon={<FiTrash2 />}
													onClick={() =>
														handleDelete(
															address._id,
														)
													}
												>
													Delete
												</MenuItem>
											</MenuList>
										</Menu>
									</Td>
								</Tr>
							))
						) : (
							<Tr>
								<Td colSpan={6}>
									<Center py={10}>
										<Text
											color={themeColors.gray}
											fontWeight="medium"
										>
											No results found
										</Text>
									</Center>
								</Td>
							</Tr>
						)}
					</Tbody>
				</Table>
			</Box>

			<Modal isOpen={isOpen} onClose={handleModalClose} size="xl">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader color={themeColors.secondary}>
						{isEditMode ? 'Edit Address' : 'Add New Address'}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<FormControl mb={4}>
							<FormLabel color={themeColors.secondary}>
								Address
							</FormLabel>
							<Input
								name="address"
								value={formData.address}
								onChange={handleInputChange}
								placeholder="Enter address"
							/>
						</FormControl>
						<FormControl mb={4}>
							<FormLabel color={themeColors.secondary}>
								Company
							</FormLabel>
							<Input
								name="company"
								value={formData.company}
								onChange={handleInputChange}
								placeholder="Enter company name"
							/>
						</FormControl>
						<FormControl mb={4}>
							<FormLabel color={themeColors.secondary}>
								Delivery Notes
							</FormLabel>
							<Textarea
								name="deliveryNotes"
								value={formData.deliveryNotes}
								onChange={handleInputChange}
								placeholder="Enter delivery notes"
							/>
						</FormControl>
						<FormControl mb={4}>
							<FormLabel color={themeColors.secondary}>
								Contacts
							</FormLabel>
							<Input
								name="contacts"
								value={formData.contacts}
								onChange={handleInputChange}
								placeholder="Enter contact information"
							/>
						</FormControl>
						<FormControl mb={4}>
							<FormLabel color={themeColors.secondary}>
								Email
							</FormLabel>
							<Input
								name="email"
								type="email"
								value={formData.email}
								onChange={handleInputChange}
								placeholder="Enter email address"
							/>
						</FormControl>
					</ModalBody>

					<ModalFooter>
						<Button
							variant="ghost"
							mr={3}
							onClick={handleModalClose}
						>
							Cancel
						</Button>
						<Button
							bg={themeColors.accent}
							color="white"
							_hover={{ bg: themeColors.accent }}
							onClick={handleSubmit}
						>
							{isEditMode ? 'Update Address' : 'Save Address'}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	)
}

export default AddressBook
