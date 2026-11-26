import Link from "next/link";
import { TERMS_VERSION } from "@/modules/auth";

export default function TermsPage(): React.JSX.Element {
  return (
    <main className="page-container legal-page">
      <span className="section-kicker">ValenciaSmash</span>
      <h1>Términos de uso</h1>
      <p>Versión {TERMS_VERSION}</p>

      <p>
        Estos términos regulan el acceso y uso de ValenciaSmash, una web comunitaria independiente
        dedicada a Super Smash Bros. Ultimate y a la comunidad de Valencia. Al crear una cuenta o
        utilizar las funciones autenticadas, aceptas estos términos. Si no estás de acuerdo, no
        crees una cuenta ni utilices dichas funciones.
      </p>

      <h2>Elegibilidad y cuenta</h2>
      <p>
        Eres responsable de mantener la confidencialidad de tus credenciales y de la actividad
        realizada desde tu cuenta. Avísanos si sospechas que alguien la utiliza sin autorización.
      </p>
      <p>
        La contraseña es personal. No compartas tu cuenta ni intentes acceder a cuentas, sistemas o
        datos de otras personas.
      </p>

      <h2>Conducta y contenido</h2>
      <p>
        No publiques ni envíes contenido ilegal, amenazante, acosador, discriminatorio, difamatorio,
        sexualmente explícito, fraudulento o que vulnere derechos de terceros. Tampoco uses el
        servicio para spam, publicidad no autorizada, suplantación o para interferir con su
        seguridad o funcionamiento.
      </p>
      <p>
        Solo envía fotos u otro material si tienes derecho a hacerlo y a permitir su publicación en
        el servicio. Eres responsable del contenido que aportas. Las fichas y los campos que marques
        o completes como públicos pueden ser vistos por otras personas y, potencialmente, indexados
        por buscadores.
      </p>
      <p>
        Podemos ocultar o retirar contenido y limitar o suspender cuentas cuando sea necesario por
        incumplimientos de estos términos, motivos de seguridad o exigencias legales. Cuando sea
        razonable, procuraremos comunicar el motivo y ofrecer un canal de contacto para revisarlo.
      </p>

      <h2>Perfiles, imágenes y funciones comunitarias</h2>
      <p>
        Al subir una foto de perfil, autorizas a ValenciaSmash a almacenarla y transformarla para
        mostrarla como parte de tu ficha. La política de privacidad explica los proveedores que
        intervienen y cómo solicitar la baja o ejercer tus derechos.
      </p>
      <p>
        Los puntos de las funciones de point matches, si se habilitan, son virtuales y no tienen
        valor monetario: no se compran ni se canjean por dinero o bienes. No se permite apostar
        dinero ni utilizar estas funciones para organizar pagos o premios económicos.
      </p>

      <h2>Propiedad intelectual y relación con Nintendo</h2>
      <p>
        Los derechos sobre el contenido aportado siguen perteneciendo a sus titulares. Al
        publicarlo, autorizas su uso técnico dentro de ValenciaSmash para prestar y mostrar la
        función que has elegido, mientras el contenido permanezca en el servicio. ValenciaSmash es
        un proyecto independiente, no afiliado, patrocinado ni aprobado por Nintendo, HAL Laboratory
        o Sora Ltd. Las marcas y obras de terceros pertenecen a sus respectivos titulares.
      </p>

      <h2>Datos, seguridad y eliminación</h2>
      <p>
        El tratamiento de datos, los proveedores, las transferencias y las solicitudes de acceso,
        rectificación o supresión se describen en la{" "}
        <Link href="/legal/privacy">política de privacidad</Link>. Ningún servicio en línea puede
        garantizar seguridad absoluta; aplicaremos medidas razonables y actuaremos conforme a las
        obligaciones legales aplicables ante incidentes.
      </p>
      <p>
        Puedes solicitar la eliminación de tu cuenta desde la página de cuenta. Se borran las
        credenciales y vínculos, se elimina la foto, y la ficha se anonimiza. Parte del historial
        competitivo puede conservarse de forma anonimizada, según se detalla en la política de
        privacidad.
      </p>

      <h2>Disponibilidad y cambios</h2>
      <p>
        Podemos mantener, modificar o retirar funciones para operar, proteger o mejorar el servicio.
        Publicaremos aquí la versión vigente de los términos. Si un cambio requiere una nueva
        aceptación, solicitaremos esa aceptación antes de aplicar el cambio a tu cuenta.
      </p>
      <p>
        Estos términos no limitan los derechos que te reconozca la normativa aplicable ni excluyen
        responsabilidades que legalmente no puedan excluirse. Para cuestiones legales o solicitudes,
        consulta el <Link href="/legal/aviso-legal">aviso legal</Link> y utiliza los datos de
        contacto allí indicados.
      </p>
      <p>
        Consulta también la <Link href="/legal/privacy">política de privacidad</Link>, el{" "}
        <Link href="/legal/aviso-legal">aviso legal</Link> y la{" "}
        <Link href="/legal/cookies">política de cookies</Link>.
      </p>
    </main>
  );
}
