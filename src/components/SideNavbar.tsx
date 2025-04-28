import { FunctionComponent, ReactElement, useState, useRef } from 'react'
import {
	Box,
	VStack,
	Icon,
	Tooltip,
	Flex,
	Text,
	useOutsideClick,
	IconButton,
	useDisclosure,
} from '@chakra-ui/react'
import {
	FiMap,
	FiLayers,
	FiUser,
	FiHelpCircle,
	FiPlus,
	FiLogIn,
} from 'react-icons/fi'
import {
	MdOutlineLightMode,
	MdOutlineDarkMode,
	MdHistory,
} from 'react-icons/md'
import { TbMap, TbSatellite, TbTruckDelivery } from 'react-icons/tb'
import { BsLayersHalf, BsBox } from 'react-icons/bs'
import { HiOutlineUserGroup } from 'react-icons/hi'
import { useMapStyle, MapStyleType } from '../context/MapStyleContext'
import { AuthModal } from './AuthModal'
import { useAuth } from '../context/AuthContext'

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
				justifyContent="flex-start"
				transition="all 0.2s"
				onClick={onClick}
			>
				<Icon
					as={icon}
					boxSize={5}
					color={
						isActive ? themeColors.accent : themeColors.secondary
					}
					flexShrink={0}
				/>
				<Box
					ml={3}
					width={isExpanded ? 'auto' : '0px'}
					opacity={isExpanded ? 1 : 0}
					overflow="hidden"
					transition="all 0.2s"
				>
					<Text
						fontSize="sm"
						fontWeight={isActive ? 'semibold' : 'medium'}
						color={
							isActive
								? themeColors.accent
								: themeColors.secondary
						}
						whiteSpace="nowrap"
					>
						{label}
					</Text>
				</Box>
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
			justifyContent="flex-start"
			onClick={onClick}
		>
			<Icon
				as={icon}
				boxSize={5}
				color={themeColors.secondary}
				flexShrink={0}
			/>
			<Text
				ml={3}
				fontSize="sm"
				fontWeight="medium"
				color={themeColors.secondary}
				whiteSpace="nowrap"
			>
				{label}
			</Text>
		</Flex>
	)
}

interface HighlightedNavItemProps {
	icon: React.ElementType
	label: string
	isExpanded: boolean
	onClick?: () => void
}

const HighlightedNavItem: FunctionComponent<HighlightedNavItemProps> = ({
	icon,
	label,
	isExpanded,
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
				bg={themeColors.accent}
				_hover={{
					bg: `${themeColors.accent}80`,
				}}
				cursor="pointer"
				w="100%"
				align="center"
				justifyContent="flex-start"
				transition="all 0.2s"
				onClick={onClick}
			>
				<Icon
					as={icon}
					boxSize={5}
					color={themeColors.secondary}
					flexShrink={0}
				/>
				<Box
					ml={3}
					width={isExpanded ? 'auto' : '0px'}
					opacity={isExpanded ? 1 : 0}
					overflow="hidden"
					transition="all 0.2s"
				>
					<Text
						fontSize="sm"
						fontWeight="semibold"
						color={themeColors.secondary}
						whiteSpace="nowrap"
					>
						{label}
					</Text>
				</Box>
			</Flex>
		</Tooltip>
	)
}

interface NavItemWithActionProps {
	icon: React.ElementType
	label: string
	isExpanded: boolean
	isActive?: boolean
	onClick?: () => void
	onActionClick?: () => void
}

const NavItemWithAction: FunctionComponent<NavItemWithActionProps> = ({
	icon,
	label,
	isExpanded,
	isActive = false,
	onClick,
	onActionClick,
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
				justifyContent="flex-start"
				transition="all 0.2s"
				onClick={onClick}
			>
				<Icon
					as={icon}
					boxSize={5}
					color={
						isActive ? themeColors.accent : themeColors.secondary
					}
					flexShrink={0}
				/>
				<Box
					ml={3}
					width={isExpanded ? '100%' : '0px'}
					opacity={isExpanded ? 1 : 0}
					overflow="hidden"
					transition="all 0.2s"
				>
					<Flex justify="space-between" w="100%" align="center">
						<Text
							fontSize="sm"
							fontWeight={isActive ? 'semibold' : 'medium'}
							color={
								isActive
									? themeColors.accent
									: themeColors.secondary
							}
							whiteSpace="nowrap"
						>
							{label}
						</Text>
						<IconButton
							icon={<FiPlus />}
							aria-label={`Add ${label}`}
							size="xs"
							variant="ghost"
							color={themeColors.secondary}
							_hover={{ bg: `${themeColors.accent}30` }}
							onClick={(e) => {
								e.stopPropagation()
								if (onActionClick) onActionClick()
							}}
							ml={2}
							flexShrink={0}
						/>
					</Flex>
				</Box>
			</Flex>
		</Tooltip>
	)
}

