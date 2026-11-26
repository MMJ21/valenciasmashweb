import Link from "next/link";
import { PRIVACY_DRAFT_VERSION } from "@/modules/auth";

export default function PrivacyPage(): React.JSX.Element {
  return (
    <main className="page-container legal-page">
      <span className="section-kicker">ValenciaSmash</span>
      <h1>Política de privacidad</h1>
      <h2>Datos y usos del servicio</h2>
      <p>
        ValenciaSmash trata datos de cuenta (nombre de usuario y correo electrónico), estado de
        verificación, aceptación de términos y datos técnicos de sesión (como IP y agente de usuario
        cuando estén disponibles); y los datos que el usuario añade a su ficha (nick, nombre y
        apellidos, redes sociales, biografía, foto y personajes). La ficha puede mostrarse
        públicamente en el sitio. La fecha y versión de los términos aceptados se registran para
        documentar la aceptación; las cuentas creadas antes de este registro pueden no tener esos
        datos históricos.
      </p>
      <p>
        Estos datos se utilizan para crear y proteger cuentas, prestar las funciones de la
        comunidad, mostrar las fichas que el usuario publica, enviar mensajes de verificación y
        recuperación, y atender solicitudes de soporte y seguridad. La vinculación con start.gg y
        las funciones de competición deben describirse y revisarse de nuevo antes de activarse
        públicamente.
      </p>
      <h2>Datos de torneos y resultados competitivos</h2>
      <p>
        La importación de torneos y el historial competitivo todavía no están implementados. Cuando
        se habiliten, personal autorizado (roles `importer` o `admin`) prevé importar manualmente
        información de torneos y eventos públicos de start.gg; no se ha previsto una importación
        automática periódica. Esta política deberá revisarse antes de activar esa función.
      </p>
      <p>
        Los registros previstos pueden incluir el nombre, fecha, ciudad o modalidad online y URL del
        torneo; el nombre del evento; identificadores y nombres públicos de participantes; puesto y
        resultados de sets (ronda, participantes, ganador, marcadores y descalificaciones); e
        información derivada, como rankings, historial y estadísticas. Los identificadores de
        start.gg se usarían para asociar e impedir duplicados en los registros. La fuente podrá ser
        información pública de start.gg; que un dato sea público no elimina la obligación de
        justificar su tratamiento.
      </p>
      <p>
        El propósito previsto es mantener el historial de torneos de la comunidad, mostrar
        clasificaciones y estadísticas competitivas y corregir o actualizar importaciones. Los
        nombres públicos, resultados y estadísticas asociados a una ficha podrían mostrarse en
        perfiles y rankings públicos y ser indexados por buscadores. La base jurídica aplicable y el
        tratamiento de registros de participantes sin cuenta, incluidos posibles menores, deben
        definirse y revisarse antes de activar la importación.
      </p>
      <p>
        Se prevé conservar los resultados históricos asociados a un registro de jugador
        despersonalizado cuando se elimine una cuenta, para preservar la integridad del historial.
        El alcance de la anonimización, la base jurídica y el plazo de conservación están pendientes
        de validación; no debe interpretarse esta descripción como una decisión legal definitiva.
      </p>
      <p>
        No se debe interpretar el checkbox de los términos como consentimiento para finalidades que
        no sean necesarias para el servicio.
      </p>

      <h2>Destinatarios de los datos</h2>
      <p>Con carácter general, los datos personales no serán comunicados a terceros.</p>
      <p>
        No obstante, podrán ser accesibles por proveedores tecnológicos que presten servicios
        necesarios para el funcionamiento de la plataforma (por ejemplo, alojamiento web, servicios
        de correo electrónico o copias de seguridad), quienes actuarán como encargados del
        tratamiento conforme al artículo 28 del Reglamento (UE) 2016/679.
      </p>
      <p>Asimismo, podrán comunicarse cuando exista una obligación o requerimiento legal.</p>
      <h2>Conservación y baja</h2>
      <p>
        Los datos de cuenta se conservan mientras la cuenta esté activa mientras sean necesarios
        para prestar los servicios solicitados. Al eliminar una cuenta se borran sus credenciales y
        vínculos de cuenta, se elimina la foto de perfil y las selecciones de personajes, y se
        anonimiza la ficha. Los resultados competitivos pueden conservarse asociados a una ficha
        anonimizada para mantener el historial comunitario.
      </p>

      <h2>Cookies y seguridad</h2>
      <p>
        El inicio de sesión utiliza cookies necesarias para mantener la sesión. Esta versión no
        incorpora herramientas de analítica de terceros. Las contraseñas se almacenan mediante un
        hash criptográfico, no en texto legible. Si se incorporan analítica, publicidad u otros
        servicios, esta información deberá actualizarse antes de activarlos.
      </p>

      <h2>Derechos</h2>
      <p>
        El usuario puede solicitar acceso, rectificación, supresión, limitación, oposición y, cuando
        corresponda, portabilidad, además de retirar un consentimiento cuando esa sea la base
        aplicable. Puede descargar los datos disponibles desde su cuenta. Para ejercer cualquiera de
        estos derechos podrá enviarse una solicitud a valenciasmash.web@gmail.com. La solicitud
        deberá permitir identificar razonablemente al solicitante.
      </p>

      <p className="legal-draft-notice">
        Versión {PRIVACY_DRAFT_VERSION}. La política y los{" "}
        <Link href="/legal/terms">términos de uso</Link>, el{" "}
        <Link href="/legal/aviso-legal">aviso legal</Link> y la{" "}
        <Link href="/legal/cookies">política de cookies</Link> requieren revisión humana y no son
        una confirmación de cumplimiento normativo.
      </p>
    </main>
  );
}
