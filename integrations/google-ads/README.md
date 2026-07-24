# Google Ads API integrace pro SynergyOS

Tato integrace načítá výkon kampaní přes Google Ads API. Změnové operace budou doplněny až po ověření přístupu a reportu.

## Potřebné údaje

1. Google Ads developer token z API Center v manager účtu.
2. OAuth 2.0 Client ID a Client Secret z Google Cloud projektu s povoleným Google Ads API.
3. OAuth refresh token uživatele, který má přístup k účtu Google Ads.
4. Customer ID bez pomlček. Pro aktuální účet je v `.env.example` předvyplněno `1487975090`.
5. Pokud je účet pod MCC, doplnit `GOOGLE_ADS_LOGIN_CUSTOMER_ID`.

## Lokální spuštění

```bash
cd integrations/google-ads
cp .env.example .env
# doplnit tajné hodnoty do .env
npm run report
```

Soubor `.env` se nesmí commitovat do GitHubu ani posílat e-mailem.

## Bezpečnost

- Výchozí režim je pouze čtení dat.
- Budoucí změnové skripty budou mít povinný dry-run.
- Ostré změny se povolí pouze nastavením `GOOGLE_ADS_APPLY_CHANGES=true`.
- Doporučený provozní model je: analýza → návrh změn → schválení → provedení.
