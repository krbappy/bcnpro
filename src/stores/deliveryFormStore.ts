import { create } from 'zustand'
import { Address } from '../components/Delivery/hooks/useAddressSelection'

// Order and item interfaces
export interface OrderItem {
	id: string
	description: string
	length: string
	width: string
	height: string
	weight: string
	quantity: string
}

export interface Order {
	id: string
	poNumber: string
	orderNumber: string
	bolNumber: string
	items: OrderItem[]
	isOpen: boolean
}

// Contact information interface
export interface ContactInfo {
	name: string
	phone: string
	email: string
	company: string
	notes: string
	saveToAddressBook?: boolean
}

export interface DeliveryFormState {
	// Form data
	stops: number[]
	selectedAddresses: Record<number, Address>
	routeDistance: {
		meters: number
		displayValue: string
	}
	vehicleType: {
		type: string
		additionalInfo?: string
	} | null
	deliveryTiming: {
		date: string | null
		timeWindow: string | null
		isValid: boolean
	}
	orderDetails: {
		weight: string | null
		size: string | null
	}
	orders: Order[]
	totalWeight: string
	additionalInfo: string | null
	contactInfo: Record<number, ContactInfo>

	// Form actions
	setStopsAndAddresses: (
		stops: number[],
		addresses: Record<number, Address>,
	) => void
	setRouteDistance: (distance: {
		meters: number
		displayValue: string
	}) => void
	setVehicleType: (vehicleType: {
		type: string
		additionalInfo?: string
	}) => void
	setDeliveryTiming: (
		date: string,
		timeWindow: string,
		isValid?: boolean,
	) => void
	setOrderDetails: (weight: string, size: string) => void
	setOrders: (orders: Order[]) => void
	setTotalWeight: (weight: string) => void
	setAdditionalInfo: (info: string) => void
	setContactInfo: (stopId: number, info: ContactInfo) => void
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
		isValid: true,
	},
	orderDetails: {
		weight: null,
		size: null,
	},
	orders: [],
	totalWeight: '0',
	additionalInfo: null,
	contactInfo: {},

	// Actions
	setStopsAndAddresses: (stops, addresses) =>
		set({ stops, selectedAddresses: addresses }),
	setRouteDistance: (distance) => set({ routeDistance: distance }),
	setVehicleType: (vehicleType) => set({ vehicleType }),
	setDeliveryTiming: (date, timeWindow, isValid = true) =>
		set({
			deliveryTiming: { date, timeWindow, isValid },
		}),
	setOrderDetails: (weight, size) =>
		set({
			orderDetails: { weight, size },
		}),
	setOrders: (orders) => set({ orders }),
	setTotalWeight: (weight) => set({ totalWeight: weight }),
	setAdditionalInfo: (info) => set({ additionalInfo: info }),
	setContactInfo: (stopId, info) =>
		set((state) => ({
			contactInfo: {
				...state.contactInfo,
				[stopId]: info,
			},
		})),
	resetForm: () =>
		set({
			stops: [1, 2],
			selectedAddresses: {},
			routeDistance: { meters: 0, displayValue: '0' },
			vehicleType: null,
			deliveryTiming: {
				date: null,
				timeWindow: null,
				isValid: true,
			},
			orderDetails: {
				weight: null,
				size: null,
			},
			orders: [],
			totalWeight: '0',
			additionalInfo: null,
			contactInfo: {},
		}),
}))
