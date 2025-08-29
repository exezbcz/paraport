import mitt from 'mitt'

const eventBus = mitt<{
	'session:ready': undefined
	'session:add-funds': undefined
	'teleport:submit': {
		autoteleport: boolean
		completed: boolean
	}
	'teleport:completed': undefined
}>()

export default eventBus
