import mitt from 'mitt'

const eventBus = mitt<{
	'teleport:submit': boolean
	'teleport:completed': undefined
}>()

export default eventBus
