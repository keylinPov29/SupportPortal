function Header() {
    return (
        <header className="header">
            <div className="header__breadcrumb">
                Soporte Empresas &rsaquo; <strong>Clientes</strong>
            </div>
            <div className="header__user">
                <button className="header__icon">🔔</button>
                <div className="header__avatar">KP</div>
                <div>
                    <div className="header__name">Keylin Poves</div>
                    <div className="header__role">Analista de soporte</div>
                </div>
            </div>
        </header>
    );
}

export default Header;