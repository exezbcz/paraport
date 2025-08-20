import { type TeleportStepDetails, TeleportStepStatus } from '@/types'
import {
	TeleportStatus,
	TransactionStatus,
	TransactionType,
} from '@paraport/core'
import type { TeleportEventPayload, TransactionDetails } from '@paraport/core'
import { type Ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default (teleport: Ref<TeleportEventPayload | undefined>) => {
	const { t } = useI18n()

	const getTeleportStepText = ({
		status,
		isActive,
	}: Omit<TeleportStepDetails, 'statusLabel'>): string => {
		if (status === TeleportStepStatus.Completed) {
			return t('autoteleport.status.completed')
		}

		if (status === TeleportStepStatus.Failed) {
			return t('autoteleport.status.error')
		}

		if (status === TeleportStepStatus.Loading) {
			return t('autoteleport.status.loading')
		}

		return !isActive
			? t('autoteleport.status.finishAbove')
			: t('autoteleport.status.waiting')
	}

	const getStepStatus = (transaction: TransactionDetails) => {
		if (
			transaction.status === TransactionStatus.Finalized &&
			transaction.succeeded
		) {
			return TeleportStepStatus.Completed
		}

		if (
			transaction.error ||
			transaction.status === TransactionStatus.Cancelled
		) {
			return TeleportStepStatus.Failed
		}

		if (transaction.status !== TransactionStatus.Unknown) {
			return TeleportStepStatus.Loading
		}

		return TeleportStepStatus.Waiting
	}

	const balanceCheckDetails = computed<{
		status: TeleportStepStatus
		message?: string
	}>(() => {
		if (!teleport.value) {
			return { status: TeleportStepStatus.Waiting }
		}

		const status = teleport.value.status

		if (teleport.value?.checked) {
			return { status: TeleportStepStatus.Completed }
		}

		if (status === TeleportStatus.Waiting) {
			return {
				status: TeleportStepStatus.Loading,
				message: t('autoteleport.status.noSignatureRequired'),
			}
		}

		return { status: TeleportStepStatus.Waiting }
	})

	const steps = computed<TeleportStepDetails[]>(() => {
		const items = teleport.value?.transactions || []

		if (!items.length) {
			return []
		}

		const teleportTransaction = items.find(
			(item) => item.type === TransactionType.Teleport,
		)

		if (!teleportTransaction) {
			return []
		}

		const teleportSteps = [
			{
				status: getStepStatus(teleportTransaction),
				txHash: teleportTransaction.txHash,
				type: TransactionType.Teleport,
				duration: 30000,
			},
			{
				status: balanceCheckDetails.value.status,
				statusLabel: balanceCheckDetails.value.message,
				type: 'balance-check',
				duration: 5000,
			},
		]

		return teleportSteps.map((step, index) => {
			const isFirstActive =
				index === 0 && step.status !== TeleportStepStatus.Completed
			const isPreviousCompleted =
				index > 0 &&
				teleportSteps[index - 1].status === TeleportStepStatus.Completed

			const sDetails = {
				...step,
				isActive: isFirstActive || isPreviousCompleted,
				id: crypto.randomUUID(),
			}

			return {
				...sDetails,
				statusLabel: sDetails.statusLabel || getTeleportStepText(sDetails),
			}
		})
	})

	return steps
}
