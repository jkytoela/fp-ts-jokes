import * as t from "io-ts";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/function";

export const Joke = t.type({
  id: t.string,
  joke: t.string,
  status: t.number,
});

export type Joke = t.TypeOf<typeof Joke>;

const fetcher = () => fetch("https://icanhazdadjoke.com/", {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
  },
});

export const getJoke: TE.TaskEither<
  O.Option<string>,
  E.Either<t.Errors, Joke>
> = pipe(
  TE.tryCatch(fetcher, () => O.none),
  TE.filterOrElse(
    (res) => res.ok,
    (res) => O.some(`Response failed with status: ${res.statusText}`)
  ),
  TE.chain((res) =>
    TE.tryCatch(
      () => res.json(),
      () => O.some("Parsing JSON failed")
    )
  ),
  TE.map((data) => Joke.decode(data))
);
