const express = require('express'); // Importa Express per creare il server web
const path = require('path'); // Modulo per lavorare con i percorsi dei file
const UsersComponent = require('./UsersComponent'); // Importa la classe che gestisce gli utenti
const app = express();
const PORT = 8080;

const usersComponent = new UsersComponent('./state.json'); // Istanzia la classe e salva i dati in state.json

app.use(express.urlencoded({ extended: true })); // Permette di leggere i dati inviati da un form HTML
app.use(express.static(path.join(__dirname, '../public'))); // Rende disponibili i file statici della cartella 'public'

// Mostra la homepage iniziale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Mostra la pagina di login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Mostra la homepage dopo il login
app.get('/homepage', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'homepage.html'));
});

// Gestisce il login e controlla le credenziali
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const isAuthenticated = await usersComponent.login(email, password);

  if (isAuthenticated) {
    res.redirect('/homepage'); // Login corretto → vai alla homepage
  } else {
    res.status(401).sendFile(path.join(__dirname, '../public', 'login_error.html')); // Login errato
  }
});

// Mostra la pagina di registrazione
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'signup.html'));
});

// Gestisce la registrazione di un nuovo utente
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const userExists = await usersComponent.userExists(email);

  if (userExists) {
    res.status(409).sendFile(path.join(__dirname, '../public', 'user_exists.html')); // L'utente esiste già
  } else {
    await usersComponent.create({ email, password }); // Crea il nuovo utente
    res.sendFile(path.join(__dirname, '../public', 'signup_success.html')); // Registrazione riuscita
  }
});

// Mostra la pagina per cambiare password
app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'reset_password.html'));
});

// Gestisce l'aggiornamento della password
app.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const userExists = await usersComponent.userExists(email);

  if (!userExists) {
    return res.status(404).sendFile(path.join(__dirname, '../public', 'user_not_found.html')); // Utente non trovato
  }

  await usersComponent.updatePassword(email, newPassword); // Aggiorna la password
  res.sendFile(path.join(__dirname, '../public', 'password_updated.html')); // Conferma aggiornamento
});

// Rotta di test
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'signup_success.html'));
});

// Avvia il server
app.listen(PORT, () => console.log('Server in ascolto sulla porta', PORT));