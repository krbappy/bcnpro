/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'

interface RouteState {
	routeType: string | null
	selectedVehicle: string | null
	stops: any[] // TODO: Define proper type
	optimizedRoute: any // TODO: Define proper type
	assignedDriver: string | null

	// Actions
	setRouteType: (type: string) => void
	setSelectedVehicle: (vehicle: string) => void
	setStops: (stops: any[]) => void
	setOptimizedRoute: (route: any) => void
	setAssignedDriver: (driver: string) => void
	resetForm: () => void
}

export const useRouteStore = create<RouteState>((set) => ({
	// Initial state
	routeType: null,
	selectedVehicle: null,
	stops: [],
	optimizedRoute: null,
	assignedDriver: null,

	// Actions
	setRouteType: (type) => set({ routeType: type }),
	setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
	setStops: (stops) => set({ stops }),
	setOptimizedRoute: (route) => set({ optimizedRoute: route }),
	setAssignedDriver: (driver) => set({ assignedDriver: driver }),
	resetForm: () =>
		set({
			routeType: null,
			selectedVehicle: null,
			stops: [],
			optimizedRoute: null,
			assignedDriver: null,
		}),
}))
