import { ApiError } from '@/types/api';

const ERROR_COPY: Record<string, string> = {
  email_already_registered: 'Ese email ya tiene una cuenta.',
  invalid_credentials: 'Email o contraseña incorrectos.',
  email_not_verified: 'Todavía no verificaste el email.',
  invalid_code: 'El código no es válido.',
  code_expired: 'El código expiró. Pedí uno nuevo.',
  account_not_found: 'No encontramos esa cuenta.',
  invalid_refresh_token: 'La sesión expiró. Volvé a entrar.',
  expired_refresh_token: 'La sesión expiró. Volvé a entrar.',
  store_not_found: 'Todavía no creaste tu tienda.',
  store_already_exists: 'Ya tenés una tienda.',
  title_not_available: 'Ese título ya está en uso.',
  product_incomplete: 'El producto está incompleto.',
  bundle_incomplete: 'El combo está incompleto.',
  products_not_found: 'Alguno de los productos no existe.',
  products_not_active: 'Los productos del combo tienen que estar activos.',
  settings_not_found: 'No encontramos la configuración del catálogo.',
  media_missing: 'Elegí una imagen (campo media).',
  media_empty: 'El archivo de imagen está vacío.',
  invalid_media_type: 'Usá PNG, JPEG, WEBP o GIF.',
  media_not_found: 'No encontramos esa foto.',
  medias_limit: 'Este producto ya tiene el máximo de fotos.',
  storage_not_configured:
    'El storage de imágenes no está configurado en el servidor.',
  upload_failed: 'No se pudo subir la imagen.',
  no_fields_to_update: 'No hay campos para actualizar.',
  terms_not_accepted: 'Tenés que aceptar los términos.',
  cell_not_validated: 'Primero validá el celular.',
  bank_account_required: 'Falta la cuenta bancaria.',
  store_already_confirmed: 'La tienda ya está confirmada.',
  delivery_not_configured: 'Primero configurá el horario de delivery.',
  invalid_delivery_schedule: 'El horario de delivery no es válido.',
  invalid_pickup_schedule: 'El horario de retiro no es válido.',
  invalid_bank_account: 'Revisá los datos bancarios.',
  name_not_available: 'Ese nombre de tienda ya está en uso.',
  cell_not_available: 'Ese celular ya está en uso.',
};

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.missing?.length) {
      const base = ERROR_COPY[error.code] ?? error.message;
      return `${base} Falta: ${error.missing.join(', ')}.`;
    }
    return ERROR_COPY[error.code] ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Algo salió mal. Probá de nuevo.';
}
