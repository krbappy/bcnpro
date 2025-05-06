import create from 'zustand'

export interface Stop {
	name: string
	address: string
	phoneNumber: string
	deliveryNotes: string
}

export interface Route {
	id: string
	type: 'Single Stop' | 'Multiple Stops'
	stops: Stop[]
	optimizedRoute: {
		sequence: number[]
		estimatedTime: number
		fuelCost: number
	}
	driver: {
		id?: string
		autoAssigned: boolean
	}
	status: 'draft' | 'dispatched'
}

interface RouteStore {
	currentRoute: Route | null
	routes: Route[]
	setCurrentRoute: (route: Route | null) => void
	addRoute: (route: Route) => void
	updateRoute: (route: Route) => void
	deleteRoute: (id: string) => void
}

export const useRouteStore = create<RouteStore>((set) => ({
	currentRoute: null,
	routes: [],
	setCurrentRoute: (route) => set({ currentRoute: route }),
	addRoute: (route) => set((state) => ({ routes: [...state.routes, route] })),
	updateRoute: (route) =>
		set((state) => ({
			routes: state.routes.map((r) => (r.id === route.id ? route : r)),
		})),
	deleteRoute: (id) =>
		set((state) => ({
			routes: state.routes.filter((r) => r.id !== id),
		})),
}))
