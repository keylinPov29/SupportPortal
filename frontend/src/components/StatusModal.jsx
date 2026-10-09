import { useState, useEffect } from 'react';

function StatusModal({ account, clientName, onClose, onSave }) {
    const [status, setStatus] = useState(account.status);
    const [reason, setReason] = useState(account.statusReason || '');
    const [saving, setSaving] = useState(false);
    const [localError, setLocalError] = useState(null);

    const isBlocking = status === 'BLOCKED';
    const maxLength = 500;

    // Check if there are unsaved changes
    const hasChanges =
        status !== account.status ||
        reason.trim() !== (account.statusReason || '').trim();

    // Close with ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Close only if there are no unsaved changes
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !hasChanges) {
            onClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);

        if (isBlocking && !reason.trim()) {
            setLocalError('El motivo es obligatorio al bloquear una cuenta.');
            return;
        }

        if (!hasChanges) {
            setLocalError('No hay cambios pendientes.');
            return;
        }

        setSaving(true);
        try {
            await onSave(account.accountId, status, reason);
        } catch (err) {
            setLocalError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal__header">
                    <div className="modal__icon">🛡️</div>
                    <div>
                        <h2 className="modal__title">
                            {isBlocking ? 'Bloquear cuenta' : 'Cambiar estado'}
                        </h2>
                        <p className="modal__subtitle">Cuenta {account.accountNumber}</p>
                    </div>
                    <button className="modal__close" onClick={onClose} type="button">✕</button>
                </div>

                {/* Account info */}
                <div className="modal__account-info">
                    <div>
                        <div className="text-muted modal__label">Cuenta empresarial</div>
                        <strong>{clientName}</strong>
                    </div>
                    <span className={`status-chip ${getStatusClass(account.status)}`}>
                        <span className={`status-dot ${getDotClass(account.status)}`}></span>
                        {getStatusLabel(account.status)}
                    </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="modal__form">
                    <label className="modal__field">
                        <span className="modal__field-label">
                            Estado <span className="required">*</span>
                        </span>
                        <select
                            className="form-field__input"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="ACTIVE">Activa</option>
                            <option value="BLOCKED">Bloqueada por fraude</option>
                        </select>
                    </label>

                    <label className="modal__field">
                        <span className="modal__field-label">
                            Motivo del bloqueo {isBlocking && <span className="required">*</span>}
                        </span>
                        <p className="modal__field-hint">
                            Este motivo quedará registrado en <strong>status_reason</strong> para la trazabilidad del caso.
                        </p>
                        <textarea
                            className="form-field__input"
                            rows={4}
                            placeholder="Ej. Bloqueo preventivo solicitado por el área de fraude…"
                            value={reason}
                            onChange={(e) => setReason(e.target.value.slice(0, maxLength))}
                            required={isBlocking}
                        />
                        <div className="modal__counter">
                            <span className="text-muted">Campo obligatorio para bloquear</span>
                            <span className="text-muted">{reason.length}/{maxLength}</span>
                        </div>
                    </label>

                    {isBlocking && (
                        <div className="modal__warning">
                            ⚠️ La cuenta dejará de operar inmediatamente. El cliente conservará
                            acceso a sus demás cuentas activas.
                        </div>
                    )}

                    {!hasChanges && (
                        <div className="modal__no-changes">
                            ℹ️ No hay cambios pendientes. Modifica el estado o el motivo para guardar.
                        </div>
                    )}

                    {localError && <div className="error-box">{localError}</div>}

                    <div className="modal__actions">
                        <button type="button" className="btn btn--secondary" onClick={onClose} disabled={saving}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`btn ${isBlocking ? 'btn--danger' : 'btn--primary'}`}
                            disabled={saving || !hasChanges}
                        >
                            {saving ? 'Guardando…' : isBlocking ? 'Confirmar bloqueo' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Helper functions for status chips
function getStatusClass(status) {
    if (status === 'ACTIVE') return 'status-chip--active';
    if (status === 'BLOCKED') return 'status-chip--blocked';
    return 'status-chip--inactive';
}
function getStatusLabel(status) {
    if (status === 'ACTIVE') return 'Activa';
    if (status === 'BLOCKED') return 'Bloqueada';
    return status;
}
function getDotClass(status) {
    if (status === 'ACTIVE') return 'status-dot--active';
    if (status === 'BLOCKED') return 'status-dot--blocked';
    return 'status-dot--inactive';
}

export default StatusModal;