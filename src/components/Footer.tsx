export function Footer() {
  return (
    <>
      <hr />
      <div className="text-xs text-slate-500">
        Morphology from the{" "}
        <a className="text-blue-500" href="https://github.com/openscriptures/morphhb">
          Open Scriptures Hebrew Bible
        </a>
        . Glosses from Strong's Hebrew dictionary, in the{" "}
        <a className="text-blue-500" href="https://github.com/openscriptures/strongs">
          Open Scriptures edition
        </a>{" "}
        (CC-BY-SA). English versions from{" "}
        <a className="text-blue-500" href="https://bible-api.com">
          bible-api.com
        </a>
        . If a parse is wrong, it would be cool if you told the OSHB project by opening an issue
        there instead of telling me, but I'm happy to pass the information on.
        <hr />
        Copyright 2025 Titus Murphy. All rights reserved. For issues or requests,{" "}
        <a
          className="text-blue-500 font-bold"
          href="https://github.com/shininglegend/hebrew-parsing-practice/issues"
        >
          open an issue on GitHub
        </a>
        .
      </div>
    </>
  );
}
