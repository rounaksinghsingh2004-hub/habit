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

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { email, password, name } = request.body

    if (!email || !password) {
      response.status(400).json({ error: 'Email and password are required' })
      return
    }

    // For demo purposes, return success
    // Full implementation would create user in Supabase
    response.status(200).json({ 
      success: true, 
      userId: 'demo-user-id',
      message: 'Signup endpoint ready - integrate with Supabase Auth' 
    })
  } catch (error: any) {
    response.status(500).json({ error: error.message })
  }
}
