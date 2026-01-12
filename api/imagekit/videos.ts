import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const folder = (req.query.folder as string) || '/cybercoach';
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
      return res.status(500).json({ error: 'ImageKit private key not configured' });
    }

    const response = await axios.get('https://api.imagekit.io/v1/files', {
      auth: {
        username: privateKey,
        password: ''
      },
      params: {
        path: folder,
        fileType: 'all',
        limit: 100
      }
    });

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('ImageKit API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || error.message || 'Failed to fetch videos'
    });
  }
}
