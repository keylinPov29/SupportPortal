const CONFIG = {
    ACTIVE: { label: 'Activa', chip: 'status-chip--active', dot: 'status-dot--active' },
    BLOCKED: { label: 'Bloqueada', chip: 'status-chip--blocked', dot: 'status-dot--blocked' },
};
const FALLBACK = { chip: 'status-chip--inactive', dot: 'status-dot--inactive' };

function StatusChip({ status }) {
    const config = CONFIG[status] ?? { ...FALLBACK, label: status };
    return (
        <span className={`status-chip ${config.chip}`}>
            <span className={`status-dot ${config.dot}`}></span>
            {config.label}
        </span>
    );
}

export default StatusChip;