# Trexifly — CarsXE vehicle image provider

Status: integration code implemented; provider activation is pending an API key.

## What is implemented
- GET /api/vehicle-image?make=...&model=...&fallback=...
- CarsXE key is read only from the server-side CARSXE_API_KEY secret.
- Searches are restricted to vehicle titles present in CAR_ROWS, TRANSFER_ROWS, or HOME_SHOWCASE_CARS. Adding a new supported model to the central inventory enables its matching query.
- Requests use CarsXE's license=Public filter, large/front/validated image options, and verify returned image MIME type and dimensions.
- The image is proxied through Trexifly; the API key is not sent to browsers.
- Successful images are cached at the Cloudflare edge. If no key, no match, or provider failure occurs, the existing local category image is used.
- Existing 50 local vehicle JPGs are preserved and remain mapped to their exact inventory rows.

## Activate after receiving a CarsXE API key
1. Create a CarsXE account and obtain an API key from its dashboard.
2. From E:\trexifly, run: npx wrangler secret put CARSXE_API_KEY
3. Paste the key into the hidden prompt. Do not put the key in source code, chat, or a committed file.
4. Deploy only after confirming the correct Cloudflare account/project: npx wrangler deploy.

For local-only testing, copy .dev.vars.example to .dev.vars and put the key in the local ignored .dev.vars file.

## Licensing note
CarsXE documents that license=Public filters to public-domain-labelled candidates, but also explicitly says the filter does not itself grant a licence. The linked contextLink must still be checked before publication. This integration therefore uses the strict public-domain filter and preserves the source link in the response header X-Trexifly-Image-Source. If CarsXE returns no suitable candidate, Trexifly keeps the existing fallback rather than displaying an unverified image.

## Provider limits / cost
The provider's published pricing currently lists a free sandbox with 100 lifetime calls. Paid tiers and quotas may change; check the CarsXE pricing page before enabling bulk updates. This integration does not make any provider calls until CARSXE_API_KEY is configured and a non-local model image is requested.