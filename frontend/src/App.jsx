import { useState, useEffect, useMemo } from 'react';
import { searchClients, updateAccountStatus } from './services/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
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
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTick((t) => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

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

    const displayData = useMemo(() => {
        if (statusFilter === 'ALL') return groupedClients;
        return rows
            .filter((row) => row.status === statusFilter && row.accountId)
            .map((row) => ({
                clientId: row.clientId,
                documentNumber: row.documentNumber,
                businessName: row.businessName,
                accounts: [{
                    accountId: row.accountId,
                    accountNumber: row.accountNumber,
                    status: row.status,
                    statusReason: row.statusReason,
                    updatedAt: row.updatedAt,
                }]
            }));
    }, [groupedClients, rows, statusFilter]);

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

                    <KpiCards
                        clients={groupedClients}
                        onFilter={setStatusFilter}
                        activeFilter={statusFilter}
                    />

                    <div className="search-bar">
                        <input
                            type="text"
                            className="search-bar__input"
                            placeholder="Buscar por empresa o RUC..."
                            onChange={(e) => setDocument(e.target.value)}
                        />
                        {loading && <span className="search-bar__spinner">⏳</span>}
                    </div>

                    {error && <div className="error-box">{error}</div>}

                    {!loading && displayData.length > 0 && (
                        <div
                            className="grid-layout"
                            /* 👇 MAGIA: Si no hay cliente seleccionado o estamos filtrando, la tabla ocupa todo (1fr). 
                               Si hay cliente, se divide en 2fr (tabla) y 1fr (panel). */
                            style={{
                                display: 'grid',
                                gridTemplateColumns: (statusFilter === 'ALL' && selectedClient) ? '2fr 1fr' : '1fr',
                                gap: '24px'
                            }}
                        >
                            <ClientGrid
                                clients={displayData}
                                isFiltered={statusFilter !== 'ALL'}
                                selectedClientId={selectedClientId}
                                onSelectClient={setSelectedClientId}
                            />

                            {statusFilter === 'ALL' && selectedClient && (
                                <ClientDetailPanel
                                    client={selectedClient}
                                    onManageAccount={setModalAccount}
                                />
                            )}
                        </div>
                    )}

                    {!loading && !error && displayData.length === 0 && (
                        <div className="placeholder">
                            No se encontraron registros con ese criterio de búsqueda.
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