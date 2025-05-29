export default function generatePassword(length = 16) {
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const specialChars = "!@#$%^&*()_+[]{};':\"\\|,.<>/?`~-";
  const allChars = lowerCase + upperCase + digits + specialChars;

  let password = "";

  // S'assurer que le mot de passe contient au moins un de chaque type de caractère
  password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
  password += upperCase[Math.floor(Math.random() * upperCase.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Compléter le reste du mot de passe avec des caractères aléatoires
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Mélanger le mot de passe pour éviter un ordre prévisible
  password = password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  return password;
}
