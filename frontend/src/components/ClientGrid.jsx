import { useState, useEffect } from 'react';

function ClientGrid({ clients, selectedClientId, onSelectClient }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(clients.length / itemsPerPage) || 1;

    useEffect(() => {
        setCurrentPage(1);
    }, [clients.length]);

    // Live timer: se actualiza cada segundo para que el tiempo corra
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentClients = clients.slice(indexOfFirstItem, indexOfLastItem);

    const getStatusClass = (status) => {
        if (status === 'ACTIVE') return 'status-chip--active';
        if (status === 'BLOCKED') return 'status-chip--blocked';
        return 'status-chip--inactive';
    };
    const getStatusLabel = (status) => {
        if (status === 'ACTIVE') return 'Active';
        if (status === 'BLOCKED') return 'Blocked';
        return status;
    };
    const getDotClass = (status) => {
        if (status === 'ACTIVE') return 'status-dot--active';
        if (status === 'BLOCKED') return 'status-dot--blocked';
        return 'status-dot--inactive';
    };
    const getInitials = (name) =>
        name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

    // Función para obtener el texto de la actividad con el ajuste de -5 horas
    const getActivityText = (isoDate) => {
        if (!isoDate) return 'No date';

        let dateStr = isoDate;
        // 1. Aseguramos que la fecha se lea como UTC
        if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
            dateStr = dateStr + 'Z';
        }

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Invalid date';

        // 2. Ajuste de zona horaria: restamos 5 horas (Perú)
        const dateAdjusted = new Date(date.getTime() - (5 * 60 * 60 * 1000));

        const diffMs = Math.max(0, now - dateAdjusted.getTime());
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'A few seconds ago';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} h ago`;
        if (diffDays < 7) return `${diffDays} d ago`;
        
        return dateAdjusted.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="grid-container">
            <table className="client-grid">
                <thead>
                    <tr>
                        <th>RUC / Document</th>
                        <th>Company</th>
                        <th>Account</th>
                        <th>Status</th>
                        <th>Activity</th>
                    </tr>
                </thead>
                <tbody>
                    {currentClients.map((client) => {
                        const firstAccount = client.accounts[0];
                        const isSelected = selectedClientId === client.clientId;
                        return (
                            <tr
                                key={client.clientId}
                                className={isSelected ? 'selected' : ''}
                                onClick={() => onSelectClient(client.clientId)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>
                                    <div className="client-grid__doc">
                                        <strong>{client.documentNumber}</strong>
                                    </div>
                                </td>
                                <td>
                                    <div className="client-grid__company">
                                        <span className="client-grid__avatar">{getInitials(client.businessName)}</span>
                                        <span>{client.businessName}</span>
                                    </div>
                                </td>
                                <td>
                                    {firstAccount ? (
                                        <div className="client-grid__account">
                                            <strong>{firstAccount.accountNumber}</strong>
                                            <span className="text-muted">Business account</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted">No accounts</span>
                                    )}
                                </td>
                                <td>
                                    {firstAccount ? (
                                        <span className={`status-chip ${getStatusClass(firstAccount.status)}`}>
                                            <span className={`status-dot ${getDotClass(firstAccount.status)}`}></span>
                                            {getStatusLabel(firstAccount.status)}
                                        </span>
                                    ) : (
                                        <span className="text-muted">—</span>
                                    )}
                                </td>
                                <td className="text-muted">
                                    {firstAccount ? getActivityText(firstAccount.updatedAt) : '—'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="pagination-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 16px' }}>
                <span className="text-muted" style={{ fontSize: '14px' }}>
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, clients.length)} of {clients.length} clients
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn btn--outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                        Previous
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '14px', fontWeight: 'bold' }}>
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        className="btn btn--outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ClientGrid;