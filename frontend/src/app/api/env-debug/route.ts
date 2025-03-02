import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Only return the existence of environment variables, not their values for security
  return NextResponse.json({
    success: true,
    envVarsExist: {
      WALRUS_PUBLISHER: !!process.env.WALRUS_PUBLISHER,
      WALRUS_AGGREGATOR: !!process.env.WALRUS_AGGREGATOR,
      WALRUS_WALLET_ADDRESS: !!process.env.WALRUS_WALLET_ADDRESS,
      WALRUS_PRIVATE_KEY: !!process.env.WALRUS_PRIVATE_KEY,
      ATOMA_API_KEY: !!process.env.ATOMA_API_KEY
    }
  })
}
