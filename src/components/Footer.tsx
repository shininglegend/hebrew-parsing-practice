export function Footer() {
  return (
    <>
      <hr />
      <div className="text-xs text-slate-500">
        Original work of the Open Scriptures Hebrew Bible available at{" "}
        <a
          className="text-blue-500"
          href="https://github.com/openscriptures/morphhb"
        >
          https://github.com/openscriptures/morphhb
        </a>
        . If there is a mistake in the parsing, it would be cool if you told
        them by opening an issue there instead of telling me, but I'm happy to
        pass on the information!
        <hr />
        Copyright 2025 Titus Murphy. All rights reserved. For issues or
        requests, submit an issue by clicking{" "}
        <a
          className="text-blue-500 font-bold"
          href="https://github.com/shininglegend/hebrew-parsing-practice/issues"
        >
          here.
        </a>
      </div>
    </>
  );
}
