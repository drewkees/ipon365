import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// ----- Supabase setup -----
const SUPABASE_URL = 'https://dhmzeevajtwjhhmcglob.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXplZXZhanR3amhobWNnbG9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU0MjAwMiwiZXhwIjoyMDgzMTE4MDAyfQ.JmMKNriCjky31T953l_9AYRk42OJwefcB6PSHl9Dv6M'; // keep this secret
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ----- Zoho SMTP setup -----
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: 'admin@ipon365.site',
    pass: '@Drewkees0514',
  },
});

// ----- Send email -----
async function sendEmail(toEmail) {
  const subject = 'Hey Ka-Ipon! Let’s Get You Back on Ipon365 💰';

  const text = `
Hi Ka-Ipon,

We noticed your Ipon365 account wasn’t fully verified. 
Don't miss out on tracking your daily savings and growing your goals! 

Click the link below to re-sign up and get back to saving smart:

https://www.ipon365.site/

Already re-signed up? Awesome! You can ignore this email.

Keep saving,
The Ipon365 Team 💙
`;

  const html = `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; background-color: #f3f4f6; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 12px;">
    
    <h1 style="color: #1a1a1a;">Hey Ka-Ipon! 💰</h1>
    
    <p style="font-size: 16px; color: #4b5563;">
      We noticed your Ipon365 account wasn’t fully verified yet. Don’t miss out on tracking your daily savings and reaching your financial goals!
    </p>
    
    <p style="font-size: 16px; color: #4b5563;">
      Click the button below to re-sign up and start saving smartly again:
    </p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://www.ipon365.site/" style="background-color: #667eea; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; font-weight: bold;">
        Re-Sign Up & Save Now
      </a>
    </p>
    
    <p style="font-size: 14px; color: #6b7280;">
      Already re-signed up? Yay! You can ignore this email.  
      Keep your savings streak alive! 🚀
    </p>
    
    <p style="font-size: 13px; color: #666;">
      Need help? Contact us anytime at <a href="mailto:support@ipon365.com" style="color:#667eea;">support@ipon365.com</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
    
    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
      This email was sent by Ipon365. You’re receiving this because your account needs to be re-verified.
    </p>
  </div>
</div>
`;

  try {
    const info = await transporter.sendMail({
      from: '"Ipon365" <admin@ipon365.site>',
      to: toEmail,
      subject,
      text,
      html,
    });

    console.log('Email sent to', toEmail, 'Message ID:', info.messageId);
  } catch (err) {
    console.error('Error sending email to', toEmail, err);
  }
}

// ----- Main -----
async function sendReminderToUnverifiedUsers() {
  try {
    // Get all unverified users
    const { data, error } = await supabase.rpc('get_unverified_users');

    if (error) {
      console.error('Error fetching unverified users:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('No unverified users found.');
      return;
    }

    // Loop through all unverified users
    for (const user of data) {
      console.log('Sending reminder to:', user.email);
      await sendEmail(user.email);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the script
sendReminderToUnverifiedUsers();
