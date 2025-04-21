import { createContext, useContext, ReactNode, useState } from 'react'

export type MapStyleType =
	| 'Light'
	| 'Dark'
	| 'Standard'
	| 'Satellite'
	| 'Hybrid'

interface MapStyleContextType {
	currentStyle: MapStyleType
	setMapStyle: (style: MapStyleType) => void
}

const MapStyleContext = createContext<MapStyleContextType | undefined>(
	undefined,
)

export const useMapStyle = () => {
	const context = useContext(MapStyleContext)
	if (context === undefined) {
		throw new Error('useMapStyle must be used within a MapStyleProvider')
	}
	return context
}

interface MapStyleProviderProps {
	children: ReactNode
}

export const MapStyleProvider = ({ children }: MapStyleProviderProps) => {
	const [currentStyle, setCurrentStyle] = useState<MapStyleType>('Standard')

	const setMapStyle = (style: MapStyleType) => {
		setCurrentStyle(style)
	}

	return (
		<MapStyleContext.Provider value={{ currentStyle, setMapStyle }}>
			{children}
		</MapStyleContext.Provider>
	)
}
