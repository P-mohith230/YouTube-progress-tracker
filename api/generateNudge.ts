import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}
	try {
		const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body as any)
		const { streak = 0, progress = 0, videosLeftToday = 0 } = body || {}
		const prompt = `You are a study coach. A user has a streak of ${streak} days, is ${progress}% done with their course, and has ${videosLeftToday} videos left today. Write a 1-2 sentence nudge that is encouraging and specific. If their streak is high, praise it. If they are close to their daily goal, motivate them to finish.`

		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
		const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
		const text = result.response.text().trim() || 'Keep going — you got this!'
		return res.status(200).json({ nudge: text })
	} catch (err: any) {
		return res.status(500).json({ error: err?.message || 'Failed to generate nudge' })
	}
}


