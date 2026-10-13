# KDPW — zadanie rekrutacyjne Frontend

Aplikacja React 19 i TypeScript prezentująca produkty oraz zamówienia w tabelach
KendoReact Grid. Oba widoki korzystają z jednego generycznego komponentu
`GridWrapper<T>`. Pobieranie danych, filtrowanie i paginacja są realizowane przez
API; RTK Query zarządza zapytaniami i pamięcią podręczną.

## Uruchomienie

Wymagany jest Node.js zgodny z `package.json`. Zalecana wersja **22.23.2**
znajduje się w `.nvmrc`.

```sh
nvm use
npm ci
```

Utwórz `.env.local` na podstawie `.env.example`, jeśli nie masz jeszcze własnej
konfiguracji:

```dotenv
VITE_API_URL=https://api.sondahub.com/v1/store/
```

Następnie uruchom aplikację:

```sh
npm run dev
```

Otwórz adres wypisany przez Vite w terminalu. Ścieżka `/` przekierowuje na
`/products`; drugi widok jest dostępny pod `/orders`.

Aplikacja korzysta z publicznego API SondaHub i nie wysyła danych logowania ani
klucza API. Nie wymaga uruchomienia własnego backendu. Zmienna `VITE_API_URL`
jest obowiązkowa i trafia do kodu przeglądarkowego — nie należy umieszczać w niej
sekretów. Po jej zmianie uruchom ponownie serwer deweloperski.

## Realizacja wymagań

| Wymaganie | Implementacja |
| --- | --- |
| React 19 i TypeScript | Komponenty funkcyjne, tryb `strict`, generyczne kontrakty; bez jawnego `any` w kodzie aplikacji i testach. |
| KendoReact Grid | Wspólna implementacja w `GridWrapper<T>`, używana dla modeli `Product` i `Order`. |
| Stronicowanie serwerowe | Parametry `page` i `limit`; liczba rekordów pochodzi z `meta.total` odpowiedzi API. |
| Filtrowanie kolumn | Konfiguracja w `columns.ts`; input tekstowy i dropdown, możliwość łączenia filtrów wielu kolumn. |
| Operacje na serwerze | Filtry są mapowane na parametry HTTP `_like`; brak lokalnego filtrowania i paginacji kolekcji. |
| Rozwijanie szczegółów | `RecordDetails` pokazuje pola pominięte w kolumnach; kontrolowane `detailExpand` pozwala rozwinąć jeden wiersz jednocześnie. |
| Zaznaczanie wiersza | Pojedynczy wybór oparty na konfigurowalnym `dataItemKey` i kontrolowanym `selectedId`. |
| Wyświetlenie wybranego rekordu | Przycisk „Wyświetl zaznaczony” pokazuje dane nad gridem. Panel można zamknąć; zmiana zaznaczenia ukrywa panel. |
| Refresh | Przycisk wywołuje `refetch()` bieżącego zapytania, zachowując filtry i stronę. |
| Preloader | Nakładka nad wierszami podczas pobierania, odświeżania i oczekiwania na ustabilizowanie filtra. |
| Stylizacja | Motyw Kendo Default, CSS Modules, wyróżnienie nagłówka, filtrów, paginacji i zaznaczenia. |
| Warunkowe kolory | Produkty dostępne są zielone, niedostępne czerwone. Zamówienia `paid` i `shipped` są zielone, `cancelled` czerwone. |

Grid obsługuje filtrowanie dowolnego pola wskazanego w konfiguracji, o ile API
obsługuje odpowiadający mu parametr. Filtr jest włączany jawnie przez
`filter: true`. W obecnym widoku produktów kolumna `id` nie ma filtra.

## Obsługa aplikacji

1. Wybierz widok „Produkty” lub „Zamówienia”.
2. Wpisz wartość pod nagłówkiem kolumny albo wybierz opcję z dropdownu.
   Zmiana filtra wraca na pierwszą stronę. Puste wartości usuwają dany filtr.
3. Zmień stronę paginacji w obrębie bieżącego widoku —
   aktywne filtry pozostają zachowane i są uwzględniane
   w kolejnym zapytaniu do API.
