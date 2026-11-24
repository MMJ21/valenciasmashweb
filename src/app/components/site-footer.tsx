export function SiteFooter(): React.JSX.Element {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>ValenciaSmash · Comunidad de Super Smash Bros. Ultimate</p>
        <div className="footer-legal">
          <p>Proyecto independiente, no afiliado ni patrocinado por Nintendo.</p>
          <a
            href="https://github.com/MMJ21/valenciasmashweb/issues/new?title=Solicitud%20de%20retirada%20de%20asset"
            rel="noreferrer"
            target="_blank"
          >
            Solicitar retirada de contenido
          </a>
        </div>
      </div>
    </footer>
  );
}
