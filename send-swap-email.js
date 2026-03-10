const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function generateICS(dateStr, timeStr, giver, receiver) {
  // Parse date like "10/3" and time like "15:00-16:00"
  const [day, month] = dateStr.split('/').map(Number);
  const [startTime, endTime] = timeStr.split('-');
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  const pad = (n) => String(n).padStart(2, '0');
  const year = 2026;

  const dtStart = `${year}${pad(month)}${pad(day)}T${pad(sh)}${pad(sm)}00`;
  const dtEnd   = `${year}${pad(month)}${pad(day)}T${pad(eh)}${pad(em)}00`;
  const uid     = `vagtbytte-${dateStr.replace('/','')}-${timeStr.replace(/[:-]/g,'')}-${Date.now()}@vagtplan`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vagtplan 2026//DK',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Vagt ${timeStr}`,
    `DESCRIPTION:Vagtbytte: ${giver} gav vagt til ${receiver}`,
    `ORGANIZER:mailto:vagtplan@lruddannelse.dk`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

function generateEmailHTML(toName, shiftDate, shiftTime, swapDescription) {
  return `<!DOCTYPE html>
<html lang="da">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0ff;font-family:'Courier New',monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ff;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#FFF9F2;border:4px solid #1a1a1a;box-shadow:8px 8px 0 #1a1a1a;">

          <!-- HEADER -->
          <tr>
            <td style="background:#7B4FD4;padding:28px 32px;border-bottom:4px solid #1a1a1a;">
              <div style="font-family:Impact,'Arial Black',sans-serif;font-size:42px;letter-spacing:0.05em;color:white;line-height:1;">
                VAGT<span style="color:#C8B4E8;">PLAN</span>
              </div>
              <div style="font-size:11px;letter-spacing:0.2em;color:rgba(255,255,255,0.7);text-transform:uppercase;margin-top:6px;">
                Vagtbytte bekræftelse
              </div>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <p style="font-size:15px;color:#1a1a1a;margin:0 0 6px 0;">Hej <strong>${toName}</strong>,</p>
              <p style="font-size:14px;color:#555;margin:0;">Dit vagtbytte er nu registreret og bekræftet.</p>
            </td>
          </tr>

          <!-- DETAILS BOX -->
          <tr>
            <td style="padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#EDE8F8;border:3px solid #9B7FCC;border-radius:4px;">
                <tr>
                  <td style="padding:8px 20px;border-bottom:2px solid #C8B4E8;">
                    <span style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#7B4FD4;font-weight:bold;">Detaljer</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #C8B4E8;">
                          <span style="font-size:18px;">📅</span>
                          <span style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#555;margin-left:10px;">Dato</span>
                          <span style="float:right;font-size:13px;font-weight:bold;color:#1a1a1a;">${shiftDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #C8B4E8;">
                          <span style="font-size:18px;">⏰</span>
                          <span style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#555;margin-left:10px;">Tidspunkt</span>
                          <span style="float:right;font-size:13px;font-weight:bold;color:#1a1a1a;">${shiftTime}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="font-size:18px;">🔄</span>
                          <span style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#555;margin-left:10px;">Bytte</span>
                          <span style="float:right;font-size:13px;font-weight:bold;color:#7B4FD4;">${swapDescription}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CALENDAR NOTE -->
          <tr>
            <td style="padding:0 32px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#C8E8A0;border:3px solid #85BB45;border-radius:4px;">
                <tr>
                  <td style="padding:14px 20px;">
                    <span style="font-size:18px;">📎</span>
                    <span style="font-size:12px;color:#1a1a1a;margin-left:10px;">Kalenderinvitation er vedhæftet — åbn den vedhæftede <strong>.ics fil</strong> for at tilføje vagten til din kalender.</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#1a1a1a;padding:20px 32px;border-top:4px solid #1a1a1a;">
              <span style="font-family:Impact,'Arial Black',sans-serif;font-size:16px;letter-spacing:0.1em;color:#C8B4E8;">VAGTPLANEN</span>
              <span style="font-size:10px;color:rgba(255,255,255,0.35);margin-left:12px;letter-spacing:0.1em;">AUTOMATISK BESKED · SVAR IKKE</span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  // Allow CORS from your GitHub Pages domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toName, toEmail, shiftDate, shiftTime, swapDescription, dateStr, giver, receiver } = req.body;

  if (!toName || !toEmail || !shiftDate || !shiftTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const icsContent = generateICS(dateStr, shiftTime, giver, receiver);
    const icsBase64 = Buffer.from(icsContent).toString('base64');

    const result = await resend.emails.send({
      from: 'Vagtplanen <vagtplan@yourdomain.com>', // ← UPDATE THIS
      to: toEmail,
      subject: `Vagtbytte bekræftet — ${shiftDate}`,
      html: generateEmailHTML(toName, shiftDate, shiftTime, swapDescription),
      attachments: [
        {
          filename: `vagt_${dateStr.replace('/', '_')}.ics`,
          content: icsBase64,
          type: 'text/calendar',
        }
      ]
    });

    return res.status(200).json({ success: true, id: result.id });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: error.message });
  }
}
