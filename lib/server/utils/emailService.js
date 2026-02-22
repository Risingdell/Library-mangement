const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD // Your Gmail App Password (not regular password)
    }
  });
};

/**
 * Send registration approval email to user
 * @param {string} userEmail - User's email address
 * @param {object} userData - User data (firstName, lastName, username)
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendRegistrationApprovalEmail = async (userEmail, userData) => {
  const transporter = createTransporter();

  const { firstName, lastName, username } = userData;

  const mailOptions = {
    from: {
      name: 'Library Management System',
      address: process.env.EMAIL_USER
    },
    to: userEmail,
    subject: '✅ Account Approved - Library Management System',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
              🎉 Account Approved!
            </h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 22px; font-weight: 600;">
              Hello ${firstName} ${lastName}!
            </h2>

            <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
              Great news! Your account has been approved by our admin team. You can now access the library management system and start borrowing books.
            </p>

            <!-- Info Box -->
            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 6px;">
              <p style="margin: 0 0 12px 0; color: #1e40af; font-weight: 600; font-size: 14px;">
                📋 Your Account Details:
              </p>
              <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px;">
                <strong>Username:</strong> ${username}
              </p>
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>Email:</strong> ${userEmail}
              </p>
            </div>

            <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
              You can now login to your account and enjoy these features:
            </p>

            <!-- Features List -->
            <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
              <li>Browse our extensive book collection 📚</li>
              <li>Borrow up to 3 books at a time 📖</li>
              <li>Track your borrowing history 📊</li>
              <li>Request new books 🎯</li>
              <li>Manage your profile 👤</li>
            </ul>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login"
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                Login Now →
              </a>
            </div>

            <!-- Divider -->
            <div style="border-top: 1px solid #e5e7eb; margin: 32px 0;"></div>

            <!-- Footer Message -->
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
              If you have any questions or need assistance, please don't hesitate to contact our support team.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
              Library Management System
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    // Plain text fallback
    text: `
Hello ${firstName} ${lastName}!

Great news! Your account has been approved by our admin team.

Your Account Details:
- Username: ${username}
- Email: ${userEmail}

You can now login to your account and start borrowing books.

Login here: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login

Features you can enjoy:
- Browse our extensive book collection
- Borrow up to 2 books at a time
- Track your borrowing history
- Request new books
- Manage your profile

If you have any questions, please contact our support team.

---
Library Management System
This is an automated email. Please do not reply.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Approval email sent successfully to:', userEmail);
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending approval email:', error);
    throw error;
  }
};

/**
 * Send registration rejection email to user
 * @param {string} userEmail - User's email address
 * @param {object} userData - User data (firstName, lastName, username, rejectionReason)
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendRegistrationRejectionEmail = async (userEmail, userData) => {
  const transporter = createTransporter();

  const { firstName, lastName, username, rejectionReason } = userData;

  const mailOptions = {
    from: {
      name: 'Library Management System',
      address: process.env.EMAIL_USER
    },
    to: userEmail,
    subject: '❌ Registration Rejected - Library Management System',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Rejected</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
              ❌ Registration Not Approved
            </h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 22px; font-weight: 600;">
              Hello ${firstName} ${lastName},
            </h2>

            <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
              We regret to inform you that your registration for the Library Management System has not been approved.
            </p>

            <!-- Info Box -->
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 24px 0; border-radius: 6px;">
              <p style="margin: 0 0 12px 0; color: #991b1b; font-weight: 600; font-size: 14px;">
                📋 Your Submission Details:
              </p>
              <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px;">
                <strong>Username:</strong> ${username}
              </p>
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                <strong>Email:</strong> ${userEmail}
              </p>
            </div>

            <!-- Rejection Reason -->
            <div style="background-color: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 6px;">
              <p style="margin: 0 0 8px 0; color: #92400e; font-weight: 600; font-size: 14px;">
                ⚠️ Reason for Rejection:
              </p>
              <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                ${rejectionReason || 'No specific reason provided.'}
              </p>
            </div>

            <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
              If you believe this decision was made in error or if you have any questions, please contact our support team or the library administrator.
            </p>

            <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
              You may attempt to register again if the issue can be resolved (e.g., using the correct USN format or providing valid information).
            </p>

            <!-- Divider -->
            <div style="border-top: 1px solid #e5e7eb; margin: 32px 0;"></div>

            <!-- Footer Message -->
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
              For assistance, please contact the library administration or support team.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
              Library Management System
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    // Plain text fallback
    text: `
Hello ${firstName} ${lastName},

We regret to inform you that your registration for the Library Management System has not been approved.

Your Submission Details:
- Username: ${username}
- Email: ${userEmail}

Reason for Rejection:
${rejectionReason || 'No specific reason provided.'}

If you believe this decision was made in error or if you have any questions, please contact our support team or the library administrator.

You may attempt to register again if the issue can be resolved (e.g., using the correct USN format or providing valid information).

---
Library Management System
This is an automated email. Please do not reply.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent successfully to:', userEmail);
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending rejection email:', error);
    throw error;
  }
};

/**
 * Send registration confirmation email to user (pending approval)
 * @param {string} userEmail - User's email address
 * @param {object} userData - User data (firstName, lastName, username)
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendRegistrationConfirmationEmail = async (userEmail, userData) => {
  const transporter = createTransporter();

  const { firstName, lastName, username } = userData;

  const mailOptions = {
    from: {
      name: 'Library Management System',
      address: process.env.EMAIL_USER
    },
    to: userEmail,
    subject: '📋 Registration Received - Pending Approval',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Received</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
              📋 Registration Received!
            </h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 22px; font-weight: 600;">
              Hello ${firstName} ${lastName}!
            </h2>

            <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
              Thank you for registering with the Library Management System. We've received your registration and it is currently being reviewed by our admin team.
            </p>

            <!-- Info Box -->
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 6px;">
              <p style="margin: 0 0 12px 0; color: #92400e; font-weight: 600; font-size: 14px;">
                📋 Your Registration Details:
              </p>
              <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;">
                <strong>Username:</strong> ${username}
              </p>
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Email:</strong> ${userEmail}
              </p>
            </div>

            <!-- Status Box -->
            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 6px;">
              <p style="margin: 0 0 8px 0; color: #1e40af; font-weight: 600; font-size: 14px;">
                ⏳ Current Status: Pending Approval
              </p>
              <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                Your registration will be reviewed within approximately <strong>2 hours</strong>. You will receive another email once a decision has been made.
              </p>
            </div>

            <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
              <strong>What happens next:</strong>
            </p>

            <!-- Steps List -->
            <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
              <li>Admin reviews your registration ⏳</li>
              <li>You receive an approval or rejection email 📧</li>
              <li>If approved, you can login immediately ✅</li>
              <li>If rejected, you can re-register with corrections 🔄</li>
            </ul>

            <!-- Divider -->
            <div style="border-top: 1px solid #e5e7eb; margin: 32px 0;"></div>

            <!-- Footer Message -->
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
              If you have any questions or did not make this registration request, please contact our support team.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
              Library Management System
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              This is an automated email. Please do not reply.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    // Plain text fallback
    text: `
Hello ${firstName} ${lastName}!

Thank you for registering with the Library Management System. We've received your registration and it is currently being reviewed by our admin team.

Your Registration Details:
- Username: ${username}
- Email: ${userEmail}

Current Status: Pending Approval

Your registration will be reviewed within approximately 2 hours. You will receive another email once a decision has been made.

What happens next:
- Admin reviews your registration
- You receive an approval or rejection email
- If approved, you can login immediately
- If rejected, you can re-register with corrections

If you have any questions or did not make this registration request, please contact our support team.

---
Library Management System
This is an automated email. Please do not reply.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Registration confirmation email sent successfully to:', userEmail);
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    throw error;
  }
};

module.exports = {
  sendRegistrationApprovalEmail,
  sendRegistrationRejectionEmail,
  sendRegistrationConfirmationEmail
};
