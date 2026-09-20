import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { productsApi } from '@/api/products';
import { AttributeList } from '@/components/catalog/AttributeList';
import { PriceTag } from '@/components/catalog/PriceTag';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorBanner, Spinner } from '@/components/ui/Feedback';
import { useTaxonomy } from '@/catalog/TaxonomyProvider';
import { errorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { mediaDisplayUrl } from '@/lib/media';
import { useAsync } from '@/lib/useAsync';
import type { Product, ProductMedia } from '@/types/api';

export function ProductDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const query = useAsync(() => productsApi.get(id), [id]);
  const { getCategory, categoryLabel } = useTaxonomy();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  if (query.loading) return <Spinner />;
  if (query.error) return <ErrorBanner message={errorMessage(query.error)} />;
  if (!query.data) return null;

  const product = query.data;

  async function publish() {
    setBusy(true);
    setError('');
    try {
      query.setData(await productsApi.save(product.id));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function upload(file?: File | null, input?: HTMLInputElement | null) {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const media = await productsApi.uploadMedia(product.id, file);
      query.setData({
        ...product,
        medias: [...(product.medias ?? []), media],
      });
      try {
        query.setData(await productsApi.get(product.id));
      } catch {
        // keep optimistic media from POST
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      if (input) input.value = '';
    }
  }

  async function removeMedia(mediaId: string) {
    if (!mediaId) {
      setError('Esa foto no tiene id. Recargá la página e intentá de nuevo.');
      return;
    }
    if (!confirm('¿Borrar esta foto?')) return;
    setBusy(true);
    setDeletingId(mediaId);
    setError('');
    try {
      await productsApi.removeMedia(product.id, mediaId);
      query.setData({
        ...product,
        medias: (product.medias ?? []).filter(
          (item) => resolveMediaId(item) !== mediaId,
        ),
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      setDeletingId('');
    }
  }

  async function remove() {
    if (!confirm('¿Borrar este producto? Se eliminan también sus fotos.')) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      await productsApi.remove(product.id);
      navigate('/app/products');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function deactivate() {
    if (!confirm('¿Desactivar este producto? Deja de mostrarse como activo.')) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      query.setData(await productsApi.deactivate(product.id));
      navigate('/app/products');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/app/products" className="text-sm font-semibold text-muted">
        ← Productos
      </Link>
      {error ? <ErrorBanner message={error} /> : null}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <Gallery
            product={product}
            busy={busy}
            deletingId={deletingId}
            onRemoveMedia={removeMedia}
          />
        </Card>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
              {getCategory(product.category)?.familyLabel
                ? `${getCategory(product.category)?.familyLabel} · `
                : ''}
              {categoryLabel(product.category)}
            </p>
            <h1 className="mt-1 font-display text-4xl">{product.title}</h1>
            <div className="mt-3">
              <Badge value={product.status} />
            </div>
          </div>
          <PriceTag price={product.price} />
          {product.price.offer ? (
            <p className="text-sm text-muted">
              Oferta {formatDate(product.price.activeFrom)} —{' '}
              {formatDate(product.price.activeUntil)}
            </p>
          ) : null}
          <p className="text-sm leading-6 text-ink-soft">
            {product.description}
          </p>
          <AttributeList
            categoryId={product.category}
            attributes={product.attributes}
          />
          <div className="flex flex-wrap gap-2">
            <label
              className={`inline-flex cursor-pointer items-center justify-center rounded-full border border-line bg-paper px-4 py-2.5 text-sm font-semibold ${
                busy ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {busy && !deletingId ? 'Subiendo…' : 'Subir foto'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                disabled={busy}
                onChange={(e) => upload(e.target.files?.[0], e.target)}
              />
            </label>
            {product.status !== 'active' ? (
              <Button onClick={publish} loading={busy}>
                Publicar
              </Button>
            ) : (
              <Button variant="ghost" onClick={deactivate} loading={busy}>
                Desactivar
              </Button>
            )}
            <Button variant="ghost" onClick={remove} loading={busy}>
              Borrar producto
            </Button>
          </div>
          <p className="text-xs text-muted">
            Para reemplazar una foto, borrála arriba y subí otra.
          </p>
        </div>
      </div>
    </div>
  );
}

function resolveMediaId(media: ProductMedia & { _id?: string }): string {
  return String(media.id || media._id || '').trim();
}

function Gallery({
  product,
  busy,
  deletingId,
  onRemoveMedia,
}: {
  product: Product;
  busy: boolean;
  deletingId: string;
  onRemoveMedia: (mediaId: string) => void;
}) {
  const photos = product.medias ?? [];
  if (!photos.length) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-sand text-sm text-muted">
        Sin fotos todavía
      </div>
    );
  }
  return (
    <div className="grid gap-3 p-3 sm:grid-cols-2">
      {photos.map((media, index) => {
        const mediaId = resolveMediaId(media);
        return (
          <div
            key={mediaId || media.url || index}
            className="overflow-hidden rounded-3xl bg-sand"
          >
            <div className="relative aspect-[4/3] bg-sand">
              <img
                src={mediaDisplayUrl(media, 'detail')}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <p className="truncate text-xs text-muted">
                Foto {index + 1}
                {!mediaId ? ' · sin id' : ''}
              </p>
              <button
                type="button"
                disabled={busy || !mediaId}
                onClick={() => onRemoveMedia(mediaId)}
                className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper hover:bg-danger disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={14} />
                {deletingId === mediaId ? 'Borrando…' : 'Borrar foto'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
