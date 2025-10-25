export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:1337/api', // ajusta a tu backend
  strapiToken: '10b51ff621a990dff6fc5eb3f6ee2836c84e93a2f95e47aae5bf463de8dbba3124704a5d0d48ef6435464b7bb85a83014bb30d80986bf69b54ebe8a150173f0c16124c006f27670122ececf104df59b4a1f0ea493bb34a108df045c5d4307cc0239d21614a655286d04fdc71e96fdd203e5501e49a2ca9ae1effa1df5ba0cfcb',
  recaptchaSiteKey: 'REEMPLAZA_CON_TU_SITE_KEY',
  /**
   * Clave usada únicamente durante el desarrollo local.
   * Por defecto apunta a la clave pública de pruebas de Google para evitar errores de dominio.
   */
  recaptchaSiteKeyLocal: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
};
