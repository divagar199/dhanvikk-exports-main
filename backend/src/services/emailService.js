import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create and configure Nodemailer SMTP Transporter
 */
export const createTransporter = () => {
  const user = process.env.SMTP_USER || 'divagar.m.msc.cs@gmail.com';
  // Strip any accidental spaces if copied from Google App Password
  const pass = (process.env.SMTP_PASSWORD || 'ewqa eani gcvi kmzy').replace(/\s+/g, '');
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

const FROM_HEADER = process.env.EMAIL_FROM || '"Dhanvikk Blooms" <divagar.m.msc.cs@gmail.com>';

/**
 * Verify SMTP connection
 */
export const verifySmtpConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ SMTP Email Transporter connected successfully (Gmail)');
    return true;
  } catch (error) {
    console.warn('⚠️ SMTP Email connection check notice:', error.message);
    return false;
  }
};

/**
 * Send Login Notification Email
 */
export const sendLoginNotificationEmail = async ({ email, name, ip = 'Unknown', userAgent = 'Web Browser' }) => {
  if (!email) return null;

  try {
    const transporter = createTransporter();
    const dateFormatted = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Sign-in Notification - Dhanvikk Blooms</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 24px; color: #242124; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #F0E8E2; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
        .header { background: linear-gradient(135deg, #FFF0F5 0%, #FCE4EC 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #F8BBD0; }
        .logo-text { font-family: 'Georgia', serif; font-size: 24px; font-weight: bold; color: #C2185B; letter-spacing: 1px; margin: 0; }
        .sub-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #880E4F; font-weight: 600; margin-top: 4px; }
        .body { padding: 32px 28px; }
        .greeting { font-size: 18px; font-weight: 700; color: #1F1A17; margin-bottom: 12px; }
        .message { font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 24px; }
        .details-box { background: #FFF9FA; border: 1px solid #FCE4EC; border-radius: 12px; padding: 18px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px dashed #F8D7E3; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #777777; font-weight: 500; }
        .detail-val { color: #242124; font-weight: 600; }
        .security-note { font-size: 12px; color: #888888; background: #FAF7F2; padding: 14px; border-radius: 10px; line-height: 1.5; }
        .footer { background: #FDFBF9; padding: 20px; text-align: center; font-size: 11px; color: #999999; border-top: 1px solid #F0ECE8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo-text">DHANVIKK BLOOMS</div>
          <div class="sub-tag">Haute Floristry & Luxury Exports</div>
        </div>
        <div class="body">
          <div class="greeting">Welcome Back, ${name || 'Valued Client'}! 🌸</div>
          <p class="message">
            We noticed a successful sign-in to your Dhanvikk Blooms account. You're ready to explore hand-tied Ecuadorian roses, exotic flower boxes, and bespoke celebration gifts.
          </p>

          <div class="details-box">
            <div class="detail-row">
              <span class="detail-label">Account Email</span>
              <span class="detail-val">${email}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date & Time</span>
              <span class="detail-val">${dateFormatted} IST</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Device / Platform</span>
              <span class="detail-val">${userAgent.substring(0, 45)}</span>
            </div>
          </div>

          <div class="security-note">
            🔒 <strong>Security Tip:</strong> If you did not initiate this login, please reply directly to this email or change your password immediately to secure your account.
          </div>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Dhanvikk Blooms & Global Exports. All rights reserved.<br>
          Direct Cold-Chain Farm-to-Door Delivery across India, UAE, and Worldwide.
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: FROM_HEADER,
      to: email,
      subject: `🌸 Welcome to Dhanvikk Blooms - Successful Sign-In`,
      html: htmlContent,
    });

    console.log(`✉️ Login notification email sent to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send login email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Purchase / Order Confirmation Email
 */
export const sendOrderConfirmationEmail = async ({ email, order, customerName }) => {
  if (!email || !order) return null;

  try {
    const transporter = createTransporter();
    const dateFormatted = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const items = order.items || [];
    const itemsHtml = items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #F5EBE6;">
          <td style="padding: 12px 8px; font-size: 13px; font-weight: 600; color: #242124;">
            ${item.name || item.title || 'Floral Arrangement'}
            ${item.variant ? `<br><span style="font-size: 11px; font-weight: normal; color: #888888;">Variant: ${item.variant}</span>` : ''}
          </td>
          <td style="padding: 12px 8px; text-align: center; font-size: 13px; color: #666666;">
            x${item.quantity || 1}
          </td>
          <td style="padding: 12px 8px; text-align: right; font-size: 13px; font-weight: 700; color: #C2185B;">
            ₹${Number(item.price || 0).toLocaleString('en-IN')}
          </td>
        </tr>
      `
      )
      .join('');

    const shipping = order.shippingAddress || {};
    const addressStr = [
      shipping.address || shipping.street,
      shipping.city,
      shipping.state,
      shipping.postalCode || shipping.pincode,
      shipping.country || 'India',
    ]
      .filter(Boolean)
      .join(', ');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - Dhanvikk Blooms</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 24px; color: #242124; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #F0E8E2; box-shadow: 0 6px 24px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #FFF0F5 0%, #FCE4EC 100%); padding: 36px 24px; text-align: center; border-bottom: 1px solid #F8BBD0; }
        .logo-text { font-family: 'Georgia', serif; font-size: 26px; font-weight: bold; color: #C2185B; letter-spacing: 1px; margin: 0; }
        .sub-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #880E4F; font-weight: 600; margin-top: 4px; }
        .badge { display: inline-block; background: #C2185B; color: #ffffff; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; margin-top: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .body { padding: 32px 28px; }
        .greeting { font-size: 20px; font-weight: 700; color: #1F1A17; margin-bottom: 8px; }
        .order-meta { font-size: 13px; color: #777777; margin-bottom: 24px; }
        .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #C2185B; margin-bottom: 12px; border-bottom: 1px solid #F8BBD0; padding-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .total-box { background: #FFF9FA; border: 1px solid #FCE4EC; border-radius: 14px; padding: 16px 20px; margin-bottom: 24px; }
        .total-row { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; color: #555555; }
        .grand-total { font-size: 18px; font-weight: 800; color: #C2185B; border-top: 1px dashed #F8D7E3; margin-top: 8px; padding-top: 10px; display: flex; justify-content: space-between; }
        .address-box { background: #FAF7F2; border-radius: 12px; padding: 16px; font-size: 13px; line-height: 1.6; color: #444444; margin-bottom: 24px; }
        .footer { background: #FDFBF9; padding: 24px; text-align: center; font-size: 11px; color: #999999; border-top: 1px solid #F0ECE8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo-text">DHANVIKK BLOOMS</div>
          <div class="sub-tag">Haute Floristry & Luxury Exports</div>
          <div class="badge">Payment Confirmed ✓</div>
        </div>
        <div class="body">
          <div class="greeting">Thank You for Your Order, ${customerName || 'Cherished Client'}! 💐</div>
          <div class="order-meta">
            Order Reference: <strong>#${order.orderNumber || order.id || order._id}</strong> • Placed on ${dateFormatted} IST
          </div>

          <div class="section-title">Order Items</div>
          <table>
            <thead>
              <tr style="border-bottom: 2px solid #FCE4EC; text-align: left; font-size: 11px; text-transform: uppercase; color: #888888;">
                <th style="padding: 8px;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || '<tr><td colspan="3" style="padding: 12px; text-align: center;">Luxury Floristry Arrangement</td></tr>'}
            </tbody>
          </table>

          <div class="total-box">
            <div class="total-row">
              <span>Payment Gateway</span>
              <span><strong>Razorpay (Verified & Paid)</strong></span>
            </div>
            ${order.razorpayPaymentId ? `
            <div class="total-row">
              <span>Razorpay Payment ID</span>
              <span style="font-family: monospace; font-size: 12px;">${order.razorpayPaymentId}</span>
            </div>` : ''}
            <div class="grand-total">
              <span>Total Paid</span>
              <span>₹${Number(order.totalAmount || order.amount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="section-title">Delivery & Destination</div>
          <div class="address-box">
            <strong>Recipient:</strong> ${shipping.recipientName || shipping.name || customerName || 'Valued Client'}<br>
            <strong>Contact:</strong> ${shipping.phone || shipping.phoneNumber || 'Provided at checkout'}<br>
            <strong>Address:</strong> ${addressStr || 'Standard Cold-Chain Express Air Shipping'}<br>
            ${order.deliveryDate ? `<strong>Scheduled Date:</strong> ${order.deliveryDate}<br>` : ''}
            ${order.deliverySlot ? `<strong>Delivery Slot:</strong> ${order.deliverySlot}<br>` : ''}
          </div>

          <p style="font-size: 12px; color: #777777; line-height: 1.5; margin: 0;">
            🌹 <strong>Cold-Chain Guarantee:</strong> Your flowers are carefully preserved at 2°C–4°C and will be freshly dispatched for pristine farm-to-vase longevity.
          </p>
        </div>
        <div class="footer">
          Need support with this order? Reply directly to this email or contact us at +91 91089 16328.<br>
          © ${new Date().getFullYear()} Dhanvikk Blooms. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: FROM_HEADER,
      to: email,
      subject: `💐 Order Confirmed #${order.orderNumber || order.id || order._id} - Dhanvikk Blooms`,
      html: htmlContent,
    });

    console.log(`✉️ Order confirmation email sent to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send order confirmation email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Welcome & Greeting Notification Email for Dhanvikk Blooms & Exports
 */
export const sendWelcomeGreetingEmail = async ({
  email,
  name,
  phone = '',
  address = null,
  encryptedPortalKey = '',
}) => {
  if (!email) return null;

  try {
    const transporter = createTransporter();
    const portalUrl = encryptedPortalKey
      ? `http://localhost:5173/account/${encryptedPortalKey}`
      : `http://localhost:5173/account`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Dhanvikk Blooms & Luxury Exports</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFFDF9; margin: 0; padding: 24px; color: #242124; }
        .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #EFE7DE; box-shadow: 0 10px 40px rgba(194, 24, 91, 0.06); }
        .header { background: linear-gradient(135deg, #FFF0F4 0%, #FAF7F2 60%, #FFF5F7 100%); padding: 36px 28px; text-align: center; border-bottom: 1px solid #F2D7DE; position: relative; }
        .logo-text { font-family: 'Georgia', serif; font-size: 26px; font-weight: 800; color: #C2185B; letter-spacing: 2px; margin: 0; }
        .sub-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; color: #880E4F; font-weight: 600; margin-top: 6px; }
        .badge { display: inline-block; margin-top: 14px; background: #C2185B; color: #ffffff; font-size: 11px; font-weight: 700; padding: 5px 16px; border-radius: 999px; text-transform: uppercase; letter-spacing: 1px; }
        .body { padding: 36px 32px; }
        .greeting { font-size: 22px; font-weight: 800; color: #1F1C1E; margin-bottom: 12px; }
        .message { font-size: 14px; line-height: 1.7; color: #555555; margin-bottom: 24px; }
        .highlight-box { background: #FFF9FA; border: 1px solid #FCE4EC; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
        .highlight-title { font-size: 13px; font-weight: 700; color: #C2185B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .pillar-grid { display: table; width: 100%; margin-top: 10px; }
        .pillar-col { display: table-cell; width: 50%; vertical-align: top; padding: 8px; }
        .pillar-card { background: #ffffff; border: 1px solid #F0ECE8; border-radius: 12px; padding: 14px; }
        .pillar-heading { font-size: 13px; font-weight: 700; color: #242124; margin-bottom: 4px; }
        .pillar-desc { font-size: 12px; color: #666666; line-height: 1.5; margin: 0; }
        .account-details { background: #FAF7F2; border-radius: 16px; padding: 20px; margin-bottom: 24px; border: 1px solid #EFE7DE; }
        .detail-row { display: flex; justify-content: space-between; font-size: 13px; padding: 7px 0; border-bottom: 1px dashed #E5DCD4; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #777777; font-weight: 500; }
        .detail-val { color: #242124; font-weight: 700; }
        .btn-wrapper { text-align: center; margin: 28px 0; }
        .btn-portal { display: inline-block; background: linear-gradient(135deg, #EC407A 0%, #C2185B 100%); color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 999px; box-shadow: 0 8px 24px rgba(194, 24, 91, 0.25); letter-spacing: 0.5px; }
        .footer { background: #FDFBF9; padding: 24px; text-align: center; font-size: 11px; color: #999999; border-top: 1px solid #F0ECE8; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo-text">DHANVIKK BLOOMS</div>
          <div class="sub-tag">Haute Floristry & Cold-Chain Global Exports</div>
          <div class="badge">Patron Membership Activated 🌸</div>
        </div>

        <div class="body">
          <div class="greeting">Namaste & Warm Greetings, ${name || 'Cherished Patron'}! 🌹</div>
          <p class="message">
            Welcome to the bespoke sanctuary of <strong>Dhanvikk Blooms & Global Exports</strong>. Your private member account is officially created and ready. We are honored to serve you with our signature cold-chain botanical artistry and world-class traditional floral exports.
          </p>

          <div class="highlight-box">
            <div class="highlight-title">Your Member Privileges & Services</div>
            <div class="pillar-grid">
              <div class="pillar-col">
                <div class="pillar-card">
                  <div class="pillar-heading">💐 Haute Floristry</div>
                  <p class="pillar-desc">
                    Hand-tied Ecuadorian roses, exotic orchids, and celebration bouquets delivered same-day in temperature-controlled packaging.
                  </p>
                </div>
              </div>
              <div class="pillar-col">
                <div class="pillar-card">
                  <div class="pillar-heading">✈️ Global Exports</div>
                  <p class="pillar-desc">
                    Direct farm-to-door bulk exports of fragrant Madurai Jasmine, Marigold, Lotus & Pooja garlands across UAE, India & worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="account-details">
            <div style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: #880E4F; letter-spacing: 1px; margin-bottom: 10px;">Registered Account Dossier</div>
            <div class="detail-row">
              <span class="detail-label">Patron Name</span>
              <span class="detail-val">${name || 'Valued Customer'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Registered Email</span>
              <span class="detail-val">${email}</span>
            </div>
            ${phone ? `
            <div class="detail-row">
              <span class="detail-label">Primary Contact</span>
              <span class="detail-val">${phone}</span>
            </div>` : ''}
            ${address ? `
            <div class="detail-row">
              <span class="detail-label">Delivery Destination</span>
              <span class="detail-val">${typeof address === 'string' ? address : `${address.street || ''}, ${address.city || ''} ${address.zipCode || ''}, ${address.country || ''}`.replace(/^,\s*|,\s*$/g, '')}</span>
            </div>` : ''}
          </div>

          <div class="btn-wrapper">
            <a href="${portalUrl}" class="btn-portal" target="_blank">
              Access Your Account Portal →
            </a>
          </div>

          <p style="font-size: 12px; color: #777777; line-height: 1.6; text-align: center; margin: 0;">
            🌸 <strong>Personal Concierge Support:</strong> For custom bespoke arrangements, wedding decor, or wholesale exports, message our master florists directly on WhatsApp: <strong>+91 91089 16328</strong>.
          </p>
        </div>

        <div class="footer">
          © ${new Date().getFullYear()} Dhanvikk Blooms & Global Exports. All rights reserved.<br>
          Operating hubs in India & UAE • Direct Cold-Chain Worldwide Express Shipping.
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: FROM_HEADER,
      to: email,
      subject: `🌸 Welcome to Dhanvikk Blooms & Exports - Membership Activated`,
      html: htmlContent,
    });

    console.log(`✉️ Welcome greeting email sent to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send welcome greeting email to ${email}:`, error.message);
    return { success: false, error: error.message };
  }
};
