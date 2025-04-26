import React, { useState, useEffect } from 'react'
import {
	Box,
	Text,
	VStack,
	HStack,
	Button,
	Input,
	InputGroup,
	Flex,
	Icon,
	FormControl,
	FormLabel,
	Alert,
	AlertIcon,
	AlertTitle,
	Collapse,
} from '@chakra-ui/react'
import { FiPlus, FiChevronDown, FiChevronUp, FiTrash2 } from 'react-icons/fi'
import { themeColors } from '../theme'
import { useDeliveryFormStore } from '../../../stores/deliveryFormStore'

// Constants for vehicle capacity
const VEHICLE_CAPACITY = {
	car: { weight: 300, description: 'up to 300 lbs' }, // Standard car capacity
	suv: { weight: 750, description: 'up to 750 lbs' }, // SUV capacity
	'cargo-van': { weight: 3000, description: 'up to 3000 lbs' },
	'pickup-truck': { weight: 1500, description: 'up to 1500 lbs' },
	'rack-vehicle': { weight: 1200, description: 'up to 1200 lbs' },
	'sprinter-van': { weight: 3500, description: 'up to 3500 lbs' },
	'vehicle-with-hitch': { weight: 2000, description: 'up to 2000 lbs' },
	'box-truck': { weight: 5000, description: 'up to 5000 lbs' },
	'box-truck-liftgate': { weight: 5000, description: 'up to 5000 lbs' },
	'open-deck': { weight: 10000, description: 'up to 10000 lbs' },
	'hotshot-trailer': { weight: 15000, description: 'up to 15000 lbs' },
	flatbed: { weight: 40000, description: 'up to 40000 lbs' },
}

// Item interface
interface OrderItem {
	id: string
	description: string
	length: string
	width: string
	height: string
	weight: string
	quantity: string
}

// Order interface
interface Order {
	id: string
	poNumber: string
	orderNumber: string
	bolNumber: string
	items: OrderItem[]
	isOpen: boolean
}

interface OrdersSelectionProps {
	onOrdersDataChange: (data: { totalWeight: number; orders: Order[] }) => void
}

