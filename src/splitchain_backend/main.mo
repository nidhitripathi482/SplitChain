import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Iter "mo:base/Iter";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Buffer "mo:base/Buffer";

actor SplitChainBackend {

  // Types
  public type User = {
    username: Text;
    principal: Principal;
    splitTokens: Nat;
    createdAt: Nat;
  };

  public type PaymentSession = {
    id: Text;
    name: Text;
    creator: Principal;
    totalAmount: Float;
    currency: Text;
    payoutCurrency: Text;
    participants: [Principal];
    payments: [(Principal, Bool, ?Text)];
    createdAt: Nat;
    status: Text;
  };

  public type Transaction = {
    id: Text;
    sessionId: Text;
    from: Principal;
    to: ?Principal;
    amount: Float;
    token: Text;
    timestamp: Nat;
    status: Text;
  };

  // Stable State
  private stable var userEntries: [(Principal, User)] = [];
  private stable var usernameEntries: [(Text, Principal)] = [];
  private stable var sessionEntries: [(Text, PaymentSession)] = [];
  private stable var transactionEntries: [(Text, Transaction)] = [];

private var users = HashMap.fromIter<Principal, User>(
  Iter.fromArray<(Principal, User)>(userEntries),
  10,
  Principal.equal,
  Principal.hash
);
 private var usernames = HashMap.fromIter<Text, Principal>(
  Iter.fromArray<(Text, Principal)>(usernameEntries),
  10,
  Text.equal,
  Text.hash
);

private var sessions = HashMap.fromIter<Text, PaymentSession>(
  Iter.fromArray<(Text, PaymentSession)>(sessionEntries),
  10,
  Text.equal,
  Text.hash
);

private var transactions = HashMap.fromIter<Text, Transaction>(
  Iter.fromArray<(Text, Transaction)>(transactionEntries),
  10,
  Text.equal,
  Text.hash
);

  // User Management
  public shared(msg) func createUser(username: Text): async Result.Result<User, Text> {
    let caller = msg.caller;
    switch (usernames.get(username)) {
      case (?_) { #err("Username already taken") };
      case null {
        switch (users.get(caller)) {
          case (?_) { #err("User already exists") };
          case null {
            let user: User = {
              username = username;
              principal = caller;
              splitTokens = 100;
              createdAt = Time.now();
            };
            users.put(caller, user);
            usernames.put(username, caller);
            #ok(user)
          };
        };
      };
    };
  };

  public query func getUser(principal: Principal): async ?User {
    users.get(principal)
  };

  public query func getUserByUsername(username: Text): async ?User {
    switch (usernames.get(username)) {
      case (?principal) { users.get(principal) };
      case null { null };
    };
  };

  public query func checkUsernameAvailable(username: Text): async Bool {
    switch (usernames.get(username)) {
      case (?_) { false };
      case null { true };
    };
  };

  // Session Management
  public shared(msg) func createSession(
    name: Text,
    totalAmount: Float,
    currency: Text,
    payoutCurrency: Text,
    participantUsernames: [Text]
  ): async Result.Result<PaymentSession, Text> {
    let caller = msg.caller;

    switch (users.get(caller)) {
      case null { #err("User not registered") };
      case (?_) {
        let buffer = Buffer.Buffer<Principal>(participantUsernames.size());
        for (username in participantUsernames.vals()) {
          switch (usernames.get(username)) {
            case (?principal) {
              Buffer.add(buffer, principal);
            };
            case null {
              return #err("Participant not found: " # username);
            };
          };
        };
        let participants = Buffer.toArray(buffer);

        let sessionId = generateId();
        let session: PaymentSession = {
          id = sessionId;
          name = name;
          creator = caller;
          totalAmount = totalAmount;
          currency = currency;
          payoutCurrency = payoutCurrency;
          participants = participants;
          payments = Array.map(participants, func(p) = (p, false, null));
          createdAt = Time.now();
          status = "active";
        };

        sessions.put(sessionId, session);
        #ok(session)
      };
    };
  };

  public query func getSession(sessionId: Text): async ?PaymentSession {
    sessions.get(sessionId)
  };

  public shared(msg) func joinSession(sessionId: Text): async Result.Result<PaymentSession, Text> {
    let caller = msg.caller;
    switch (sessions.get(sessionId)) {
      case null { #err("Session not found") };
      case (?session) {
        let isParticipant = Array.find(session.participants, func(p) = Principal.equal(p, caller));
        switch (isParticipant) {
          case null { #err("Not a participant in this session") };
          case (?_) { #ok(session) };
        };
      };
    };
  };

  // Payment Processing
  public shared(msg) func processPayment(
    sessionId: Text,
    token: Text,
    amount: Float
  ): async Result.Result<Transaction, Text> {
    let caller = msg.caller;
    switch (sessions.get(sessionId)) {
      case null { #err("Session not found") };
      case (?session) {
        let isParticipant = Array.find(session.participants, func(p) = Principal.equal(p, caller));
        switch (isParticipant) {
          case null { #err("Not a participant in this session") };
          case (?_) {
            let transactionId = generateId();
            let transaction: Transaction = {
              id = transactionId;
              sessionId = sessionId;
              from = caller;
              to = ?session.creator;
              amount = amount;
              token = token;
              timestamp = Time.now();
              status = "completed";
            };
            transactions.put(transactionId, transaction);

            let updatedPayments = Array.map(session.payments, func((p, paid, t)) =
              if (Principal.equal(p, caller)) (p, true, ?token) else (p, paid, t)
            );

            let updatedSession = { session with payments = updatedPayments };
            sessions.put(sessionId, updatedSession);

            // Reward SPLIT tokens (5% of amount)
            switch (users.get(caller)) {
              case (?user) {
                let bonus = Nat.fromInt(Float.toInt(amount * 0.05));
                let updatedUser = { user with splitTokens = user.splitTokens + bonus };
                users.put(caller, updatedUser);
              };
              case null {};
            };

            #ok(transaction)
          };
        };
      };
    };
  };

  // Token Management
  public shared(msg) func redeemTokens(amount: Nat, currency: Text): async Result.Result<Text, Text> {
    let caller = msg.caller;
    switch (users.get(caller)) {
      case null { #err("User not found") };
      case (?user) {
        if (user.splitTokens < amount) {
          #err("Insufficient SPLIT tokens")
        } else {
          let updatedUser = { user with splitTokens = Nat.sub(user.splitTokens, amount) };
          users.put(caller, updatedUser);
          #ok("Redemption successful: " # Nat.toText(amount) # " SPLIT tokens redeemed for " # currency)
        }
      };
    };
  };

  // Utility
  private func generateId(): Text {
    Int.toText(Time.now())
  };

  // Upgrade hooks
  system func preupgrade() {
    userEntries := users.entries() |> Iter.toArray(_);
    usernameEntries := usernames.entries() |> Iter.toArray(_);
    sessionEntries := sessions.entries() |> Iter.toArray(_);
    transactionEntries := transactions.entries() |> Iter.toArray(_);
  };

  system func postupgrade() {
    userEntries := [];
    usernameEntries := [];
    sessionEntries := [];
    transactionEntries := [];
  };
}
