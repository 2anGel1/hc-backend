const bcrypt = require('bcrypt');

// Fonction pour hasher un mot de passe
export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};