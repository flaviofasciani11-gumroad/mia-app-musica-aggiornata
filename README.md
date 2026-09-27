# Neon Pulse Music

Crea un'app di streaming musicale mobile-first completa, ultra-moderna e pronta per la monetizzazione, strutturata esattamente con le seguenti caratteristiche:

1. INTERFACCIA GRAFICA E DOPPIO TEMA:

- Di base, usa un tema scuro ultra-moderno stile Cyberpunk/Neon (Colori: Nero Profondo, Viola Elettrico #A020F0 e dettagli Verde Neon) con animazioni fluide sulle copertine dei brani.

- Inserisci una schermata "Impostazioni" nel profilo con un interruttore (Toggle) fluido per cambiare istantaneamente l'interfaccia a un tema chiaro elegante (Sfondo Bianco/Grigio chiaro, dettagli Viola scuro).

2. FUNZIONALITÀ DI RIPRODUZIONE, RICERCA E PLAYLIST:

- BARRA DI RICERCA: Funzionante e connessa a un sistema di riproduzione. Permette di cercare canzoni reali, visualizzare i risultati corretti e riprodurle in tempo reale nell'app tramite un player audio completo (Play, Pausa, Skip, Barra di avanzamento).

- SEZIONE PLAYLIST: L'utente deve poter creare nuove playlist personalizzate, assegnare un nome, aggiungere i brani cercati direttamente dal player e rimuoverli.

- TIMER SPEGNIMENTO: Un selettore nelle impostazioni che permette di impostare un timer (15, 30, 60 minuti) per interrompere automaticamente la musica.

3. AUTENTICAZIONE E CRONOLOGIA:

- Sistema di Login e Registrazione funzionante. Quando l'utente è loggato, l'app salva sul suo profilo la cronologia dei brani ascoltati e la lista dei Preferiti.

4. STRATEGIA DI MONETIZZAZIONE E PAYWALL AGGRESSIVO:

- POP-UP ALL'APERTURA: Ogni singola volta che l'app viene aperta da un utente FREE, appare un pop-up a tutto schermo (Modal Paywall) che promuove l'abbonamento Premium a 4,99€/mese. Mostra un pulsante gigante "Passa a Premium Ora" e una piccola "X" per chiuderlo che appare solo dopo un timer di 3 secondi.

- BLOCCO OGNI 10 CANZONI: Un contatore interno interrompe la musica esattamente ogni 10 brani per gli utenti FREE, mostrando un pop-up bloccante: "Hai raggiunto il limite FREE. Passa a Premium o guarda una pubblicità per sbloccare altri 10 brani".

- PUBBLICITÀ FREE: Gli utenti Free vedono finti banner pubblicitari grafici realistici nella schermata principale.

- VANTAGGI PREMIUM: Gli utenti Premium hanno un badge "PRO" dorato, 0 pubblicità, sbloccano una funzione di "Equalizzatore Audio Avanzato", la selezione della Qualità Audio HD (320kbps) e il pulsante "Backup Cloud dei Dati".

5. SCHERMATA DI PAGAMENTO (CHECK-OUT):

- Cliccando su "Passa a Premium", si apre una schermata di check-out simulata, elegante e accattivante, per l'inserimento della carta di credito (predisposta per l'integrazione con Stripe).

Genera tutte le schermate navigabili (Home, Ricerca, Playlist, Profilo, Impostazioni, Player) con transizioni perfette.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cosmic-chord-play.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fe712be6-9994-4f55-81ad-7c747d7bd5ce).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