4. Zaznacz wiersz i kliknij „Wyświetl zaznaczony”, aby pokazać jego dane
   nad tabelą. Przycisk „Zamknij” ukrywa panel i przywraca fokus na przycisk
   wyświetlania rekordu.
5. Rozwiń wiersz przyciskiem w pierwszej kolumnie, aby zobaczyć dodatkowe pola.
6. Kliknij „Refresh”, aby ponowić zapytanie z aktualnymi parametrami.

Błąd pobierania jest prezentowany komunikatem z przyciskiem „Spróbuj ponownie”.
Na małych ekranach tabela przewija się poziomo, a Kendo synchronizuje nagłówek
z wierszami. Paginacja jest responsywna, a przyciski nad tabelą mogą się zawijać.
Status lub dostępność są również prezentowane jako dane — kolor nie jest ich
jedynym oznaczeniem.

## Przepływ danych i filtrowanie

```text
Interakcja w GridWrapper
  → aktualizacja stanu w ProductsPage / OrdersPage
  → debounce filtra (400 ms)
  → buildLikeFilters: konfiguracja kolumn → parametry *_like
  → RTK Query → HTTP GET
  → odpowiedź API: data + meta → GridWrapper
```

Endpointy względem `VITE_API_URL`:

- `GET products`
- `GET orders`

Przykładowe parametry budowane przez aplikację:

```text
products?page=2&limit=10&name_like=Sonora&price_like=200.50
orders?page=1&limit=10&status_like=paid&currency_like=USD
```

Wszystkie filtry korzystają z `_like`, również wartości z dropdownu oraz inputy
kolumn liczbowych. Wartości są wysyłane jako tekst; aplikacja nie implementuje
zakresów liczbowych ani osobnego operatora równości. Ostateczne dopasowanie
rekordów wykonuje API.

W czasie debounce zapytanie jest wstrzymane przez `skip`, aby nie pobierać danych
z nieaktualnym filtrem. Stan odpowiedzi pozostaje w RTK Query, a lokalny stan
React przechowuje ustawienia widoku i interakcji. `GridWrapper` nie wykonuje
zapytań HTTP ani nie zna nazw endpointów.

W trybie deweloperskim przed zapytaniem dodawane jest **500 ms opóźnienia**, aby
ułatwić obserwację preloadera. Opóźnienie nie jest dodawane w buildzie produkcyjnym.

## Architektura

```text
src/
├── app/                       # Providery, Redux store, routing i układ
├── features/
│   ├── products/              # Widok, model, kolumny i endpoint produktów
│   └── orders/                # Widok, model, kolumny i endpoint zamówień
├── shared/
│   ├── api/                   # baseApi, kontrakty odpowiedzi, mapper filtrów
│   ├── components/
│   │   ├── GridWrapper/       # Kendo Grid, filtry, zaznaczenie i panel rekordu
│   │   ├── LoadingOverlay/    # Wskaźnik ładowania
│   │   ├── RecordDetails/     # Rozwinięte szczegóły
│   │   └── RecordFields/      # Prezentacja pól, w tym obiektów zagnieżdżonych
│   └── hooks/                 # useDebounce
└── styles/                    # Globalne style i tokeny

tests/                         # Konfiguracja środowiska testowego i MSW
```

Kierunek zależności to `App → Features → Shared`. Reguły ESLint kontrolują
granice modułów. Nie ma dodatkowych Redux slices kopiujących stan serwerowy.

### Kontrakt GridWrapper

[GridWrapper.types.ts](src/shared/components/GridWrapper/GridWrapper.types.ts)
definiuje publiczne API komponentu:

