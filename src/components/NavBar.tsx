import { FunctionComponent, ReactElement } from 'react'

import { Flex, useColorMode } from '@chakra-ui/react'

import { ColorModeSwitcher } from './ColorModeSwitcher'

export const NavBar: FunctionComponent = (): ReactElement => {
	const { colorMode } = useColorMode()
	return (
		<Flex
			alignItems={'center'}
			justifyContent={'space-between'}
			borderBottom={1}
			borderStyle={'solid'}
			borderColor={colorMode === 'light' ? 'gray.100' : 'gray.900'}
			shadow={'sm'}
			px={10}
			py={1}
			fontSize={'sm'}
			style={{ scrollbarWidth: 'none' }}
		>
			<Flex alignItems={'center'} justifyContent={'space-between'}>
				<ColorModeSwitcher justifySelf="flex-end" />
			</Flex>
		</Flex>
	)
}
