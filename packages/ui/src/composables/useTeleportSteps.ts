import {
	type TransactionDetails,
	TransactionStatus,
	TransactionType,
} from '@autoteleport/core'
import type { Action, TeleportEventPayload } from '@autoteleport/core'
import { TeleportStatus } from '@autoteleport/core'
import { type ComputedRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { type TeleportStepDetails, TeleportStepStatus } from '../types'
import { getExtrinsicDetails } from '../utils/extrinsics'

export default (teleport: ComputedRef<TeleportEventPayload | undefined>) => {
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
		if (transaction.status === TransactionStatus.Finalized) {
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

		const actionTransactions = items.filter(
			(item) => item.type === TransactionType.Action,
		)

		const teleportSteps = [
			{
				title: t('autoteleport.steps.1.title'),
				status: getStepStatus(teleportTransaction),
				txHash: teleportTransaction.txHash,
			},
			{
				title: t('autoteleport.steps.2.title'),
				status: balanceCheckDetails.value.status,
				statusLabel: balanceCheckDetails.value.message,
			},
			...actionTransactions.map((transaction) => ({
				title: getExtrinsicDetails(transaction.details as Action)?.docs,
				status: getStepStatus(transaction),
				txHash: transaction.txHash,
			})),
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
				title: step.title,
			}

			return {
				...sDetails,
				statusLabel: sDetails.statusLabel || getTeleportStepText(sDetails),
			}
		})
	})

	return steps
}
