import { useState, useEffect, useRef } from 'react'
import { Address } from './useAddressSelection'

export interface MapboxFeature {
	text: string
	place_name: string
	center: [number, number]
}

// Mapbox access token
const MAPBOX_ACCESS_TOKEN =
	'pk.eyJ1IjoiYmNucHJvMjAiLCJhIjoiY205cmVvZXhrMXB6dTJqb2I4cHFxN2xnbiJ9.HOKvHjSyBLNkwiaiEoFnBg'

export function useAddressSearch(onAddressSelect?: (address: Address) => void) {
	const [inputValue, setInputValue] = useState<string>('')
	const [suggestions, setSuggestions] = useState<Address[]>([])
	const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
	const suggestionsRef = useRef<HTMLDivElement>(null)

	// Handle clicks outside of the suggestions list
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(event.target as Node)
			) {
				setShowSuggestions(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	// Fetch address suggestions from Mapbox
	const fetchAddressSuggestions = async (query: string) => {
		if (!query || query.length < 3) {
			setSuggestions([])
			return
		}

		try {
			const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
			const url = `${endpoint}?access_token=${MAPBOX_ACCESS_TOKEN}&types=address,place,postcode&limit=5`

			const response = await fetch(url)
			const data = await response.json()

			if (data.features) {
				setSuggestions(
					data.features.map((feature: MapboxFeature) => ({
						text: feature.text,
						place_name: feature.place_name,
						center: feature.center,
					})),
				)
				setShowSuggestions(true)
			}
		} catch (error) {
			console.error('Error fetching address suggestions:', error)
			setSuggestions([])
		}
	}

	// Handle input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setInputValue(value)

		// Debounce the API call
		const timeoutId = setTimeout(() => {
			fetchAddressSuggestions(value)
		}, 300)

		return () => clearTimeout(timeoutId)
	}

	// Handle selection of an address
	const handleSelectAddress = (address: Address) => {
		setInputValue(address.place_name)
		setShowSuggestions(false)
		if (onAddressSelect) {
			onAddressSelect(address)
		}
	}

	return {
		inputValue,
		setInputValue,
		suggestions,
		showSuggestions,
		setShowSuggestions,
		suggestionsRef,
		handleInputChange,
		handleSelectAddress,
	}
}
