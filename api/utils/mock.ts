import { User } from "database/entitys/User";
import dayjs from "dayjs";
import randomatic from "randomatic";

// Fonction pour générer une date de naissance au hasard, supérieure à 18 ans et inférieure à 70 ans
function mockBirthDate() {
  const aujourdHui = new Date();

  // Calcul de la date limite pour être majeur (18 ans avant aujourd'hui)
  const dateLimite18 = new Date(
    aujourdHui.setFullYear(aujourdHui.getFullYear() - 18),
  );

  // Calcul de la date limite pour être inférieur à 70 ans (70 ans avant aujourd'hui)
  const dateLimite70 = new Date(
    aujourdHui.setFullYear(aujourdHui.getFullYear() - 70),
  );

  // Générer une date de naissance entre 18 et 70 ans
  const anneeNaissance = Math.floor(
    Math.random() * (dateLimite18.getFullYear() - dateLimite70.getFullYear()) +
      dateLimite70.getFullYear(),
  );
  const moisNaissance = Math.floor(Math.random() * 12); // entre 0 (janvier) et 11 (décembre)
  const jourNaissance =
    Math.floor(
      Math.random() * new Date(anneeNaissance, moisNaissance + 1, 0).getDate(),
    ) + 1; // entre 1 et le dernier jour du mois

  // Retourner la date de naissance générée
  return new Date(anneeNaissance, moisNaissance, jourNaissance);
}

function generatePassword(length = 16) {
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

// Listes de prénoms, noms
const firstNames: string[] = [
  "male:Ali",
  "male:Mamadou",
  "male:Omar",
  "male:Moussa",
  "male:Ibrahima",
  "male:Babacar",
  "male:Amadou",
  "male:Cheikh",
  "male:Modou",
  "male:Demba",
  "male:Ousmane",
  "male:Serigne",
  "male:Lamine",
  "male:Tidiane",
  "male:Abdou",
  "male:Moustapha",
  "male:Samba",
  "male:Seydou",
  "male:Malick",
  "male:Assane",
  "male:Pape",
  "male:Daouda",
  "male:Birame",
  "male:Boubacar",
  "male:Fadel",
  "female:Aissatou",
  "female:Fatou",
  "female:Ndeye",
  "female:Seynabou",
  "female:Adja",
  "female:Coumba",
  "female:Diarra",
  "female:Khady",
  "female:Mariama",
  "female:Sokhna",
  "female:Yacine",
  "female:Astou",
  "female:Bineta",
  "female:Ramatoulaye",
  "female:Dieynaba",
  "female:Ami",
  "female:Fama",
  "female:Ndèye Marie",
  "female:Dior",
  "female:Hawa",
  "female:Kadiatou",
  "female:Maguette",
  "female:Safietou",
  "female:Kiné",
  "female:Anta",
];

const lastNames: string[] = [
  "Diouf",
  "Seck",
  "Sow",
  "Ba",
  "Diagne",
  "Ndiaye",
  "Fall",
  "Diatta",
  "Sarr",
  "Thiam",
  "Faye",
  "Sy",
  "Camara",
  "Gaye",
  "Toure",
  "Cisse",
  "Kane",
  "Gueye",
  "Mbaye",
  "Sene",
  "Dieng",
  "Barry",
  "Diallo",
  "Khouma",
  "Baldé",
  "Ndour",
  "Mbengue",
  "Ly",
  "Wade",
  "Ka",
  "Sagna",
  "Coly",
  "Gassama",
  "Beye",
  "Tall",
  "Konte",
  "Sané",
  "Badiane",
  "Sylla",
  "Dabo",
  "Soumaré",
  "Hanne",
  "Nguirane",
  "Mendy",
  "Bousso",
  "Samb",
  "Niang",
  "Dieye",
  "Goudiaby",
  "Faty",
];

// Fonction qui choisit un prénom, un nom et le sexe associé au prénom
function mockIdentity() {
  const prenomIndex = Math.floor(Math.random() * firstNames.length);
  const firstName = firstNames[prenomIndex];
  const lastNameIndex = Math.floor(Math.random() * lastNames.length);
  const lastName = lastNames[lastNameIndex];
  const sexe = firstName.startsWith("male") ? "male" : "female";

  return {
    firstName: firstName.split(":")[1],
    lastName: lastName,
    sexe: sexe,
    email:
      `${firstName.split(":")[1]}_${lastName}_${randomatic("a", 3)}@example.com`.toLowerCase(),
  };
}

// Afficher la date de naissance générée

export default async function (length = 100) {
  // Liste des localités du Sénégal
  const localites: string[] = [
    "Dakar",
    "Pikine",
    "Guédiawaye",
    "Rufisque",
    "Bargny",
    "Thiès",
    "Tivaouane",
    "Mbour",
    "Joal-Fadiouth",
    "Kayar",
    "Saint-Louis",
    "Richard-Toll",
    "Dagana",
    "Podor",
    "Gandon",
    "Kaolack",
    "Guinguinéo",
    "Nioro du Rip",
    "Kaffrine",
    "Kahone",
    "Ziguinchor",
    "Bignona",
    "Oussouye",
    "Cap Skirring",
    "Goudomp",
    "Kolda",
    "Vélingara",
    "Médina Yoro Foulah",
    "Kounkané",
    "Dabo",
    "Matam",
    "Ranérou",
    "Kanel",
    "Ourossogui",
    "Thilogne",
    "Tambacounda",
    "Bakel",
    "Goudiry",
    "Koumpentoum",
    "Kidira",
    "Louga",
    "Kébémer",
    "Linguère",
    "Sakal",
    "Dahra",
    "Fatick",
    "Foundiougne",
    "Gossas",
    "Sokone",
    "Niakhar",
    "Diourbel",
    "Bambey",
    "Mbacké",
    "Touba",
    "Ndindy",
    "Kédougou",
    "Salémata",
    "Saraya",
    "Dindéfélo",
    "Fongolimbi",
    "Sédhiou",
    "Bounkiling",
    "Goudomp",
    "Diattacounda",
    "Tanaff",
  ];

  for (let i = 0; i < length; i++) {
    const mock = mockIdentity();
    const user = new User();
    user.name = `${mock.firstName} ${mock.lastName}`;
    user.email = mock.email;
    user.password = { plain: generatePassword() };
    user.username = `${user.name.split(" ").join("_")}_${randomatic("A0", 8)}`;

    await user.save();

    // const user = {
    //   ...mockIdentity(),

    //   //   birthPlace: localites[Math.floor(Math.random() * localites.length)],
    //   //   birthDate: dayjs(mockBirthDate()).format("YYYY-MM-DD"),
    // };
  }
}

// Fonction principale pour générer des employés et leurs contrats
