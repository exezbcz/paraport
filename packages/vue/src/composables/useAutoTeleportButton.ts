import type { Ref } from 'vue'
import { computed } from 'vue'

export default ({
  needsAutoTeleport,
  isAvailable,
  isReady,
  disabled,
  canAutoTeleport,
}: {
  needsAutoTeleport: Ref<boolean>
  isAvailable: Ref<boolean>
  isReady: Ref<boolean>
  disabled: Ref<boolean>
  canAutoTeleport: Ref<boolean>
  hasNoFundsAtAll: Ref<boolean>
}) => {
  const showAutoTeleport = computed(() => {
    return (
      needsAutoTeleport.value
      && isAvailable.value
      && isReady.value
      && !disabled.value
    )
  })

  const allowAutoTeleport = computed(() => {
    return needsAutoTeleport.value && canAutoTeleport.value && isReady.value
  })

  return {
    showAutoTeleport,
    allowAutoTeleport,
  }
}