export const SideNavbar: FunctionComponent = (): ReactElement => {
	const [isExpanded, setIsExpanded] = useState(false)
	const [activeItem, setActiveItem] = useState<string | null>(null)
	const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false)
	const styleMenuRef = useRef(null)
	const { currentStyle, setMapStyle } = useMapStyle()
	const { isOpen, onOpen, onClose } = useDisclosure()
	const { currentUser, logout } = useAuth()
	const ref = useRef<HTMLDivElement>(null)

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

	const handleAuthClick = () => {
		if (currentUser) {
			logout()
		} else {
			onOpen()
		}
	}

	return (
		<Box
			ref={ref}
			h="100vh"
			pb={10}
			pt={4}
			px={2}
			w={isExpanded ? { base: '48', md: '56' } : { base: '16', md: '16' }}
			transition="width 0.2s ease-in-out"
			bg={themeColors.background}
			borderRight="1px"
			borderRightColor={`${themeColors.secondary}20`}
			position="relative"
			onMouseEnter={() => setIsExpanded(true)}
			onMouseLeave={() => {
				setIsExpanded(false)
				setIsStyleMenuOpen(false)
			}}
			overflow="hidden"
			shadow="md"
		>
			{/* Logo at the top with fixed height and positioning */}
			<Box
				h="70px"
				position="relative"
				display="flex"
				justifyContent="center"
				alignItems="center"
				mb={3}
			>
				<Box
					position="absolute"
					transition="opacity 0.2s ease-in-out"
					opacity={isExpanded ? 1 : 0}
				>
					<Flex align="center" justify="center" gap={1}>
						<Icon
							as={TbTruckDelivery}
							boxSize={7}
							color="white"
							aria-label="BCNPRO"
						/>
						<Text fontSize="2xl" fontWeight="bold" color="white">
							BCNPRO
						</Text>
					</Flex>
				</Box>
				<Box
					position="absolute"
					transition="opacity 0.2s ease-in-out"
					opacity={isExpanded ? 0 : 1}
				>
					<Icon
						as={TbTruckDelivery}
						boxSize={7}
						color="white"
						aria-label="BCNPRO"
					/>
				</Box>
			</Box>

			<VStack spacing={5} align="start" h="calc(100% - 70px)">
				{/* Main navigation items */}
				<HighlightedNavItem
					icon={BsBox}
					label="Book delivery"
					isExpanded={isExpanded}
					onClick={() => setActiveItem('Book delivery')}
				/>

				<NavItemWithAction
					icon={FiMap}
					label="Routes"
					isExpanded={isExpanded}
					isActive={activeItem === 'Routes'}
					onClick={() => setActiveItem('Routes')}
					onActionClick={() => console.log('Add new route')}
				/>

				{currentUser && (
					<>
						<NavItem
							icon={MdHistory}
							label="Delivery history"
							isExpanded={isExpanded}
							isActive={activeItem === 'Delivery history'}
							onClick={() => setActiveItem('Delivery history')}
						/>
						<NavItemWithAction
							icon={HiOutlineUserGroup}
							label="Teams"
							isExpanded={isExpanded}
							isActive={activeItem === 'Teams'}
							onClick={() => setActiveItem('Teams')}
							onActionClick={() => console.log('Add new team')}
						/>
						<NavItem
							icon={FiUser}
							label="Account"
							isExpanded={isExpanded}
							isActive={activeItem === 'Account'}
							onClick={() => setActiveItem('Account')}
						/>
					</>
				)}

				<NavItem
					icon={FiHelpCircle}
					label="Support"
					isExpanded={isExpanded}
					isActive={activeItem === 'Support'}
					onClick={() => setActiveItem('Support')}
				/>

				<NavItem
					icon={FiLogIn}
					label={currentUser ? 'Logout' : 'Login / Sign up'}
					isExpanded={isExpanded}
					isActive={false}
					onClick={handleAuthClick}
				/>

				{/* Spacer to push map style selector to bottom */}
				<Box flex="1" />

				{/* Map Style Selector - Only show when logged in */}
				{currentUser && (
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
								justifyContent="flex-start"
								transition="all 0.2s"
								onClick={() =>
									setIsStyleMenuOpen(!isStyleMenuOpen)
								}
							>
								<Icon
									as={FiLayers}
									boxSize={5}
									color={
										isStyleMenuOpen
											? themeColors.accent
											: themeColors.secondary
									}
									flexShrink={0}
								/>
								<Box
									ml={3}
									width={isExpanded ? 'auto' : '0px'}
									opacity={isExpanded ? 1 : 0}
									overflow="hidden"
									transition="all 0.2s"
								>
									<Text
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
										whiteSpace="nowrap"
									>
										{currentStyle}
									</Text>
								</Box>
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
				)}
			</VStack>

			<AuthModal isOpen={isOpen} onClose={onClose} />
		</Box>
	)
}
