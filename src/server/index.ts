import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WhatsAppWebhookWorkflow } from './services/whatsapp-workflow.service';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post('/api/whatsapp/webhook', async (req, res) => {
  try {
    const result = await WhatsAppWebhookWorkflow.processIncomingMessage(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin/Product routes will be added here

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
