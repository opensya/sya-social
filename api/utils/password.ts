import crypto from "node:crypto";

export function generatePassword(length = 16) {
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const specialChars = "!@#$%^&*()_+[]{};':\"\\|,.<>/?`~-";
  const allChars = lowerCase + upperCase + digits + specialChars;

  function getRandomInt(max: number) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  }

  let password = "";
  password += lowerCase[getRandomInt(lowerCase.length)];
  password += upperCase[getRandomInt(upperCase.length)];
  password += digits[getRandomInt(digits.length)];
  password += specialChars[getRandomInt(specialChars.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[getRandomInt(allChars.length)];
  }

  // Mélange sécurisé
  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return password;
}

export function isValidPassword(password: string, minLength = 8) {
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?`~\-]/.test(
    password,
  );
  const isLongEnough = password.length >= minLength;

  return {
    valid:
      hasLowerCase &&
      hasUpperCase &&
      hasDigit &&
      hasSpecialChar &&
      isLongEnough,
    details: {
      isLongEnough,
      hasLowerCase,
      hasUpperCase,
      hasDigit,
      hasSpecialChar,
    },
  };
}

// console.log(isValidPassword(generatePassword(22)));