export const OrdersSelection: React.FC<OrdersSelectionProps> = ({
	onOrdersDataChange,
}) => {
	// Load from zustand store
	const vehicleType = useDeliveryFormStore((state) => state.vehicleType)
	const storedOrders = useDeliveryFormStore((state) => state.orders)
	const setOrdersInStore = useDeliveryFormStore((state) => state.setOrders)
	const setTotalWeightInStore = useDeliveryFormStore(
		(state) => state.setTotalWeight,
	)

	// Initialize state with stored orders or default
	const [orders, setOrders] = useState<Order[]>(
		storedOrders.length > 0
			? storedOrders
			: [
					{
						id: '1',
						poNumber: '',
						orderNumber: '',
						bolNumber: '',
						items: [
							{
								id: '1-1',
								description: '',
								length: '',
								width: '',
								height: '',
								weight: '',
								quantity: '1',
							},
						],
						isOpen: true,
					},
				],
	)

	// State for validation errors
	const [validationError, setValidationError] = useState<string | null>(null)

	// Update the parent component with current data and check capacity
	const updateParentAndValidate = (updatedOrders: Order[]) => {
		// Use this function after any state update to inform the parent
		// Calculate weight with updated orders
		const totalWeight = updatedOrders.reduce((totalOrderWeight, order) => {
			const orderWeight = order.items.reduce((totalItemWeight, item) => {
				const weight = parseFloat(item.weight) || 0
				const quantity = parseInt(item.quantity) || 1
				return totalItemWeight + weight * quantity
			}, 0)
			return totalOrderWeight + orderWeight
		}, 0)

		// Notify parent component of changes
		onOrdersDataChange({
			totalWeight,
			orders: updatedOrders,
		})

		// Save to zustand store
		setOrdersInStore(updatedOrders)
		setTotalWeightInStore(totalWeight.toString())

		// Validate weight against vehicle capacity
		if (vehicleType && totalWeight > 0) {
			const capacity =
				VEHICLE_CAPACITY[vehicleType as keyof typeof VEHICLE_CAPACITY]

			if (capacity && totalWeight > capacity.weight) {
				setValidationError(
					`The total weight (${totalWeight.toFixed(1)} lbs) exceeds the ${vehicleType} capacity of ${capacity.weight} lbs. Consider upgrading your vehicle.`,
				)
			} else {
				setValidationError(null)
			}
		} else {
			setValidationError(null)
		}
	}

	// Initial update when component mounts or vehicleType changes
	useEffect(() => {
		updateParentAndValidate(orders)
		// Only run when vehicleType changes, not when orders change
	}, [vehicleType])

	// Delete an order
	const deleteOrder = (orderId: string) => {
		// Only allow deleting if there's more than one order
		if (orders.length > 1) {
			const newOrders = orders.filter((order) => order.id !== orderId)
			// Renumber the orders
			const renumberedOrders = renumberOrders(newOrders)
			setOrders(renumberedOrders)
			updateParentAndValidate(renumberedOrders)
		}
	}

	// Helper function to renumber all orders and their items sequentially
	const renumberOrders = (ordersToRenumber: Order[]): Order[] => {
		return ordersToRenumber.map((order, index) => {
			const newOrderId = (index + 1).toString()

			// Renumber items within the order
			const newItems = order.items.map((item, itemIndex) => ({
				...item,
				id: `${newOrderId}-${itemIndex + 1}`,
			}))

			return {
				...order,
				id: newOrderId,
				items: newItems,
			}
		})
	}

	// Add a new order
	const addOrder = () => {
		const newOrders = [
			...orders,
			{
				id: (orders.length + 1).toString(),
				poNumber: '',
				orderNumber: '',
				bolNumber: '',
				items: [
					{
						id: `${orders.length + 1}-1`,
						description: '',
						length: '',
						width: '',
						height: '',
						weight: '',
						quantity: '1',
					},
				],
				isOpen: true,
			},
		]

		// Make sure all orders are numbered correctly
		const renumberedOrders = renumberOrders(newOrders)
		setOrders(renumberedOrders)
		updateParentAndValidate(renumberedOrders)
	}

	// Add an item to a specific order
	const addItem = (orderId: string) => {
		const newOrders = orders.map((order) => {
			if (order.id === orderId) {
				const newItemId = `${orderId}-${order.items.length + 1}`
				return {
					...order,
					items: [
						...order.items,
						{
							id: newItemId,
							description: '',
							length: '',
							width: '',
							height: '',
							weight: '',
							quantity: '1',
						},
					],
				}
			}
			return order
		})
		setOrders(newOrders)
		updateParentAndValidate(newOrders)
	}

	// Delete an item from an order
	const deleteItem = (orderId: string, itemId: string) => {
		const newOrders = orders.map((order) => {
			if (order.id === orderId) {
				// Only allow deleting if there's more than one item
				if (order.items.length > 1) {
					// First filter out the item to delete
					const filteredItems = order.items.filter(
						(item) => item.id !== itemId,
					)

					// Then renumber the remaining items
					const renumberedItems = filteredItems.map(
						(item, index) => ({
							...item,
							id: `${order.id}-${index + 1}`,
						}),
					)

					return {
						...order,
						items: renumberedItems,
					}
				}
			}
			return order
		})
		setOrders(newOrders)
		updateParentAndValidate(newOrders)
	}

	// Toggle order collapse/expand
	const toggleOrderCollapse = (orderId: string) => {
		const newOrders = orders.map((order) => {
			if (order.id === orderId) {
				// Toggle this order's open state
				return {
					...order,
					isOpen: !order.isOpen,
				}
			}
			// Leave all other orders unchanged
			return order
		})

		setOrders(newOrders)
	}

	// Update order information
	const updateOrderInfo = (
		orderId: string,
		field: keyof Order,
		value: string,
	) => {
		const newOrders = orders.map((order) => {
			if (order.id === orderId) {
				return {
					...order,
					[field]: value,
				}
			}
			return order
		})
		setOrders(newOrders)
		// No need to update parent as this doesn't affect weight/capacity
	}

	// Update item information
	const updateItemInfo = (
		orderId: string,
		itemId: string,
		field: keyof OrderItem,
		value: string,
	) => {
		const newOrders = orders.map((order) => {
			if (order.id === orderId) {
				return {
					...order,
					items: order.items.map((item) => {
						if (item.id === itemId) {
							return {
								...item,
								[field]: value,
							}
						}
						return item
					}),
				}
			}
			return order
		})
		setOrders(newOrders)

		// Only update parent if the change affects weight
		if (field === 'weight' || field === 'quantity') {
			updateParentAndValidate(newOrders)
		}
	}

	// Calculate the total weight and item count for a specific order
	const getOrderSummary = (order: Order) => {
		const itemCount = order.items.reduce((total, item) => {
			return total + (parseInt(item.quantity) || 1)
		}, 0)

		const weight = order.items.reduce((total, item) => {
			return (
				total +
				(parseFloat(item.weight) || 0) * (parseInt(item.quantity) || 1)
			)
		}, 0)

		return { itemCount, weight }
	}

	// Render each order
	return (
		<VStack spacing={6} align="stretch" w="100%">
			{validationError && (
				<Alert status="warning" borderRadius="md">
					<AlertIcon />
					<AlertTitle color="orange.500">
						{validationError}
					</AlertTitle>
				</Alert>
			)}

			{orders.map((order) => {
				const { itemCount, weight } = getOrderSummary(order)

				return (
					<Box
						key={order.id}
						borderWidth="1px"
						borderRadius="md"
						borderColor={themeColors.lightGray}
						overflow="hidden"
					>
						{/* Order Header */}
						<Flex
							p={4}
							bg={order.isOpen ? 'white' : 'gray.50'}
							justify="space-between"
							align="center"
							borderBottomWidth={order.isOpen ? '1px' : '0px'}
							borderBottomColor={themeColors.lightGray}
							onClick={() => toggleOrderCollapse(order.id)}
							cursor="pointer"
						>
							<HStack>
								<Text
									fontWeight="bold"
									fontSize="lg"
									color={themeColors.text}
								>
									Order {order.id}
								</Text>
								<Text color="gray.600">
									{itemCount} item{itemCount !== 1 ? 's' : ''}{' '}
									({weight} lbs)
								</Text>
							</HStack>
							<HStack>
								{orders.length > 1 && (
									<Box
										onClick={(e) => {
											e.stopPropagation()
											deleteOrder(order.id)
										}}
										cursor="pointer"
										borderRadius="md"
										p={1}
										_hover={{
											bg: 'red.50',
										}}
										mr={1}
									>
										<FiTrash2 size={18} color="red" />
									</Box>
								)}
								<Icon
									as={
										order.isOpen
											? FiChevronUp
											: FiChevronDown
									}
									boxSize={5}
									color="gray.600"
								/>
							</HStack>
						</Flex>

						{/* Order Details */}
						<Collapse in={order.isOpen} animateOpacity>
							<Box p={4}>
								{/* Order Numbers */}
								<HStack spacing={4} mb={6}>
									<FormControl>
										<FormLabel color="black" fontSize="sm">
											PO #
										</FormLabel>
										<Input
											placeholder="PO Number"
											value={order.poNumber}
											onChange={(e) =>
												updateOrderInfo(
													order.id,
													'poNumber',
													e.target.value,
												)
											}
											borderColor={themeColors.lightGray}
											_hover={{
												borderColor: themeColors.accent,
											}}
											color="black"
										/>
									</FormControl>

									<FormControl>
										<FormLabel color="black" fontSize="sm">
											ORDER #
										</FormLabel>
										<Input
											placeholder="Order Number"
											value={order.orderNumber}
											onChange={(e) =>
												updateOrderInfo(
													order.id,
													'orderNumber',
													e.target.value,
												)
											}
											borderColor={themeColors.lightGray}
											_hover={{
												borderColor: themeColors.accent,
											}}
											color="black"
										/>
									</FormControl>

									<FormControl>
										<FormLabel color="black" fontSize="sm">
											BOL #
										</FormLabel>
										<Input
											placeholder="BOL Number"
											value={order.bolNumber}
											onChange={(e) =>
												updateOrderInfo(
													order.id,
													'bolNumber',
													e.target.value,
												)
											}
											borderColor={themeColors.lightGray}
											_hover={{
												borderColor: themeColors.accent,
											}}
											color="black"
										/>
									</FormControl>
								</HStack>

								{/* Items Section */}
								<Box mb={4}>
									<Text
										fontWeight="bold"
										mb={3}
										color="black"
									>
										What&apos;s in this order?
									</Text>
									<Text color="gray.600" fontSize="sm" mb={4}>
										At least one order item required
									</Text>

									{/* Items */}
									<VStack spacing={4} align="stretch">
										{order.items.map((item) => (
											<Box
												key={item.id}
												p={4}
												borderWidth="1px"
												borderRadius="md"
												borderColor={
													themeColors.lightGray
												}
												position="relative"
											>
												{/* Delete item button (only if there's more than one item) */}
												{order.items.length > 1 && (
													<Box
														w={6}
														h={6}
														onClick={(e) => {
															e.stopPropagation()
															deleteItem(
																order.id,
																item.id,
															)
														}}
														cursor="pointer"
														borderRadius="md"
														p={1}
														_hover={{
															bg: 'red.50',
														}}
														justifyContent="center"
														alignItems="center"
													>
														<FiTrash2
															size={18}
															color="red"
														/>
													</Box>
												)}

												{/* Item description */}
												<FormControl mb={4}>
													<FormLabel
														color="black"
														fontSize="sm"
													>
														PAYLOAD DESCRIPTION
													</FormLabel>
													<Input
														placeholder="Describe your item"
														value={item.description}
														onChange={(e) =>
															updateItemInfo(
																order.id,
																item.id,
																'description',
																e.target.value,
															)
														}
														borderColor={
															themeColors.lightGray
														}
														_hover={{
															borderColor:
																themeColors.accent,
														}}
														color="black"
													/>
												</FormControl>

												{/* Item dimensions */}
												<HStack spacing={4} mb={2}>
													<FormControl>
														<FormLabel
															color="black"
															fontSize="sm"
														>
															LENGTH
														</FormLabel>
														<InputGroup>
															<Input
																type="number"
																placeholder=""
																px={2}
																value={
																	item.length ===
																	''
																		? ''
																		: Number(
																				item.length,
																			)
																}
																color="black"
																onChange={(e) =>
																	updateItemInfo(
																		order.id,
																		item.id,
																		'length',
																		e.target
																			.value,
																	)
																}
																borderColor={
																	themeColors.lightGray
																}
																_hover={{
																	borderColor:
																		themeColors.accent,
																}}
															/>
															<Box
																position="absolute"
																right="8px"
																top="50%"
																transform="translateY(-50%)"
																color="gray.500"
																fontSize="sm"
																pointerEvents="none"
																zIndex={2}
															>
																IN
															</Box>
														</InputGroup>
													</FormControl>

													<FormControl>
														<FormLabel
															color="black"
															fontSize="sm"
														>
															WIDTH
														</FormLabel>
														<InputGroup>
															<Input
																type="number"
																placeholder=""
																px={2}
																value={
																	item.width ===
																	''
																		? ''
																		: Number(
																				item.width,
																			)
																}
																onChange={(e) =>
																	updateItemInfo(
																		order.id,
																		item.id,
																		'width',
																		e.target
																			.value,
																	)
																}
																borderColor={
																	themeColors.lightGray
																}
																_hover={{
																	borderColor:
																		themeColors.accent,
																}}
																color="black"
															/>
															<Box
																position="absolute"
																right="8px"
																top="50%"
																transform="translateY(-50%)"
																color="gray.500"
																fontSize="sm"
																pointerEvents="none"
																zIndex={2}
															>
																IN
															</Box>
														</InputGroup>
													</FormControl>

													<FormControl>
														<FormLabel
															color="black"
															fontSize="sm"
														>
															HEIGHT
														</FormLabel>
														<InputGroup>
															<Input
																type="number"
																px={2}
																placeholder=""
																value={
																	item.height ===
																	''
																		? ''
																		: Number(
																				item.height,
																			)
																}
																onChange={(e) =>
																	updateItemInfo(
																		order.id,
																		item.id,
																		'height',
																		e.target
																			.value,
																	)
																}
																borderColor={
																	themeColors.lightGray
																}
																_hover={{
																	borderColor:
																		themeColors.accent,
																}}
																color="black"
															/>
															<Box
																position="absolute"
																right="8px"
																top="50%"
																transform="translateY(-50%)"
																color="gray.500"
																fontSize="sm"
																pointerEvents="none"
																zIndex={2}
															>
																IN
															</Box>
														</InputGroup>
													</FormControl>

													<FormControl>
														<FormLabel
															color="black"
															fontSize="sm"
														>
															WEIGHT
														</FormLabel>
														<InputGroup>
															<Input
																type="number"
																placeholder=""
																px={2}
																value={
																	item.weight ===
																	''
																		? ''
																		: Number(
																				item.weight,
																			)
																}
																onChange={(e) =>
																	updateItemInfo(
																		order.id,
																		item.id,
																		'weight',
																		e.target
																			.value,
																	)
																}
																borderColor={
																	themeColors.lightGray
																}
																_hover={{
																	borderColor:
																		themeColors.accent,
																}}
																color="black"
															/>
															<Box
																position="absolute"
																right="8px"
																top="50%"
																transform="translateY(-50%)"
																color="gray.500"
																fontSize="sm"
																pointerEvents="none"
																zIndex={2}
															>
																LBS
															</Box>
														</InputGroup>
													</FormControl>

													<FormControl>
														<FormLabel
															color="black"
															fontSize="sm"
														>
															QUANTITY
														</FormLabel>
														<InputGroup>
															<Input
																type="number"
																placeholder=""
																value={
																	item.quantity ===
																	''
																		? ''
																		: Number(
																				item.quantity,
																			)
																}
																onChange={(e) =>
																	updateItemInfo(
																		order.id,
																		item.id,
																		'quantity',
																		e.target
																			.value,
																	)
																}
																borderColor={
																	themeColors.lightGray
																}
																_hover={{
																	borderColor:
																		themeColors.accent,
																}}
																min="1"
																color="black"
															/>
														</InputGroup>
													</FormControl>
												</HStack>
											</Box>
										))}
									</VStack>

									{/* Add Item Button */}
									<Button
										leftIcon={<FiPlus />}
										variant="ghost"
										mt={4}
										color={themeColors.accent}
										onClick={() => addItem(order.id)}
									>
										Add item
									</Button>
								</Box>
							</Box>
						</Collapse>
					</Box>
				)
			})}

			{/* Add Another Order Button */}
			<Button
				leftIcon={<FiPlus />}
				variant="outline"
				borderColor={themeColors.lightGray}
				color="gray.700"
				onClick={addOrder}
				w="100%"
				py={6}
			>
				Add another order
			</Button>
		</VStack>
	)
}
