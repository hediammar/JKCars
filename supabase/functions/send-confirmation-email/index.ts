import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

// Gmail SMTP Configuration
const SMTP_HOST = Deno.env.get("SMTP_HOST") || "smtp.gmail.com";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "465");
const SMTP_USER = Deno.env.get("SMTP_USER") || "jkcar7647@gmail.com";
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD"); // Gmail App Password
const SMTP_FROM_EMAIL = Deno.env.get("SMTP_FROM_EMAIL") || SMTP_USER;
const SMTP_FROM_NAME = Deno.env.get("SMTP_FROM_NAME") || "JK Cars";

interface CarReservation {
  id: string;
  reference_code: string;
  car_id: string;
  car_name: string;
  pickup_date: string;
  return_date: string | null;
  pickup_location: string;
  return_location: string | null;
  add_ons: string[];
  total_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  driver_license: string | null;
  payment_method: string;
  status: string;
  created_at: string;
}

serve(async (req) => {
  try {
    console.log("Function called - Starting request processing");
    
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check SMTP configuration
    if (!SMTP_PASSWORD) {
      console.error("SMTP_PASSWORD not set");
      return new Response(
        JSON.stringify({ 
          error: "SMTP configuration missing. Please set SMTP_PASSWORD secret.",
          hint: "Set secrets: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_FROM_NAME"
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body - handle both webhook and direct call formats
    let body;
    try {
      const bodyText = await req.text();
      console.log("Request body received:", bodyText.substring(0, 200)); // Log first 200 chars
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request body",
          details: parseError instanceof Error ? parseError.message : String(parseError)
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Webhook format: { type: 'UPDATE', table: 'car_reservations', record: {...}, old_record: {...} }
    // Direct call format: { record: {...} }
    // Database trigger format: { record: {...} } (from pg_net)
    let reservation: CarReservation;
    let oldRecord: CarReservation | null = null;
    
    console.log("Parsing request body format...");
    
    if (body.record) {
      // Direct call or webhook with record
      console.log("Using 'record' format");
      reservation = body.record;
      oldRecord = body.old_record || null;
    } else if (body.type === 'UPDATE' && body.table === 'car_reservations') {
      // Webhook format
      console.log("Using webhook format");
      reservation = body.record;
      oldRecord = body.old_record || null;
    } else {
      console.error("Invalid request format. Body keys:", Object.keys(body));
      return new Response(
        JSON.stringify({ 
          error: "Invalid request format. Expected 'record' or webhook format.",
          received_keys: Object.keys(body),
          body_sample: JSON.stringify(body).substring(0, 500)
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log("Reservation parsed. Reference:", reservation.reference_code, "Status:", reservation.status);

    // Filter: Only send email if status changed to 'confirmed'
    // Check if status is 'confirmed' AND it wasn't 'confirmed' before
    const wasConfirmed = oldRecord?.status === "confirmed";
    const isNowConfirmed = reservation.status === "confirmed";
    
    if (!isNowConfirmed) {
      return new Response(
        JSON.stringify({ 
          message: "Status is not confirmed, skipping email",
          current_status: reservation.status 
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // If it was already confirmed, don't send email again (avoid duplicates)
    if (wasConfirmed) {
      return new Response(
        JSON.stringify({ 
          message: "Reservation was already confirmed, skipping duplicate email",
          reference_code: reservation.reference_code 
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Additional validation: ensure we have required fields
    if (!reservation.customer_email || !reservation.reference_code) {
      console.error("Missing required fields:", {
        has_email: !!reservation.customer_email,
        has_reference: !!reservation.reference_code
      });
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: customer_email or reference_code",
          reservation_keys: Object.keys(reservation)
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Generating PDF for reservation:", reservation.reference_code);
    
    // Generate PDF
    let pdfBytes: Uint8Array;
    try {
      pdfBytes = await generateBookingPDF(reservation);
      console.log("PDF generated successfully, size:", pdfBytes.length);
    } catch (pdfError) {
      console.error("PDF generation failed:", pdfError);
      throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`);
    }

    console.log("Sending email to:", reservation.customer_email);
    
    // Send email with PDF attachment
    try {
      await sendEmailWithPDF(
        reservation.customer_email,
        reservation.customer_name,
        reservation.reference_code,
        pdfBytes
      );
      console.log("Email sent successfully");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      throw new Error(`Email sending failed: ${emailError instanceof Error ? emailError.message : String(emailError)}`);
    }

    return new Response(
      JSON.stringify({ 
        message: "Confirmation email sent successfully",
        reference_code: reservation.reference_code 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-confirmation-email:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Log full error details
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
      type: error?.constructor?.name
    });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorStack,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "X-Error-Type": error?.constructor?.name || "Unknown"
        } 
      }
    );
  }
});

async function generateBookingPDF(reservation: CarReservation): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const margin = 50;
  let yPosition = height - margin;
  
  // Colors
  const primaryColor = rgb(0, 0.482, 1); // Blue
  const darkColor = rgb(0.122, 0.161, 0.216); // Dark gray
  const lightGray = rgb(0.953, 0.957, 0.965); // Light gray
  
  // Header
  page.drawRectangle({
    x: 0,
    y: height - 40,
    width: width,
    height: 40,
    color: primaryColor,
  });
  
  page.drawText("JK CARS", {
    x: margin,
    y: height - 25,
    size: 18,
    font: boldFont,
    color: rgb(1, 1, 1),
  });
  
  page.drawText("Premium Car Rental & Excursions | Hammamet, Tunisia", {
    x: margin,
    y: height - 35,
    size: 9,
    font: font,
    color: rgb(1, 1, 1),
  });
  
  yPosition = height - 60;
  
  // Title
  const titleText = "BOOKING CONFIRMATION";
  const titleWidth = boldFont.widthOfTextAtSize(titleText, 16);
  page.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: yPosition,
    size: 16,
    font: boldFont,
    color: darkColor,
  });
  yPosition -= 20;
  
  // Booking ID and Date
  page.drawText(`Booking ID: ${reservation.reference_code}`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: boldFont,
    color: primaryColor,
  });
  
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const dateText = `Date: ${currentDate}`;
  const dateWidth = font.widthOfTextAtSize(dateText, 9);
  page.drawText(dateText, {
    x: width - margin - dateWidth,
    y: yPosition,
    size: 9,
    font: font,
    color: rgb(0.392, 0.392, 0.392),
  });
  yPosition -= 25;
  
  // Customer Information
  page.drawText("CUSTOMER INFORMATION", {
    x: margin,
    y: yPosition,
    size: 11,
    font: boldFont,
    color: darkColor,
  });
  yPosition -= 15;
  
  const customerInfo = [
    ["Full Name:", reservation.customer_name],
    ["Email:", reservation.customer_email],
    ["Phone:", reservation.customer_phone],
  ];
  
  if (reservation.driver_license) {
    customerInfo.push(["Driver's License:", reservation.driver_license]);
  }
  
  customerInfo.forEach(([label, value]) => {
    page.drawText(label, {
      x: margin,
      y: yPosition,
      size: 9,
      font: boldFont,
      color: darkColor,
    });
    page.drawText(value, {
      x: margin + 80,
      y: yPosition,
      size: 9,
      font: font,
      color: darkColor,
    });
    yPosition -= 12;
  });
  
  yPosition -= 10;
  
  // Booking Details
  page.drawText("BOOKING DETAILS", {
    x: margin,
    y: yPosition,
    size: 11,
    font: boldFont,
    color: darkColor,
  });
  yPosition -= 15;
  
  const pickupDate = new Date(reservation.pickup_date).toLocaleDateString();
  const returnDate = reservation.return_date
    ? new Date(reservation.return_date).toLocaleDateString()
    : "N/A";
  
  const days = reservation.return_date
    ? Math.max(
        1,
        Math.floor(
          (new Date(reservation.return_date).getTime() -
            new Date(reservation.pickup_date).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      )
    : 1;
  
  const bookingDetails = [
    ["Service Type:", "Car Rental"],
    ["Vehicle:", reservation.car_name],
    ["Pickup Location:", reservation.pickup_location.charAt(0).toUpperCase() + reservation.pickup_location.slice(1)],
    ["Return Location:", reservation.return_location
      ? reservation.return_location.charAt(0).toUpperCase() + reservation.return_location.slice(1)
      : "N/A"],
    ["Pickup Date:", pickupDate],
    ["Return Date:", returnDate],
    ["Rental Period:", `${days} ${days === 1 ? "day" : "days"}`],
  ];
  
  if (reservation.add_ons && reservation.add_ons.length > 0) {
    const addOnLabels: { [key: string]: string } = {
      gps: "GPS Navigation",
      babySeat: "Baby Seat",
      insurance: "Extra Insurance",
      driver: "Driver Service",
    };
    const addOnsText = reservation.add_ons
      .map((a) => addOnLabels[a] || a)
      .join(", ");
    bookingDetails.push(["Add-ons:", addOnsText]);
  }
  
  bookingDetails.forEach(([label, value]) => {
    page.drawText(label, {
      x: margin,
      y: yPosition,
      size: 9,
      font: boldFont,
      color: darkColor,
    });
    // Wrap text if too long
    const maxWidth = width - margin * 2 - 80;
    const words = value.split(" ");
    let line = "";
    let lineY = yPosition;
    
    words.forEach((word) => {
      const testLine = line + (line ? " " : "") + word;
      const textWidth = font.widthOfTextAtSize(testLine, 9);
      if (textWidth > maxWidth && line) {
        page.drawText(line, {
          x: margin + 80,
          y: lineY,
          size: 9,
          font: font,
          color: darkColor,
        });
        line = word;
        lineY -= 12;
      } else {
        line = testLine;
      }
    });
    if (line) {
      page.drawText(line, {
        x: margin + 80,
        y: lineY,
        size: 9,
        font: font,
        color: darkColor,
      });
    }
    yPosition = lineY - 12;
  });
  
  yPosition -= 10;
  
  // Payment Information
  page.drawText("PAYMENT INFORMATION", {
    x: margin,
    y: yPosition,
    size: 11,
    font: boldFont,
    color: darkColor,
  });
  yPosition -= 15;
  
  const paymentMethod =
    reservation.payment_method === "card" ? "Paid by Card" : "Pay at Agency";
  const paymentDetails = [
    ["Payment Method:", paymentMethod],
    ["Total Amount:", `${reservation.total_price}DT`],
    ["Payment Status:", "Confirmed"],
  ];
  
  paymentDetails.forEach(([label, value]) => {
    page.drawText(label, {
      x: margin,
      y: yPosition,
      size: 9,
      font: boldFont,
      color: darkColor,
    });
    page.drawText(value, {
      x: margin + 80,
      y: yPosition,
      size: 9,
      font: font,
      color: darkColor,
    });
    yPosition -= 12;
  });
  
  yPosition -= 10;
  
  // Total Amount Highlight
  page.drawRectangle({
    x: margin,
    y: yPosition - 12,
    width: width - margin * 2,
    height: 18,
    color: lightGray,
  });
  
  page.drawText("Total Amount:", {
    x: margin + 5,
    y: yPosition - 3,
    size: 13,
    font: boldFont,
    color: darkColor,
  });
  
  const totalText = `${reservation.total_price}DT`;
  const totalWidth = boldFont.widthOfTextAtSize(totalText, 18);
  page.drawText(totalText, {
    x: width - margin - 5 - totalWidth,
    y: yPosition - 3,
    size: 18,
    font: boldFont,
    color: primaryColor,
  });
  
  yPosition -= 30;
  
  // Footer
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 0.5,
    color: rgb(0.784, 0.784, 0.784),
  });
  yPosition -= 10;
  
  const thankYouText = "Thank you for choosing JK Cars!";
  const thankYouWidth = font.widthOfTextAtSize(thankYouText, 8);
  page.drawText(thankYouText, {
    x: (width - thankYouWidth) / 2,
    y: yPosition,
    size: 8,
    font: font,
    color: rgb(0.392, 0.392, 0.392),
  });
  yPosition -= 8;
  
  const footerText = "Email: info@jkcars.tn | Phone: +216 XX XXX XXX | Hammamet, Tunisia";
  const footerWidth = font.widthOfTextAtSize(footerText, 8);
  page.drawText(footerText, {
    x: (width - footerWidth) / 2,
    y: yPosition,
    size: 8,
    font: font,
    color: rgb(0.392, 0.392, 0.392),
  });
  
  return await pdfDoc.save();
}

async function sendEmailWithPDF(
  to: string,
  customerName: string,
  referenceCode: string,
  pdfBytes: Uint8Array
): Promise<void> {
  if (!SMTP_PASSWORD) {
    throw new Error("SMTP_PASSWORD environment variable is not set. Please set your Gmail App Password.");
  }

  // Convert PDF to base64 for email attachment
  const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));

  // Create email message with attachment
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const emailBody = [
    `From: ${SMTP_FROM_NAME} <${SMTP_FROM_EMAIL}>`,
    `To: ${to}`,
    `Subject: Booking Confirmation - ${referenceCode}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .booking-id { background: #e3f2fd; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
              .booking-id-code { font-size: 24px; font-weight: bold; color: #007bff; }
              .info-box { background: white; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Booking Confirmed!</h1>
                <p>Your car rental reservation has been confirmed</p>
              </div>
              <div class="content">
                <p>Dear ${customerName},</p>
                
                <p>We're excited to confirm your car rental reservation with JK Cars!</p>
                
                <div class="booking-id">
                  <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Booking Reference</div>
                  <div class="booking-id-code">${referenceCode}</div>
                </div>
                
                <div class="info-box">
                  <strong>📎 Your booking confirmation PDF is attached to this email.</strong>
                  <p style="margin-top: 10px; margin-bottom: 0;">Please keep this document safe and bring it with you when picking up your vehicle.</p>
                </div>
                
                <p><strong>What's next?</strong></p>
                <ul>
                  <li>Please arrive at the pickup location on your scheduled date</li>
                  <li>Bring a valid ID and driver's license</li>
                  <li>Complete payment at the agency (if not already paid)</li>
                  <li>Enjoy your rental!</li>
                </ul>
                
                <p>If you have any questions or need to modify your reservation, please contact us:</p>
                <p>
                  📧 Email: info@jkcars.tn<br>
                  📞 Phone: +216 XX XXX XXX
                </p>
                
                <p>We look forward to serving you!</p>
                
                <p>Best regards,<br><strong>The JK Cars Team</strong></p>
              </div>
              <div class="footer">
                <p>JK Cars | Premium Car Rental & Excursions</p>
                <p>Hammamet, Tunisia</p>
              </div>
            </div>
          </body>
        </html>
      `,
    ``,
    `--${boundary}`,
    `Content-Type: application/pdf`,
    `Content-Disposition: attachment; filename="Booking_${referenceCode}.pdf"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    pdfBase64,
    ``,
    `--${boundary}--`,
  ].join('\r\n');

  try {
    // Use Deno's built-in TLS connection for SMTP
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Connect to SMTP server
    let conn: Deno.TcpConn | Deno.TlsConn;
    
    if (SMTP_PORT === 465) {
      // SSL connection for port 465
      conn = await Deno.connectTls({
        hostname: SMTP_HOST,
        port: SMTP_PORT,
      });
    } else {
      // TLS connection for port 587
      const tcpConn = await Deno.connect({
        hostname: SMTP_HOST,
        port: SMTP_PORT,
      });
      
      // Upgrade to TLS
      conn = await Deno.startTls(tcpConn, {
        hostname: SMTP_HOST,
      });
    }

    const buffer = new Uint8Array(4096);
    
    // Read welcome message
    await conn.read(buffer);
    
    // Send EHLO
    await conn.write(encoder.encode(`EHLO ${SMTP_HOST}\r\n`));
    await conn.read(buffer);
    
    // Authenticate
    await conn.write(encoder.encode(`AUTH LOGIN\r\n`));
    await conn.read(buffer);
    
    await conn.write(encoder.encode(`${btoa(SMTP_USER)}\r\n`));
    await conn.read(buffer);
    
    await conn.write(encoder.encode(`${btoa(SMTP_PASSWORD)}\r\n`));
    await conn.read(buffer);
    
    // Send email
    await conn.write(encoder.encode(`MAIL FROM:<${SMTP_FROM_EMAIL}>\r\n`));
    await conn.read(buffer);
    
    await conn.write(encoder.encode(`RCPT TO:<${to}>\r\n`));
    await conn.read(buffer);
    
    await conn.write(encoder.encode(`DATA\r\n`));
    await conn.read(buffer);
    
    await conn.write(encoder.encode(`${emailBody}\r\n.\r\n`));
    await conn.read(buffer);
    
    await conn.write(encoder.encode(`QUIT\r\n`));
    await conn.read(buffer);
    
    conn.close();
    
    console.log("Email sent successfully via SMTP");
  } catch (error) {
    console.error("SMTP error:", error);
    throw new Error(`Failed to send email via SMTP: ${error instanceof Error ? error.message : String(error)}`);
  }
}

