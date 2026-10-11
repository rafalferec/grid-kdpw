# KDPW — fundament aplikacji

Etap 2: React 19, TypeScript strict i Vite. Dostępny jest układ aplikacji,
nawigacja i dwa widoki „w przygotowaniu”. Zakres i kierunek zależności wynikają
z [AGENTS.md](AGENTS.md) i [architektury](docs/architecture.md).

## Uruchomienie

```sh
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Node 22.23.2 jest wskazany w `.nvmrc`; Vite 8 wymaga co najmniej Node 20.19
lub 22.12. W tym środowisku dostępny jest odpowiedni Node 22, ale domyślny
Node 18 nie wystarcza. [Wymagania Vite](https://vite.dev/guide/)

Lokalny `.env.local` został przygotowany z publicznym adresem z przykładu.
Nie nadpisuj własnej konfiguracji poleceniem `cp`, jeżeli plik już istnieje.
Na innym stanowisku utwórz go po instalacji; na CI ustaw `VITE_API_URL` przed
buildem. `.env.example` nie jest automatycznie wczytywany przez Vite.
Zmienne `VITE_` są publiczne i nie mogą zawierać sekretów.
[Środowisko Vite](https://vite.dev/guide/env-and-mode)

`baseApi` waliduje adres przy inicjalizacji: wymagany jest bezwzględny HTTP(S),
bez danych logowania, query i fragmentu. Zachowuje ścieżkę bazową i dodaje
końcowy slash. Brak konfiguracji powoduje jednoznaczny błąd, bez domyślnego
adresu wpisanego w transport. Testy mają osobny adres `api.example.test`
i MSW odrzucający nieobsłużone żądania.

| Polecenie | Przeznaczenie |
| --- | --- |
| `npm run dev` | Serwer developerski Vite |
| `npm run typecheck` | Typy aplikacji, testów i konfiguracji Vite |
| `npm run lint` | ESLint, React Hooks, Refresh i granice modułów |
| `npm test` | Vitest w trybie obserwowania zmian |
| `npm run test:run` | Jednorazowe wykonanie testów |
| `npm run build` | Kontrola typów i build do `dist/` |
| `npm run preview` | Lokalny podgląd istniejącego buildu |

## Zrealizowany zakres

- Jeden store z reducerem i middleware `baseApi`; bez dodatkowych slices.
- `baseApi` ma puste endpointy. Nie wykonuje żądań przy renderowaniu aplikacji.
- Jeden `BrowserRouter` w `AppProviders`; `/` przekierowuje z `replace`
  na `/products`, dostępne są `/orders` i komunikat dla nieznanej trasy.
- App importuje widoki przez publiczne indexy features. Shared pozostaje
  niezależne od App i Features.
- CSS Modules dla układu, globalne tokeny i jeden import motywu Kendo.
- Semantyczny nagłówek, nawigacja, główna treść, skip link i widoczny focus.
- Jeden test RTL sprawdza układ, przekierowanie i nawigację Tab/Enter.
- MSW uruchamia serwer testowy bez handlerów biznesowych.
- `ApiResponse`, `ApiPaginationParams` i unia `ApiFailure` przygotowują kontrakt
  transportu. `normalizeApiError.ts` powstanie wraz z odbiorcą w etapie zapytań;
  nie dodajemy pustej funkcji ani sztucznego użycia.

GridWrapper, endpointy, modele, filtry, szczegóły, selection i paginacja biznesowa
pozostają zakresem kolejnych etapów. Hosting produkcyjny będzie wymagał fallbacku
SPA do `index.html`, również dla bezpośredniego wejścia na `/orders`.

## Zależności i decyzje o wersjach

Bezpośrednie zależności są przypięte, a całe drzewo utrwala `package-lock.json`.

| Pakiet | Wersja |
| --- | --- |
| `react`, `react-dom` | 19.3.0 |
| `react-router-dom` | 7.18.4 |
| `@reduxjs/toolkit` | 2.13.0 |
| `react-redux` | 9.3.0 |
| `@progress/kendo-react-grid` | 16.2.0 |
| `@progress/kendo-theme-default` | 14.6.1 |
| `typescript` | 5.9.3 |
| `vite`, `@vitejs/plugin-react` | 8.3.4, 6.1.2 |
| `eslint`, `@eslint/js` | 10.12.0, 10.0.1 |
| `typescript-eslint` | 8.71.1 |
| `eslint-plugin-boundaries` | 7.2.0 |
| `eslint-import-resolver-typescript` | 4.4.5 |
| `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` | 7.1.1, 0.5.7 |
| `globals` | 17.13.0 |
| `vitest`, `jsdom`, `msw` | 4.1.11, 30.1.2, 2.15.0 |
| `@testing-library/react`, `@testing-library/dom` | 16.3.3, 10.4.2 |
| `@testing-library/user-event`, `@testing-library/jest-dom` | 14.6.7, 7.0.1 |
| `@types/react`, `@types/react-dom`, `@types/node` | 19.3.0, 19.3.0, 22.20.5 |
| `patch-package` | 8.0.1 |

React Router używa deklaratywnych API przez wymagany `react-router-dom`.
Nie dodano alternatywnego stanu ani osobnego klienta HTTP.
TypeScript 5.9.3 i Vitest 4.1.11 tworzą zweryfikowany stabilny zestaw:
deklaracje `Assertion` w Vitest 5.0.3 i jest-dom 7.0.1 były niezgodne.
Wszystkie wymagane flagi strict są włączone. `skipLibCheck` pozostaje wyłączone.

### Poprawka deklaracji Redux Toolkit

RTK 2.13.0 zawiera deklaracje niezgodne z `exactOptionalPropertyTypes`.
Błąd odtworzono również w RTK 2.11.2 i 2.9.2. Zamiast utrzymywać starszy RTK,
stosujemy [jawną poprawkę](patches/@reduxjs+toolkit+2.13.0.patch), nakładaną przez
`postinstall` i `patch-package --error-on-fail`:

1. `SerializedError.code` dopuszcza jawne `undefined`, zgodnie z konstruktorem
   `TaskAbortError` w dostarczonym kodzie biblioteki.
2. `OverrideThunkApiConfigs` zachowuje przecięcie `NewConfig & Omit<...>`
   bez dodatkowego mapowania przez `Id`, które powodowało błąd ograniczeń
   generyków przy dokładnych właściwościach opcjonalnych.

Zmiana dotyczy obu plików deklaracji (`.d.ts`, `.d.mts`), nie kodu wykonywalnego.
Nie zmienia ograniczeń dispatch/state i nie wyłącza sprawdzania typów.
Przy aktualizacji RTK najpierw sprawdź niezmodyfikowaną paczkę; usuń patch
i narzędzie, gdy upstream przejdzie pełny typecheck. Instalacja developerska
wymaga devDependencies, ponieważ to w niej działa patch i build.

### Kontrola zależności

`overrides.handlebars = 4.7.10` aktualizuje przypiętą zależność pluginu granic
i usuwa zgłoszenia krytyczne dla 4.7.9. Pozostałe ostrzeżenia npm dotyczą
`braces` 3.0.3: sześć pozycji high obejmuje ten sam problem i zależne narzędzia
(`micromatch`, Boundaries, patch-package). W chwili weryfikacji nie ma nowszego
naprawionego `braces`. Problem dotyczy nadmiernie zagnieżdżonych wzorców.
W tym projekcie wzorce pochodzą z lokalnej konfiguracji; narzędzia te nie
wchodzą do bundla aplikacji. Nie jest to deklaracja braku ryzyka dla narzędzi.
[Advisory braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)

Automatyczny `audit fix --force` sugeruje stare, niezgodne wydania narzędzi;
nie zastosowano go. Ponownie sprawdź advisory przy aktualizacji zależności.
`npm audit --omit=dev` zakończył się wynikiem 0 podatności.

## Granice architektoniczne

ESLint 10 korzysta z flat config. Boundaries 7 używa `policies` oraz osobnych
deskryptorów plików wejścia i deklaracji. Każdy feature jest odrębnym elementem.
Zakazane są Shared → Features/App, Features → App, Products ↔ Orders oraz
deep imports z App do feature. Alias `@/` jest rozwiązywany z tego samego
tsconfig, który stosuje TypeScript; Vitest współdzieli konfigurację Vite.

Sprawdzono przypadki z aliasem, ścieżkami względnymi, reeksportem i importem
typu oraz przypadki poprawne. Nieznane pliki i nierozpoznane lokalne importy
również są błędami. Reguła dla przyszłego GridWrapper i hooka stanu blokuje
RTK oraz `shared/api`; nie wymaga tworzenia pustych katalogów.

## KendoReact: integracja i licencja

Weryfikacja: 8–9 października 2026. Manifest zainstalowanego Grid 16.2.0
dopuszcza `react` i `react-dom` `^18.0.0 || ^19.0.0`.
Docelowy import to `import { Grid, GridColumn } from '@progress/kendo-react-grid'`.
Obecny etap nie renderuje Grid i nie potwierdza działania jego funkcji Premium.
[Instalacja i import Grid](https://www.telerik.com/kendo-react-ui/components/grid/getting-started/get-started)

Npm automatycznie instaluje wymagane peer dependencies Grid; nie użyto
`--legacy-peer-deps`, `--force` ani pakietu obejmującego wszystkie komponenty.
Manifest wymaga KendoReact 16.2.0: animation, buttons, common, conversational-ui,
data-tools, dateinputs, dialogs, dropdowns, form, indicators, inputs, intl,
labels, layout i popup. Wymaga też kendo-csv, data-query, drawing, file-saver,
licensing i svg-icons. Ich obecność wynika z paczki Grid, nie z użycia w aplikacji
eksportu, AI czy lokalnego przetwarzania. Dalsze zależności przechodnie utrwala
lockfile. Motyw Default importowany jest raz w `main.tsx`, przed stylami aplikacji.

| Funkcja przyszłego GridWrapper | Aktualne API / ograniczenie |
| --- | --- |
| Paginacja | Kontrolowane `pageable`, `skip`, `take`, `total`, `onPageChange`; pager liczbowy z dropdownem jest Free |
| Filtrowanie | `filterable`, `filter`, `onFilterChange`; filtr wiersza jest Free, zewnętrzne i wielokolumnowe oraz serwerowe scenariusze są wskazane jako Premium |
| Selection | `selectable`, `select`, `onSelectionChange`; pojedynczy wiersz jest Free |
| Szczegóły | `detail`, `detailExpand`, `onDetailExpandChange`; Premium |
| Loading | `showLoader`, opcjonalnie `loader`; standardowy wskaźnik jest Free |
| Customizacja | `rows.data` i `GridColumn.cells.data`; własne renderery są Premium, podstawowe stylowanie jest Free |

Źródła: [Free/Premium](https://www.telerik.com/kendo-react-ui/components/getting-started/free-vs-premium),
[paging](https://www.telerik.com/kendo-react-ui/components/grid/paging),
[filtering](https://www.telerik.com/kendo-react-ui/components/grid/filtering),
[selection](https://www.telerik.com/kendo-react-ui/components/grid/selection),
[detail rows](https://www.telerik.com/kendo-react-ui/components/grid/rows/detail),
[custom rows](https://www.telerik.com/kendo-react-ui/components/grid/rows/custom-rows),
[GridProps](https://www.telerik.com/kendo-react-ui/components/grid/api/gridprops).

W kolejnym etapie nie używamy przestarzałych `cellRender`/`rowRender` ani
`autoProcessData` do lokalnego filtrowania/paginacji. Dane przetwarza serwer,
a adapter Kendo pozostaje wewnątrz generycznego wrappera.

Pełny zakres zadania wymaga ważnej licencji komercyjnej lub próbnej.
Instalacja paczki nie aktywuje Premium. Klucz należy uzyskać na koncie Telerik
i aktywować zgodnie z dokumentacją producenta, np. dostarczając lokalny
`telerik-license.txt` i uruchamiając `npx kendo-ui-license activate`.
W CI klucz pochodzi z chronionego sekretu według instrukcji producenta,
nigdy ze zmiennej `VITE_`. Pliki kluczy są ignorowane przez Git.
Bez ważnego klucza funkcje Premium mogą wyświetlać ostrzeżenia i znaki wodne.
Nie uzyskano ani nie aktywowano klucza w tym etapie.
[Aktywacja licencji](https://www.telerik.com/kendo-react-ui/components/my-license)

## Pliki etapu 2

Utworzone pliki źródłowe i konfiguracyjne:

```text
.env.example
.env.local                   (lokalny, ignorowany)
.gitignore
.nvmrc
README.md
package.json
package-lock.json
index.html
eslint.config.js
tsconfig.json
tsconfig.base.json
tsconfig.app.json
tsconfig.node.json
vite.config.ts
patches/@reduxjs+toolkit+2.13.0.patch
tests/setup.ts
tests/server.ts
src/vite-env.d.ts
src/main.tsx
src/app/App.tsx
src/app/App.module.css
src/app/providers/AppProviders.tsx
src/app/router/AppRouter.tsx
src/app/router/AppRouter.test.tsx
src/app/store/store.ts
src/shared/api/baseApi.ts
src/shared/api/api.types.ts
src/features/products/ProductsPage.tsx
src/features/products/index.ts
src/features/orders/OrdersPage.tsx
src/features/orders/index.ts
src/styles/globals.css
src/styles/tokens.css
```

`node_modules/` i `dist/` to wygenerowane, ignorowane artefakty. Nie inicjalizowano
Git. `AGENTS.md` pozostaje niezmieniony; w `docs/architecture.md` dodano tylko
informację o wykonaniu fundamentu i odsyłacz do niniejszej dokumentacji.

## Wyniki weryfikacji etapu 2

Wykonano 9 października 2026, po ponownej instalacji z lockfile:

| Kontrola | Wynik |
| --- | --- |
| `npm ci` | Sukces, patch RTK nakładany w `postinstall` |
| `npm run typecheck` | Sukces, pełne sprawdzanie deklaracji importowanych bibliotek |
| `npm run lint` | Sukces, 0 błędów i ostrzeżeń |
| `npm run test:run` | 1 test / 1 plik — sukces |
| `npm test -- --watch` | Test przechodzi, tryb obserwowania uruchomiony i zakończony |
| `npm run build` | Sukces; JS 337,03 kB, CSS 750,82 kB przed gzip |
| `npm ls --all` | Spójne drzewo, bez brakujących lub niezgodnych zależności |
| Próbki granic ESLint | 16 przypadków poprawnych i zabronionych — sukces |
| Próba typów po patchu RTK | Poprawny thunk działa; błędny argument oraz state/dispatch w konfiguracji thunk slice nadal są odrzucane |
| Vite dev w przeglądarce | Przekierowanie `/`, przejście Products → Orders, reload `/orders`, widoczny focus |
| Vite preview w przeglądarce | Bezpośrednie `/orders` i komunikat dla nieznanej trasy działają |

Próbki importów i dodatkowa próba kompilatora były jednorazową weryfikacją;
nie pozostawiły modułów w aplikacji ani dodatkowych testów biznesowych.
Duży arkusz CSS pochodzi z pełnego motywu Kendo Default. Optymalizacja zakresu
motywu może być oceniona po wdrożeniu Grid, gdy znany będzie zestaw komponentów.

Instalacja raz przerwała się z powodu braku miejsca na dysku. Usunięto wyłącznie
cache utworzony dla tego zadania; następne `npm ci` zakończyło się sukcesem.
Nie usuwano plików użytkownika. Nie weryfikowano jeszcze zapytań SondaHub,
renderowania Grid ani aktywacji licencji — nie należą do zakresu etapu 2.
