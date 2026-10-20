# S103 request annotation guide (written before annotation; preregistration evaluation/s103/preregistration.json)

You annotate the numeric limits in shoppers' messages to a buying adviser. You see only the messages and this guide. You
must not read or run any code, test, rule file or system output. Decide each field by what a careful human adviser would
understand from the message.

## What is a limit

A number with a unit (or a price) that restricts which product would suit the shopper: a size, capacity, power, weight,
battery life, noise level, price. Not limits: numbers that describe the use or the household ("for 4 people", "a 2 kg
chicken", "a 40 m² room" when it is not itself a limit on the product), model numbers, ages, how long they owned an old
product, quantities of food or drink. A number that refers back to an earlier limit without repeating the unit ("at least
4 litres... make it 6") is a limit with the earlier unit.

## Fields for each limit

- `text`: the exact words of the limit as written (for example "no wider than 45 cm").
- `property`: `capacity` (volume the product holds), `water_tank`, `width`, `height`, `depth`, `weight`, `power`,
  `battery_life` (running time on battery), `price`, or `other:<words>` (for example `other:noise`).
- `side`: `min` (at least this much) or `max` (at most this much).
- `value` and `unit`: as written (a price: the amount and the currency).
- `closure`: `inclusive` when the limit value itself is acceptable ("at least", "at most", "up to", "no more than",
  "or less", "or more", "between X and Y", "within"); `strict` when it is not ("more than", "over", "above", "under",
  "below", "less than", "smaller than"). Use the ordinary meaning of the words; if you cannot tell, write `inclusive`
  and say so in `note`.
- `product`: `this` (the product the shopper is choosing now) or `other` (another product the message also asks about
  or describes).
- `kind`:
  - `requirement`: the product must meet it;
  - `preference`: wanted but not required ("ideally", "preferably", "possibly", "would be nice", "if possible");
  - `replaced`: the shopper changes or corrects it later in the message; the later limit replaces it;
  - `alternative`: it applies only in one of two or more situations the shopper describes ("4 litres, or 6 if my
    family visits").
- `handling`: what a careful adviser should do with this limit before searching:
  - `apply`: a clear requirement on the product being chosen. Also, when the shopper describes alternative situations,
    the weakest limit that every situation requires (in "at least 4 litres, or at least 6 when guests come", at least
    4 litres holds in both situations: `apply`; at least 6: `ask`);
  - `ask`: the adviser should ask before using it: limits that no product can meet together (ask which one: both are
    `ask`), a limit tied to one situation only, a limit that seems to be about another product, a limit whose meaning
    is unclear (a range with no bound word, a possible negation);
  - `report`: noted, never used to exclude a product: a preference, a replaced limit, or a limit made redundant by a
    stricter limit of the same kind on the same product in the same situation (at least 4 L and at least 6 L, both
    required: 6 L is `apply`, 4 L is `report`).
- `note`: anything uncertain (optional).

## Output

One JSON object: `{"requests":[{"id":"q01","limits":[{...},...]},...]}` with every request, in order; `limits: []` when a
message has none. Annotate every limit, including ones on properties an adviser might not be able to check.
