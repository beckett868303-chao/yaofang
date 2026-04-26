import { cookies } from 'next/headers'
import { createHash } from 'crypto'

const TOKEN_NAME = 'auth_token'
const TOKEN_SECRET = process.env.AUTH_SECRET || 'tcm-secret-key-change-in-production'

// 密码哈希函数
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

// 验证密码
export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  return hashPassword(plainPassword) === hashedPassword
}

export async function createToken(userId: number): Promise<string> {
  const payload = {
    userId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  }
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')
  const signature = Buffer.from(TOKEN_SECRET + base64Payload).toString('base64')
  return `${base64Payload}.${signature}`
}

export async function verifyToken(token: string): Promise<number | null> {
  try {
    const [base64Payload, signature] = token.split('.')
    const expectedSignature = Buffer.from(TOKEN_SECRET + base64Payload).toString('base64')
    
    if (signature !== expectedSignature) {
      return null
    }
    
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString())
    
    if (payload.exp < Date.now()) {
      return null
    }
    
    return payload.userId
  } catch {
    return null
  }
}

export async function getCurrentUserId(): Promise<number | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value
  
  if (!token) {
    return null
  }
  
  return verifyToken(token)
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'
  const isHttps = process.env.FORCE_HTTPS === 'true' || (isProduction && !process.env.ALLOW_HTTP)
  
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/'
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_NAME)
}