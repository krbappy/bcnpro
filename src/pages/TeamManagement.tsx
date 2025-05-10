import { FunctionComponent, ReactElement, useState, useEffect } from 'react'
import {
	Box,
	Button,
	Heading,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	useToast,
	Alert,
	AlertIcon,
	AlertTitle,
	AlertDescription,
	TableContainer,
	FormControl,
	FormLabel,
	Input,
	Text,
	Select,
} from '@chakra-ui/react'
import { useTeam } from '../context/TeamContext'
import { FiUserPlus, FiTrash } from 'react-icons/fi'
import { RoleBadge } from '../components/RoleBadge'
import { StatusBadge } from '../components/StatusBadge'
import { CreateTeam } from '../components/CreateTeam'
import { useAuth } from '../context/AuthContext'

export const TeamManagement: FunctionComponent = (): ReactElement => {
	return (
		<Box p={4} w={'50%'} mx={'auto'}>
			<CreateTeam />
			<ManageTeamComponent />
			<InviteTeamMemberComponent />
		</Box>
	)
}

const ManageTeamComponent: FunctionComponent = (): ReactElement => {
	const { teams, members, removeMember } = useTeam()
	const { currentUser } = useAuth()
	const toast = useToast()
	const [selectedTeamId, setSelectedTeamId] = useState('')

	// Set default team if none selected
	useEffect(() => {
		if (!selectedTeamId && teams?.length > 0) {
			setSelectedTeamId(teams[0].id)
		}
	}, [teams, selectedTeamId])

	const handleRemoveMember = async (teamId: string, userId: string) => {
		try {
			await removeMember(teamId, userId)
			toast({
				title: 'Member removed successfully',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})
		} catch (error) {
			console.error('Error removing member:', error)
			toast({
				title: 'Failed to remove member',
				description:
					error instanceof Error
						? error.message
						: 'There was an error removing the team member.',
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
		}
	}

	if (!teams || teams.length === 0) {
		return (
			<Alert status="info" mt={4}>
				<AlertIcon />
				<AlertTitle>No Teams Available</AlertTitle>
				<AlertDescription>
					Create a team to start managing team members.
				</AlertDescription>
			</Alert>
		)
	}

	return (
		<Box mt={8}>
			<Heading size="md" mb={4}>
				Manage Team Members
			</Heading>
			<FormControl mb={4}>
				<FormLabel>Select Team</FormLabel>
				<Select
					value={selectedTeamId}
					onChange={(e) => setSelectedTeamId(e.target.value)}
				>
					{teams.map((team) => (
						<option key={team.id} value={team.id}>
							{team.name}
						</option>
					))}
				</Select>
			</FormControl>
			<TableContainer>
				<Table variant="simple">
					<Thead>
						<Tr>
							<Th>Member</Th>
							<Th>Role</Th>
							<Th>Status</Th>
							<Th>Actions</Th>
						</Tr>
					</Thead>
					<Tbody>
						{members?.map((member) => (
							<Tr key={member.id}>
								<Td>{member.email}</Td>
								<Td>
									<RoleBadge role={member.role} />
								</Td>
								<Td>
									<StatusBadge status={member.status} />
								</Td>
								<Td>
									{member.role !== 'owner' &&
										member.email !== currentUser?.email && (
											<Button
												size="sm"
												colorScheme="red"
												leftIcon={<FiTrash />}
												onClick={() =>
													handleRemoveMember(
														selectedTeamId,
														member.id,
													)
												}
											>
												Remove
											</Button>
										)}
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>
		</Box>
	)
}

const InviteTeamMemberComponent: FunctionComponent = (): ReactElement => {
	const [email, setEmail] = useState('')
	const [role, setRole] = useState<'admin' | 'member'>('member')
	const [selectedTeamId, setSelectedTeamId] = useState('')
	const { teams, inviteTeamMember } = useTeam()
	const toast = useToast()

	const handleInvite = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!selectedTeamId) {
			toast({
				title: 'Team selection required',
				description:
					'Please select a team before sending an invitation.',
				status: 'warning',
				duration: 3000,
				isClosable: true,
			})
			return
		}

		try {
			await inviteTeamMember(selectedTeamId, email, role)
			toast({
				title: 'Invitation sent successfully',
				status: 'success',
				duration: 3000,
				isClosable: true,
			})
			setEmail('')
		} catch (error) {
			toast({
				title: 'Failed to send invitation',
				description: 'There was an error sending the invitation.',
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
		}
	}

	if (!teams || teams.length === 0) {
		return (
			<Alert status="warning" mt={4}>
				<AlertIcon />
				<AlertTitle>No Teams Available</AlertTitle>
				<AlertDescription>
					Please create a team before inviting members.
				</AlertDescription>
			</Alert>
		)
	}

	return (
		<Box mt={8}>
			<Heading size="md" mb={4}>
				Invite Team Member
			</Heading>
			<Box as="form" onSubmit={handleInvite}>
				<FormControl mb={4} isRequired>
					<FormLabel>Select Team</FormLabel>
					<Select
						value={selectedTeamId}
						onChange={(e) => setSelectedTeamId(e.target.value)}
						placeholder="Select a team"
					>
						{teams?.map((team) => (
							<option key={team.id} value={team.id}>
								{team.name}
							</option>
						))}
					</Select>
				</FormControl>

				<FormControl mb={4} isRequired>
					<FormLabel>Email Address</FormLabel>
					<Input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter email address"
					/>
				</FormControl>

				<FormControl mb={4} isRequired>
					<FormLabel>Role</FormLabel>
					<Select
						value={role}
						onChange={(e) =>
							setRole(e.target.value as 'admin' | 'member')
						}
					>
						<option value="member">Member</option>
						<option value="admin">Admin</option>
					</Select>
				</FormControl>

				<Button
					mt={4}
					colorScheme="orange"
					type="submit"
					leftIcon={<FiUserPlus />}
					isDisabled={!email || !selectedTeamId}
				>
					Send Invitation
				</Button>
			</Box>

			<Box mt={8}>
				<Heading size="sm" mb={3}>
					Role Permissions
				</Heading>
				<Text fontSize="sm" mb={2}>
					<strong>Admin:</strong> Can manage team members, send
					invitations, and access all team resources.
				</Text>
				<Text fontSize="sm">
					<strong>Member:</strong> Can view and collaborate on team
					resources.
				</Text>
			</Box>
		</Box>
	)
}
