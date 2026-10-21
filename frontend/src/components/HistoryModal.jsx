import { useEffect, useState } from 'react';
import { getAccountHistory } from '../services/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

function HistoryModal({ account, onClose }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (account) {
            getAccountHistory(account.accountId)
                .then((data) => setHistory(data))
                .catch((err) => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [account]);

    if (!account) return null;

    const formatHistoryDate = (isoDate) => {
        if (!isoDate) return 'No date';

        const cleanDate = isoDate.replace('Z', '');

        const date = new Date(cleanDate);
        if (isNaN(date.getTime())) return 'Invalid date';

        return dayjs(cleanDate).format('MMM DD, YYYY, hh:mm A');
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Account History: {account.accountNumber}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
                </div>

                {loading ? (
                    <p>Loading history...</p>
                ) : history.length === 0 ? (
                    <p className="text-muted">No status changes recorded.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {history.map((record) => (
                            <li key={record.historyId} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <strong style={{ fontSize: '14px' }}>{record.oldStatus || 'NEW'} ➔ {record.newStatus}</strong>
                                    <span className="text-muted" style={{ fontSize: '12px' }}>
                                        {formatHistoryDate(record.changedAt)}
                                    </span>
                                </div>
                                {record.statusReason && <p style={{ fontSize: '13px', color: '#555', margin: '4px 0' }}>Reason: {record.statusReason}</p>}
                                <span className="text-muted" style={{ fontSize: '12px' }}>By: {record.changedBy || 'System'}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default HistoryModal;