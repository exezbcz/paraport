import { USER_ADDRESS, AMOUNT } from '../constants'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Paraport } from '@paraport/react'
import '@paraport/react/style'

const main = async () => {
  const rootElement = document.getElementById('root')
  if (rootElement) {
    const root = createRoot(rootElement)
    root.render(
      <>
        <Paraport
          label="Mint"
          address={USER_ADDRESS}
          amount={AMOUNT}
          chain="AssetHubKusama"
          asset="KSM"
          onReady={() => {
            console.log('Ready')
          }}
          onAddFunds={() => {
            console.log('Add Funds')
          }}
          onCompleted={() => {
            console.log('Completed')
          }}
        />
      </>
    )
  }
}

main()