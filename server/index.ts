import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env

const app = express();
const PORT = process.env.PORT || 3002;

// ----- Supabase Admin Client -----
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ----- Middleware -----
app.use(cors());
app.use(express.json());

// Auth middleware – extracts user from Bearer token
async function requireAuth(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.split(' ')[1];
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    (req as any).user = data.user;
    next();
}

// =============================================
// PLACES ROUTES
// =============================================

// GET /api/places – list all places for the authenticated user
app.get('/api/places', requireAuth, async (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    try {
        const { data, error } = await supabaseAdmin
            .from('places')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map DB columns to frontend format
        const places = (data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            location: row.location,
            dateAdded: row.date_added,
            image: row.image || '',
            isMarked: row.is_marked,
            category: row.category,
            description: row.description,
        }));

        res.json(places);
    } catch (err: any) {
        console.error('GET /api/places error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/places – create a new place
app.post('/api/places', requireAuth, async (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    const { name, location, dateAdded, image, isMarked, category, description } = req.body;

    try {
        const { data, error } = await supabaseAdmin
            .from('places')
            .insert({
                user_id: user.id,
                name,
                location,
                date_added: dateAdded || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                image: image || '',
                is_marked: isMarked ?? true,
                category: category || null,
                description: description || null,
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            id: data.id,
            name: data.name,
            location: data.location,
            dateAdded: data.date_added,
            image: data.image,
            isMarked: data.is_marked,
            category: data.category,
            description: data.description,
        });
    } catch (err: any) {
        console.error('POST /api/places error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/places/:id – update a place
app.put('/api/places/:id', requireAuth, async (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    const { id } = req.params;
    const { name, location, dateAdded, image, isMarked, category, description } = req.body;

    try {
        const updates: Record<string, any> = {};
        if (name !== undefined) updates.name = name;
        if (location !== undefined) updates.location = location;
        if (dateAdded !== undefined) updates.date_added = dateAdded;
        if (image !== undefined) updates.image = image;
        if (isMarked !== undefined) updates.is_marked = isMarked;
        if (category !== undefined) updates.category = category;
        if (description !== undefined) updates.description = description;

        const { data, error } = await supabaseAdmin
            .from('places')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            id: data.id,
            name: data.name,
            location: data.location,
            dateAdded: data.date_added,
            image: data.image,
            isMarked: data.is_marked,
            category: data.category,
            description: data.description,
        });
    } catch (err: any) {
        console.error('PUT /api/places/:id error:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/places/:id – delete a place
app.delete('/api/places/:id', requireAuth, async (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    const { id } = req.params;

    try {
        const { error } = await supabaseAdmin
            .from('places')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        res.json({ success: true });
    } catch (err: any) {
        console.error('DELETE /api/places/:id error:', err);
        res.status(500).json({ error: err.message });
    }
});

// =============================================
// PROVINCES ROUTES
// =============================================

// GET /api/provinces – get province visited status for the user
app.get('/api/provinces', requireAuth, async (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    try {
        const { data, error } = await supabaseAdmin
            .from('user_provinces')
            .select('*')
            .eq('user_id', user.id);

        if (error) throw error;

        const provinces = (data || []).map((row: any) => ({
            id: row.province_id,
            name: row.province_name,
            visited: row.visited,
        }));

        res.json(provinces);
    } catch (err: any) {
        console.error('GET /api/provinces error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/provinces/:id – toggle province visited status (upsert)
app.put('/api/provinces/:id', requireAuth, async (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    const { id } = req.params;
    const { provinceName, visited } = req.body;

    try {
        const { data, error } = await supabaseAdmin
            .from('user_provinces')
            .upsert(
                {
                    user_id: user.id,
                    province_id: id,
                    province_name: provinceName,
                    visited: visited,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id,province_id' }
            )
            .select()
            .single();

        if (error) throw error;

        res.json({
            id: data.province_id,
            name: data.province_name,
            visited: data.visited,
        });
    } catch (err: any) {
        console.error('PUT /api/provinces/:id error:', err);
        res.status(500).json({ error: err.message });
    }
});

// =============================================
// AUTH HELPER ROUTE
// =============================================

// GET /api/auth/user – get current user info (useful for debugging)
app.get('/api/auth/user', requireAuth, async (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    res.json({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        avatar: user.user_metadata?.avatar_url || null,
    });
});

// =============================================
// START SERVER
// =============================================

app.listen(PORT, () => {
    console.log(`🚀 Thailand Tracker API server running on http://localhost:${PORT}`);
});
