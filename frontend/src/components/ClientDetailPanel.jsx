function ClientDetailPanel({ client, onManageAccount }) {
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

    // Format the updatedAt timestamp
    const formatDate = (isoDate) => {
        if (!isoDate) return 'Sin fecha';
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    if (!client) {
        return (
            <aside className="detail-panel">
                <p className="text-muted">Selecciona un cliente para ver sus cuentas.</p>
            </aside>
        );
    }

    return (
        <aside className="detail-panel">
            <div className="detail-panel__header">
                <div className="detail-panel__avatar">{getInitials(client.businessName)}</div>
                <div className="detail-panel__info">
                    <h2 className="detail-panel__name">{client.businessName}</h2>
                    <span className="text-muted">RUT {client.documentNumber}</span>
                </div>
                <button className="detail-panel__more" type="button">⋯</button>
            </div>

            <div className="detail-panel__section">
                <div className="detail-panel__section-title">
                    <span>CUENTAS ASOCIADAS</span>
                    <span className="text-muted">{client.accounts.length} total</span>
                </div>

                {client.accounts.length === 0 && (
                    <p className="text-muted">Este cliente no tiene cuentas registradas.</p>
                )}

                {client.accounts.map((account) => (
                    <div key={account.accountId} className="account-card">
                        <div className="account-card__top">
                            <div>
                                <div className="text-muted account-card__label">Cuenta empresarial</div>
                                <strong className="account-card__number">{account.accountNumber}</strong>
                            </div>
                            <span className={`status-chip ${getStatusClass(account.status)}`}>
                                <span className={`status-dot ${getDotClass(account.status)}`}></span>
                                {getStatusLabel(account.status)}
                            </span>
                        </div>

                        {account.statusReason && (
                            <div className="account-card__reason">
                                <strong>Motivo:</strong> {account.statusReason}
                            </div>
                        )}

                        <div className="account-card__bottom">
                            <div>
                                <div className="text-muted account-card__label">ÚLTIMA ACTUALIZACIÓN</div>
                                <strong>{formatDate(account.updatedAt)}</strong>
                            </div>
                            <button
                                type="button"
                                className="btn btn--outline"
                                onClick={() => onManageAccount(account)}
                            >
                                Cambiar estado
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}

export default ClientDetailPanel;