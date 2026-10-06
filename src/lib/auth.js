export function createLocalAccount(users, username, password, confirmation) {
  const cleanUsername = username.trim();

  if (!cleanUsername || !password || !confirmation) {
    return { error: 'Completá todos los campos.' };
  }
  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' };
  }
  if (password !== confirmation) {
    return { error: 'Las contraseñas no coinciden.' };
  }
  if (users.some((user) => user.username.toLowerCase() === cleanUsername.toLowerCase())) {
    return { error: 'Ese usuario ya está registrado.' };
  }

  const user = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    username: cleanUsername,
    password,
  };

  return { user, users: [...users, user] };
}

export function authenticateLocalUser(users, username, password) {
  return (
    users.find(
      (user) =>
        user.username.toLowerCase() === username.trim().toLowerCase() &&
        user.password === password,
    ) ?? null
  );
}
