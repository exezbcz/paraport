import mitt from 'mitt'

const eventBus = mitt<{
	'session:ready': undefined
	'session:add-funds': undefined
	'teleport:submit': boolean
	'teleport:completed': undefined
}>()

export default eventBus
