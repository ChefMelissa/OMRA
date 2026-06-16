import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Helper to parse env variables directly for integration testing
function parseEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found!')
  }
  const content = fs.readFileSync(envPath, 'utf8')
  const env: Record<string, string> = {}
  content.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      let value = match[2] || ''
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1)
      }
      env[match[1]] = value.trim()
    }
  })
  return env
}

describe('Database Row Level Security (RLS) Integration Tests', () => {
  let supabaseUrl: string
  let supabaseAnonKey: string
  let supabaseServiceKey: string

  beforeAll(() => {
    const env = parseEnv()
    supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
    supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are missing in .env.local')
    }
  })

  it('should prevent anonymous client from reading booking requests directly', async () => {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data, error } = await anonClient.from('booking_requests').select('*')
    
    // RLS policy should return empty array or permission error for anonymous select
    // Since policy allows insert check(true) but no select for anon, select should return empty or error.
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('should prevent anonymous client from reading commission settlements', async () => {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data, error } = await anonClient.from('commission_settlements').select('*')
    
    // RLS policy allows select only to agency owner (agency_id = auth.uid()) or admin.
    // Anonymous user is not authenticated, so it should return empty array.
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('should prevent anonymous client from reading agencies with pending or rejected status', async () => {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data } = await anonClient.from('agencies').select('*').in('status', ['pending', 'rejected'])
    
    // RLS policy only allows select where status = 'approved' for public/anon
    expect(data).toEqual([])
  })

  it('should bypass RLS constraints when using the Service Role Key', async () => {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    
    // Selecting agencies as admin/service_role should successfully query all records
    const { data, error } = await adminClient.from('agencies').select('id, name')
    
    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(Array.isArray(data)).toBe(true)
  })
})
