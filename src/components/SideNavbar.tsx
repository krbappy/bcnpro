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
	Avatar,
} from '@chakra-ui/react'
import {
	FiMap,
	FiLayers,
	FiUser,
	FiHelpCircle,
	FiPlus,
	FiLogIn,
	FiBook,
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
import { CreateTeamModal } from './CreateTeamModal'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'

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
	const {
		isOpen: isCreateTeamOpen,
		onOpen: onCreateTeamOpen,
		onClose: onCreateTeamClose,
	} = useDisclosure()
	const { currentUser, logout } = useAuth()
	const ref = useRef<HTMLDivElement>(null)
	const navigate = useNavigate()
	const [isRoutesMenuOpen, setIsRoutesMenuOpen] = useState(false)

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

	const handleNavigation = (itemName: string) => {
		setActiveItem(itemName)

		// Navigation based on item clicked
		switch (itemName) {
			case 'Account':
				navigate('/account')
				break
			case 'Delivery history':
				navigate('/delivery-history')
				break
			case 'Teams':
				navigate('/team-management')
				break
			case 'Routes':
				navigate('/routes')
				break
			case 'Address Book':
				navigate('/address-book')
				break
			// Add other navigation cases as needed
			default:
				// Default behavior, perhaps just set the active item
				break
		}
	}

	const handleCreateTeam = () => {
		onCreateTeamOpen()
	}

	const handleRoutesMenuClick = () => {
		setIsRoutesMenuOpen((prev) => !prev)
		setActiveItem('Routes')
	}

	const handleManageRoutes = () => {
		setActiveItem('Manage Routes')
		navigate('/routes/manage')
	}

	const handleRequestRoute = () => {
		setActiveItem('Request Route')
		navigate('/routes')
	}

	return (
		<Box
			ref={ref}
			h="100vh"
			pb={4}
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

				{/* Routes menu with submenu */}
				<Box w="100%">
					<Flex
						p={3}
						borderRadius="md"
						bg={
							activeItem === 'Routes'
								? `${themeColors.accent}30`
								: 'transparent'
						}
						_hover={{
							bg:
								activeItem === 'Routes'
									? `${themeColors.accent}50`
									: `${themeColors.secondary}10`,
						}}
						cursor="pointer"
						w="100%"
						align="center"
						justifyContent="flex-start"
						transition="all 0.2s"
						onClick={handleRoutesMenuClick}
					>
						<Icon
							as={FiMap}
							boxSize={5}
							color={
								activeItem === 'Routes'
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
									activeItem === 'Routes'
										? 'semibold'
										: 'medium'
								}
								color={
									activeItem === 'Routes'
										? themeColors.accent
										: themeColors.secondary
								}
								whiteSpace="nowrap"
							>
								Routes
							</Text>
						</Box>
						<Box
							ml="auto"
							opacity={isExpanded ? 1 : 0}
							transition="all 0.2s"
						>
							{isRoutesMenuOpen ? (
								<ChevronUpIcon color={themeColors.secondary} />
							) : (
								<ChevronDownIcon
									color={themeColors.secondary}
								/>
							)}
						</Box>
					</Flex>
					{/* Submenu */}
					{isRoutesMenuOpen && isExpanded && (
						<VStack
							align="start"
							pl={7}
							spacing={1}
							mt={1}
							borderLeft="1px solid"
							borderColor={`${themeColors.secondary}20`}
						>
							<Flex
								align="center"
								cursor="pointer"
								py={1}
								px={2}
								borderRadius="md"
								bg={
									activeItem === 'Manage Routes'
										? `${themeColors.accent}30`
										: 'transparent'
								}
								_hover={{ bg: `${themeColors.secondary}10` }}
								onClick={handleManageRoutes}
							>
								<Icon
									as={BsLayersHalf}
									boxSize={4}
									color={themeColors.secondary}
									mr={2}
								/>
								<Text
									fontWeight={
										activeItem === 'Manage Routes'
											? 'semibold'
											: 'medium'
									}
									color={themeColors.secondary}
									fontSize="sm"
								>
									Manage
								</Text>
							</Flex>
							<Flex
								align="center"
								cursor="pointer"
								py={1}
								px={2}
								borderRadius="md"
								bg={
									activeItem === 'Request Route'
										? `${themeColors.accent}30`
										: 'transparent'
								}
								_hover={{ bg: `${themeColors.secondary}10` }}
								onClick={handleRequestRoute}
							>
								<Icon
									as={FiUser}
									boxSize={4}
									color={themeColors.secondary}
									mr={2}
								/>
								<Text
									fontWeight={
										activeItem === 'Request Route'
											? 'semibold'
											: 'medium'
									}
									color={themeColors.secondary}
									fontSize="sm"
								>
									Request a route
								</Text>
							</Flex>
						</VStack>
					)}
				</Box>

				{currentUser && (
					<>
						<NavItem
							icon={MdHistory}
							label="Delivery history"
							isExpanded={isExpanded}
							isActive={activeItem === 'Delivery history'}
							onClick={() => handleNavigation('Delivery history')}
						/>
						<NavItemWithAction
							icon={HiOutlineUserGroup}
							label="Teams"
							isExpanded={isExpanded}
							isActive={activeItem === 'Teams'}
							onClick={() => handleNavigation('Teams')}
							onActionClick={handleCreateTeam}
						/>
						<NavItem
							icon={FiBook}
							label="Address Book"
							isExpanded={isExpanded}
							isActive={activeItem === 'Address Book'}
							onClick={() => handleNavigation('Address Book')}
						/>
						<NavItem
							icon={FiUser}
							label="Account"
							isExpanded={isExpanded}
							isActive={activeItem === 'Account'}
							onClick={() => handleNavigation('Account')}
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

				{/* Remove the login/logout NavItem since we'll have it in the profile section */}
				{!currentUser && (
					<NavItem
						icon={FiLogIn}
						label="Login / Sign up"
						isExpanded={isExpanded}
						isActive={false}
						onClick={handleAuthClick}
					/>
				)}

				{/* Spacer to push map style selector and profile to bottom */}
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

				{/* User Profile Section */}
				{currentUser && (
					<Box
						w="100%"
						pt={2}
						borderTop="1px"
						borderTopColor={`${themeColors.secondary}20`}
					>
						<Flex
							p={2}
							borderRadius="md"
							w="100%"
							align="center"
							justify="space-between"
							transition="all 0.2s"
						>
							<Flex align="center">
								<Avatar
									size="sm"
									name={currentUser.displayName || 'User'}
									src={currentUser.photoURL || undefined}
									bg={themeColors.accent}
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
										fontWeight="medium"
										color={themeColors.secondary}
										noOfLines={1}
									>
										{currentUser.displayName || 'User'}
									</Text>
									<Text
										fontSize="xs"
										color={`${themeColors.secondary}80`}
										noOfLines={1}
									>
										{currentUser.email}
									</Text>
								</Box>
							</Flex>
							{isExpanded && (
								<IconButton
									icon={<FiLogIn />}
									aria-label="Logout"
									size="sm"
									variant="ghost"
									color={themeColors.secondary}
									_hover={{ bg: `${themeColors.accent}30` }}
									onClick={logout}
								/>
							)}
						</Flex>
					</Box>
				)}
			</VStack>

			<AuthModal isOpen={isOpen} onClose={onClose} />
			<CreateTeamModal
				isOpen={isCreateTeamOpen}
				onClose={onCreateTeamClose}
			/>
		</Box>
	)
}
