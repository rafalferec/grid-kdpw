# Standardy inżynierskie projektu KDPW

## 1. Cel i zakres

Projekt jest zadaniem rekrutacyjnym dla KDPW. Pracuj z perspektywy Principal
Frontend Engineera, architekta oprogramowania i doświadczonego recenzenta kodu.
Oczekiwana jakość rozwiązania odpowiada poziomowi Senior Frontend Developera.

Priorytety:

- poprawność działania;
- bezpieczeństwo typów;
- czytelna architektura;
- generyczność komponentów;
- łatwość utrzymania;
- testowalność;
- wydajność;
- dostępność;
- zgodność z wymaganiami rekrutacyjnymi.

Zasady obowiązują w całym projekcie. Opis docelowej aplikacji nie jest poleceniem
jej wdrożenia. Realizuj wyłącznie etap zlecony przez użytkownika.

## 2. Docelowy stos i wymagania aplikacji

Stos technologiczny:

- React 19;
- TypeScript w trybie strict;
- Vite;
- KendoReact Grid;
- Redux Toolkit;
- RTK Query;
- CSS Modules;
- Vitest;
- React Testing Library;
- MSW.

Aplikacja będzie zawierać widoki `Products` i `Orders`. Oba muszą korzystać
z tego samego generycznego komponentu `GridWrapper<T>`.

Źródłem danych jest publiczne API `https://api.sondahub.com/v1/store/`.
Względem tego adresu bazowego przewidziane są endpointy:

- `GET /products`;
- `GET /orders`.

Pobieranie danych, filtrowanie i paginacja muszą być realizowane po stronie
serwera. Nie zastępuj ich operacjami na lokalnej kolekcji rekordów.

## 3. Pragmatyczne stosowanie SOLID

### Single Responsibility Principle

Każdy komponent, hook, serwis i funkcja mają jedną jasno określoną
odpowiedzialność. Przyjmij następujący podział:

- `GridWrapper`: prezentacja tabeli i obsługa interakcji;
- `ProductsPage`: konfiguracja widoku produktów;
- `OrdersPage`: konfiguracja widoku zamówień;
- RTK Query: pobieranie danych i zarządzanie cache;
- adaptery API: mapowanie filtrów na parametry HTTP.

### Open/Closed Principle

Rozszerzaj funkcjonalność `GridWrapper` przez konfigurację propsów.
Dodanie kolejnego modelu danych nie może wymagać modyfikacji komponentu.

### Liskov Substitution Principle

`GridWrapper` musi działać poprawnie z różnymi modelami danych. Nie zakładaj,
że rekord zawsze posiada pole `id` ani że identyfikator ma typ `number`.
Sposób identyfikowania rekordów musi być konfigurowalny.

### Interface Segregation Principle

Projektuj spójne, niewielkie interfejsy. Nie twórz ogromnych kontraktów
z niepowiązanymi obowiązkowymi właściwościami. Funkcjonalności opcjonalne
muszą być odpowiednio typowane.

### Dependency Inversion Principle

`GridWrapper` zależy wyłącznie od własnych generycznych kontraktów TypeScript.
Nie może zależeć od modeli `Product` i `Order`, SondaHub, RTK Query ani
konkretnych endpointów.

## 4. Pozostałe zasady projektowe

- **DRY:** nie duplikuj logiki.
- **KISS:** preferuj najprostsze poprawne rozwiązanie.
- **YAGNI:** nie implementuj funkcjonalności, które nie są potrzebne.
- **Separation of Concerns:** oddzielaj logikę biznesową, komunikację z API
  i prezentację.
- **Composition over Inheritance:** preferuj kompozycję komponentów.
- **High Cohesion / Low Coupling:** utrzymuj wysoką spójność modułów
  i możliwie niewielkie zależności między nimi.
- **Single Source of Truth:** nie przechowuj tego samego stanu w kilku
  niezależnych miejscach.

## 5. TypeScript

Podczas etapu konfiguracji TypeScript włącz następujące opcje:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

Zabronione są:

- używanie `any`;
- `@ts-ignore` i `@ts-nocheck`;
- nieuzasadnione rzutowania typów;
- wyłączanie kontroli TypeScript;
- rzutowania służące wyłącznie uciszeniu kompilatora.

Preferuj generics, `keyof`, `unknown` z zawężaniem typów, discriminated unions,
type guards, `satisfies` oraz jawne typy domenowe.

Wszystkie publiczne API komponentów muszą mieć poprawne typowanie.

## 6. React i stan aplikacji

- Stosuj komponenty funkcyjne i przestrzegaj Rules of Hooks.
- Nie używaj `useEffect` do obliczania wartości, które można wyliczyć podczas
  renderowania.
- Nie duplikuj danych pochodzących z API w dodatkowym stanie.
- Stan serwerowy obsługuj przez RTK Query.
- Stan lokalny UI obsługuj przez React, jeżeli nie ma uzasadnienia dla Redux.
- Nie stosuj `useMemo` i `useCallback` automatycznie. Każda optymalizacja
  musi mieć uzasadnienie.
- Stosuj stabilne identyfikatory rekordów.
- Nie mutuj stanu React bezpośrednio.

