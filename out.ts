interface Greeter {
  greet(name: string): string;
}

class ConsoleGreeter implements Greeter {
  greet(name: string): string {
    return `Hello, ${name}!`;
  }
}

const greeter: Greeter = new ConsoleGreeter();
console.log(greeter.greet("TypeScript")); // Outputs: Hello, TypeScript!

type User = {
  id: number;
  name: string;
  email?: string;
};

const user1: User = { id: 1, name: "Alice" };
const user2: User = { id: 2, name: "Bob", email: "bob@example.com" };

function displayUser(user: User): void {
  console.log(`User ID: ${user.id}, Name: ${user.name}`);
  if (user.email) {
    console.log(`Email: ${user.email}`);
  }
}

displayUser(user1);
displayUser(user2);

enum Status {
  Pending,
  Active,
  Inactive,
  Deleted,
}

let currentStatus: Status = Status.Active;

if (currentStatus === Status.Active) {
  console.log("The current status is Active.");
}