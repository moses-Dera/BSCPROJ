import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function generateCertificatePDF(data: {
  studentName: string
  jambRegNo: string
  universityName: string
  completedAt: string
  templateUrl?: string | null
  coordinates?: {
    name?: { x: number; y: number; size: number }
    jamb?: { x: number; y: number; size: number }
    date?: { x: number; y: number; size: number }
  }
}) {
  let pdfDoc = await PDFDocument.create()
  let page: any
  let width: number
  let height: number

  async function drawDefaultTemplate(p: any, doc: PDFDocument, uniName: string) {
    const { width, height } = p.getSize()
    const primaryColor = rgb(0.1, 0.3, 0.45)
    p.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: primaryColor, borderWidth: 4 })
    p.drawRectangle({ x: 25, y: 25, width: width - 50, height: height - 50, borderColor: primaryColor, borderWidth: 1 })
    const hBold = await doc.embedFont(StandardFonts.HelveticaBold)
    const hFont = await doc.embedFont(StandardFonts.Helvetica)
    p.drawText(uniName, { x: width / 2 - (hBold.widthOfTextAtSize(uniName, 24) / 2), y: height - 80, size: 24, font: hBold, color: primaryColor })
    const title = 'CLEARANCE CERTIFICATE'
    p.drawText(title, { x: width / 2 - (hBold.widthOfTextAtSize(title, 20) / 2), y: height - 120, size: 20, font: hBold, color: rgb(0, 0, 0) })
    const text1 = 'This is to certify that'
    p.drawText(text1, { x: width / 2 - (hFont.widthOfTextAtSize(text1, 14) / 2), y: height - 160, size: 14, font: hFont, color: rgb(0.3, 0.3, 0.3) })
    const text2 = 'has satisfactorily completed all requirements for final clearance.'
    p.drawText(text2, { x: width / 2 - (hFont.widthOfTextAtSize(text2, 14) / 2), y: height - 250, size: 14, font: hFont, color: rgb(0.3, 0.3, 0.3) })
  }

  if (data.templateUrl) {
    try {
      const templateBytes = await fetch(data.templateUrl).then(r => r.arrayBuffer())
      pdfDoc = await PDFDocument.load(templateBytes)
      page = pdfDoc.getPages()[0]
      const size = page.getSize()
      width = size.width
      height = size.height
    } catch (e) {
      console.error('Failed to load custom template, falling back to default:', e)
      page = pdfDoc.addPage([600, 400])
      width = 600
      height = 400
      await drawDefaultTemplate(page, pdfDoc, data.universityName)
    }
  } else {
    page = pdfDoc.addPage([600, 400])
    width = 600
    height = 400
    await drawDefaultTemplate(page, pdfDoc, data.universityName)
  }

  // Draw Dynamic Text
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Determine Coordinates (Use custom or fallback to defaults for 600x400)
  // Our default template expects name around y: height - 210, which is 400 - 210 = 190. 190/400 = 47.5%
  const nameCoords = data.coordinates?.name ?? { x: 50, y: 47.5, size: 28 }
  const jambCoords = data.coordinates?.jamb ?? { x: 50, y: 27.5, size: 14 }
  const dateCoords = data.coordinates?.date ?? { x: 50, y: 15, size: 12 }

  const drawCenteredAtX = (text: string, font: any, size: number, xPercent: number, yPercent: number, color: any) => {
    const textWidth = font.widthOfTextAtSize(text, size)
    const x = (width * (xPercent / 100)) - (textWidth / 2)
    const y = height * (yPercent / 100)
    page.drawText(text, { x, y, size, font, color })
  }

  drawCenteredAtX(data.studentName.toUpperCase(), fontBold, nameCoords.size, nameCoords.x, nameCoords.y, rgb(0, 0, 0))
  drawCenteredAtX(`JAMB Reg Number: ${data.jambRegNo}`, fontBold, jambCoords.size, jambCoords.x, jambCoords.y, rgb(0.2, 0.2, 0.2))
  drawCenteredAtX(`Date of Issue: ${data.completedAt}`, fontRegular, dateCoords.size, dateCoords.x, dateCoords.y, rgb(0.4, 0.4, 0.4))

  // Serialize and download
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `Clearance_Certificate_${data.jambRegNo}.pdf`
  link.click()
}

export async function generateClearanceSlipPDF(data: {
  studentName: string
  jambRegNo: string
  universityName: string
  campaignName: string
  completedAt: string
  clearanceNumber?: string | null
  issuedData?: any | null
}) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([500, 350]) // Slightly taller to accommodate more data
  const { width, height } = page.getSize()

  const hBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const hFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const primaryColor = rgb(0.2, 0.2, 0.2)

  // Border
  page.drawRectangle({ x: 15, y: 15, width: width - 30, height: height - 30, borderColor: primaryColor, borderWidth: 2 })

  // Header
  const title = `${data.universityName} - Clearance Slip`
  page.drawText(title, { x: width / 2 - (hBold.widthOfTextAtSize(title, 16) / 2), y: height - 40, size: 16, font: hBold, color: rgb(0, 0, 0) })
  
  page.drawText(`Campaign: ${data.campaignName}`, { x: width / 2 - (hFont.widthOfTextAtSize(`Campaign: ${data.campaignName}`, 12) / 2), y: height - 65, size: 12, font: hFont, color: rgb(0.3, 0.3, 0.3) })

  if (data.clearanceNumber) {
    page.drawText(`No: ${data.clearanceNumber}`, { x: width - 150, y: height - 40, size: 10, font: hBold, color: rgb(0.6, 0.1, 0.1) })
  }

  // Details
  page.drawText(`Student Name: ${data.studentName}`, { x: 40, y: height - 110, size: 12, font: hFont, color: rgb(0, 0, 0) })
  page.drawText(`JAMB Reg No: ${data.jambRegNo}`, { x: 40, y: height - 135, size: 12, font: hFont, color: rgb(0, 0, 0) })
  page.drawText(`Status: CLEARED`, { x: 40, y: height - 160, size: 12, font: hBold, color: rgb(0.1, 0.6, 0.1) })
  page.drawText(`Date: ${data.completedAt}`, { x: 40, y: height - 185, size: 12, font: hFont, color: rgb(0.4, 0.4, 0.4) })

  // Custom Issued Data
  if (data.issuedData && Object.keys(data.issuedData).length > 0) {
    page.drawText(`Issued Details:`, { x: width / 2 + 20, y: height - 110, size: 12, font: hBold, color: rgb(0, 0, 0) })
    let currentY = height - 135
    for (const [key, value] of Object.entries(data.issuedData)) {
      page.drawText(`${key}: ${value}`, { x: width / 2 + 20, y: currentY, size: 12, font: hFont, color: rgb(0.2, 0.2, 0.2) })
      currentY -= 25
    }
  }

  // Footer note
  const footer = 'This slip is computer generated and serves as proof of clearance.'
  page.drawText(footer, { x: width / 2 - (hFont.widthOfTextAtSize(footer, 10) / 2), y: 30, size: 10, font: hFont, color: rgb(0.5, 0.5, 0.5) })

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `Clearance_Slip_${data.jambRegNo}.pdf`
  link.click()
}
