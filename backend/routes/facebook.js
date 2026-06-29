/* ==========================================================
   FACEBOOK.JS — Facebook Messenger Webhook
   Handles webhook verification + incoming messages + auto-reply
   ========================================================== */

import { Router } from 'express';
import db from '../db.js';

const router = Router();

/* ── Webhook Verification (GET) ── */
router.get('/webhook', async (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe') {
    const rows = await db.prepare("SELECT value FROM settings WHERE key = 'fb_verify_token'").all();
    const verifyToken = rows.length ? rows[0].value : '';
    if (token === verifyToken) {
      console.log('[FB] Webhook verified');
      return res.status(200).send(challenge);
    }
  }
  res.sendStatus(403);
});

/* ── Incoming Messages (POST) ── */
router.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  try {
    const body = req.body;
    if (body.object !== 'page') return;

    const entries = body.entry || [];
    for (const entry of entries) {
      const events = entry.messaging || [];
      for (const event of events) {
        const senderId = event.sender?.id;
        if (!senderId) continue;

        if (event.message?.text) {
          const text = event.message.text.trim();
          await handleIncomingMessage(senderId, text);
        } else if (event.postback?.payload) {
          await handlePostback(senderId, event.postback.payload);
        }
      }
    }
  } catch (err) {
    console.error('[FB] Webhook error:', err.message);
  }
});

/* ── Handle Incoming Text Message ── */
async function handleIncomingMessage(senderId, text) {
  const lower = text.toLowerCase();

  // Get auto-reply settings
  const rows = await db.prepare("SELECT key, value FROM settings WHERE key IN ('fb_page_token', 'fb_auto_reply', 'fb_welcome_msg', 'fb_bot_replies', 'fb_page_id')").all();
  const cfg = {};
  rows.forEach(r => { cfg[r.key] = r.value; });

  if (!cfg.fb_page_token) return;

  // Check if auto-reply is enabled
  if (cfg.fb_auto_reply !== 'true') return;

  const botReplies = cfg.fb_bot_replies ? JSON.parse(cfg.fb_bot_replies) : [];
  const welcomeMsg = cfg.fb_welcome_msg || 'ধন্যবাদ! আমরা আপনার মেসেজ পেয়েছি। শীঘ্রই আমাদের টিম আপনাকে রিপ্লাই দেবে।';

  // Check bot replies for keyword match
  let reply = '';
  for (const br of botReplies) {
    const keywords = (br.keywords || '').toLowerCase().split(',').map(k => k.trim()).filter(Boolean);
    if (keywords.some(kw => lower.includes(kw))) {
      reply = br.reply || '';
      break;
    }
  }

  // Default reply if no keyword match
  if (!reply) reply = welcomeMsg;

  // Send reply via Facebook Graph API
  await sendFacebookMessage(cfg.fb_page_token, senderId, reply);

  // Log message to DB
  try {
    await db.prepare("CREATE TABLE IF NOT EXISTS fb_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id TEXT, message_text, direction TEXT DEFAULT 'incoming', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)").run();
    await db.prepare("INSERT INTO fb_messages (sender_id, message_text, direction) VALUES (?, ?, 'incoming')").run(senderId, text);
    await db.prepare("INSERT INTO fb_messages (sender_id, message_text, direction) VALUES (?, ?, 'outgoing')").run(senderId, reply);
  } catch (e) { /* table might not exist yet */ }
}

/* ── Handle Postback ── */
async function handlePostback(senderId, payload) {
  const rows = await db.prepare("SELECT key, value FROM settings WHERE key IN ('fb_page_token', 'fb_auto_reply', 'fb_welcome_msg')").all();
  const cfg = {};
  rows.forEach(r => { cfg[r.key] = r.value; });
  if (!cfg.fb_page_token || cfg.fb_auto_reply !== 'true') return;

  const reply = cfg.fb_welcome_msg || 'ধন্যবাদ! আমাদের পোর্টালে স্বাগতম।';
  await sendFacebookMessage(cfg.fb_page_token, senderId, reply);
}

/* ── Send Message via Facebook Graph API ── */
async function sendFacebookMessage(pageToken, recipientId, text) {
  try {
    const resp = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${pageToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        messaging_type: 'RESPONSE',
        message: { text }
      })
    });
    const data = await resp.json();
    if (data.error) console.error('[FB] Send error:', data.error.message);
  } catch (err) {
    console.error('[FB] Send failed:', err.message);
  }
}

/* ── Admin: Get FB messages ── */
router.get('/messages', async (req, res) => {
  try {
    await db.prepare("CREATE TABLE IF NOT EXISTS fb_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id TEXT, message_text, direction TEXT DEFAULT 'incoming', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)").run();
    const rows = await db.prepare("SELECT * FROM fb_messages ORDER BY id DESC LIMIT 100").all();
    res.json(rows);
  } catch (err) { res.json([]); }
});

/* ── Admin: Reply to a message ── */
router.post('/reply', async (req, res) => {
  try {
    const { sender_id, message } = req.body;
    const rows = await db.prepare("SELECT value FROM settings WHERE key = 'fb_page_token'").all();
    const pageToken = rows.length ? rows[0].value : '';
    if (!pageToken) return res.status(400).json({ error: 'FB Page Token not set' });
    if (!sender_id || !message) return res.status(400).json({ error: 'Missing sender_id or message' });

    await sendFacebookMessage(pageToken, sender_id, message);
    await db.prepare("INSERT INTO fb_messages (sender_id, message_text, direction) VALUES (?, ?, 'outgoing')").run(sender_id, message);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