| Parametry | Odpowiedzialność |
| --- | --- |
| `data`, `columns` | Rekordy bieżącej strony i konfiguracja kolumn powiązana z `keyof T`. |
| `pagination` | Numer strony, rozmiar strony, liczba rekordów i callback zmiany. |
| `filter`, `onFilterChange` | Kontrolowany stan filtrów Kendo. |
| `dataItemKey`, `selectedId`, `onSelectionChange` | Identyfikacja i zaznaczenie rekordu; identyfikator może być tekstem lub liczbą. |
| `detail` | Komponent prezentujący rozwinięte szczegóły. |
| `loading`, `message`, `onRefresh` | Wskaźnik ładowania, komunikat i callback odświeżania. |
| `rowClassName` | Warunkowe przypisanie klasy CSS do rekordu. |

Dodanie kolejnego zbioru danych wymaga przygotowania jego modelu, kolumn,
zapytania i widoku. Nie wymaga dopisywania logiki biznesowej do `GridWrapper`.

Szerokości kolumn można ustawiać indywidualnie. Minimalna szerokość tabeli
chroni kolumny bez `width` przed nadmiernym ściśnięciem na telefonie, bez
przypisywania im sztywnej szerokości. Portal loadera umieszcza nakładkę w
kontenerze wierszy Kendo, dzięki czemu nie zasłania filtrów i paginacji.

## Technologie i typowanie

- React 19.3.0, TypeScript 5.9.3 i Vite 8.3.4.
- KendoReact Grid 16.2.0 i motyw Kendo Default 14.6.1.
- Redux Toolkit 2.13.0 z RTK Query oraz React Router.
- CSS Modules, ESLint, Vitest, React Testing Library i MSW.

Włączone są `strict`, `noImplicitAny`, `strictNullChecks`,
`noUncheckedIndexedAccess` i `exactOptionalPropertyTypes`. Konfiguracja aplikacji
ma `skipLibCheck: true`: kod aplikacji jest sprawdzany, ale deklaracje zależności
nie są w pełni kontrolowane. Typy odpowiedzi API opisują oczekiwany kontrakt;
nie stanowią walidacji danych w czasie wykonania.

Instalacja przez `npm ci` nakłada patch deklaracji Redux Toolkit z katalogu
`patches/` przy użyciu `patch-package`. Poprawka dotyczy typów, nie kodu
wykonywalnego biblioteki. Wersje zależności utrwala `package-lock.json`.

## Kontrola jakości

| Polecenie | Działanie |
| --- | --- |
| `npm run typecheck` | Sprawdzenie typów aplikacji, testów i konfiguracji Vite. |
| `npm run lint` | ESLint z kontrolą granic modułów i bez dopuszczalnych ostrzeżeń. |
| `npm run test:run` | Jednorazowe uruchomienie testów. |
| `npm test` | Testy w trybie obserwowania zmian. |
| `npm run build` | Typecheck i przygotowanie plików produkcyjnych w `dist/`. |
| `npm run preview` | Lokalny podgląd wcześniej zbudowanej aplikacji. |

Testy obejmują routing i nawigację klawiaturą, mapowanie filtrów, zapytania
serwerowe, zachowanie parametrów podczas paginacji i Refresh, zaznaczanie,
wyświetlanie danych oraz rozwijanie szczegółów. MSW przechwytuje zapytania
na osobny adres testowy, więc testy nie wymagają dostępności SondaHub.

Vitest przetwarza CSS, aby uwzględniać widoczność elementów. Test zaznaczania
jawnie wskazuje wynik `elementFromPoint`, ponieważ jsdom nie wylicza geometrii
strony. Testy w jsdom nie zastępują sprawdzenia rzeczywistego układu mobilnego.

## KendoReact i publikacja

KendoReact podlega warunkom licencji producenta. Konfigurację klucza opisuje
[dokumentacja licencjonowania Telerik](https://www.telerik.com/kendo-react-ui/components/my-license/).
Pliki `telerik-license.txt` i `kendo-ui-license.txt` są ignorowane przez Git.
Klucza licencyjnego nie należy umieszczać w zmiennych `VITE_`.

Podczas budowania należy ustawić `VITE_API_URL`. Hosting aplikacji powinien
obsługiwać przekierowanie nieznanych ścieżek do `index.html`, aby bezpośrednie
wejścia na `/products` i `/orders` działały z `BrowserRouter`.
