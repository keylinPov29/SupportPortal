function KpiCards({ clients }) {
    // Calculate KPIs from the grouped clients
    const allAccounts = clients.flatMap((c) => c.accounts);
    const totalClients = clients.length;
    const totalAccounts = allAccounts.length;
    const activeAccounts = allAccounts.filter((a) => a.status === 'ACTIVE').length;
    const blockedAccounts = allAccounts.filter((a) => a.status === 'BLOCKED').length;

    return (
        <div className="kpi-grid">
            {/* KPI 1 — Registered clients */}
            <div className="kpi-card">
                <div className="kpi-card__header">
                    <span className="kpi-card__label">Clientes registrados</span>
                    <span className="kpi-card__dot kpi-card__dot--green"></span>
                </div>
                <div className="kpi-card__value">
                    {totalClients}
                    <span className="kpi-card__subtitle">
                        {totalClients === 1 ? 'empresa disponible' : 'empresas disponibles'}
                    </span>
                </div>
            </div>

            {/* KPI 2 — Active accounts */}
            <div className="kpi-card">
                <div className="kpi-card__header">
                    <span className="kpi-card__label">Cuentas activas</span>
                    <span className="kpi-card__dot kpi-card__dot--yellow"></span>
                </div>
                <div className="kpi-card__value">
                    {activeAccounts}
                    <span className="kpi-card__subtitle">
                        de {totalAccounts} {totalAccounts === 1 ? 'cuenta' : 'cuentas'}
                    </span>
                </div>
            </div>

            {/* KPI 3 — Blocked accounts */}
            <div className="kpi-card">
                <div className="kpi-card__header">
                    <span className="kpi-card__label">Cuentas bloqueadas</span>
                    <span className="kpi-card__dot kpi-card__dot--red"></span>
                </div>
                <div className="kpi-card__value">
                    {blockedAccounts}
                    <span className="kpi-card__subtitle">requieren seguimiento</span>
                </div>
            </div>
        </div>
    );
}

export default KpiCards;