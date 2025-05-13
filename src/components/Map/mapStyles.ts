// Map style configurations
export const mapStyles = {
	light: 'mapbox://styles/mapbox/light-v11',
	dark: 'mapbox://styles/mapbox/dark-v11',
	standard: 'mapbox://styles/mapbox/streets-v12',
	satellite: 'mapbox://styles/mapbox/satellite-v9',
	hybrid: 'mapbox://styles/mapbox/satellite-streets-v12',
}

// Default map configuration
export const defaultMapConfig = {
	center: [-118.2437, 34.0522] as [number, number], // Default center (Los Angeles)
	zoom: 12,
	minZoom: 2,
	maxZoom: 18,
}

// Map style conversion helper
export const styleNameToMapboxStyle = (styleName: string): string => {
	switch (styleName) {
		case 'Light':
			return mapStyles.light
		case 'Dark':
			return mapStyles.dark
		case 'Standard':
			return mapStyles.standard
		case 'Satellite':
			return mapStyles.satellite
		case 'Hybrid':
			return mapStyles.hybrid
		default:
			return mapStyles.standard
	}
}
