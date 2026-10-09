import { useState, useEffect, useMemo } from 'react';
import { searchClients, updateAccountStatus } from './services/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KpiCards from './components/KpiCards';           // 🆕
import ClientGrid from './components/ClientGrid';
import ClientDetailPanel from './components/ClientDetailPanel';
import StatusModal from './components/StatusModal';
import './App.css';

function App() {
    const [document, setDocument] = useState('');
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [modalAccount, setModalAccount] = useState(null);

    useEffect(() => {
        loadClients('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadClients(document);
        }, 300);
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [document]);

    const loadClients = async (searchTerm) => {
        setLoading(true);
        setError(null);
        try {
            const data = await searchClients(searchTerm);
            setRows(data);

            if (data.length > 0) {
                const grouped = groupByClient(data);
                setSelectedClientId((prev) => {
                    const stillExists = prev && grouped.find((c) => c.clientId === prev);
                    return stillExists ? prev : grouped[0].clientId;
                });
            } else {
                setSelectedClientId(null);
            }
        } catch (err) {
            setError(err.message);
            setRows([]);
            setSelectedClientId(null);
        } finally {
            setLoading(false);
        }
    };

    const groupByClient = (flatRows) => {
        const map = new Map();
        flatRows.forEach((row) => {
            if (!map.has(row.clientId)) {
                map.set(row.clientId, {
                    clientId: row.clientId,
                    documentNumber: row.documentNumber,
                    businessName: row.businessName,
                    accounts: [],
                });
            }
            if (row.accountId) {
                map.get(row.clientId).accounts.push({
                    accountId: row.accountId,
                    accountNumber: row.accountNumber,
                    status: row.status,
                    statusReason: row.statusReason,
                    updatedAt: row.updatedAt,
                });
            }
        });
        return Array.from(map.values());
    };

    const groupedClients = useMemo(() => groupByClient(rows), [rows]);
    const selectedClient = groupedClients.find((c) => c.clientId === selectedClientId) || null;

    const handleStatusSave = async (accountId, status, reason) => {
        try {
            await updateAccountStatus(accountId, status, reason);
            await loadClients(document);
            setModalAccount(null);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main">
                <Header />
                <div className="content">
                    <h1>Clientes corporativos</h1>
                    <p className="content__subtitle">
                        Busca clientes y administra el estado operativo de sus cuentas.
                    </p>

                    {/* 🆕 KPI Cards — dynamically calculated */}
                    <KpiCards clients={groupedClients} />

                    <div className="search-bar">
                        <input
                            type="text"
                            className="search-bar__input"
                            placeholder="Buscar por empresa o RUC...."
                            onChange={(e) => setDocument(e.target.value)}
                        />
                        {loading && <span className="search-bar__spinner">⏳</span>}
                    </div>

                    {error && <div className="error-box">{error}</div>}

                    {!loading && groupedClients.length > 0 && (
                        <div className="grid-layout">
                            <ClientGrid
                                clients={groupedClients}
                                selectedClientId={selectedClientId}
                                onSelectClient={setSelectedClientId}
                            />

                            <ClientDetailPanel
                                client={selectedClient}
                                onManageAccount={setModalAccount}
                            />
                        </div>
                    )}

                    {!loading && !error && groupedClients.length === 0 && (
                        <div className="placeholder">
                            No se encontraron clientes con ese criterio de búsqueda.
                        </div>
                    )}
                </div>
            </main>

            {modalAccount && (
                <StatusModal
                    account={modalAccount}
                    clientName={selectedClient?.businessName || ''}
                    onClose={() => setModalAccount(null)}
                    onSave={handleStatusSave}
                />
            )}
        </div>
    );
}

export default App;