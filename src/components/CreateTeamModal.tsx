import { FunctionComponent, ReactElement, useState } from 'react'
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	FormControl,
	FormLabel,
	Input,
	Button,
	useToast,
} from '@chakra-ui/react'
import { useTeam } from '../context/TeamContext'
import { FiPlus } from 'react-icons/fi'

interface CreateTeamModalProps {
	isOpen: boolean
	onClose: () => void
}

export const CreateTeamModal: FunctionComponent<CreateTeamModalProps> = ({
	isOpen,
	onClose,
}): ReactElement => {
	const [teamName, setTeamName] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const { createTeam } = useTeam()
	const toast = useToast()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!teamName.trim()) {
			toast({
				title: 'Team name required',
				description: 'Please enter a name for your team.',
				status: 'warning',
				duration: 3000,
				isClosable: true,
			})
			return
		}

		setIsLoading(true)

		try {
			await createTeam(teamName)

			toast({
				title: 'Team created',
				description: 'Your team has been created successfully.',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})

			setTeamName('')
			onClose()
		} catch (error) {
			toast({
				title: 'Error creating team',
				description:
					'There was an error creating your team. Please try again.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent bg="#191919" color="white" borderColor="#E4DCFF20">
				<ModalHeader>Create New Team</ModalHeader>
				<ModalCloseButton />
				<form onSubmit={handleSubmit}>
					<ModalBody pb={6}>
						<FormControl>
							<FormLabel>Team Name</FormLabel>
							<Input
								placeholder="Enter team name"
								value={teamName}
								onChange={(e) => setTeamName(e.target.value)}
								borderColor="#E4DCFF30"
								_hover={{ borderColor: '#E4DCFF50' }}
								_focus={{
									borderColor: '#F75708',
									boxShadow: '0 0 0 1px #F75708',
								}}
							/>
						</FormControl>
					</ModalBody>

					<ModalFooter>
						<Button
							colorScheme="orange"
							mr={3}
							type="submit"
							leftIcon={<FiPlus />}
							isLoading={isLoading}
						>
							Create Team
						</Button>
						<Button variant="ghost" onClick={onClose}>
							Cancel
						</Button>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	)
}
