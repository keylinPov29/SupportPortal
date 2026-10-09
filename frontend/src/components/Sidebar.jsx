function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar__brand">
                <div className="sidebar__logo">🏦</div>
                <div>
                    <div className="sidebar__title">FRACTAL Soporte</div>
                    <div className="sidebar__subtitle">BANCA EMPRESAS</div>
                </div>
            </div>
            <nav className="sidebar__nav">
                <div className="sidebar__section-label">GESTIÓN</div>
                <a className="sidebar__item sidebar__item--active" href="#"><span>🏢</span> Clientes</a>
                <a className="sidebar__item" href="#"><span>👥</span> Usuarios</a>
                <a className="sidebar__item" href="#"><span>📋</span> Solicitudes</a>
                <a className="sidebar__item" href="#"><span>📊</span> Reportes</a>
            </nav>
            <div className="sidebar__footer">
                <a className="sidebar__item" href="#"><span>❓</span> Centro de ayuda</a>
                <a className="sidebar__item" href="#"><span>↪️</span> Cerrar sesión</a>
            </div>
        </aside>
    );
}

export default Sidebar;