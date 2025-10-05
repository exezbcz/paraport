import type { ParaportParams, ParaportEvents } from '@paraport/vue'

export type TeleportEvents = {
	/**
		* Callback fired when user submits the teleport form.
		* @param params - Object containing the autotelport status and completion status.
		*/
	onSubmit?: (...params: ParaportEvents['submit']) => void

	/**
		* Callback fired when the teleport operation completes successfully.
		*/
	onCompleted?: (...params: ParaportEvents['completed']) => void

	/**
		* Callback fired when the UI is ready for interaction.
		*/
	onReady?: (...params: ParaportEvents['ready']) => void

	/**
		* Callback fired when the user clicks adds funds.
		*/
	onAddFunds?: (...params: ParaportEvents['addFunds']) => void
}

/**
 * Configuration options for initializing the ParaPort SDK UI component.
 */
export type MountOptions = TeleportEvents & ParaportParams & {
	/**
	 * HTML element ID where the ParaPort UI will be mounted.
	 * The element must exist in the DOM before initialization.
	 */
	integratedTargetId: string
}
