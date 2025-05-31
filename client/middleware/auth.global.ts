// middleware/auth.global.ts

export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = Store.session.user;

  // Vérifier si le chemin commence par "/dashboard"
  // Si l'utilisateur n'est pas authentifié, rediriger vers la page login

  if (
    !user &&
    !(
      to.path.startsWith("/session") ||
      to.path.startsWith("/welcome") ||
      to.path.startsWith("/share")
    )
  ) {
    const localPath = useLocalePath();
    return navigateTo(localPath({ name: "welcome", query: { next: to.path } }));
  }
});
