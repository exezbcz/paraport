import {
	type TeleportStepDetails,
	type TeleportStepStatus,
	TeleportStepStatuses,
} from '@/types'
import {
	TeleportStatuses,
	TransactionStatuses,
	TransactionTypes,
} from '@paraport/core'
import type { TeleportEventPayload, TransactionDetails } from '@paraport/core'
import { type Ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default (teleport: Ref<TeleportEventPayload | undefined>) => {
	const { t } = useI18n()

	const getTeleportStepText = ({
		status,
	}: { status: TeleportStepStatus }): string => {
		if (status === TeleportStepStatuses.Completed) {
			return t('autoteleport.status.completed')
		}

		if (status === TeleportStepStatuses.Failed) {
			return t('autoteleport.status.error')
		}

		if (status === TeleportStepStatuses.Loading) {
			return t('autoteleport.status.loading')
		}

		return t('autoteleport.status.waiting')
	}

	const getStepStatus = (transaction: TransactionDetails) => {
		if (
			transaction.status === TransactionStatuses.Finalized &&
			transaction.succeeded
		) {
			return TeleportStepStatuses.Completed
		}

		if (transaction.status === TransactionStatuses.Cancelled) {
			return TeleportStepStatuses.Cancelled
		}

		if (transaction.error) {
			return TeleportStepStatuses.Failed
		}

		if (transaction.status !== TransactionStatuses.Unknown) {
			return TeleportStepStatuses.Loading
		}

		return TeleportStepStatuses.Waiting
	}

	const balanceCheckDetails = computed<{
		status: TeleportStepStatus
		message?: string
	}>(() => {
		if (!teleport.value) {
			return { status: TeleportStepStatuses.Waiting }
		}

		const status = teleport.value.status

		if (teleport.value?.checked) {
			return { status: TeleportStepStatuses.Completed }
		}

		if (status === TeleportStatuses.Waiting) {
			return {
				status: TeleportStepStatuses.Loading,
				message: t('autoteleport.status.noSignatureRequired'),
			}
		}

		return { status: TeleportStepStatuses.Waiting }
	})

	const steps = computed<TeleportStepDetails[]>(() => {
		const items = teleport.value?.transactions || []

		if (!items.length) {
			return []
		}

		const teleportTransaction = items.find(
			(item) => item.type === TransactionTypes.Teleport,
		)

		if (!teleportTransaction) {
			return []
		}

		const teleportSteps = [
			{
				status: getStepStatus(teleportTransaction),
				txHash: teleportTransaction.txHash,
				type: TransactionTypes.Teleport,
				duration: 30000,
			},
			{
				status: balanceCheckDetails.value.status,
				statusLabel: balanceCheckDetails.value.message,
				type: 'balance-check' as const,
				duration: 5000,
			},
		]

		return teleportSteps.map((step, index) => {
			const isFirstActive =
				index === 0 && step.status !== TeleportStepStatuses.Completed
			const isPreviousCompleted =
				index > 0 &&
				teleportSteps[index - 1].status === TeleportStepStatuses.Completed

			return {
				...step,
				isActive: isFirstActive || isPreviousCompleted,
				id: crypto.randomUUID() as string,
				statusLabel: step.statusLabel || getTeleportStepText(step),
			}
		})
	})

	return steps
}
