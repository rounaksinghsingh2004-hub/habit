import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true')
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, Authorization')

  if (request.method === 'OPTIONS') {
    response.status(200).end()
    return
  }

  try {
    // For now, return empty data structure
    // Full implementation would use Supabase client
    response.status(200).json({
      habits: [],
      dailyData: {},
      currentStreak: 0
    })
  } catch (error: any) {
    response.status(500).json({ error: error.message })
  }
}
