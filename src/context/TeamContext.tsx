import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { teamService } from '../services/teamService'

// Types
export interface Team {
	id: string
	name: string
	createdAt: string
	updatedAt: string
}

export interface TeamMember {
	id: string
	email: string
	role: 'owner' | 'admin' | 'member'
	status: 'active' | 'pending' | 'inactive'
}

interface ApiTeam {
	id?: string
	_id?: string
	name: string
	createdAt: string
	updatedAt: string
	members?: ApiMember[]
}

interface ApiMember {
	id?: string
	_id?: string
	email?: string
	user?: {
		_id: string
		email: string
		name?: string
	}
	role: 'owner' | 'admin' | 'member'
	status?: 'active' | 'pending' | 'inactive'
	invitationStatus?: string
}

export interface TeamContextType {
	teams: Team[]
	members: TeamMember[]
	createTeam: (name: string) => Promise<void>
	inviteTeamMember: (
		teamId: string,
		email: string,
		role: 'admin' | 'member',
	) => Promise<void>
	removeMember: (teamId: string, memberId: string) => Promise<void>
}

// Create the context
const TeamContext = createContext<TeamContextType | undefined>(undefined)

// Provider component
export const TeamProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [teams, setTeams] = useState<Team[]>([])
	const [members, setMembers] = useState<TeamMember[]>([])
	const { currentUser } = useAuth()

	// Fetch team data on component mount or user change
	useEffect(() => {
		const fetchTeamData = async () => {
			if (!currentUser) {
				setTeams([])
				setMembers([])
				return
			}

			try {
				const response = await teamService.getMyTeam()
				// Ensure we're handling the response as an array
				const teamsData = (
					Array.isArray(response) ? response : [response]
				) as ApiTeam[]
				setTeams(
					teamsData.map((team) => ({
						id: team.id || team._id || '',
						name: team.name,
						createdAt: team.createdAt,
						updatedAt: team.updatedAt,
					})),
				)

				// Extract members from all teams
				const allMembers = teamsData.flatMap(
					(team) => team.members || [],
				)
				setMembers(
					allMembers.map((member) => ({
						id: member.user?._id || '',
						email: member.email || member.user?.email || '',
						role: member.role,
						status: (member.status ||
							member.invitationStatus ||
							'pending') as 'active' | 'pending' | 'inactive',
					})),
				)
			} catch (err) {
				console.error('Failed to fetch team data', err)
				// Set empty arrays on error to prevent mapping issues
				setTeams([])
				setMembers([])
			}
		}

		fetchTeamData()
	}, [currentUser])

	// Create a new team
	const createTeam = async (name: string) => {
		try {
			const response = await teamService.createTeam(name)
			const newTeam: Team = {
				id:
					(response as unknown as ApiTeam).id ||
					(response as unknown as ApiTeam)._id ||
					'',
				name: (response as unknown as ApiTeam).name,
				createdAt: (response as unknown as ApiTeam).createdAt,
				updatedAt: (response as unknown as ApiTeam).updatedAt,
			}
			setTeams((prevTeams) => [...prevTeams, newTeam])
		} catch (err) {
			console.error('Failed to create team', err)
			throw err
		}
	}

	// Invite a team member
	const inviteTeamMember = async (
		teamId: string,
		email: string,
		role: 'admin' | 'member',
	) => {
		try {
			const response = await teamService.inviteTeamMember(teamId, {
				email,
				role,
			})
			const newMember: TeamMember = {
				id:
					(response as unknown as ApiMember).id ||
					(response as unknown as ApiMember)._id ||
					'',
				email: email,
				role: role,
				status: 'pending',
			}
			setMembers((prevMembers) => [...prevMembers, newMember])
		} catch (err) {
			console.error('Failed to invite team member', err)
			throw err
		}
	}

	// Remove a team member
	const removeMember = async (teamId: string, memberId: string) => {
		try {
			await teamService.removeTeamMember(teamId, memberId)
			setMembers((prevMembers) =>
				prevMembers.filter((member) => member.id !== memberId),
			)
		} catch (err) {
			console.error('Failed to remove team member', err)
			throw err
		}
	}

	return (
		<TeamContext.Provider
			value={{
				teams,
				members,
				createTeam,
				inviteTeamMember,
				removeMember,
			}}
		>
			{children}
		</TeamContext.Provider>
	)
}

// Custom hook to use the team context
export const useTeam = () => {
	const context = useContext(TeamContext)
	if (context === undefined) {
		throw new Error('useTeam must be used within a TeamProvider')
	}
	return context
}