## 7. Architektura feature-based

Podziel aplikację na następujące obszary:

```text
app/
shared/
features/
styles/
```

- `app/`: konfiguracja aplikacji, providery i Redux store;
- `shared/`: wyłącznie elementy niezależne od konkretnej domeny;
- `features/`: logika biznesowa i poszczególne funkcjonalności;
- `styles/`: wspólne style aplikacji; style komponentów twórz z użyciem
  CSS Modules.

Kierunek zależności: `App -> Features -> Shared`.

`Shared` nie może importować modułów `Features`. Unikaj zależności cyklicznych
i nie twórz zbędnych abstrakcji.

## 8. Kontrakt i odpowiedzialność GridWrapper<T>

`GridWrapper<T>` musi być uniwersalny i obsługiwać:

- konfigurację kolumn;
- konfigurowalne filtrowanie dowolnej kolumny;
- filtr z inputem tekstowym;
- filtr typu dropdown;
- jednoczesne filtrowanie wielu kolumn;
- paginację serwerową;
- stan loading;
- odświeżanie danych (refresh);
- zaznaczanie wierszy;
- rozwijanie wierszy;
- wyświetlanie zaznaczonych danych;
- warunkowe kolorowanie wierszy.

Konfiguracja kolumn i filtrów musi umożliwiać określenie:

- pola;
- tytułu;
- typu filtra;
- dostępnych opcji;
- aktualnej wartości;
- obsługi zmiany wartości.

Komponent nie może zawierać nazw pól biznesowych ani wykonywać zapytań HTTP.
Mapowanie filtrów na parametry API i budowanie parametrów muszą odbywać się
poza `GridWrapper`.

Nie stosuj lokalnego filtrowania ani lokalnej paginacji. Nie używaj
`process()` z Kendo data-query do realizacji operacji serwerowych.

## 9. Komunikacja z API i RTK Query

Wykorzystaj Redux Toolkit i RTK Query. RTK Query odpowiada za:

- pobieranie danych;
- cache;
- stan loading;
- stan fetching;
- obsługę błędów;
- ponowne pobieranie danych.

Nie twórz dodatkowych Redux slices, jeżeli nie są potrzebne. Nie przechowuj
kopii danych z RTK Query w zwykłym Redux slice.

Parametry API buduj poza `GridWrapper`, zachowując rozdzielenie komunikacji
z API od prezentacji i interakcji tabeli.

## 10. Dostępność

Uwzględnij WCAG 2.2 AA w zakresie mającym zastosowanie do aplikacji.
Zapewnij:

- obsługę klawiatury;
- widoczny focus;
- odpowiedni kontrast;
- semantyczny HTML;
- etykiety formularzy;
- zrozumiałe komunikaty błędów;
- czytelne stany loading.

Nie usuwaj mechanizmów dostępności zapewnianych przez KendoReact.
Kolor nie może być jedynym sposobem przekazywania informacji o statusie.

## 11. Jakość kodu i nazewnictwo

Kod ma być czytelny, modularny, przewidywalny, testowalny i łatwy w utrzymaniu.

Unikaj:

- magicznych wartości;
- niepotrzebnych zależności;
- duplikacji kodu;
- nadmiernego zagnieżdżania;
- ogromnych komponentów;
- ukrytych efektów ubocznych;
- nieuzasadnionych abstrakcji.

Stosuj czytelne nazewnictwo. Nazwy plików, funkcji, zmiennych, typów
i interfejsów zapisuj po angielsku. Dokumentację i komentarze opisowe
przygotowuj po polsku. Nie dodawaj komentarzy opisujących oczywiste
działanie kodu.

## 12. Etapy pracy i weryfikacja

Pracuj etapami. Nie implementuj funkcjonalności z kolejnych etapów bez
polecenia użytkownika.

Po zakończeniu każdego etapu:

1. Podsumuj wykonane prace.
2. Wypisz utworzone i zmodyfikowane pliki.
3. Opisz najważniejsze decyzje.
4. Uruchom możliwe kontrole jakości i podaj ich rzeczywiste wyniki.
5. Wskaż ewentualne problemy.
6. Zatrzymaj pracę i czekaj na kolejny etap.

Nie deklaruj, że testy przeszły, jeżeli nie zostały uruchomione. Nie deklaruj,
że aplikacja działa w przeglądarce, jeżeli nie została rzeczywiście sprawdzona.
Nie pozostawiaj atrap wymaganych funkcji.

## 13. Zakres etapu przygotowania standardów

Polecenie dla tego etapu obejmuje analizę istniejącego repozytorium oraz
utworzenie tego pliku `AGENTS.md` z uporządkowanymi zasadami projektu.

W tym etapie:

- nie instaluj zależności;
- nie implementuj aplikacji;
- nie twórz komponentów;
- nie konfiguruj jeszcze Redux Toolkit.

Po utworzeniu `AGENTS.md` wykonaj możliwe kontrole dokumentu, przedstaw
krótkie podsumowanie i zakończ pracę. Kontynuuj dopiero po poleceniu
użytkownika dotyczącym kolejnego etapu.
