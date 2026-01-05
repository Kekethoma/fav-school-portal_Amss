import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send registration invitation email
 */
export async function sendInvitationEmail(
    to: string,
    name: string,
    role: string,
    id: string,
    password: string
) {
    try {
        await resend.emails.send({
            from: 'AMSS Portal <onboarding@amssportal.com>',
            to,
            subject: `Welcome to AMSS Portal - Your ${role} Account`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .credentials {
                background: white;
                padding: 20px;
                border-left: 4px solid #60a5fa;
                margin: 20px 0;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background: #1e40af;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to AMSS Portal</h1>
              </div>
              <div class="content">
                <h2>Hello ${name},</h2>
                <p>Your account has been created successfully. You can now access the AMSS Portal using the credentials below:</p>
                
                <div class="credentials">
                  <p><strong>Role:</strong> ${role}</p>
                  <p><strong>ID:</strong> ${id}</p>
                  <p><strong>Email:</strong> ${to}</p>
                  <p><strong>Password:</strong> ${password}</p>
                </div>
                
                <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
                
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Login to Portal</a>
                
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  If you have any questions, please contact the school administration.
                </p>
              </div>
            </div>
          </body>
        </html>
      `
        })

        return { success: true }
    } catch (error) {
        console.error('Email sending failed:', error)
        return { success: false, error }
    }
}

/**
 * Send results notification email
 */
export async function sendResultsNotification(
    to: string,
    name: string,
    term: number,
    academicYear: string,
    average: number,
    position: number
) {
    try {
        await resend.emails.send({
            from: 'AMSS Portal <results@amssportal.com>',
            to,
            subject: `Term ${term} Results Available - AMSS Portal`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .results-box {
                background: white;
                padding: 20px;
                border-left: 4px solid #60a5fa;
                margin: 20px 0;
                text-align: center;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background: #1e40af;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Results Published</h1>
              </div>
              <div class="content">
                <h2>Hello ${name},</h2>
                <p>Your Term ${term} results for ${academicYear} are now available.</p>
                
                <div class="results-box">
                  <h3>Term ${term} Summary</h3>
                  <p><strong>Average:</strong> ${average.toFixed(2)}%</p>
                  <p><strong>Position:</strong> ${position}</p>
                </div>
                
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/results" class="button">View Full Results</a>
                
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  Login to your portal to view detailed subject-wise breakdown and download your report card.
                </p>
              </div>
            </div>
          </body>
        </html>
      `
        })

        return { success: true }
    } catch (error) {
        console.error('Email sending failed:', error)
        return { success: false, error }
    }
}

