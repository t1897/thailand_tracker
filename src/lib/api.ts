import { supabase } from './supabaseClient';

const API_BASE = '/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token
        ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { ...headers, ...(options.headers as Record<string, string>) },
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`API error ${res.status}: ${body}`);
    }
    return res.json();
}

// ---- Places ----

export interface Place {
    id: string;
    name: string;
    location: string;
    dateAdded: string;
    image: string;
    isMarked: boolean;
    category?: string;
    description?: string;
}

export async function getPlaces(): Promise<Place[]> {
    return request<Place[]>('/places');
}

export async function createPlace(place: Omit<Place, 'id'>): Promise<Place> {
    return request<Place>('/places', {
        method: 'POST',
        body: JSON.stringify(place),
    });
}

export async function updatePlace(id: string, place: Partial<Place>): Promise<Place> {
    return request<Place>(`/places/${id}`, {
        method: 'PUT',
        body: JSON.stringify(place),
    });
}

export async function deletePlace(id: string): Promise<void> {
    await request(`/places/${id}`, { method: 'DELETE' });
}

// ---- Provinces ----

export interface Province {
    id: string;
    name: string;
    visited: boolean;
}

export async function getProvinces(): Promise<Province[]> {
    return request<Province[]>('/provinces');
}

export async function toggleProvince(
    provinceId: string,
    provinceName: string,
    visited: boolean
): Promise<Province> {
    return request<Province>(`/provinces/${provinceId}`, {
        method: 'PUT',
        body: JSON.stringify({ provinceName, visited }),
    });
}
