import React from 'react'
import { Box, Grid, Text, Flex, Image } from '@chakra-ui/react'
import { CheckIcon } from '@chakra-ui/icons'
import { themeColors } from '../theme'

// Define vehicle data structure
interface VehicleData {
	id: string
	name: string
	description: string
	maxWeight: string
	imagePath: string
}

interface VehicleSelectionProps {
	onVehicleSelect: (vehicleType: string) => void
	selectedVehicle: string | null
}

// Vehicle data with attributes matching the design
const VEHICLES: VehicleData[] = [
	{
		id: 'car',
		name: 'Car',
		description: 'Small boxes, bags, fittings, fasteners, romex',
		maxWeight: '200 LBS MAX',
		imagePath:
			'https://app.curri.com/_next/static/images/car-41f084f877c022c803fdd7ab0e641127.svg',
	},
	{
		id: 'suv',
		name: 'SUV',
		description: 'Boxes, tankless water heaters, electrical panels',
		maxWeight: '800 LBS MAX',
		imagePath:
			'https://app.curri.com/_next/static/images/suv-aead1864b3b49019e0dfc2639b7e6e95.svg',
	},
	{
		id: 'cargo-van',
		name: 'Cargo Van',
		description: 'Pickup truck capacity enclosed for protection',
		maxWeight: '1.5K LBS MAX',
		imagePath:
			'https://app.curri.com/_next/static/images/cargo-van-d604735e5e14fad831c75319532d3711.svg',
	},
	{
		id: 'pickup-truck',
		name: 'Pickup Truck',
		description: "Pallets, 10' pipe or lumber, large boxes",
		maxWeight: '1.5K LBS MAX',
		imagePath:
			'https://app.curri.com/_next/static/images/truck-0f36fc60fceb6e4c18e36ba0156dfaa3.svg',
	},
	{
		id: 'rack-vehicle',
		name: 'Rack Vehicle',
		description: 'Lengthy pipe or lumber, rack up to 700 lbs.',
		maxWeight: '1.5K LBS MAX',
		imagePath:
			'https://app.curri.com/_next/static/images/truck-with-pipe-rack-76caa15dde5905c3d7093fef1ec31ab3.svg',
	},
	{
		id: 'sprinter-van',
		name: 'Sprinter Van',
		description: 'Pallets, large boxes, appliances',
		maxWeight: '4K LBS MAX',
		imagePath:
			'https://app.curri.com/_next/static/images/sprinter-van-3f97da8e21e9515747ad6395a24d42f3.svg',
	},
	{
		id: 'vehicle-with-hitch',
		name: 'Vehicle w/ Hitch',
		description: 'You provide the trailer or towable equipment',
		maxWeight: '10K LBS MAX',
		imagePath:
			'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzUiIGhlaWdodD0iNzUiIHZpZXdCb3g9IjAgMCA3OCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTY0LjkyNTUgNTUuMDEwMVY2MEM2NC45MjU1IDYwIDcyLjcxODggNTguNzYyMyA3Ni45MzU2IDUzLjEzNEM3Ny40NDUyIDUyLjQ1MjYgNzcuNzIwNCA1MS42MjI5IDc3LjcxNjUgNTAuNzcxOEw3Ny42OTUxIDQ1LjQ2NTZDNzcuNjk1MSA0NS40NjU2IDcyLjkzOTQgNTUuMDEwMSA2NC45MjU1IDU1LjAxMDFaIiBmaWxsPSIjMzIzNzQ0Ii8+CjxwYXRoIGQ9Ik0yNi4zNDE1IDUuNjU5NTNMNDEuMTgwNCAwTDQ3LjMwMDcgMC43NjUyNzZMMzEuODQ4OCA2Ljk1MTkxTDI2LjM0MTUgNS42NTk1M1oiIGZpbGw9IiNBNUFCQjciLz4KPHBhdGggZD0iTTAgNy40OTI2OEwxMy4xMTEyIDMuNjMzMTFDMTMuNDU4NyAzLjUzMTU5IDEzLjgyNzcgMy41Mjc2OSAxNC4xNzcxIDMuNjIzMzVMNDIuMTMxMiAxMS4yNzYxTDMxLjA1NjIgMTUuNjQ1MkwwIDcuNDkyNjhaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMjk0M184ODc5OCkiLz4KPHBhdGggZD0iTTI2LjM0MTUgNS42NTk1NUwzNy4wMjggNDMuODA0M0MzNy45MjAyIDQ2Ljk4NjQgNDAuMTEyNiA0OS42NDM0IDQzLjA2ODMgNTEuMTIxMkw2NC45MjM1IDYwVjU1LjIwNTNMNDUuOTUxNyA0Ny42OTEyQzQzLjkxNTUgNDYuNzE3IDQyLjQwMDYgNDQuOTExMiA0MS43OTU0IDQyLjczNjRMMzEuODQ4OCA2Ljk1MTkzTDI2LjM0MTUgNS42NTk1NVoiIGZpbGw9IiMwMzE3MjYiLz4KPHBhdGggZD0iTTMxLjg0ODggNi45NTE4OUw0Ny4zMDA3IDAuNzY1MjU5TDU1LjI5OSAzNS43NTcxTDc3LjcwMjkgNDUuMzE1M0M3Ny43MDI5IDQ1LjMxNTMgNzUuMzExNCA1NC4yMzMxIDY0LjkyNTUgNTUuMjA3Mkw0NS41MjIyIDQ3LjUwMThDNDMuNTA5NSA0Ni41MjU3IDQyLjAxNDEgNDQuNzMxNiA0MS40MTA4IDQyLjU3ODJMMzEuODQ4OCA2Ljk1NThWNi45NTE4OVoiIGZpbGw9InVybCgjcGFpbnQxX2xpbmVhcl8yOTQzXzg4Nzk4KSIvPgo8cGF0aCBkPSJNNzAuMjg4MyA0Ni4wNTkxQzcwLjI4ODMgNDcuOTQ1IDY2LjU2NzMgNDkuODU0MyA2MS45Nzk2IDQ5Ljg1NDNDNTcuMzkxOCA0OS44NTQzIDUzLjY3MDkgNDcuOTQ1IDUzLjY3MDkgNDYuMDU5MUM1My42NzA5IDQ0LjE3MzMgNTcuMzkxOCA0Mi42NDI3IDYxLjk3OTYgNDIuNjQyN0M2Ni41NjczIDQyLjY0MjcgNzAuMjg4MyA0NC4xNzEzIDcwLjI4ODMgNDYuMDU5MVoiIGZpbGw9IiMzMjM3NDQiLz4KPHBhdGggZD0iTTY4LjcxMDkgMzkuNzE0NEM2OC43MTA5IDM5LjcxNDQgNjcuMTc2NCA0Mi4yOTEzIDY5LjI2MTQgNDQuMzMzM0M3MC4xMTY1IDQ1LjE2ODkgNjkuNjY1NSA0OS4wMTY4IDYxLjk1NDIgNDkuMDE2OEM1NC4yNDI5IDQ5LjAxNjggNTMuNjY4OSA0NS4yODQxIDU1LjAxNCA0NC4zMzMzQzU3LjM5NzcgNDIuNjQ4NiA1NS41NjQ1IDM5LjcxNDQgNTUuNTY0NSAzOS43MTQ0IiBmaWxsPSJ1cmwoI3BhaW50Ml9yYWRpYWxfMjk0M184ODc5OCkiLz4KPHBhdGggZD0iTTYyLjE3NDggNDEuOTUxNkM2OC4xODQ2IDQxLjk1MTYgNzMuMDU2NSAzNy4wNzk3IDczLjA1NjUgMzEuMDY5OUM3My4wNTY1IDI1LjA2IDY4LjE4NDYgMjAuMTg4MSA2Mi4xNzQ4IDIwLjE4ODFDNTYuMTY1IDIwLjE4ODEgNTEuMjkzIDI1LjA2IDUxLjI5MyAzMS4wNjk5QzUxLjI5MyAzNy4wNzk3IDU2LjE2NSA0MS45NTE2IDYyLjE3NDggNDEuOTUxNloiIGZpbGw9InVybCgjcGFpbnQzX3JhZGlhbF8yOTQzXzg4Nzk4KSIvPgo8cGF0aCBkPSJNNjIuMzcgMjYuMDA3N0M2NS4yMDg5IDI2LjAwNzcgNjcuNTEwMiAyNC45NDMxIDY3LjUxMDIgMjMuNjI5OUM2Ny41MTAyIDIyLjMxNjcgNjUuMjA4OSAyMS4yNTIxIDYyLjM3IDIxLjI1MjFDNTkuNTMxMSAyMS4yNTIxIDU3LjIyOTggMjIuMzE2NyA1Ny4yMjk4IDIzLjYyOTlDNTcuMjI5OCAyNC45NDMxIDU5LjUzMTEgMjYuMDA3NyA2Mi4zNyAyNi4wMDc3WiIgZmlsbD0idXJsKCNwYWludDRfbGluZWFyXzI5NDNfODg3OTgpIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMCAyMy4yOTk5VjcuNDkyNjhMMzEuMDU4MSAxNS42NDUyTDM0LjkzMzMgMzUuMjUxNUwxLjM5MDAxIDI1LjE3MDJDMC41NjQyMDkgMjQuOTIyMiAwIDI0LjE2MDkgMCAyMy4yOTk5Wk04LjAwMTgzIDIwLjkyNjNDOS4xODg0OCAyMC44ODAxIDEwLjA5ODEgMTkuNTAwNiAxMC4wMzM3IDE3Ljg0NTFDOS45NjkzIDE2LjE4OTYgOC45NTUxNCAxNC44ODQ5IDcuNzY4NDkgMTQuOTMxMkM2LjU4MTkxIDE0Ljk3NzQgNS42NzIyNCAxNi4zNTY4IDUuNzM2NjkgMTguMDEyNEM1LjgwMTA5IDE5LjY2NzkgNi44MTUyNSAyMC45NzI1IDguMDAxODMgMjAuOTI2M1oiIGZpbGw9IiMwMzE3MjYiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8yOTQzXzg4Nzk4IiB4MT0iMjkuMDYxIiB5MT0iMTYuMjY4IiB4Mj0iOC4yNDQyOSIgeTI9Ii0xLjY1NzQ1IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNBNUFCQjciLz4KPHN0b3Agb2Zmc2V0PSIwLjY1IiBzdG9wLWNvbG9yPSIjNUI2MDZEIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzMyMzc0NCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MV9saW5lYXJfMjk0M184ODc5OCIgeDE9IjQwLjQ2MiIgeTE9IjYuNDc3NSIgeDI9IjYzLjg2NTQiIHkyPSI1Mi4zNzQ1IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM3Rjg2OTMiLz4KPHN0b3Agb2Zmc2V0PSIwLjMyIiBzdG9wLWNvbG9yPSIjN0M4MzkwIi8+CjxzdG9wIG9mZnNldD0iMC41IiBzdG9wLWNvbG9yPSIjNzQ3QzhBIi8+CjxzdG9wIG9mZnNldD0iMC42NSIgc3RvcC1jb2xvcj0iIzY2NkY3RSIvPgo8c3RvcCBvZmZzZXQ9IjAuNjgiIHN0b3AtY29sb3I9IiM2MzZEN0MiLz4KPHN0b3Agb2Zmc2V0PSIwLjciIHN0b3AtY29sb3I9IiM2QTczODIiLz4KPHN0b3Agb2Zmc2V0PSIwLjc1IiBzdG9wLWNvbG9yPSIjNzY3RThCIi8+CjxzdG9wIG9mZnNldD0iMC44MSIgc3RvcC1jb2xvcj0iIzdEODQ5MSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM3Rjg2OTMiLz4KPC9saW5lYXJHcmFkaWVudD4KPHJhZGlhbEdyYWRpZW50IGlkPSJwYWludDJfcmFkaWFsXzI5NDNfODg3OTgiIGN4PSIwIiBjeT0iMCIgcj0iMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGdyYWRpZW50VHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjIuMDEwOCA0NC4zNjY1KSBzY2FsZSg2LjI3ODM5KSI+CjxzdG9wIHN0b3AtY29sb3I9IiNFMUU4RjAiLz4KPHN0b3Agb2Zmc2V0PSIwLjIzIiBzdG9wLWNvbG9yPSIjQzlEMEQ5Ii8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzdGODY5MyIvPgo8L3JhZGlhbEdyYWRpZW50Pgo8cmFkaWFsR3JhZGllbnQgaWQ9InBhaW50M19yYWRpYWxfMjk0M184ODc5OCIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSg1OS40ODA3IDI5LjY0NjcpIHNjYWxlKDEwLjg4MTgpIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0UxRThGMCIvPgo8c3RvcCBvZmZzZXQ9IjAuMjMiIHN0b3AtY29sb3I9IiNDOUQwRDkiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjN0Y4NjkzIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQ0X2xpbmVhcl8yOTQzXzg4Nzk4IiB4MT0iNTUuMDk0IiB5MT0iMjUuNzc5MyIgeDI9Ijc1LjE5NDIiIHkyPSIxOS44NDA2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM4RDk1QTQiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRUFFRkY2Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==',
	},
	{
		id: 'box-truck',
		name: 'Box Truck',
		description: 'Pallets, large boxes, appliances',
		maxWeight: '10K LBS MAX',
		imagePath:
			'https://app.curri.com/_next/static/images/box-truck-ddb33c3ad12d872290461ce6c07657c5.svg',
	},
	{
		id: 'box-truck-liftgate',
		name: 'BT with Liftgate',
		description: 'Includes pallet jack for easy unloading',
		maxWeight: '10K LBS MAX',
		imagePath:
			'https://app.curri.com/_next/static/images/box-truck-with-liftgate-c9e7d593756d1e439683333d95b6f4f5.svg',
	},
	{
		id: 'open-deck',
		name: "20' Open Deck",
		description: 'Ideal for local or short haul freight services',
		maxWeight: '10K LBS MAX',
		imagePath:
			'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQyIiBoZWlnaHQ9Ijc1IiB2aWV3Qm94PSIwIDAgMzQwIDU5IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTEyMi42NTMgNTUuMjM2OEgxMzAuNjcyQzEzNy40OCA1NS4yMzY4IDE0MyA0Ny42MjU4IDE0MyAzOC4yMzY4QzE0MyAyOC44NDc5IDEzNy40OCAyMS4yMzY4IDEzMC42NzIgMjEuMjM2OEgxMjIuNjUzQzExNS4yMzcgMjEuMjM2OCAxMTQuOTk1IDU1LjIzNjggMTIyLjY1MyA1NS4yMzY4WiIgZmlsbD0iIzMyMzc0NCIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTExNC44OTMgNTUuMjM2OEgxMjIuMTQ5QzEyOS4yNDYgNTUuMjM2OCAxMzUgNDcuNjI1OCAxMzUgMzguMjM2OEMxMzUgMjguODQ3OSAxMjkuMjQ2IDIxLjIzNjggMTIyLjE0OSAyMS4yMzY4SDExNC44OTNDMTA3LjE2MyAyMS4yMzY4IDEwNi45MSA1NS4yMzY4IDExNC44OTMgNTUuMjM2OFoiIGZpbGw9IiMzMjM3NDQiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMTUuNDk5IDU1LjIzNjhDMTA4LjYxNSA1NS4yMzY4IDEwMyA0Ny42IDEwMyAzOC4yMzY4QzEwMyAyOC44NzM3IDEwOC42MTUgMjEuMjM2OCAxMTUuNDk5IDIxLjIzNjhDMTIyLjM4MyAyMS4yMzY4IDEyOCAyOC44NzM3IDEyOCAzOC4yMzY4QzEyOCA0Ny42IDEyMi4zODUgNTUuMjM2OCAxMTUuNDk5IDU1LjIzNjhaIiBmaWxsPSIjMDMxNzI2Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNODQuODcwNCA1NS4yMzY4SDkzLjE5NzNDMTAwLjI2OSA1NS4yMzY4IDEwNiA0Ny42MjU4IDEwNiAzOC4yMzY4QzEwNiAyOC44NDc5IDEwMC4yNjkgMjEuMjM2OCA5My4xOTczIDIxLjIzNjhIODQuODcwNEM3Ny4xNjk2IDIxLjIzNjggNzYuOTE3OSA1NS4yMzY4IDg0Ljg3MDQgNTUuMjM2OFoiIGZpbGw9IiMwMzE3MjYiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04Ni40OTkyIDU1LjIzNjhDNzkuNjE1MyA1NS4yMzY4IDc0IDQ3LjYgNzQgMzguMjM2OEM3NCAyOC44NzM3IDc5LjYxNTMgMjEuMjM2OCA4Ni40OTkyIDIxLjIzNjhDOTMuMzgzMiAyMS4yMzY4IDk5IDI4Ljg3MzcgOTkgMzguMjM2OEM5OSA0Ny42IDkzLjM5MDggNTUuMjM2OCA4Ni40OTkyIDU1LjIzNjhaIiBmaWxsPSIjMDMxNzI2Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNODUgNTAuMjM2OEM4Ni43OTE4IDQ4LjY2NTggODggNDUuNjcxMyA4OCA0Mi4yMzY4Qzg4IDM4LjgwMjMgODYuNzg5MSAzNS44MDY1IDg1IDM0LjIzNjhDODMuMjA4MiAzNS44MDc5IDgyIDM4LjgwMjMgODIgNDIuMjM2OEM4MiA0NS42NzEzIDgzLjIwODIgNDguNjY1OCA4NSA1MC4yMzY4WiIgZmlsbD0iIzAzMTcyNiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTEwNi40MDcgNDZMMTA4IDM5LjcxOTVDMTA4IDMwLjEwOTQgMTA0LjUgMTEgODcuNTQ1NCAxMUg0OS4yNTVDMjkuNDAzMSAxMSAyNyAzMC4xMDk0IDI3IDM5LjcxOTVMMjcuNDAzMSA0NkgxMDYuNDEzSDEwNi40MDdaIiBmaWxsPSIjMDMxNzI2Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNTYuODcwOCA1NS4yMzY4SDY1LjE5NzZDNzIuMjY5IDU1LjIzNjggNzggNDcuNjI1OCA3OCAzOC4yMzY4Qzc4IDI4Ljg0NzkgNzIuMjY5IDIxLjIzNjggNjUuMTk3NiAyMS4yMzY4SDU2Ljg3MDhDNDkuMTcwMiAyMS4yMzY4IDQ4LjkxNjkgNTUuMjM2OCA1Ni44NzA4IDU1LjIzNjhaIiBmaWxsPSIjMDMxNzI2Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNTAuNjY0NyA1NS4yMzY4SDU3LjY0MTdDNjQuNDY2OSA1NS4yMzY4IDcwIDQ3LjYyNTggNzAgMzguMjM2OEM3MCAyOC44NDc5IDY0LjQ2NjkgMjEuMjM2OCA1Ny42NDE3IDIxLjIzNjhINTAuNjY0N0M0My4yMzM3IDIxLjIzNjggNDIuOTkwOCA1NS4yMzY4IDUwLjY2NDcgNTUuMjM2OFoiIGZpbGw9IiMwMzE3MjYiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik05Mi42NTMgNTUuMjM2OEgxMDAuNjcyQzEwNy40OCA1NS4yMzY4IDExMyA0Ny42MjU4IDExMyAzOC4yMzY4QzExMyAyOC44NDc5IDEwMS4zMDggMjEuMjM2OCA5NC41IDIxLjIzNjhIOTIuNjUzQzg1LjIzNzQgMjEuMjM2OCA4NC45OTUgNTUuMjM2OCA5Mi42NTMgNTUuMjM2OFoiIGZpbGw9IiMwMzE3MjYiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04NC44OTMxIDU1LjIzNjhIOTIuMTQ5MUM5OS4yNDU2IDU1LjIzNjggMTA1IDQ3LjYyNTggMTA1IDM4LjIzNjhDMTA1IDI4Ljg0NzkgOTkuMjQ1NiAyMS4yMzY4IDkyLjE0OTEgMjEuMjM2OEg4NC44OTMxQzc3LjE2MzMgMjEuMjM2OCA3Ni45MDkgNTUuMjM2OCA4NC44OTMxIDU1LjIzNjhaIiBmaWxsPSIjMDMxNzI2Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNODUuNDk5MyA1NS4yMzY4Qzc4LjYxNTMgNTUuMjM2OCA3MyA0Ny42IDczIDM4LjIzNjhDNzMgMjguODczNyA3OC42MTUzIDIxLjIzNjggODUuNDk5MyAyMS4yMzY4QzkyLjM4MzIgMjEuMjM2OCA5OCAyOC44NzM3IDk4IDM4LjIzNjhDOTggNDcuNiA5Mi4zODQ4IDU1LjIzNjggODUuNDk5MyA1NS4yMzY4WiIgZmlsbD0iIzMyMzc0NCIvPgo8cGF0aCBkPSJNODUgNDguMjM2OEM4OS40MTgzIDQ4LjIzNjggOTMgNDMuNzU5NyA5MyAzOC4yMzY4QzkzIDMyLjcxNCA4OS40MTgzIDI4LjIzNjggODUgMjguMjM2OEM4MC41ODE3IDI4LjIzNjggNzcgMzIuNzE0IDc3IDM4LjIzNjhDNzcgNDMuNzU5NyA4MC41ODE3IDQ4LjIzNjggODUgNDguMjM2OFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik01MC41IDU1LjIzNjhDNTcuNDAzNiA1NS4yMzY4IDYzIDQ3LjYyNTcgNjMgMzguMjM2OEM2MyAyOC44NDggNTcuNDAzNiAyMS4yMzY4IDUwLjUgMjEuMjM2OEM0My41OTY0IDIxLjIzNjggMzggMjguODQ4IDM4IDM4LjIzNjhDMzggNDcuNjI1NyA0My41OTY0IDU1LjIzNjggNTAuNSA1NS4yMzY4WiIgZmlsbD0iIzMyMzc0NCIvPgo8cGF0aCBkPSJNNTEgNDguMjM2OEM1NS40MTgzIDQ4LjIzNjggNTkgNDMuNzU5NyA1OSAzOC4yMzY4QzU5IDMyLjcxNCA1NS40MTgzIDI4LjIzNjggNTEgMjguMjM2OEM0Ni41ODE3IDI4LjIzNjggNDMgMzIuNzE0IDQzIDM4LjIzNjhDNDMgNDMuNzU5NyA0Ni41ODE3IDQ4LjIzNjggNTEgNDguMjM2OFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yNy40ODAyIDQxLjk2NTNIMjZWMzQuOTY1M0gyNy40ODAyQzI3Ljg4MzMgMzQuOTY1MyAyOC4yNjk4IDM1LjA4NzkgMjguNTU0OSAzNS4zMDYyQzI4LjgzOTkgMzUuNTI0NSAyOSAzNS44MjA1IDI5IDM2LjEyOTJWNDAuODAyN0MyOC45OTk2IDQxLjExMTEgMjguODM5MiA0MS40MDY5IDI4LjU1NDMgNDEuNjI0OUMyOC4yNjkzIDQxLjg0MjkgMjcuODgzIDQxLjk2NTMgMjcuNDgwMiA0MS45NjUzWiIgZmlsbD0iI0JFMUUyRCIvPgo8cGF0aCBkPSJNMjUgMTRDMjUgMTMuNDQ3NyAyNS40NDc3IDEzIDI2IDEzSDI4NUMyODUuNTUyIDEzIDI4NiAxMy40NDc3IDI4NiAxNFYxOEMyODYgMTguNTUyMyAyODUuNTUyIDE5IDI4NSAxOUgyNkMyNS40NDc3IDE5IDI1IDE4LjU1MjMgMjUgMThWMTRaIiBmaWxsPSIjMDMxNzI2Ii8+CjxwYXRoIGQ9Ik0xMDYuNTc4IDMwLjM0MjVMOTAuNSAxOUgxNzQuOTM0SDI0MUwxOTcuMDg4IDMzLjA0ODlDMTk1LjExOCAzMy42NzkxIDE5My4wNjIgMzQgMTkwLjk5MyAzNEgxMTguMTA3QzExMy45NzkgMzQgMTA5Ljk1MSAzMi43MjI0IDEwNi41NzggMzAuMzQyNVoiIGZpbGw9IiM2MzZEN0MiLz4KPHBhdGggZD0iTTExNSAyOS40ODAyTDExNSAyOUwxMjIgMjlMMTIyIDI5LjQ4MDJDMTIyIDI5Ljg4MzMgMTIxLjg3NyAzMC4yNjk4IDEyMS42NTkgMzAuNTU0OUMxMjEuNDQxIDMwLjgzOTkgMTIxLjE0NSAzMSAxMjAuODM2IDMxTDExNi4xNjMgMzFDMTE1Ljg1NCAzMC45OTk2IDExNS41NTggMzAuODM5MiAxMTUuMzQgMzAuNTU0M0MxMTUuMTIyIDMwLjI2OTMgMTE1IDI5Ljg4MyAxMTUgMjkuNDgwMloiIGZpbGw9IiNEMURBRTMiLz4KPHBhdGggZD0iTTEwNSAxNS45NTIyQzEwNSAxNS40MDcyIDEwNS40NDIgMTQuOTY1MyAxMDUuOTg3IDE0Ljk2NTNMMTExLjAxMyAxNC45NjUzQzExMS41NTggMTQuOTY1MyAxMTIgMTUuNDA3MiAxMTIgMTUuOTUyMkMxMTIgMTYuMjIwOSAxMTEuODc3IDE2LjQ3ODYgMTExLjY1OSAxNi42Njg2QzExMS40NDEgMTYuODU4NiAxMTEuMTQ1IDE2Ljk2NTMgMTEwLjgzNiAxNi45NjUzTDEwNi4xNjMgMTYuOTY1M0MxMDUuODU0IDE2Ljk2NSAxMDUuNTU4IDE2Ljg1ODIgMTA1LjM0IDE2LjY2ODJDMTA1LjEyMiAxNi40NzgyIDEwNSAxNi4yMjA3IDEwNSAxNS45NTIyWiIgZmlsbD0iI0JFMUUyRCIvPgo8cmVjdCB4PSIyNTQiIHk9IjEwIiB3aWR0aD0iNyIgaGVpZ2h0PSIxNCIgcng9IjEiIGZpbGw9IiMwMzE3MjYiLz4KPHBhdGggZD0iTTIyOSAxNS45NTIyQzIyOSAxNS40MDcyIDIyOS40NDIgMTQuOTY1MyAyMjkuOTg3IDE0Ljk2NTNMMjM1LjAxMyAxNC45NjUzQzIzNS41NTggMTQuOTY1MyAyMzYgMTUuNDA3MiAyMzYgMTUuOTUyMkMyMzYgMTYuMjIwOSAyMzUuODc3IDE2LjQ3ODYgMjM1LjY1OSAxNi42Njg2QzIzNS40NDEgMTYuODU4NiAyMzUuMTQ1IDE2Ljk2NTMgMjM0LjgzNiAxNi45NjUzTDIzMC4xNjMgMTYuOTY1M0MyMjkuODU0IDE2Ljk2NSAyMjkuNTU4IDE2Ljg1ODIgMjI5LjM0IDE2LjY2ODJDMjI5LjEyMiAxNi40NzgyIDIyOSAxNi4yMjA3IDIyOSAxNS45NTIyWiIgZmlsbD0iI0JFMUUyRCIvPgo8cGF0aCBkPSJNMjc2IDE1Ljk1MjJDMjc2IDE1LjQwNzIgMjc2LjQ0MiAxNC45NjUzIDI3Ni45ODcgMTQuOTY1M0wyODIuMDEzIDE0Ljk2NTNDMjgyLjU1OCAxNC45NjUzIDI4MyAxNS40MDcyIDI4MyAxNS45NTIyQzI4MyAxNi4yMjA5IDI4Mi44NzcgMTYuNDc4NiAyODIuNjU5IDE2LjY2ODZDMjgyLjQ0MSAxNi44NTg2IDI4Mi4xNDUgMTYuOTY1MyAyODEuODM2IDE2Ljk2NTNMMjc3LjE2MyAxNi45NjUzQzI3Ni44NTQgMTYuOTY1IDI3Ni41NTggMTYuODU4MiAyNzYuMzQgMTYuNjY4MkMyNzYuMTIyIDE2LjQ3ODIgMjc2IDE2LjIyMDcgMjc2IDE1Ljk1MjJaIiBmaWxsPSIjQkUxRTJEIi8+CjxyZWN0IHg9IjI1MyIgeT0iNyIgd2lkdGg9IjkiIGhlaWdodD0iNCIgcng9IjEiIGZpbGw9IiMwMzE3MjYiLz4KPC9zdmc+Cg==',
	},
	{
		id: 'hotshot-trailer',
		name: 'Hotshot Trailer',
		description: "20'-40' trailer for oversized or long haul",
		maxWeight: '16K LBS MAX',
		imagePath:
			'https://app.curri.com/_next/static/images/freight-hotshot-trailer-ab1ad2fadd070ccda95fe98705a055ea.svg',
	},
	{
		id: 'flatbed',
		name: "48'-53' Flatbed",
		description: 'Open deck for heavy and oversized loads',
		maxWeight: '45K LBS MAX',
		imagePath:
			'https://app.curri.com/_next/static/images/freight-flatbed-402d309803c631060a5c19a19746324f.svg',
	},
]

