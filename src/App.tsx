import React from "react";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/function";
import { flow } from "fp-ts/lib/function";
import { getJoke } from "./lib/getJoke";
import reporter from "io-ts-reporters";
import useEventListener from "./hooks/useEventListener";

const errorMessage = "Well, this is awkward";

function App() {
  const [data, setData] = React.useState("");
  const throttling = React.useRef(false);

  const updateJoke = React.useCallback(() => pipe(
    getJoke,
    TE.bimap(
      (or: O.Option<string>) =>
        pipe(
          or,
          O.fold(() => setData(errorMessage), (s) => setData(s))
        ),
      flow(
        E.fold(
          (errors) => {
            setData(errorMessage);
            console.error(reporter.report(E.left(errors)).join("\n"));
          },
          ({ joke }) => setData(joke)
        )
      )
    ),
  )(), []);

  useEventListener('keypress', (event) => {
    if (throttling.current || event.code !== 'Space') {
      return;
    }

    throttling.current = true;
    setTimeout(() => {
      throttling.current = false;
      updateJoke();
    }, 500)
  })

  React.useEffect(() => {
    updateJoke();
  }, [updateJoke]);

  return (
    <React.Fragment>
      <blockquote>{data}</blockquote>
      <cite>-Dad</cite>
      <p>Press space to get a new joke</p>
    </React.Fragment>
  );
}

export default App;
