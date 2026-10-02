import { FIELDS, type FieldName } from '@/lib/fields'
import type { APIRoute } from 'astro'

export function getStaticPaths() {
  return Object.keys(FIELDS).map((name) => ({ params: { name } }))
}

export const GET: APIRoute = ({ params }) =>
  new Response(FIELDS[params.name as FieldName](), {
    headers: { 'Content-Type': 'image/svg+xml' },
  })
