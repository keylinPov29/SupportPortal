function ClientGrid({ clients, selectedClientId, onSelectClient }) {
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

    // Format the updatedAt timestamp nicely
    const formatActivity = (isoDate) => {
        if (!isoDate) return 'Sin fecha registrada';
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return 'Fecha inválida';

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        // "Hace X minutos/horas/días" for recent changes
        if (diffMins < 1) return 'Hace unos segundos';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} h`;
        if (diffDays < 7) return `Hace ${diffDays} d`;

        // Otherwise show the full date
        return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="grid-container">
            <table className="client-grid">
                <thead>
                    <tr>
                        <th>RUC / Documento</th>
                        <th>Empresa</th>
                        <th>Cuenta</th>
                        <th>Estado</th>
                        <th>Actividad</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client) => {
                        const firstAccount = client.accounts[0];
                        const isSelected = selectedClientId === client.clientId;
                        return (
                            <tr
                                key={client.clientId}
                                className={isSelected ? 'selected' : ''}
                                onClick={() => onSelectClient(client.clientId)}
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
                                            <span className="text-muted">Cuenta empresarial</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted">Sin cuentas</span>
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
                                    {firstAccount ? formatActivity(firstAccount.updatedAt) : '—'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default ClientGrid;