import { FunctionComponent, ReactElement, useState } from 'react'
import {
	Box,
	Button,
	FormControl,
	FormLabel,
	Input,
	useToast,
	Heading,
} from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import { useTeam } from '../context/TeamContext'

export const CreateTeam: FunctionComponent = (): ReactElement => {
	const [name, setName] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const toast = useToast()
	const { createTeam } = useTeam()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			await createTeam(name)
			toast({
				title: 'Team created successfully',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})
			setName('')
		} catch (error) {
			toast({
				title: 'Failed to create team',
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
		<Box mt={4}>
			<Heading size="md" mb={4}>
				Create New Team
			</Heading>
			<Box as="form" onSubmit={handleSubmit}>
				<FormControl isRequired>
					<FormLabel>Team Name</FormLabel>
					<Input
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Enter team name"
					/>
				</FormControl>
				<Button
					mt={4}
					colorScheme="blue"
					type="submit"
					isLoading={isLoading}
					loadingText="Creating Team"
					leftIcon={<FiPlus />}
					isDisabled={!name.trim() || isLoading}
				>
					Create Team
				</Button>
			</Box>
		</Box>
	)
}
