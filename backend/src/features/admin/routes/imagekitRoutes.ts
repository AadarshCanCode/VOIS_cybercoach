import { Router, type Request, type Response } from 'express';
import axios from 'axios';

const router = Router();

// ImageKit credentials from environment
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || '';

// Debug log on startup
console.log('[ImageKit] Private key configured:', IMAGEKIT_PRIVATE_KEY ? 'Yes (length: ' + IMAGEKIT_PRIVATE_KEY.length + ')' : 'No');

// List files from ImageKit folder
router.get('/videos', async (req: Request, res: Response): Promise<void> => {
  try {
    const folder = (req.query.folder as string) || '/cybercoach';
    
    console.log('[ImageKit] Fetching videos from folder:', folder);
    
    if (!IMAGEKIT_PRIVATE_KEY) {
      console.error('[ImageKit] Private key not configured!');
      res.status(500).json({ error: 'ImageKit private key not configured' });
      return;
    }
    
    // ImageKit API to list files
    const response = await axios.get('https://api.imagekit.io/v1/files', {
      auth: {
        username: IMAGEKIT_PRIVATE_KEY,
        password: ''
      },
      params: {
        path: folder,
        fileType: 'all',
        limit: 100
      }
    });
    
    console.log('[ImageKit] Found', response.data.length, 'files');
    res.json(response.data);
  } catch (error: unknown) {
    console.error('[ImageKit] API error:', error);
    if (axios.isAxiosError(error)) {
      console.error('[ImageKit] Response:', error.response?.data);
      res.status(error.response?.status || 500).json({ 
        error: error.response?.data?.message || error.message 
      });
    } else {
      const message = error instanceof Error ? error.message : 'Failed to fetch videos';
      res.status(500).json({ error: message });
    }
  }
});

// Get single file details
router.get('/video/:fileId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    
    if (!IMAGEKIT_PRIVATE_KEY) {
      res.status(500).json({ error: 'ImageKit private key not configured' });
      return;
    }
    
    const response = await axios.get(`https://api.imagekit.io/v1/files/${fileId}/details`, {
      auth: {
        username: IMAGEKIT_PRIVATE_KEY,
        password: ''
      }
    });
    
    res.json(response.data);
  } catch (error: unknown) {
    console.error('ImageKit API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch video details';
    res.status(500).json({ error: message });
  }
});

export default router;
