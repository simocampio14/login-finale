const fs = require('fs'); // Modulo per lavorare con i file
const bcrypt = require('bcrypt'); // Libreria per criptare le password
const SALT_ROUNDS = 10; // Livello di sicurezza della criptazione

class UsersComponent {
  constructor(statePath) {
    this.statePath = statePath;

    // Prova a leggere il file con gli utenti
    try {
      this.users = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    } catch (err) {
      console.log(err.message);

      // Se il file non esiste o è vuoto, inizializza un oggetto vuoto
      this.users = {};
      this.serialize(); // Crea il file
    }
  }

  // Scrive i dati aggiornati nel file
  serialize() {
    fs.writeFileSync(this.statePath, JSON.stringify(this.users, null, 2));
  }

  // Crea un nuovo utente con password criptata
  async create(data) {
    const { email, password } = data;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    this.users[email] = { email, password: hashedPassword };
    this.serialize();
  }

  // Verifica le credenziali per il login
  async login(email, password) {
    const user = this.users[email];
    if (user && await bcrypt.compare(password, user.password)) {
      return true;
    }
    return false;
  }

  // Controlla se un utente esiste
  async userExists(email) {
    return !!this.users[email];
  }

  // Aggiorna la password di un utente già registrato
  async updatePassword(email, newPassword) {
    if (!this.users[email]) {
      return false;
    }
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    this.users[email].password = hashedPassword;
    this.serialize();
    return true;
  }
}

module.exports = UsersComponent; // Esporta la classe per usarla in altri file