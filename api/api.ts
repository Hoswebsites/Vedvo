import express, { Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';

const app = express();
app.use(express.json());

// CORS middleware to allow requests from your frontend
app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Replace with your frontend origin in production
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});

// Helper function to handle Supabase Edge Function calls using native fetch (Node 20+)
async function callSupabaseEdgeFunction(url: string, payload: any, headers: any) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Supabase Edge Function error: ${response.status} - ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error calling Supabase Edge Function:', error);
        throw error;
    }
}

// Image Generation Endpoint
app.post('/generate-image', async (req: Request, res: Response) => {
    try {
        const { prompt, mode, n } = req.body;

        // Basic validation
        if (!prompt || !mode || !n) {
            res.status(400).json({ status: 1, message: 'Missing required parameters: prompt, mode, n' });
            return;
        }

        const SUPABASE_IMAGE_URL = process.env.SUPABASE_IMAGE_URL;
        const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

        if (!SUPABASE_IMAGE_URL || !SUPABASE_ANON_KEY) {
            throw new Error('Supabase environment variables not set.');
        }

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "apikey": SUPABASE_ANON_KEY
        };

        const payload = {
            action: "submit",
            prompt: prompt,
            mode: mode,
            n: n,
            project_id: "slave-51" // This should ideally also come from env or be dynamic
        };

        const data = await callSupabaseEdgeFunction(SUPABASE_IMAGE_URL, payload, headers);
        res.json(data);

    } catch (error: any) {
        console.error('Error in /generate-image:', error);
        res.status(500).json({ status: 1, message: error.message || 'Internal Server Error' });
    }
});

// Image Query Endpoint
app.post('/query-image', async (req: Request, res: Response) => {
    try {
        const { taskId } = req.body;

        if (!taskId) {
            res.status(400).json({ status: 1, message: 'Missing required parameter: taskId' });
            return;
        }

        const SUPABASE_IMAGE_URL = process.env.SUPABASE_IMAGE_URL;
        const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

        if (!SUPABASE_IMAGE_URL || !SUPABASE_ANON_KEY) {
            throw new Error('Supabase environment variables not set.');
        }

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "apikey": SUPABASE_ANON_KEY
        };

        const payload = {
            action: "query",
            taskId: taskId,
            project_id: 51 // This should ideally also come from env or be dynamic
        };

        const data = await callSupabaseEdgeFunction(SUPABASE_IMAGE_URL, payload, headers);
        res.json(data);

    } catch (error: any) {
        console.error('Error in /query-image:', error);
        res.status(500).json({ status: 1, message: error.message || 'Internal Server Error' });
    }
});

// Video Generation Endpoint
app.post('/generate-video', async (req: Request, res: Response) => {
    try {
        const { prompt, duration, aspect_ratio, sound, mode } = req.body;

        if (!prompt || !duration || !aspect_ratio || !sound || !mode) {
            res.status(400).json({ status: 1, message: 'Missing required parameters for video generation' });
            return;
        }

        const SUPABASE_VIDEO_ROUTER_URL = process.env.SUPABASE_VIDEO_ROUTER_URL;
        const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

        if (!SUPABASE_VIDEO_ROUTER_URL || !SUPABASE_ANON_KEY) {
            throw new Error('Supabase environment variables not set.');
        }

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "apikey": SUPABASE_ANON_KEY
        };

        const payload = {
            prompt: prompt,
            duration: String(duration),
            aspect_ratio: aspect_ratio,
            sound: sound,
            mode: mode,
            audio_enabled: (sound === 'on'),
            project_id: "slave-51" // This should ideally also come from env or be dynamic
        };

        const data = await callSupabaseEdgeFunction(SUPABASE_VIDEO_ROUTER_URL, payload, headers);
        res.json(data);

    } catch (error: any) {
        console.error('Error in /generate-video:', error);
        res.status(500).json({ status: 1, message: error.message || 'Internal Server Error' });
    }
});

// Video Query Endpoint
app.post('/query-video', async (req: Request, res: Response) => {
    try {
        const { taskId } = req.body;

        if (!taskId) {
            res.status(400).json({ status: 1, message: 'Missing required parameter: taskId' });
            return;
        }

        const SUPABASE_VIDEO_ROUTER_URL = process.env.SUPABASE_VIDEO_ROUTER_URL;
        const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

        if (!SUPABASE_VIDEO_ROUTER_URL || !SUPABASE_ANON_KEY) {
            throw new Error('Supabase environment variables not set.');
        }

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "apikey": SUPABASE_ANON_KEY
        };

        const payload = {
            task_id: taskId,
            project_id: 51 // This should ideally also come from env or be dynamic
        };

        const data = await callSupabaseEdgeFunction(SUPABASE_VIDEO_ROUTER_URL, payload, headers);
        res.json(data);

    } catch (error: any) {
        console.error('Error in /query-video:', error);
        res.status(500).json({ status: 1, message: error.message || 'Internal Server Error' });
    }
});

// Export the app for Vercel Serverless Functions
export default serverless(app);
