import { create } from 'zustand'
import { Address } from '../components/Delivery/hooks/useAddressSelection'

export interface DeliveryFormState {
	// Form data
	stops: number[]
	selectedAddresses: Record<number, Address>
	routeDistance: {
		meters: number
		displayValue: string
	}
	vehicleType: string | null
	deliveryTiming: {
		date: string | null
		timeWindow: string | null
	}
	orderDetails: {
		weight: string | null
		size: string | null
	}
	additionalInfo: string | null

	// Form actions
	setStopsAndAddresses: (
		stops: number[],
		addresses: Record<number, Address>,
	) => void
	setRouteDistance: (distance: {
		meters: number
		displayValue: string
	}) => void
	setVehicleType: (vehicleType: string) => void
	setDeliveryTiming: (date: string, timeWindow: string) => void
	setOrderDetails: (weight: string, size: string) => void
	setAdditionalInfo: (info: string) => void
	resetForm: () => void
}

export const useDeliveryFormStore = create<DeliveryFormState>((set) => ({
	// Initial state
	stops: [1, 2],
	selectedAddresses: {},
	routeDistance: { meters: 0, displayValue: '0' },
	vehicleType: null,
	deliveryTiming: {
		date: null,
		timeWindow: null,
	},
	orderDetails: {
		weight: null,
		size: null,
	},
	additionalInfo: null,

	// Actions
	setStopsAndAddresses: (stops, addresses) =>
		set({ stops, selectedAddresses: addresses }),
	setRouteDistance: (distance) => set({ routeDistance: distance }),
	setVehicleType: (vehicleType) => set({ vehicleType }),
	setDeliveryTiming: (date, timeWindow) =>
		set({
			deliveryTiming: { date, timeWindow },
		}),
	setOrderDetails: (weight, size) =>
		set({
			orderDetails: { weight, size },
		}),
	setAdditionalInfo: (info) => set({ additionalInfo: info }),
	resetForm: () =>
		set({
			stops: [1, 2],
			selectedAddresses: {},
			routeDistance: { meters: 0, displayValue: '0' },
			vehicleType: null,
			deliveryTiming: {
				date: null,
				timeWindow: null,
			},
			orderDetails: {
				weight: null,
				size: null,
			},
			additionalInfo: null,
		}),
}))
