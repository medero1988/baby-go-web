# Flyfree Web

Front del provider para consumir `baby-go-services`.

Por defecto apunta a staging:

`https://baby-go-services-staging.up.railway.app/api`

## Correr

```bash
cp .env.example .env
```

```bash
npm install
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173).

## Qué hay en esta primera versión

- Auth local: alta, verificación de email, login, refresh, recovery
- Panel provider: tienda, productos, combos y movimientos
- Cliente HTTP con Bearer + refresh automático

El contrato está en `baby-go-services/postman`.
