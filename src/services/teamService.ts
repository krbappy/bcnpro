import axios from 'axios'
import { getAuth } from 'firebase/auth'

// Types
interface TeamMember {
	_id: string
	user: {
		_id: string
		name: string
		email: string
	}
	role: 'owner' | 'admin' | 'member'
	invitationStatus: 'accepted' | 'pending' | 'rejected'
}

interface Team {
	_id: string
	name: string
	location?: string
	owner: string
	members: TeamMember[]
}

interface InviteTeamMemberData {
	email: string
	role: 'admin' | 'member'
}

class TeamService {
	private baseUrl: string

	constructor() {
		// Use your backend API URL from environment variables
		this.baseUrl = `${import.meta.env.VITE_BASE_URL}/api/teams`
	}

	private async getAuthHeaders() {
		const auth = getAuth()
		const user = auth.currentUser

		if (!user) {
			throw new Error('User not authenticated')
		}

		const token = await user.getIdToken()
		return {
			Authorization: `Bearer ${token}`,
		}
	}

	// Create a new team
	async createTeam(name: string, location?: string): Promise<Team> {
		const headers = await this.getAuthHeaders()
		const response = await axios.post(
			this.baseUrl,
			{ name, location },
			{
				headers,
				withCredentials: true,
			},
		)
		return response.data
	}

	// Get user's team information
	async getMyTeam(): Promise<Team> {
		const headers = await this.getAuthHeaders()
		const response = await axios.get(`${this.baseUrl}/my-team`, {
			headers,
			withCredentials: true,
		})
		return response.data
	}

	// Get team details by ID
	async getTeamById(teamId: string): Promise<Team> {
		if (!teamId) throw new Error('Team ID is required')
		const headers = await this.getAuthHeaders()
		const response = await axios.get(`${this.baseUrl}/${teamId}`, {
			headers,
			withCredentials: true,
		})
		return response.data
	}

	// Delete a team
	async deleteTeam(teamId: string): Promise<void> {
		const headers = await this.getAuthHeaders()
		await axios.delete(`${this.baseUrl}/${teamId}`, {
			headers,
			withCredentials: true,
		})
	}

	// Invite a user to join a team
	async inviteTeamMember(
		teamId: string,
		data: InviteTeamMemberData,
	): Promise<TeamMember> {
		if (!teamId) throw new Error('Team ID is required')
		const headers = await this.getAuthHeaders()
		const response = await axios.post(
			`${this.baseUrl}/${teamId}/invite`,
			data,
			{
				headers,
				withCredentials: true,
			},
		)
		return response.data
	}

	// Accept a team invitation
	async acceptInvitation(teamId: string, email: string): Promise<void> {
		if (!teamId) throw new Error('Team ID is required')
		if (!email) throw new Error('Email is required')
		const headers = await this.getAuthHeaders()
		await axios.post(
			`${this.baseUrl}/${teamId}/accept-invitation`,
			{ email },
			{
				headers,
				withCredentials: true,
			},
		)
	}

	// Reject a team invitation
	async rejectInvitation(
		teamId: string,
		invitationId: string,
	): Promise<void> {
		if (!teamId) throw new Error('Team ID is required')
		if (!invitationId) throw new Error('Invitation ID is required')
		const headers = await this.getAuthHeaders()
		await axios.post(
			`${this.baseUrl}/${teamId}/reject-invitation/${invitationId}`,
			{},
			{
				headers,
				withCredentials: true,
			},
		)
	}

	// Remove a team member
	async removeTeamMember(teamId: string, userId: string): Promise<void> {
		if (!teamId) throw new Error('Team ID is required')
		if (!userId) throw new Error('User ID is required')
		const headers = await this.getAuthHeaders()
		await axios.delete(`${this.baseUrl}/${teamId}/members/${userId}`, {
			headers,
			withCredentials: true,
		})
	}

	// Leave a team
	async leaveTeam(teamId: string): Promise<void> {
		if (!teamId) throw new Error('Team ID is required')
		const headers = await this.getAuthHeaders()
		await axios.post(
			`${this.baseUrl}/${teamId}/leave`,
			{},
			{
				headers,
				withCredentials: true,
			},
		)
	}

	// Resend invitation
	async resendInvitation(teamId: string, memberId: string): Promise<void> {
		if (!teamId) throw new Error('Team ID is required')
		if (!memberId) throw new Error('Member ID is required')
		const headers = await this.getAuthHeaders()
		await axios.post(
			`${this.baseUrl}/${teamId}/resend-invitation/${memberId}`,
			{},
			{
				headers,
				withCredentials: true,
			},
		)
	}
}

export const teamService = new TeamService()
