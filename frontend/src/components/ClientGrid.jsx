import { useState, useEffect } from 'react';

function ClientGrid({ clients, isFiltered, selectedClientId, onSelectClient }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // 👇 LÓGICA MEJORADA: Buscamos la cuenta con la fecha más reciente para mostrarla en "Empresas"
    const displayRows = isFiltered
        ? clients
        : clients.map((client) => {
            // Si el cliente no tiene cuentas, devolvemos null
            if (!client.accounts || client.accounts.length === 0) {
                return { ...client, currentAccount: null };
            }

            // Buscamos la cuenta con el updatedAt más reciente
            const latestAccount = client.accounts.reduce((latest, current) => {
                const latestDate = new Date(latest.updatedAt || 0);
                const currentDate = new Date(current.updatedAt || 0);
                return currentDate > latestDate ? current : latest;
            }, client.accounts[0]);

            return { ...client, currentAccount: latestAccount };
        });

    const totalPages = Math.ceil(displayRows.length / itemsPerPage) || 1;

    useEffect(() => {
        setCurrentPage(1);
    }, [displayRows.length]);

    // Reloj en vivo
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRows = displayRows.slice(indexOfFirstItem, indexOfLastItem);

    const getStatusClass = (status) => {
        if (status === 'ACTIVE') return 'status-chip--active';
        if (status === 'BLOCKED') return 'status-chip--blocked';
        return 'status-chip--inactive';
    };
    const getStatusLabel = (status) => {
        if (status === 'ACTIVE') return 'Activa';
        if (status === 'BLOCKED') return 'Bloqueada';
        return status;
    };
    const getDotClass = (status) => {
        if (status === 'ACTIVE') return 'status-dot--active';
        if (status === 'BLOCKED') return 'status-dot--blocked';
        return 'status-dot--inactive';
    };
    const getInitials = (name) =>
        name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

    const avatarColors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2', '#4f46e5'];
    const getAvatarColor = (name) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return avatarColors[Math.abs(hash) % avatarColors.length];
    };

    const getActivityText = (isoDate) => {
        if (!isoDate) return 'Sin fecha';
        const cleanDate = isoDate.replace('Z', '');
        const date = new Date(cleanDate);
        if (isNaN(date.getTime())) return 'Fecha inválida';

        const diffMs = Math.max(0, now - date.getTime());
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Hace unos segundos';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} h`;
        if (diffDays < 7) return `Hace ${diffDays} d`;
        return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="grid-container">
            <table className="client-grid">
                <thead>
                    <tr>
                        <th>RUC / Documento</th>
                        <th>Empresa</th>

                        {isFiltered && (
                            <>
                                <th>Cuenta</th>
                                <th>Estado</th>
                            </>
                        )}

                        <th>Actividad</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRows.map((row, index) => {
                        const account = row.currentAccount || row.accounts[0];
                        const isSelected = selectedClientId === row.clientId;

                        return (
                            <tr
                                key={`${row.clientId}-${account ? account.accountId : 'no-acc'}-${index}`}
                                className={isSelected ? 'selected' : ''}
                                onClick={() => onSelectClient(row.clientId)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td>
                                    <div className="client-grid__doc">
                                        <strong>{row.documentNumber}</strong>
                                    </div>
                                </td>
                                <td>
                                    <div className="client-grid__company">
                                        <span
                                            className="client-grid__avatar"
                                            style={{ backgroundColor: getAvatarColor(row.businessName), color: '#fff' }}
                                        >
                                            {getInitials(row.businessName)}
                                        </span>
                                        <span>{row.businessName}</span>
                                    </div>
                                </td>

                                {isFiltered && (
                                    <>
                                        <td>
                                            {account ? (
                                                <div className="client-grid__account">
                                                    <strong>{account.accountNumber}</strong>
                                                    <span className="text-muted">Cuenta empresarial</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted">Sin cuentas</span>
                                            )}
                                        </td>
                                        <td>
                                            {account ? (
                                                <span className={`status-chip ${getStatusClass(account.status)}`}>
                                                    <span className={`status-dot ${getDotClass(account.status)}`}></span>
                                                    {getStatusLabel(account.status)}
                                                </span>
                                            ) : (
                                                <span className="text-muted">—</span>
                                            )}
                                        </td>
                                    </>
                                )}

                                <td className="text-muted">
                                    {account ? getActivityText(account.updatedAt) : '—'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="pagination-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 16px' }}>
                <span className="text-muted" style={{ fontSize: '14px' }}>
                    Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, displayRows.length)} de {displayRows.length} {isFiltered ? 'cuentas' : 'empresas'}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn btn--outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                    >
                        Anterior
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
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ClientGrid;