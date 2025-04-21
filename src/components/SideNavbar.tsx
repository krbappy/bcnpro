import { FunctionComponent, ReactElement, useState, useRef } from 'react'
import {
	Box,
	VStack,
	Icon,
	Tooltip,
	Flex,
	Text,
	useOutsideClick,
} from '@chakra-ui/react'
import { FiHome, FiMap, FiSettings, FiInfo, FiLayers } from 'react-icons/fi'
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md'
import { TbMap, TbSatellite } from 'react-icons/tb'
import { BsLayersHalf } from 'react-icons/bs'
import { useMapStyle, MapStyleType } from '../context/MapStyleContext'

// Custom theme colors
const themeColors = {
	background: '#191919', // Black background
	accent: '#F75708', // Orange - assuming full HEX code is F75708
	secondary: '#E4DCFF', // Light/whitish - assuming full HEX code is E4DCFF
}

interface NavItemProps {
	icon: React.ElementType
	label: string
	isExpanded: boolean
	isActive?: boolean
	onClick?: () => void
}

const NavItem: FunctionComponent<NavItemProps> = ({
	icon,
	label,
	isExpanded,
	isActive = false,
	onClick,
}): ReactElement => {
	return (
		<Tooltip
			label={label}
			placement="right"
			hasArrow
			isDisabled={isExpanded}
			bg={themeColors.accent}
			color={themeColors.secondary}
		>
			<Flex
				p={3}
				borderRadius="md"
				bg={isActive ? `${themeColors.accent}30` : 'transparent'}
				_hover={{
					bg: isActive
						? `${themeColors.accent}50`
						: `${themeColors.secondary}10`,
				}}
				cursor="pointer"
				w="100%"
				align="center"
				transition="all 0.2s"
				onClick={onClick}
			>
				<Icon
					as={icon}
					boxSize={5}
					color={
						isActive ? themeColors.accent : themeColors.secondary
					}
				/>
				{isExpanded && (
					<Text
						ml={3}
						fontSize="sm"
						fontWeight={isActive ? 'semibold' : 'medium'}
						transition="opacity 0.2s"
						opacity={1}
						color={
							isActive
								? themeColors.accent
								: themeColors.secondary
						}
					>
						{label}
					</Text>
				)}
			</Flex>
		</Tooltip>
	)
}

interface MapStyleOptionProps {
	icon: React.ElementType
	label: string
	onClick: () => void
}

const MapStyleOption: FunctionComponent<MapStyleOptionProps> = ({
	icon,
	label,
	onClick,
}): ReactElement => {
	return (
		<Flex
			p={2}
			borderRadius="md"
			_hover={{ bg: `${themeColors.accent}20` }}
			cursor="pointer"
			w="100%"
			align="center"
			onClick={onClick}
		>
			<Icon as={icon} boxSize={5} color={themeColors.secondary} />
			<Text
				ml={3}
				fontSize="sm"
				fontWeight="medium"
				color={themeColors.secondary}
			>
				{label}
			</Text>
		</Flex>
	)
}

export const SideNavbar: FunctionComponent = (): ReactElement => {
	const [isExpanded, setIsExpanded] = useState(false)
	const [activeItem, setActiveItem] = useState('Home')
	const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false)
	const styleMenuRef = useRef(null)
	const { currentStyle, setMapStyle } = useMapStyle()

	useOutsideClick({
		ref: styleMenuRef,
		handler: () => setIsStyleMenuOpen(false),
	})

	const mapStyles = [
		{ label: 'Light', icon: MdOutlineLightMode },
		{ label: 'Dark', icon: MdOutlineDarkMode },
		{ label: 'Standard', icon: TbMap },
		{ label: 'Satellite', icon: TbSatellite },
		{ label: 'Hybrid', icon: BsLayersHalf },
	]

	const handleStyleChange = (style: string) => {
		setMapStyle(style as MapStyleType)
		setIsStyleMenuOpen(false)
	}

	return (
		<Box
			h="100vh"
			pb={10}
			pt={2}
			px={2}
			w={isExpanded ? { base: '48', md: '56' } : { base: '16', md: '16' }}
			transition="all 0.2s ease-in-out"
			bg={themeColors.background}
			borderRight="1px"
			borderRightColor={`${themeColors.secondary}20`}
			position="relative"
			// p={2}
			onMouseEnter={() => setIsExpanded(true)}
			onMouseLeave={() => {
				setIsExpanded(false)
				setIsStyleMenuOpen(false)
			}}
			overflow="hidden"
			shadow="md"
		>
			<VStack spacing={4} align="start" mt={8} h="100%">
				<NavItem
					icon={FiHome}
					label="Home"
					isExpanded={isExpanded}
					isActive={activeItem === 'Home'}
					onClick={() => setActiveItem('Home')}
				/>
				<NavItem
					icon={FiMap}
					label="Explore"
					isExpanded={isExpanded}
					isActive={activeItem === 'Explore'}
					onClick={() => setActiveItem('Explore')}
				/>
				<NavItem
					icon={FiInfo}
					label="About"
					isExpanded={isExpanded}
					isActive={activeItem === 'About'}
					onClick={() => setActiveItem('About')}
				/>
				<NavItem
					icon={FiSettings}
					label="Settings"
					isExpanded={isExpanded}
					isActive={activeItem === 'Settings'}
					onClick={() => setActiveItem('Settings')}
				/>

				{/* Spacer to push map style selector to bottom */}
				<Box flex="1" />

				{/* Map Style Selector */}
				<Box position="relative" w="100%" ref={styleMenuRef}>
					<Tooltip
						label="Map Style"
						placement="right"
						hasArrow
						isDisabled={isExpanded}
						bg={themeColors.accent}
						color={themeColors.secondary}
					>
						<Flex
							p={3}
							borderRadius="md"
							bg={
								isStyleMenuOpen
									? `${themeColors.accent}30`
									: 'transparent'
							}
							_hover={{
								bg: isStyleMenuOpen
									? `${themeColors.accent}50`
									: `${themeColors.secondary}10`,
							}}
							cursor="pointer"
							w="100%"
							align="center"
							onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
						>
							<Icon
								as={FiLayers}
								boxSize={5}
								color={
									isStyleMenuOpen
										? themeColors.accent
										: themeColors.secondary
								}
							/>
							{isExpanded && (
								<Flex
									justify="space-between"
									w="100%"
									align="center"
								>
									<Text
										ml={3}
										fontSize="sm"
										fontWeight={
											isStyleMenuOpen
												? 'semibold'
												: 'medium'
										}
										color={
											isStyleMenuOpen
												? themeColors.accent
												: themeColors.secondary
										}
									>
										{currentStyle}
									</Text>
								</Flex>
							)}
						</Flex>
					</Tooltip>

					{isStyleMenuOpen && (
						<Box
							position="absolute"
							bottom="100%"
							left={isExpanded ? '0' : '16'}
							w={isExpanded ? '100%' : '48'}
							bg={themeColors.background}
							borderRadius="md"
							p={2}
							shadow="lg"
							border="1px solid"
							borderColor={`${themeColors.secondary}20`}
							zIndex={1001}
							mb={2}
						>
							<VStack spacing={1} align="start">
								{mapStyles.map((style) => (
									<MapStyleOption
										key={style.label}
										icon={style.icon}
										label={style.label}
										onClick={() =>
											handleStyleChange(style.label)
										}
									/>
								))}
							</VStack>
						</Box>
					)}
				</Box>
			</VStack>
		</Box>
	)
}
