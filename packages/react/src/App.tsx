import { useEffect, useRef } from 'react'
import './index.css'
import { init } from '@paraport/sdk'

type InitParams = Parameters<typeof init>[0]
type autoteleport = InitParams['autoteleport']

type AutoTeleportProps = {
  address: autoteleport['address']
  amount: autoteleport['amount']
  chain: autoteleport['chain']
  asset: autoteleport['asset']
} & Pick<InitParams, 'onSubmit' | 'onCompleted' | 'onReady' | 'onAddFunds' | 'disabled' | 'displayMode' | 'getSigner' | 'logLevel' | 'label'>

function App({
  address,
  amount,
  chain,
  asset,
  onSubmit,
  onCompleted,
  onReady,
  onAddFunds,
  displayMode,
  label,
  disabled,
  getSigner,
  logLevel,
}: AutoTeleportProps) {
  const sdkInstanceRef = useRef<ReturnType<typeof init> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || sdkInstanceRef.current) return

    const integratedTargetId = `paraport-container-${Math.random().toString(36).substring(2, 9)}`
    containerRef.current.id = integratedTargetId

    const teleportParams = {
      address,
      amount,
      chain,
      asset
    }

    const instance = init({
      integratedTargetId,
      autoteleport: teleportParams,
      onSubmit,
      onCompleted,
      onReady,
      onAddFunds,
      displayMode,
      label,
      disabled,
      getSigner,
      logLevel
    })

    sdkInstanceRef.current = instance

    // Cleanup function
    return () => {
      if (sdkInstanceRef.current) {
        sdkInstanceRef.current.destroy()
        sdkInstanceRef.current = null
      }
    }
  })

  useEffect(() => {
    if (sdkInstanceRef.current) {
      sdkInstanceRef.current.update({
        label,
        disabled
      })
    }
  }, [label, disabled])

  return (
    <div ref={containerRef} />
  )
}

export default App
