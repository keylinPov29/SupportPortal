const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5043';

export async function searchClients(document) {
    const term = (document || '').trim();
    const url = `${API_BASE_URL}/api/clients?document=${encodeURIComponent(term)}`;
    const response = await fetch(url);

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `Request failed with status ${response.status}`);
    }

    return response.json();
}

export async function updateAccountStatus(accountId, status, reason) {
    const url = `${API_BASE_URL}/api/accounts/${accountId}/status`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason: reason || null }),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `Request failed with status ${response.status}`);
    }

    return response.json();
}