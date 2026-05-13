import { NextResponse, type NextRequest } from 'next/server'
import { generateQRDataURL } from '@/lib/qr'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'url requerida' }, { status: 400 })
  }

  const dataUrl = await generateQRDataURL(url)
  return NextResponse.json({ dataUrl })
}
