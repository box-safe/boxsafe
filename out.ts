interface User {
  id: number;
  name: string;
  email?: string;
}

const currentUser: User = {
  id: 1,
  name: "Alice Smith",
};

function greetUser(user: User): string {
  return `Hello, ${user.name}! Your ID is ${user.id}.`;
}

console.log(greetUser(currentUser));