export const VehicleSelection: React.FC<VehicleSelectionProps> = ({
	onVehicleSelect,
	selectedVehicle,
}) => {
	// Placeholder image for error fallback
	const placeholderImage = '/vehicle-placeholder.svg'

	return (
		<Box mb={8}>
			<Grid
				templateColumns={{
					base: 'repeat(2, 1fr)',
					md: 'repeat(3, 1fr)',
				}}
				gap="19px"
			>
				{VEHICLES.map((vehicle) => (
					<Box
						key={vehicle.id}
						borderWidth="1px"
						borderRadius="md"
						borderColor={
							selectedVehicle === vehicle.id
								? themeColors.accent
								: themeColors.lightGray
						}
						p={4}
						position="relative"
						cursor="pointer"
						onClick={() => onVehicleSelect(vehicle.id)}
						tabIndex={0}
						_hover={{
							borderColor: themeColors.accent + '80',
							boxShadow: 'sm',
						}}
						textAlign="center"
					>
						{/* Check icon for selected vehicle */}
						{selectedVehicle === vehicle.id && (
							<Flex
								position="absolute"
								top={2}
								left={2}
								w="20px"
								h="20px"
								borderRadius="full"
								bgColor={themeColors.accent}
								alignItems="center"
								justifyContent="center"
							>
								<CheckIcon color="white" w={3} h={3} />
							</Flex>
						)}

						{/* "View Price" button - display only, non-functional */}

						{/* Vehicle image */}
						<Image
							src={vehicle.imagePath}
							fallbackSrc={placeholderImage}
							alt={vehicle.name}
							mx="auto"
							h="75px"
							mb={2}
						/>

						{/* Vehicle name */}
						<Text
							fontSize="18px"
							fontWeight="600"
							lineHeight="20px"
							textAlign="center"
							mb={2}
							textColor={themeColors.text}
						>
							{vehicle.name}
						</Text>

						{/* Description */}
						<Text
							fontSize="12px"
							fontWeight="500"
							lineHeight="1.25"
							maxWidth="145px"
							mx="auto"
							mb={2}
							textAlign="center"
							textColor={themeColors.text}
						>
							{vehicle.description}
						</Text>

						{/* Max weight */}
						<Text
							fontSize="11px"
							fontWeight="600"
							letterSpacing="0.02em"
							color={themeColors.gray}
							textTransform="uppercase"
							textAlign="center"
							mt={1}
						>
							{vehicle.maxWeight}
						</Text>
					</Box>
				))}
			</Grid>
		</Box>
	)
}
